"""Virtual Agro-Sensor Twin Physics Engine & Open-Science Azure/Aurora SKU Registry.

Implements:
1. FAO-56 Penman-Monteith Reference Evapotranspiration (`et0_mm_day`).
2. Seven mandatory Virtual Agro-Sensor Twin indicators (Zero-IoT Hardware):
   - `soil_moisture_root_zone` (0.0 - 100.0%)
   - `et0_mm_day` (0.0 - 25.0 mm/day)
   - `gdd_accumulated` (Growing Degree Days, degC-days)
   - `salinity_risk_index` (0.0 - 100.0, Mekong Delta & coastal estuaries)
   - `frost_risk_index` (0.0 - 100.0, Northern Highlands & Red River Delta)
   - `leaf_wetness_hours` (0.0 - 24.0h, Rice Blast & Phytophthora canopy moisture)
   - `crop_stress_gravity_score` (0.0 - 100.0, AA-SKU-2 composite yield risk)
3. 3-Color Zero-Literacy Traffic Light (`GREEN`, `AMBER`, `RED`) + spoken Vietnamese
   advisory (`voice_advisory_vi`) using folk water units ("đốt ngón tay", "xô 10 lít").
4. Phase 1 Vietnam 5 Agro-Ecological Zones including 100% sovereignty over
   Hoàng Sa (Đà Nẵng) and Trường Sa (Khánh Hòa) (`VN_HS_TS`).
5. Open-Science 4 Agro-SKU Manifest (`AA-SKU-1` to `AA-SKU-4`) powered by Microsoft Aurora 1.5,
   NVIDIA Earth-2, IBM-ESA TerraMind & THOR, Qwen3.8-27B & VieNeu-TTS on Microsoft Azure
   NVIDIA GPUs (A100/H100) & NVIDIA Brev, with strict `100% Air-Gapped Non-Commercial Open-Science`
   isolation (`zero_domain_bleed = True`).
6. Ultra-compact Offline Field Delta Packet (`< 5 KB` / `< 5120 bytes`) for 14-day reference indices.
"""

from __future__ import annotations

import base64
import hashlib
import json
import math
import zlib
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Literal, Optional

TrafficLightColor = Literal["GREEN", "AMBER", "RED"]

STEFAN_BOLTZMANN_MJ_K4_M2_DAY: float = 4.903e-9
DEFAULT_EXTRATERRESTRIAL_RAD_MJ_M2_DAY: float = 36.8
MAX_DELTA_PACKET_BYTES: int = 5120


def _clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


# ==============================================================================
# 1. PHASE 1 VIETNAM AGRO-ECOLOGICAL ZONES (INCLUDING HOANG SA & TRUONG SA)
# ==============================================================================

VIETNAM_AGRO_ZONES: Dict[str, Dict[str, Any]] = {
    "VN_MKD": {
        "zone_code": "VN_MKD",
        "country_code": "VN",
        "sovereignty_verified": True,
        "zone_name_vi": "Đồng bằng Sông Cửu Long",
        "zone_name_en": "Mekong River Delta",
        "representative_h3_res7": "8765b566affffff",
        "representative_h3_res8": "8865b566a1fffff",
        "default_land_use": "paddy",
        "default_crop_base_temp_c": 10.0,
        "primary_crops": [
            "Lúa 3 vụ (Đông Xuân, Hè Thu, Thu Đông)",
            "Sầu riêng Ri6 / Monthong",
            "Xoài Cát Hòa Lộc",
            "Tôm nước lợ & Cá tra",
        ],
        "primary_hazards": [
            "salinity_intrusion",
            "rice_blast_fungus",
            "acid_sulfate_soil",
            "tidal_flooding",
        ],
        "bbox_wgs84": [104.40, 8.55, 106.80, 11.05],
        "default_meteo": {
            "temp_min_c": 24.8,
            "temp_max_c": 33.4,
            "relative_humidity_pct": 82.0,
            "wind_speed_2m_ms": 2.1,
            "solar_radiation_mj_m2_day": 20.5,
            "precip_mm_24h": 4.2,
            "elevation_m": 2.0,
            "smap_surface_moisture_pct": 44.0,
            "sar_vh_vv_db": -12.4,
            "ndwi_sentinel2": 0.28,
            "estuary_salinity_g_l": 2.6,
            "canal_distance_m": 180.0,
            "tidal_surge_m": 0.85,
            "prior_gdd_accumulated": 840.0,
            "season_days": 52,
        },
    },
    "VN_CH": {
        "zone_code": "VN_CH",
        "country_code": "VN",
        "sovereignty_verified": True,
        "zone_name_vi": "Tây Nguyên",
        "zone_name_en": "Central Highlands (Dak Lak, Lam Dong, Gia Lai, Dak Nong, Kon Tum)",
        "representative_h3_res7": "876590c9affffff",
        "representative_h3_res8": "886590c9a3fffff",
        "default_land_use": "orchard",
        "default_crop_base_temp_c": 12.0,
        "primary_crops": [
            "Cà phê Robusta & Arabica",
            "Sầu riêng xuất khẩu",
            "Hồ tiêu",
            "Bơ sáp & Chè",
        ],
        "primary_hazards": [
            "dry_season_drought_et0",
            "phytophthora_root_rot",
            "red_basalt_leaching",
        ],
        "bbox_wgs84": [107.10, 11.20, 108.95, 15.00],
        "default_meteo": {
            "temp_min_c": 18.2,
            "temp_max_c": 30.6,
            "relative_humidity_pct": 64.0,
            "wind_speed_2m_ms": 2.9,
            "solar_radiation_mj_m2_day": 22.8,
            "precip_mm_24h": 0.5,
            "elevation_m": 650.0,
            "smap_surface_moisture_pct": 25.5,
            "sar_vh_vv_db": -16.8,
            "ndwi_sentinel2": -0.04,
            "estuary_salinity_g_l": 0.0,
            "canal_distance_m": 1500.0,
            "tidal_surge_m": 0.0,
            "prior_gdd_accumulated": 615.0,
            "season_days": 48,
        },
    },
    "VN_RRD_NWM": {
        "zone_code": "VN_RRD_NWM",
        "country_code": "VN",
        "sovereignty_verified": True,
        "zone_name_vi": "Đồng bằng Sông Hồng & Miền núi phía Bắc",
        "zone_name_en": "Red River Delta & Northern Midlands/Highlands",
        "representative_h3_res7": "87411c12affffff",
        "representative_h3_res8": "88411c12a5fffff",
        "default_land_use": "cropland",
        "default_crop_base_temp_c": 10.0,
        "primary_crops": [
            "Lúa Chiêm Xuân / Lúa Mùa",
            "Rau vụ Đông (Bắp cải, Su hào, Khoai tây)",
            "Mận Hậu, Đào & Chè Shan Tuyết cổ thụ",
        ],
        "primary_hazards": [
            "hoarfrost_ret_dam_ret_hai",
            "cold_spell_panicle_sterility",
            "flash_flood_slope_erosion",
        ],
        "bbox_wgs84": [102.14, 19.80, 108.05, 23.39],
        "default_meteo": {
            "temp_min_c": 6.8,
            "temp_max_c": 15.2,
            "relative_humidity_pct": 86.0,
            "wind_speed_2m_ms": 1.1,
            "solar_radiation_mj_m2_day": 13.4,
            "precip_mm_24h": 1.2,
            "elevation_m": 1150.0,
            "smap_surface_moisture_pct": 38.0,
            "sar_vh_vv_db": -13.5,
            "ndwi_sentinel2": 0.14,
            "estuary_salinity_g_l": 0.1,
            "canal_distance_m": 600.0,
            "tidal_surge_m": 0.0,
            "prior_gdd_accumulated": 310.0,
            "season_days": 40,
        },
    },
    "VN_CCC": {
        "zone_code": "VN_CCC",
        "country_code": "VN",
        "sovereignty_verified": True,
        "zone_name_vi": "Duyên hải Miền Trung",
        "zone_name_en": "Central Coastal Vietnam",
        "representative_h3_res7": "87658244affffff",
        "representative_h3_res8": "88658244a7fffff",
        "default_land_use": "cropland",
        "default_crop_base_temp_c": 10.0,
        "primary_crops": [
            "Lúa ngắn ngày chạy lũ",
            "Thanh long Bình Thuận",
            "Nho & Táo Ninh Thuận",
            "Tỏi Lý Sơn & Thủy sản ven biển",
        ],
        "primary_hazards": [
            "foehn_hot_dry_wind",
            "typhoon_inundation",
            "sandy_soil_water_deficit",
        ],
        "bbox_wgs84": [105.50, 10.50, 109.50, 19.80],
        "default_meteo": {
            "temp_min_c": 25.5,
            "temp_max_c": 36.8,
            "relative_humidity_pct": 56.0,
            "wind_speed_2m_ms": 4.2,
            "solar_radiation_mj_m2_day": 24.6,
            "precip_mm_24h": 0.0,
            "elevation_m": 18.0,
            "smap_surface_moisture_pct": 21.0,
            "sar_vh_vv_db": -18.2,
            "ndwi_sentinel2": -0.12,
            "estuary_salinity_g_l": 1.1,
            "canal_distance_m": 420.0,
            "tidal_surge_m": 0.35,
            "prior_gdd_accumulated": 920.0,
            "season_days": 50,
        },
    },
    "VN_HS_TS": {
        "zone_code": "VN_HS_TS",
        "country_code": "VN",
        "sovereignty_verified": True,
        "zone_name_vi": "Quần đảo Hoàng Sa (Đà Nẵng) & Quần đảo Trường Sa (Khánh Hòa) - Việt Nam",
        "zone_name_en": "Hoang Sa (Paracel) & Truong Sa (Spratly) Archipelagos - Vietnam Sovereignty",
        "representative_h3_res7": "8765f1a2affffff",
        "representative_h3_res8": "8865f1a2a9fffff",
        "default_land_use": "farmland",
        "default_crop_base_temp_c": 12.0,
        "primary_crops": [
            "Rau xanh nhà màng chịu mặn trên đảo (Cải xanh, Rau muống, Mồng tơi)",
            "Cây phong ba, Bàng vuông & Dừa biển chắn sóng",
            "Hậu cần ngư trường & Thủy sản biển đảo Việt Nam",
        ],
        "primary_hazards": [
            "severe_typhoon_swell",
            "salt_spray_stress",
            "freshwater_lens_scarcity",
        ],
        "sovereignty_archipelagos": [
            {
                "name_vi": "Quần đảo Hoàng Sa",
                "administrative_unit_vi": "Thành phố Đà Nẵng, Việt Nam",
                "country_code": "VN",
                "lat": 16.5333,
                "lon": 111.6167,
                "sovereignty_verified": True,
            },
            {
                "name_vi": "Quần đảo Trường Sa",
                "administrative_unit_vi": "Tỉnh Khánh Hòa, Việt Nam",
                "country_code": "VN",
                "lat": 8.6444,
                "lon": 111.9194,
                "sovereignty_verified": True,
            },
        ],
        "bbox_wgs84": [111.00, 6.00, 117.50, 17.50],
        "default_meteo": {
            "temp_min_c": 26.2,
            "temp_max_c": 32.1,
            "relative_humidity_pct": 79.0,
            "wind_speed_2m_ms": 5.4,
            "solar_radiation_mj_m2_day": 23.2,
            "precip_mm_24h": 3.5,
            "elevation_m": 4.0,
            "smap_surface_moisture_pct": 33.0,
            "sar_vh_vv_db": -14.6,
            "ndwi_sentinel2": 0.08,
            "estuary_salinity_g_l": 1.8,
            "canal_distance_m": 120.0,
            "tidal_surge_m": 0.65,
            "prior_gdd_accumulated": 780.0,
            "season_days": 45,
        },
    },
}


# ==============================================================================
# 2. OPEN-SCIENCE 4 AGRO-SKU MANIFEST (AZURE AURORA + NVIDIA EARTH-2 + QWEN)
# ==============================================================================

OPEN_SCIENCE_AZURE_AURORA_SKUS: List[Dict[str, Any]] = [
    {
        "sku_id": "AA-SKU-1",
        "sku_codename": "AgricultureAtlas-Climate-Aurora-Earth2",
        "base_model_id": (
            "microsoft/aurora (v1.5 + v1.5-ensemble + 0.1deg + wave + air-pollution) "
            "+ nvidia/cbottle + nvidia/fourcastnet3"
        ),
        "license": "MIT + Apache-2.0",
        "compute_target": "Microsoft Azure NVIDIA GPUs (A100/H100) & NVIDIA Brev",
        "quantization_stack": "BF16 + FSDP + LoRA + FAO-56 Physics Constraint",
        "modalities": [
            "atmospheric_rollout_1h",
            "ensemble_s2s_60d",
            "km_scale_super_resolution",
            "ocean_wave",
            "air_pollution",
            "agro_physics_hybrid",
        ],
        "verification_baselines": (
            "ECMWF AIFS 2.0 (CC-BY-4.0) + ERA5-Land + Multi-Model NC Cross-Validation"
        ),
        "role_vi": (
            "Trạm Cảm Biến Ảo Không Cần IoT chạy mô phỏng nghiên cứu chuỗi chỉ số nông học "
            "tham khảo độ ẩm vùng rễ, ET0 FAO-56, GDD, xâm nhập mặn & sương muối theo lưới H3"
        ),
        "zero_domain_bleed": True,
        "air_gapped_open_science": True,
        "isolation_policy": "AIR_GAPPED_NON_COMMERCIAL_OPEN_SCIENCE",
        "license_compliance": "100% Permissive Open Science (MIT / Apache-2.0 / CC-BY-4.0)",
    },
    {
        "sku_id": "AA-SKU-2",
        "sku_codename": "AgricultureAtlas-EO-TerraMind-THOR",
        "base_model_id": "ibm-esa-geospatial/TerraMind-1.0-base + FM4CS/THOR-1.0-base",
        "license": "Apache-2.0",
        "compute_target": "Microsoft Azure NVIDIA GPUs (A100/H100) & NVIDIA Brev",
        "quantization_stack": "TerraTorch BF16 + TensorRT/ONNX FP16",
        "modalities": [
            "sentinel1_sar",
            "sentinel2_l2a",
            "sentinel3_slstr_thermal",
            "nasa_smap_l4",
            "dem_lulc_ndvi",
            "crop_stress_gravity_score",
        ],
        "verification_baselines": (
            "ibm-nasa-geospatial/Prithvi-EO-2.0-300M-TL (Apache-2.0) "
            "+ Microsoft Planetary Computer STAC + GEE Non-Commercial"
        ),
        "role_vi": (
            "Động cơ Viễn thám Đa cảm biến & Trọng lực Áp lực Mùa vụ chấm điểm tham khảo "
            "crop_stress_gravity_score (0–100) kết hợp Sentinel-1/2/3 & NASA SMAP cho từng ô H3"
        ),
        "zero_domain_bleed": True,
        "air_gapped_open_science": True,
        "isolation_policy": "AIR_GAPPED_NON_COMMERCIAL_OPEN_SCIENCE",
        "license_compliance": "100% Permissive Open Science (MIT / Apache-2.0 / CC-BY-4.0)",
    },
    {
        "sku_id": "AA-SKU-3",
        "sku_codename": "AgricultureAtlas-Agronomist-Qwen38-VN",
        "base_model_id": (
            "Qwen/Qwen3.8-27B (nvidia/Qwen3.8-27B-NVFP4) + Qwen/Qwen3.6-35B-A3B "
            "+ Qwen/Qwen3-ASR-1.7B + pnnbao-ump/VieNeu-TTS-v3-Turbo"
        ),
        "license": "Apache-2.0",
        "compute_target": "Microsoft Azure NVIDIA GPUs (A100/H100) & NVIDIA Brev",
        "quantization_stack": "NVIDIA ModelOpt NVFP4 / FP8 + vLLM / TensorRT-LLM + Azure AI Content Safety",
        "modalities": [
            "vision_leaf_pathology",
            "agronomic_reasoning",
            "vietnamese_dialect_asr",
            "vietnamese_3region_tts_48khz",
        ],
        "verification_baselines": (
            "nvidia/nemotron-3.5-asr-streaming-0.6b + vinai/PhoWhisper-large + openbmb/VoxCPM2"
        ),
        "role_vi": (
            "Bác sĩ Khuyến nông Đa phương thức nghe phương ngữ Việt Nam 3 miền, phân tích bệnh "
            "lá cây/đất và tổng hợp hướng dẫn canh tác tham khảo theo đơn vị dân gian"
        ),
        "zero_domain_bleed": True,
        "air_gapped_open_science": True,
        "isolation_policy": "AIR_GAPPED_NON_COMMERCIAL_OPEN_SCIENCE",
        "license_compliance": "100% Permissive Open Science (MIT / Apache-2.0 / CC-BY-4.0)",
    },
    {
        "sku_id": "AA-SKU-4",
        "sku_codename": "AgricultureAtlas-Edge-Pocket",
        "base_model_id": (
            "timm/mobilenetv4_conv_small + pnnbao-ump/VieNeu-TTS-v3-Nano "
            "+ google/gemma-4-E2B-it + Qwen/Qwen3.5-0.8B"
        ),
        "license": "Apache-2.0",
        "compute_target": "Android $50-$70 Edge (2-4GB RAM) via ONNX Runtime / LiteRT-LM / llama.cpp GGUF",
        "quantization_stack": "NVIDIA ModelOpt INT8/INT4 + ONNX Q4 + GGUF Q4_0 + Offline H3 Delta Packet < 5KB",
        "modalities": [
            "tier0_offline_leaf_cnn",
            "tier1_offline_vlm_2gb_4gb",
            "offline_vietnamese_asr_tts",
            "offline_h3_delta_5kb",
        ],
        "verification_baselines": (
            "Qwen/Qwen3-ASR-0.6B-hf (Apache-2.0) "
            "+ LiquidAI/LFM3-Omni-2B-GGUF (LFM-v1.0 experimental track)"
        ),
        "role_vi": (
            "Mô hình Bỏ túi Chạy Offline 100% ngoài ruộng không cần 4G trên điện thoại "
            "Android phổ thông ($50–$70, 2–4GB RAM) kèm gói đồng bộ H3 dưới 5KB"
        ),
        "zero_domain_bleed": True,
        "air_gapped_open_science": True,
        "isolation_policy": "AIR_GAPPED_NON_COMMERCIAL_OPEN_SCIENCE",
        "license_compliance": "100% Permissive Open Science (MIT / Apache-2.0 / CC-BY-4.0)",
    },
]


# ==============================================================================
# 3. CORE AGRO-PHYSICS EQUATIONS (FAO-56 PENMAN-MONTEITH & 7 SENSOR INDICATORS)
# ==============================================================================


def compute_fao56_et0_mm_day(
    temp_min_c: float,
    temp_max_c: float,
    relative_humidity_pct: float,
    wind_speed_2m_ms: float,
    solar_radiation_mj_m2_day: float,
    elevation_m: float = 5.0,
    albedo: float = 0.23,
    soil_heat_flux_mj_m2_day: float = 0.0,
) -> float:
    """Compute reference crop evapotranspiration ET0 (mm/day) via FAO-56 Penman-Monteith.

    Formula:
        ET0 = [0.408 * Delta * (Rn - G) + gamma * (900 / (Tmean + 273)) * u2 * (es - ea)]
              / [Delta + gamma * (1 + 0.34 * u2)]
    """
    t_min = float(temp_min_c)
    t_max = max(float(temp_max_c), t_min)
    t_mean = 0.5 * (t_max + t_min)
    rh = _clamp(float(relative_humidity_pct), 1.0, 100.0)
    u2 = max(0.05, float(wind_speed_2m_ms))
    rs = max(0.0, float(solar_radiation_mj_m2_day))
    elev = _clamp(float(elevation_m), -50.0, 5000.0)

    # Atmospheric pressure P (kPa) and psychrometric constant gamma (kPa / degC)
    pressure_kpa = 101.3 * math.pow((293.0 - 0.0065 * elev) / 293.0, 5.26)
    gamma = 0.000665 * pressure_kpa

    # Saturation vapor pressure eo(T) (kPa)
    eo_tmin = 0.6108 * math.exp((17.27 * t_min) / (t_min + 237.3))
    eo_tmax = 0.6108 * math.exp((17.27 * t_max) / (t_max + 237.3))
    es = 0.5 * (eo_tmin + eo_tmax)

    # Actual vapor pressure ea (kPa) and vapor pressure deficit (es - ea)
    ea = es * (rh / 100.0)
    vpd = max(0.0, es - ea)

    # Slope of saturation vapor pressure curve Delta (kPa / degC)
    eo_tmean = 0.6108 * math.exp((17.27 * t_mean) / (t_mean + 237.3))
    delta = (4098.0 * eo_tmean) / math.pow(t_mean + 237.3, 2.0)

    # Net shortwave radiation Rns (MJ / m2 / day)
    rns = (1.0 - _clamp(albedo, 0.05, 0.90)) * rs

    # Clear-sky radiation Rso and net outgoing longwave radiation Rnl (MJ / m2 / day)
    rso = max(1.0, (0.75 + 2.0e-5 * max(0.0, elev)) * DEFAULT_EXTRATERRESTRIAL_RAD_MJ_M2_DAY)
    rel_shortwave = _clamp(rs / rso, 0.25, 1.0)
    tmax_k4 = math.pow(t_max + 273.16, 4.0)
    tmin_k4 = math.pow(t_min + 273.16, 4.0)
    rnl = (
        STEFAN_BOLTZMANN_MJ_K4_M2_DAY
        * (0.5 * (tmax_k4 + tmin_k4))
        * max(0.02, 0.34 - 0.14 * math.sqrt(max(0.01, ea)))
        * max(0.05, 1.35 * rel_shortwave - 0.35)
    )

    rn = max(0.0, rns - rnl)
    numerator = (
        0.408 * delta * (rn - soil_heat_flux_mj_m2_day)
        + gamma * (900.0 / (t_mean + 273.0)) * u2 * vpd
    )
    denominator = delta + gamma * (1.0 + 0.34 * u2)
    et0 = numerator / max(1e-6, denominator)
    return round(_clamp(et0, 0.0, 25.0), 2)


def compute_soil_moisture_root_zone(
    smap_surface_moisture_pct: float,
    sar_vh_vv_db: float,
    precip_mm_24h: float,
    et0_mm_day: float,
    ndwi_sentinel2: float = 0.10,
    field_capacity_pct: float = 42.0,
) -> float:
    """Fuse NASA SMAP + Sentinel-1 SAR backscatter + Sentinel-2 NDWI + water balance (0-100%)."""
    smap_component = _clamp(float(smap_surface_moisture_pct), 0.0, 100.0)
    # Sentinel-1 VH/VV typically spans -22 dB (bone dry) to -8 dB (saturated/flooded paddy)
    sar_norm_pct = _clamp(((float(sar_vh_vv_db) + 22.0) / 14.0) * 100.0, 0.0, 100.0)
    ndwi_bonus_pct = _clamp(float(ndwi_sentinel2) * 25.0, -12.0, 18.0)

    # Root-zone water balance adjustment from 24h rainfall vs daily ET0 loss
    net_water_mm = float(precip_mm_24h) - 0.85 * float(et0_mm_day)
    water_balance_delta_pct = _clamp(net_water_mm * 1.35, -18.0, 28.0)

    fused = (
        0.52 * smap_component
        + 0.33 * sar_norm_pct
        + 0.15 * _clamp(float(field_capacity_pct), 15.0, 85.0)
        + ndwi_bonus_pct
        + water_balance_delta_pct
    )
    return round(_clamp(fused, 0.0, 100.0), 2)


def compute_gdd_accumulated(
    temp_min_c: float,
    temp_max_c: float,
    crop_base_temp_c: float = 10.0,
    prior_gdd_accumulated: float = 0.0,
    temp_upper_cap_c: float = 36.0,
) -> float:
    """Compute Growing Degree Days: prior_gdd + max(0, (min(Tmax, Tcap) + Tmin)/2 - Tbase)."""
    t_min = float(temp_min_c)
    t_max = min(max(float(temp_max_c), t_min), float(temp_upper_cap_c))
    daily_gdd = max(0.0, 0.5 * (t_max + t_min) - float(crop_base_temp_c))
    total_gdd = max(0.0, float(prior_gdd_accumulated)) + daily_gdd
    return round(total_gdd, 2)


def compute_salinity_risk_index(
    estuary_salinity_g_l: float,
    canal_distance_m: float = 250.0,
    tidal_surge_m: float = 0.5,
    precip_mm_24h: float = 0.0,
    soil_moisture_root_zone: float = 40.0,
) -> float:
    """Compute Mekong Delta / coastal salinity intrusion risk index (0.0 - 100.0).

    - Durian & sensitive orchards suffer damage at >= 0.5 g/L.
    - Rice paddy suffers critical osmotic shock at >= 2.0 - 4.0 g/L.
    """
    sal_g_l = max(0.0, float(estuary_salinity_g_l))
    if sal_g_l <= 0.05:
        return 0.0

    # Base salinity pressure (4.0 g/L approaches 80+ base risk)
    concentration_score = _clamp((sal_g_l / 4.0) * 78.0, 0.0, 85.0)
    # Proximity attenuation along inland canal network
    dist_m = max(10.0, float(canal_distance_m))
    proximity_factor = math.exp(-dist_m / 2200.0)
    # Spring tide surge amplification
    tidal_boost = _clamp(float(tidal_surge_m) * 14.0, 0.0, 22.0)
    # Freshwater rain flushing & high soil moisture dilution
    rain_flush = _clamp(float(precip_mm_24h) * 0.9, 0.0, 20.0)
    dry_soil_penalty = max(0.0, (35.0 - float(soil_moisture_root_zone)) * 0.35)

    risk = (
        concentration_score * (0.45 + 0.55 * proximity_factor)
        + tidal_boost * proximity_factor
        + dry_soil_penalty
        - rain_flush
    )
    return round(_clamp(risk, 0.0, 100.0), 2)


def compute_frost_risk_index(
    temp_min_c: float,
    relative_humidity_pct: float,
    wind_speed_2m_ms: float,
    elevation_m: float = 200.0,
    solar_radiation_mj_m2_day: float = 14.0,
) -> float:
    """Compute Northern Highlands & Red River Delta hoarfrost / cold-spell risk (0.0 - 100.0).

    In Vietnam:
    - Rét đậm: daily mean <= 15C (night min ~10-12C)
    - Rét hại & sương muối (hoarfrost): night min <= 6-8C at high elevation with calm winds.
    """
    t_min = float(temp_min_c)
    if t_min >= 16.5:
        return 0.0

    # Thermal cold severity below 16.5C
    cold_severity = _clamp(((16.5 - t_min) / 14.5) * 76.0, 0.0, 82.0)
    # Calm nocturnal wind (< 1.5 m/s) traps radiative cooling in mountain valleys
    calm_wind_bonus = _clamp((2.2 - max(0.0, float(wind_speed_2m_ms))) * 6.5, 0.0, 14.0)
    # High altitude lapse rate amplification
    elev_bonus = _clamp((max(0.0, float(elevation_m)) / 1500.0) * 12.0, 0.0, 14.0)
    # Radiative cooling under clear sky / high humidity hoarfrost condensation
    rh = _clamp(float(relative_humidity_pct), 0.0, 100.0)
    hoarfrost_condensation = 6.0 if (t_min <= 8.0 and rh >= 75.0) else 0.0
    clear_sky_cooling = 4.0 if float(solar_radiation_mj_m2_day) >= 16.0 and t_min <= 10.0 else 0.0

    risk = cold_severity + calm_wind_bonus + elev_bonus + hoarfrost_condensation + clear_sky_cooling
    return round(_clamp(risk, 0.0, 100.0), 2)


def compute_leaf_wetness_hours(
    relative_humidity_pct: float,
    temp_min_c: float,
    temp_max_c: float,
    precip_mm_24h: float = 0.0,
    wind_speed_2m_ms: float = 2.0,
) -> float:
    """Compute canopy free moisture duration (0.0 - 24.0 hours) driving Rice Blast & Phytophthora."""
    rh = _clamp(float(relative_humidity_pct), 10.0, 100.0)
    t_mean = 0.5 * (float(temp_min_c) + float(temp_max_c))

    # Magnus-Tetens dew point approximation
    alpha = ((17.27 * t_mean) / (237.7 + t_mean)) + math.log(rh / 100.0)
    dew_point_c = (237.7 * alpha) / (17.27 - alpha)
    dew_depression_c = max(0.0, float(temp_min_c) - dew_point_c)

    # Base humid hours from RH above 70%
    rh_hours = max(0.0, (rh - 62.0) * 0.36)
    # Nocturnal dew condensation hours when minimum temperature approaches dew point
    dew_hours = _clamp((3.5 - dew_depression_c) * 2.1, 0.0, 7.5)
    # Rainfall canopy wetting duration
    rain_hours = _clamp(math.sqrt(max(0.0, float(precip_mm_24h))) * 2.2, 0.0, 9.0)
    # Wind ventilation drying reduction
    wind_drying_hours = _clamp(max(0.0, float(wind_speed_2m_ms) - 1.2) * 1.15, 0.0, 6.5)

    wet_hours = rh_hours + dew_hours + rain_hours - wind_drying_hours
    return round(_clamp(wet_hours, 0.0, 24.0), 2)


def compute_crop_stress_gravity_score(
    soil_moisture_root_zone: float,
    et0_mm_day: float,
    salinity_risk_index: float,
    frost_risk_index: float,
    leaf_wetness_hours: float,
    wilting_point_pct: float = 18.0,
    field_capacity_pct: float = 42.0,
) -> float:
    """Compute AA-SKU-2 composite food-security & yield-loss risk score (0.0 - 100.0)."""
    sm = _clamp(float(soil_moisture_root_zone), 0.0, 100.0)
    wp = _clamp(float(wilting_point_pct), 8.0, 35.0)
    fc = max(wp + 10.0, _clamp(float(field_capacity_pct), 25.0, 65.0))

    # Water deficit or extreme waterlogging stress
    if sm < wp:
        water_stress = 70.0 + ((wp - sm) / max(1.0, wp)) * 30.0
    elif sm < fc * 0.72:
        water_stress = ((fc * 0.72 - sm) / max(1.0, fc * 0.72 - wp)) * 68.0
    elif sm > 88.0:
        water_stress = (sm - 88.0) * 3.2
    else:
        water_stress = 0.0

    # Atmospheric evaporative demand stress (ET0 > 4.5 mm/day)
    et0_stress = _clamp(max(0.0, float(et0_mm_day) - 4.2) * 11.5, 0.0, 65.0)
    # Fungal pathogen pressure (Rice Blast / Durian Phytophthora peak when leaf wetness >= 10h)
    disease_stress = _clamp(max(0.0, float(leaf_wetness_hours) - 8.0) * 5.2, 0.0, 80.0)

    salinity_s = _clamp(float(salinity_risk_index), 0.0, 100.0)
    frost_s = _clamp(float(frost_risk_index), 0.0, 100.0)

    # Weighted synthesis + dominant hazard floor so acute single-hazard events trigger alerts
    weighted = (
        0.28 * water_stress
        + 0.14 * et0_stress
        + 0.24 * salinity_s
        + 0.20 * frost_s
        + 0.14 * disease_stress
    )
    dominant_hazard = max(water_stress, salinity_s, frost_s, disease_stress * 0.9)
    gravity_score = 0.55 * weighted + 0.45 * dominant_hazard
    return round(_clamp(gravity_score, 0.0, 100.0), 2)


# ==============================================================================
# 4. ZERO-LITERACY 3-COLOR TRAFFIC LIGHT & VIETNAMESE VOICE ADVISORY
# ==============================================================================


@dataclass(frozen=True)
class VirtualAgroSensorInput:
    """Input payload for evaluating an H3 Virtual Agro-Sensor Twin cell."""

    h3_index: str
    agro_zone_code: str = "VN_MKD"
    dominant_land_use: str = "paddy"
    temp_min_c: float = 24.8
    temp_max_c: float = 33.4
    relative_humidity_pct: float = 82.0
    wind_speed_2m_ms: float = 2.1
    solar_radiation_mj_m2_day: float = 20.5
    precip_mm_24h: float = 4.2
    elevation_m: float = 2.0
    smap_surface_moisture_pct: float = 44.0
    sar_vh_vv_db: float = -12.4
    ndwi_sentinel2: float = 0.28
    estuary_salinity_g_l: float = 2.6
    canal_distance_m: float = 180.0
    tidal_surge_m: float = 0.85
    crop_base_temp_c: float = 10.0
    prior_gdd_accumulated: float = 840.0


@dataclass(frozen=True)
class VirtualAgroSensorTwinReading:
    """Complete 7-indicator output + 3-color traffic light + zero-literacy voice advisory."""

    h3_index: str
    country_code: str
    sovereignty_verified: bool
    agro_zone_code: str
    agro_zone_name_vi: str
    dominant_land_use: str
    # 7 Mandatory Virtual Agro-Sensor Twin Indicators
    soil_moisture_root_zone: float
    et0_mm_day: float
    gdd_accumulated: float
    salinity_risk_index: float
    frost_risk_index: float
    leaf_wetness_hours: float
    crop_stress_gravity_score: float
    # Traffic Light & Zero-Literacy Advisory
    traffic_light_status: TrafficLightColor
    traffic_light_hex: str
    recommended_irrigation_mm: float
    folk_water_measure_vi: str
    finger_joints_water: float
    buckets_per_tree_10l: int
    voice_advisory_vi: str
    sensor_fusion_source: str
    active_open_science_skus: List[str]
    zero_domain_bleed: bool


def resolve_agro_zone_for_h3(h3_index: str, requested_zone: Optional[str] = None) -> Dict[str, Any]:
    """Resolve the Vietnam Agro-Ecological Zone for an H3 cell with sovereignty lock."""
    if requested_zone and requested_zone in VIETNAM_AGRO_ZONES:
        return VIETNAM_AGRO_ZONES[requested_zone]

    normalized = (h3_index or "").strip().lower()
    for zone in VIETNAM_AGRO_ZONES.values():
        if normalized in (
            zone["representative_h3_res7"].lower(),
            zone["representative_h3_res8"].lower(),
        ):
            return zone

    if normalized.startswith(("8765f", "8865f")) or "hs" in normalized or "ts" in normalized:
        return VIETNAM_AGRO_ZONES["VN_HS_TS"]
    if normalized.startswith(("87659", "88659")):
        return VIETNAM_AGRO_ZONES["VN_CH"]
    if normalized.startswith(("87411", "88411")):
        return VIETNAM_AGRO_ZONES["VN_RRD_NWM"]
    if normalized.startswith(("87658", "88658")):
        return VIETNAM_AGRO_ZONES["VN_CCC"]
    return VIETNAM_AGRO_ZONES["VN_MKD"]


def classify_agro_traffic_light(
    soil_moisture_root_zone: float,
    et0_mm_day: float,
    salinity_risk_index: float,
    frost_risk_index: float,
    leaf_wetness_hours: float,
    crop_stress_gravity_score: float,
    precip_mm_24h: float = 0.0,
    dominant_land_use: str = "paddy",
) -> Dict[str, Any]:
    """Classify into GREEN / AMBER / RED and build Zero-Literacy Vietnamese voice advisory."""
    # Compute net irrigation demand in mm
    moisture_deficit_mm = max(0.0, (38.0 - float(soil_moisture_root_zone)) * 0.65)
    evap_replacement_mm = max(0.0, float(et0_mm_day) - 0.75 * float(precip_mm_24h))
    raw_irrigation_mm = moisture_deficit_mm + evap_replacement_mm

    # Do not recommend pumping canal water if salinity intrusion is dangerous (>= 55)
    if salinity_risk_index >= 55.0:
        recommended_irrigation_mm = 0.0
    elif soil_moisture_root_zone >= 48.0:
        recommended_irrigation_mm = 0.0
    else:
        recommended_irrigation_mm = round(_clamp(raw_irrigation_mm, 0.0, 35.0), 1)

    # Convert mm to folk units:
    # 1 "đốt ngón tay" (finger joint depth in paddy field) ~= 20 mm water sheet
    # 1 "xô nước 10 lít/gốc" (10L bucket per tree canopy ~4 m2) ~= 2.5 mm equivalent
    finger_joints = round(recommended_irrigation_mm / 20.0, 1)
    buckets_per_tree = int(math.ceil(recommended_irrigation_mm / 2.5)) if recommended_irrigation_mm > 0 else 0

    if dominant_land_use in ("orchard", "cropland", "vineyard"):
        folk_measure_vi = (
            f"tưới khoảng {buckets_per_tree} xô nước (xô 10 lít) mỗi gốc (tương đương {finger_joints} đốt ngón tay)"
            if buckets_per_tree > 0
            else "đất đủ ẩm, hôm nay chưa cần xách xô tưới thêm"
        )
    else:
        folk_display_joints = max(0.5, finger_joints) if recommended_irrigation_mm > 0 else 0.0
        folk_measure_vi = (
            f"bơm nước vào ruộng ngập chừng {folk_display_joints} đốt ngón tay "
            f"(hoặc {buckets_per_tree} xô nước loại xô 10 lít mỗi gốc cây ăn trái)"
            if recommended_irrigation_mm > 0
            else "mực nước ruộng đang tốt, giữ nguyên cống chưa cần bơm thêm"
        )

    # Traffic Light classification
    if (
        crop_stress_gravity_score >= 68.0
        or salinity_risk_index >= 70.0
        or frost_risk_index >= 70.0
        or soil_moisture_root_zone < 20.0
        or leaf_wetness_hours >= 16.5
    ):
        status: TrafficLightColor = "RED"
        color_hex = "#EF4444"
    elif (
        crop_stress_gravity_score >= 38.0
        or salinity_risk_index >= 40.0
        or frost_risk_index >= 40.0
        or soil_moisture_root_zone < 30.0
        or leaf_wetness_hours >= 10.5
    ):
        status = "AMBER"
        color_hex = "#F59E0B"
    else:
        status = "GREEN"
        color_hex = "#10B981"

    # Build warm, natural Zero-Literacy spoken Vietnamese message (VN KTTV compliant)
    if status == "RED":
        if salinity_risk_index >= 60.0:
            voice_vi = (
                "Đèn Đỏ mức chú ý nông học cao bác ơi! Chỉ số nông học tham khảo cho thấy nước ngoài kênh "
                "đang nhiễm mặn rất nặng, bác đóng kín cống tuyệt đối không bơm nước vào ruộng hay vườn sầu riêng "
                "lúc này. Nếu cây khô quá thì chỉ tưới cầm chừng khoảng 1 đến 2 xô nước ngọt (xô 10 lít) dự trữ mỗi gốc thôi nhé!"
            )
        elif frost_risk_index >= 60.0:
            voice_vi = (
                "Đèn Đỏ mức chú ý nông học cao về sương muối và rét hại bác ơi! Mô phỏng nghiên cứu đêm nay "
                "trời hạ lạnh sâu, bác che phủ gốc bằng rơm rạ và tưới phun sương rửa lá lúc sáng sớm khoảng "
                "1 đốt ngón tay hoặc 2 xô nước (xô 10 lít) mỗi gốc để bảo vệ mầm hoa nhé!"
            )
        elif soil_moisture_root_zone < 22.0:
            voice_vi = (
                f"Đèn Đỏ mức chú ý nông học về hạn khô vùng rễ bác ơi! Chỉ số nông học tham khảo cho thấy đất "
                f"đang thiếu ẩm mạnh, bác mở nước {folk_measure_vi} vào lúc sáng sớm hoặc chiều mát ngay nhé!"
            )
        else:
            voice_vi = (
                f"Đèn Đỏ mức chú ý nông học cao: chỉ số lá ướt đọng sương đạt {leaf_wetness_hours} tiếng "
                f"dễ phát sinh bệnh đạo ôn và nấm thối rễ! Bác thăm đồng ngay, tháo bớt nước đọng và {folk_measure_vi} nhé!"
            )
    elif status == "AMBER":
        if salinity_risk_index >= 40.0:
            voice_vi = (
                f"Đèn Vàng mức chú ý nông học bác ơi! Chỉ số nông học tham khảo cho thấy nước sông bắt đầu lợ "
                f"theo con nước triều, bác nhớ thử nước trước khi bơm, {folk_measure_vi} khi nước ròng nhé!"
            )
        elif leaf_wetness_hours >= 10.5:
            voice_vi = (
                f"Đèn Vàng mức chú ý nông học bác ơi! Đêm qua sương đọng trên lá hơn {leaf_wetness_hours} tiếng, "
                f"bác kiểm tra mặt dưới lá lúa và gốc cây xem có vết nấm không, hôm nay {folk_measure_vi} nhé!"
            )
        else:
            voice_vi = (
                f"Đèn Vàng nhắc bác thăm đồng! Mô phỏng nghiên cứu bốc thoát hơi nước đạt {et0_mm_day} ly một ngày, "
                f"bác chủ động {folk_measure_vi} để cây không bị héo nhé!"
            )
    else:
        voice_vi = (
            f"Đèn Xanh thuận lợi bác ơi! Chỉ số nông học tham khảo độ ẩm đất vùng rễ đạt {soil_moisture_root_zone} phần trăm, "
            f"bác chỉ cần {folk_measure_vi} là cây khỏe mạnh!"
        )

    return {
        "traffic_light_status": status,
        "traffic_light_hex": color_hex,
        "recommended_irrigation_mm": recommended_irrigation_mm,
        "folk_water_measure_vi": folk_measure_vi,
        "finger_joints_water": finger_joints,
        "buckets_per_tree_10l": buckets_per_tree,
        "voice_advisory_vi": voice_vi,
    }


def evaluate_virtual_agro_sensor_twin(
    sensor_input: VirtualAgroSensorInput,
) -> VirtualAgroSensorTwinReading:
    """Compute all 7 Virtual Agro-Sensor Twin indicators + Traffic Light + Voice Advisory."""
    zone = resolve_agro_zone_for_h3(sensor_input.h3_index, sensor_input.agro_zone_code)

    et0_mm_day = compute_fao56_et0_mm_day(
        temp_min_c=sensor_input.temp_min_c,
        temp_max_c=sensor_input.temp_max_c,
        relative_humidity_pct=sensor_input.relative_humidity_pct,
        wind_speed_2m_ms=sensor_input.wind_speed_2m_ms,
        solar_radiation_mj_m2_day=sensor_input.solar_radiation_mj_m2_day,
        elevation_m=sensor_input.elevation_m,
    )
    soil_moisture_root_zone = compute_soil_moisture_root_zone(
        smap_surface_moisture_pct=sensor_input.smap_surface_moisture_pct,
        sar_vh_vv_db=sensor_input.sar_vh_vv_db,
        precip_mm_24h=sensor_input.precip_mm_24h,
        et0_mm_day=et0_mm_day,
        ndwi_sentinel2=sensor_input.ndwi_sentinel2,
    )
    gdd_accumulated = compute_gdd_accumulated(
        temp_min_c=sensor_input.temp_min_c,
        temp_max_c=sensor_input.temp_max_c,
        crop_base_temp_c=sensor_input.crop_base_temp_c,
        prior_gdd_accumulated=sensor_input.prior_gdd_accumulated,
    )
    salinity_risk_index = compute_salinity_risk_index(
        estuary_salinity_g_l=sensor_input.estuary_salinity_g_l,
        canal_distance_m=sensor_input.canal_distance_m,
        tidal_surge_m=sensor_input.tidal_surge_m,
        precip_mm_24h=sensor_input.precip_mm_24h,
        soil_moisture_root_zone=soil_moisture_root_zone,
    )
    frost_risk_index = compute_frost_risk_index(
        temp_min_c=sensor_input.temp_min_c,
        relative_humidity_pct=sensor_input.relative_humidity_pct,
        wind_speed_2m_ms=sensor_input.wind_speed_2m_ms,
        elevation_m=sensor_input.elevation_m,
        solar_radiation_mj_m2_day=sensor_input.solar_radiation_mj_m2_day,
    )
    leaf_wetness_hours = compute_leaf_wetness_hours(
        relative_humidity_pct=sensor_input.relative_humidity_pct,
        temp_min_c=sensor_input.temp_min_c,
        temp_max_c=sensor_input.temp_max_c,
        precip_mm_24h=sensor_input.precip_mm_24h,
        wind_speed_2m_ms=sensor_input.wind_speed_2m_ms,
    )
    crop_stress_gravity_score = compute_crop_stress_gravity_score(
        soil_moisture_root_zone=soil_moisture_root_zone,
        et0_mm_day=et0_mm_day,
        salinity_risk_index=salinity_risk_index,
        frost_risk_index=frost_risk_index,
        leaf_wetness_hours=leaf_wetness_hours,
    )
    traffic = classify_agro_traffic_light(
        soil_moisture_root_zone=soil_moisture_root_zone,
        et0_mm_day=et0_mm_day,
        salinity_risk_index=salinity_risk_index,
        frost_risk_index=frost_risk_index,
        leaf_wetness_hours=leaf_wetness_hours,
        crop_stress_gravity_score=crop_stress_gravity_score,
        precip_mm_24h=sensor_input.precip_mm_24h,
        dominant_land_use=sensor_input.dominant_land_use,
    )

    return VirtualAgroSensorTwinReading(
        h3_index=sensor_input.h3_index,
        country_code="VN",
        sovereignty_verified=True,
        agro_zone_code=zone["zone_code"],
        agro_zone_name_vi=zone["zone_name_vi"],
        dominant_land_use=sensor_input.dominant_land_use,
        soil_moisture_root_zone=soil_moisture_root_zone,
        et0_mm_day=et0_mm_day,
        gdd_accumulated=gdd_accumulated,
        salinity_risk_index=salinity_risk_index,
        frost_risk_index=frost_risk_index,
        leaf_wetness_hours=leaf_wetness_hours,
        crop_stress_gravity_score=crop_stress_gravity_score,
        traffic_light_status=traffic["traffic_light_status"],
        traffic_light_hex=traffic["traffic_light_hex"],
        recommended_irrigation_mm=traffic["recommended_irrigation_mm"],
        folk_water_measure_vi=traffic["folk_water_measure_vi"],
        finger_joints_water=traffic["finger_joints_water"],
        buckets_per_tree_10l=traffic["buckets_per_tree_10l"],
        voice_advisory_vi=traffic["voice_advisory_vi"],
        sensor_fusion_source="MICROSOFT_AURORA_PLANETARY_COMPUTER_GEE_FAO56",
        active_open_science_skus=[sku["sku_id"] for sku in OPEN_SCIENCE_AZURE_AURORA_SKUS],
        zero_domain_bleed=True,
    )


# ==============================================================================
# 5. OFFLINE FIELD DELTA PACKET BUILDER (< 5 KB FOR 14-DAY SIMULATION)
# ==============================================================================


def build_h3_agro_delta_packet(
    h3_index: str,
    agro_zone_code: Optional[str] = None,
    forecast_days: int = 14,
    init_time_utc: Optional[datetime] = None,
) -> Dict[str, Any]:
    """Pack a 14-day H3 Virtual Agro-Sensor simulation into a zlib-compressed packet < 5 KB."""
    horizon = int(_clamp(float(forecast_days), 1.0, 30.0))
    zone = resolve_agro_zone_for_h3(h3_index, agro_zone_code)
    meteo = zone["default_meteo"]

    base_input = VirtualAgroSensorInput(
        h3_index=h3_index,
        agro_zone_code=zone["zone_code"],
        dominant_land_use=zone["default_land_use"],
        temp_min_c=meteo["temp_min_c"],
        temp_max_c=meteo["temp_max_c"],
        relative_humidity_pct=meteo["relative_humidity_pct"],
        wind_speed_2m_ms=meteo["wind_speed_2m_ms"],
        solar_radiation_mj_m2_day=meteo["solar_radiation_mj_m2_day"],
        precip_mm_24h=meteo["precip_mm_24h"],
        elevation_m=meteo["elevation_m"],
        smap_surface_moisture_pct=meteo["smap_surface_moisture_pct"],
        sar_vh_vv_db=meteo["sar_vh_vv_db"],
        ndwi_sentinel2=meteo["ndwi_sentinel2"],
        estuary_salinity_g_l=meteo["estuary_salinity_g_l"],
        canal_distance_m=meteo["canal_distance_m"],
        tidal_surge_m=meteo["tidal_surge_m"],
        crop_base_temp_c=zone["default_crop_base_temp_c"],
        prior_gdd_accumulated=meteo["prior_gdd_accumulated"],
    )
    day0_reading = evaluate_virtual_agro_sensor_twin(base_input)

    if init_time_utc is None:
        init_dt = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    elif init_time_utc.tzinfo is None:
        init_dt = init_time_utc.replace(tzinfo=timezone.utc)
    else:
        init_dt = init_time_utc.astimezone(timezone.utc)
    daily_series: List[Dict[str, Any]] = []
    running_gdd = meteo["prior_gdd_accumulated"]

    for day_idx in range(horizon):
        phase = (2.0 * math.pi * day_idx) / 7.0
        temp_min_d = round(meteo["temp_min_c"] + 1.1 * math.sin(phase), 1)
        temp_max_d = round(meteo["temp_max_c"] + 1.4 * math.cos(phase), 1)
        rh_d = _clamp(meteo["relative_humidity_pct"] + 4.5 * math.sin(phase + 0.6), 35.0, 98.0)
        wind_d = max(0.4, round(meteo["wind_speed_2m_ms"] + 0.5 * math.cos(phase), 2))
        solar_d = max(8.0, round(meteo["solar_radiation_mj_m2_day"] + 1.8 * math.cos(phase), 1))
        precip_d = round(max(0.0, meteo["precip_mm_24h"] + (6.5 if day_idx in (3, 9, 12) else -1.5)), 1)
        salinity_d = max(
            0.0,
            round(meteo["estuary_salinity_g_l"] * (1.0 + 0.18 * math.sin(phase)), 2),
        )

        day_input = VirtualAgroSensorInput(
            h3_index=h3_index,
            agro_zone_code=zone["zone_code"],
            dominant_land_use=zone["default_land_use"],
            temp_min_c=temp_min_d,
            temp_max_c=temp_max_d,
            relative_humidity_pct=rh_d,
            wind_speed_2m_ms=wind_d,
            solar_radiation_mj_m2_day=solar_d,
            precip_mm_24h=precip_d,
            elevation_m=meteo["elevation_m"],
            smap_surface_moisture_pct=_clamp(
                meteo["smap_surface_moisture_pct"] + (precip_d * 0.8) - (day_idx * 0.35),
                12.0,
                92.0,
            ),
            sar_vh_vv_db=meteo["sar_vh_vv_db"],
            ndwi_sentinel2=meteo["ndwi_sentinel2"],
            estuary_salinity_g_l=salinity_d,
            canal_distance_m=meteo["canal_distance_m"],
            tidal_surge_m=meteo["tidal_surge_m"],
            crop_base_temp_c=zone["default_crop_base_temp_c"],
            prior_gdd_accumulated=running_gdd,
        )
        day_reading = evaluate_virtual_agro_sensor_twin(day_input)
        running_gdd = day_reading.gdd_accumulated
        valid_date = (init_dt + timedelta(days=day_idx)).strftime("%Y-%m-%d")

        daily_series.append(
            {
                "d": day_idx + 1,
                "dt": valid_date,
                "sm": day_reading.soil_moisture_root_zone,
                "et0": day_reading.et0_mm_day,
                "gdd": day_reading.gdd_accumulated,
                "sal": day_reading.salinity_risk_index,
                "frz": day_reading.frost_risk_index,
                "lwh": day_reading.leaf_wetness_hours,
                "grv": day_reading.crop_stress_gravity_score,
                "tl": day_reading.traffic_light_status,
                "irr_mm": day_reading.recommended_irrigation_mm,
            }
        )

    compact_wire_payload = {
        "v": "1.0-vn",
        "h3": h3_index,
        "cc": "VN",
        "sov": True,
        "z": zone["zone_code"],
        "sku": "AA-SKU-4",
        "init": init_dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "tl": day0_reading.traffic_light_status,
        "voice_vi": day0_reading.voice_advisory_vi,
        "fc14": daily_series,
    }
    raw_json_bytes = json.dumps(
        compact_wire_payload, ensure_ascii=False, separators=(",", ":")
    ).encode("utf-8")
    compressed_bytes = zlib.compress(raw_json_bytes, level=9)
    payload_size = len(compressed_bytes)

    if payload_size >= MAX_DELTA_PACKET_BYTES:
        raise ValueError(
            f"Delta packet size {payload_size} bytes exceeds strict 5KB ({MAX_DELTA_PACKET_BYTES}B) budget"
        )

    return {
        "h3_index": h3_index,
        "country_code": "VN",
        "sovereignty_verified": True,
        "agro_zone_code": zone["zone_code"],
        "agro_zone_name_vi": zone["zone_name_vi"],
        "epistemic_label": "reference_agronomic_simulation_not_official_forecast",
        "init_time_utc": init_dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "forecast_horizon_days": horizon,
        "compression_codec": "zlib_deflate_level9",
        "uncompressed_bytes": len(raw_json_bytes),
        "payload_bytes": payload_size,
        "max_allowed_bytes": MAX_DELTA_PACKET_BYTES,
        "within_5kb_budget": payload_size < MAX_DELTA_PACKET_BYTES,
        "payload_sha256": hashlib.sha256(compressed_bytes).hexdigest(),
        "payload_b64": base64.b64encode(compressed_bytes).decode("ascii"),
        "current_reading": asdict(day0_reading),
        "forecast_14d": daily_series,
    }


def decode_h3_agro_delta_packet(payload_b64: str) -> Dict[str, Any]:
    """Decode and decompress a base64 Offline Field Delta Packet back into JSON."""
    compressed = base64.b64decode(payload_b64.encode("ascii"))
    raw_bytes = zlib.decompress(compressed)
    return json.loads(raw_bytes.decode("utf-8"))


def get_vietnam_agro_zones() -> Dict[str, Any]:
    """Return all 5 Phase-1 Vietnam Agro-Ecological Zones with sovereignty metadata."""
    zones_list = list(VIETNAM_AGRO_ZONES.values())
    return {
        "country_code": "VN",
        "sovereignty_verified": True,
        "hoang_sa_truong_sa_included": True,
        "zone_count": len(zones_list),
        "zones": zones_list,
    }


def get_open_science_sku_manifest() -> Dict[str, Any]:
    """Return the 4 Open-Science Azure/Aurora & NVIDIA Earth-2 SKU manifest."""
    return {
        "project": "Agriculture Atlas",
        "domain": "https://agricultureatlas.org",
        "chat_domain_en": "https://agricultureatlas.org/en/chat",
        "chat_domain_vi": "https://agricultureatlas.org/vi/chat",
        "research_domain_en": "https://agricultureatlas.org/research",
        "research_domain_vi": "https://agricultureatlas.org/vi/research",
        "api_domain": "https://api.agricultureatlas.org",
        "github_repo": "https://github.com/vantbhp/agricultureatlas",
        "principal_investigator": "Van Le (Lê Thành Văn)",
        "orcid": "https://orcid.org/0009-0005-3514-106X",
        "compute_platform": "Microsoft Azure NVIDIA GPUs (A100/H100) & NVIDIA Brev",
        "sku_count": len(OPEN_SCIENCE_AZURE_AURORA_SKUS),
        "zero_domain_bleed": all(sku["zero_domain_bleed"] for sku in OPEN_SCIENCE_AZURE_AURORA_SKUS),
        "air_gapped_open_science": all(
            sku["air_gapped_open_science"] for sku in OPEN_SCIENCE_AZURE_AURORA_SKUS
        ),
        "isolation_policy": "AIR_GAPPED_NON_COMMERCIAL_OPEN_SCIENCE",
        "skus": list(OPEN_SCIENCE_AZURE_AURORA_SKUS),
    }
