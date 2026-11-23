"""Comprehensive Pytest Suite for Agriculture Atlas Agro-Physics Engine & FastAPI Gateway."""

from __future__ import annotations

import base64
import hashlib
import json
import re
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

GATEWAY_ROOT = Path(__file__).resolve().parents[1] / "services" / "agriatlas-gateway"
if str(GATEWAY_ROOT) not in sys.path:
    sys.path.insert(0, str(GATEWAY_ROOT))

from app.core.agro_physics_engine import (  # noqa: E402
    MAX_DELTA_PACKET_BYTES,
    OPEN_SCIENCE_AZURE_AURORA_SKUS,
    VIETNAM_AGRO_ZONES,
    VirtualAgroSensorInput,
    build_h3_agro_delta_packet,
    classify_agro_traffic_light,
    compute_crop_stress_gravity_score,
    compute_fao56_et0_mm_day,
    compute_frost_risk_index,
    compute_gdd_accumulated,
    compute_leaf_wetness_hours,
    compute_salinity_risk_index,
    compute_soil_moisture_root_zone,
    decode_h3_agro_delta_packet,
    evaluate_virtual_agro_sensor_twin,
    get_open_science_sku_manifest,
)
from app.main import app  # noqa: E402

client = TestClient(app)

REQUIRED_SEVEN_INDICATORS = (
    "soil_moisture_root_zone",
    "et0_mm_day",
    "gdd_accumulated",
    "salinity_risk_index",
    "frost_risk_index",
    "leaf_wetness_hours",
    "crop_stress_gravity_score",
)


def test_fao56_penman_monteith_et0_physics() -> None:
    """Verify FAO-56 Penman-Monteith ET0 responds physically to radiation, humidity, and wind."""
    # Typical Mekong Delta sunny day
    et0_mkd = compute_fao56_et0_mm_day(
        temp_min_c=24.8,
        temp_max_c=33.4,
        relative_humidity_pct=80.0,
        wind_speed_2m_ms=2.1,
        solar_radiation_mj_m2_day=21.0,
        elevation_m=2.0,
    )
    assert 3.2 <= et0_mkd <= 6.8

    # Central Coast Foehn (Gió Lào) hot dry wind increases ET0 significantly
    et0_foehn = compute_fao56_et0_mm_day(
        temp_min_c=27.0,
        temp_max_c=38.5,
        relative_humidity_pct=45.0,
        wind_speed_2m_ms=4.8,
        solar_radiation_mj_m2_day=25.5,
        elevation_m=15.0,
    )
    assert et0_foehn > et0_mkd
    assert 5.5 <= et0_foehn <= 12.0

    # Cool overcast Northern winter day yields low ET0
    et0_winter = compute_fao56_et0_mm_day(
        temp_min_c=9.0,
        temp_max_c=14.0,
        relative_humidity_pct=92.0,
        wind_speed_2m_ms=1.0,
        solar_radiation_mj_m2_day=8.5,
        elevation_m=800.0,
    )
    assert 0.5 <= et0_winter < et0_mkd


def test_seven_virtual_agro_sensor_indicators_bounds_and_semantics() -> None:
    """Verify all 7 mandatory Virtual Agro-Sensor Twin indicators obey physical bounds."""
    sm_wet = compute_soil_moisture_root_zone(
        smap_surface_moisture_pct=52.0,
        sar_vh_vv_db=-10.2,
        precip_mm_24h=18.0,
        et0_mm_day=4.2,
        ndwi_sentinel2=0.35,
    )
    sm_dry = compute_soil_moisture_root_zone(
        smap_surface_moisture_pct=14.0,
        sar_vh_vv_db=-20.5,
        precip_mm_24h=0.0,
        et0_mm_day=6.8,
        ndwi_sentinel2=-0.22,
    )
    assert 0.0 <= sm_dry < sm_wet <= 100.0

    gdd = compute_gdd_accumulated(
        temp_min_c=24.0,
        temp_max_c=32.0,
        crop_base_temp_c=10.0,
        prior_gdd_accumulated=500.0,
    )
    assert gdd == pytest.approx(518.0, abs=0.01)

    sal_high = compute_salinity_risk_index(
        estuary_salinity_g_l=4.2,
        canal_distance_m=90.0,
        tidal_surge_m=1.2,
        precip_mm_24h=0.0,
        soil_moisture_root_zone=24.0,
    )
    sal_zero = compute_salinity_risk_index(
        estuary_salinity_g_l=0.0,
        canal_distance_m=1500.0,
        tidal_surge_m=0.0,
        precip_mm_24h=12.0,
        soil_moisture_root_zone=45.0,
    )
    assert sal_zero == 0.0
    assert 70.0 <= sal_high <= 100.0

    frost_high = compute_frost_risk_index(
        temp_min_c=2.5,
        relative_humidity_pct=88.0,
        wind_speed_2m_ms=0.6,
        elevation_m=1450.0,
        solar_radiation_mj_m2_day=17.5,
    )
    frost_tropical = compute_frost_risk_index(
        temp_min_c=25.0,
        relative_humidity_pct=80.0,
        wind_speed_2m_ms=2.5,
        elevation_m=5.0,
    )
    assert frost_tropical == 0.0
    assert 75.0 <= frost_high <= 100.0

    lwh_humid = compute_leaf_wetness_hours(
        relative_humidity_pct=95.0,
        temp_min_c=23.5,
        temp_max_c=27.0,
        precip_mm_24h=14.0,
        wind_speed_2m_ms=0.8,
    )
    assert 12.0 <= lwh_humid <= 24.0

    gravity_severe = compute_crop_stress_gravity_score(
        soil_moisture_root_zone=sm_dry,
        et0_mm_day=6.8,
        salinity_risk_index=sal_high,
        frost_risk_index=0.0,
        leaf_wetness_hours=lwh_humid,
    )
    assert 68.0 <= gravity_severe <= 100.0


def test_traffic_light_and_zero_literacy_folk_voice_advisory() -> None:
    """Verify 3-color traffic light (GREEN, AMBER, RED) and folk Vietnamese voice advisory."""
    green_res = classify_agro_traffic_light(
        soil_moisture_root_zone=41.0,
        et0_mm_day=3.9,
        salinity_risk_index=8.0,
        frost_risk_index=0.0,
        leaf_wetness_hours=5.5,
        crop_stress_gravity_score=16.0,
        precip_mm_24h=2.0,
        dominant_land_use="paddy",
    )
    assert green_res["traffic_light_status"] == "GREEN"
    assert green_res["traffic_light_hex"] == "#10B981"
    assert "Đèn Xanh" in green_res["voice_advisory_vi"]
    assert ("đốt ngón tay" in green_res["voice_advisory_vi"]) or (
        "xô nước" in green_res["voice_advisory_vi"]
    )

    amber_res = classify_agro_traffic_light(
        soil_moisture_root_zone=27.5,
        et0_mm_day=5.1,
        salinity_risk_index=44.0,
        frost_risk_index=0.0,
        leaf_wetness_hours=9.0,
        crop_stress_gravity_score=46.0,
        precip_mm_24h=0.0,
        dominant_land_use="orchard",
    )
    assert amber_res["traffic_light_status"] == "AMBER"
    assert amber_res["traffic_light_hex"] == "#F59E0B"
    assert "Đèn Vàng" in amber_res["voice_advisory_vi"]
    assert "xô nước" in amber_res["voice_advisory_vi"]

    red_res = classify_agro_traffic_light(
        soil_moisture_root_zone=16.0,
        et0_mm_day=6.4,
        salinity_risk_index=82.0,
        frost_risk_index=0.0,
        leaf_wetness_hours=14.0,
        crop_stress_gravity_score=84.0,
        precip_mm_24h=0.0,
        dominant_land_use="paddy",
    )
    assert red_res["traffic_light_status"] == "RED"
    assert red_res["traffic_light_hex"] == "#EF4444"
    assert "Đèn Đỏ" in red_res["voice_advisory_vi"]
    assert "xô nước" in red_res["voice_advisory_vi"]

    banned_kttv_re = re.compile(r"cảnh báo|báo động|dự báo", re.IGNORECASE)
    for res in (green_res, amber_res, red_res):
        assert not banned_kttv_re.search(res["voice_advisory_vi"]), (
            f"Regulatory KTTV term leaked into voice_advisory_vi: {res['voice_advisory_vi']}"
        )


def test_five_vietnam_zones_and_hoang_sa_truong_sa_sovereignty() -> None:
    """Verify all 5 Phase-1 Vietnam zones and 100% Hoang Sa & Truong Sa sovereignty lock."""
    expected_zones = {"VN_MKD", "VN_CH", "VN_RRD_NWM", "VN_CCC", "VN_HS_TS"}
    assert set(VIETNAM_AGRO_ZONES.keys()) == expected_zones

    for code, zone in VIETNAM_AGRO_ZONES.items():
        assert zone["country_code"] == "VN", f"Zone {code} must lock country_code='VN'"
        assert zone["sovereignty_verified"] is True

    hs_ts = VIETNAM_AGRO_ZONES["VN_HS_TS"]
    assert "Hoàng Sa" in hs_ts["zone_name_vi"]
    assert "Trường Sa" in hs_ts["zone_name_vi"]
    archipelagos = hs_ts["sovereignty_archipelagos"]
    assert len(archipelagos) == 2
    assert archipelagos[0]["country_code"] == "VN"
    assert archipelagos[1]["country_code"] == "VN"


def test_four_open_science_azure_aurora_skus_and_air_gapped_boundary() -> None:
    """Verify all 4 Open-Science Azure/Aurora SKUs and Air-Gapped isolation."""
    assert len(OPEN_SCIENCE_AZURE_AURORA_SKUS) == 4
    expected_ids = ["AA-SKU-1", "AA-SKU-2", "AA-SKU-3", "AA-SKU-4"]
    assert [sku["sku_id"] for sku in OPEN_SCIENCE_AZURE_AURORA_SKUS] == expected_ids

    for sku in OPEN_SCIENCE_AZURE_AURORA_SKUS:
        assert sku["sku_codename"].startswith("AgricultureAtlas-")
        assert sku["zero_domain_bleed"] is True
        assert sku["air_gapped_open_science"] is True
        assert sku["isolation_policy"] == "AIR_GAPPED_NON_COMMERCIAL_OPEN_SCIENCE"

    sku_by_id = {sku["sku_id"]: sku for sku in OPEN_SCIENCE_AZURE_AURORA_SKUS}
    assert "microsoft/aurora" in sku_by_id["AA-SKU-1"]["base_model_id"]
    assert "TerraMind-1.0-base" in sku_by_id["AA-SKU-2"]["base_model_id"]
    assert "THOR-1.0-base" in sku_by_id["AA-SKU-2"]["base_model_id"]
    assert "Qwen/Qwen3.8-27B" in sku_by_id["AA-SKU-3"]["base_model_id"]
    assert "VieNeu-TTS-v3-Turbo" in sku_by_id["AA-SKU-3"]["base_model_id"]
    assert "mobilenetv4" in sku_by_id["AA-SKU-4"]["base_model_id"].lower()

    manifest = get_open_science_sku_manifest()
    assert manifest["sku_count"] == 4
    assert manifest["zero_domain_bleed"] is True
    assert manifest["air_gapped_open_science"] is True


@pytest.mark.parametrize("zone_code", ["VN_MKD", "VN_CH", "VN_RRD_NWM", "VN_CCC", "VN_HS_TS"])
def test_offline_h3_delta_packet_strictly_under_5kb(zone_code: str) -> None:
    """Verify 14-day Offline Field Delta Packet is < 5120 bytes and losslessly decodable."""
    h3_idx = VIETNAM_AGRO_ZONES[zone_code]["representative_h3_res7"]
    packet = build_h3_agro_delta_packet(h3_index=h3_idx, agro_zone_code=zone_code, forecast_days=14)

    assert packet["country_code"] == "VN"
    assert packet["sovereignty_verified"] is True
    assert packet["agro_zone_code"] == zone_code
    assert packet["forecast_horizon_days"] == 14
    assert packet["within_5kb_budget"] is True
    assert 0 < packet["payload_bytes"] < MAX_DELTA_PACKET_BYTES

    raw_compressed = base64.b64decode(packet["payload_b64"].encode("ascii"))
    assert len(raw_compressed) == packet["payload_bytes"]
    assert len(raw_compressed) < 5120

    decoded = decode_h3_agro_delta_packet(packet["payload_b64"])
    assert decoded["h3"] == h3_idx
    assert decoded["cc"] == "VN"
    assert decoded["sov"] is True
    assert len(decoded["fc14"]) == 14


def test_fastapi_gateway_endpoints_end_to_end() -> None:
    """Verify all 5 FastAPI endpoints return valid HTTP 200 payloads."""
    # 1. GET /healthz
    r_health = client.get("/healthz")
    assert r_health.status_code == 200
    health_data = r_health.json()
    assert health_data["status"] == "ok"
    assert health_data["project"] == "Agriculture Atlas"
    assert health_data["domain"] == "https://agricultureatlas.org"
    assert health_data["chat_domain"] == "https://agricultureatlas.org/vi/chat"
    assert health_data["chat_domain_en"] == "https://agricultureatlas.org/en/chat"
    assert health_data["chat_domain_vi"] == "https://agricultureatlas.org/vi/chat"
    assert health_data["research_domain_en"] == "https://agricultureatlas.org/research"
    assert health_data["research_domain_vi"] == "https://agricultureatlas.org/vi/research"
    assert health_data["api_domain"] == "https://api.agricultureatlas.org"
    assert health_data["github_repo"] == "https://github.com/vantbhp/agricultureatlas"
    assert health_data["orcid"] == "https://orcid.org/0009-0005-3514-106X"
    assert health_data["zero_domain_bleed"] is True
    assert health_data["air_gapped_open_science"] is True
    assert health_data["sovereignty_verified"] is True

    # 2. GET /api/v1/agro/vietnam-zones
    r_zones = client.get("/api/v1/agro/vietnam-zones")
    assert r_zones.status_code == 200
    zones_data = r_zones.json()
    assert zones_data["zone_count"] == 5
    assert zones_data["hoang_sa_truong_sa_included"] is True

    # 3. GET /api/v1/agro/sku-manifest
    r_skus = client.get("/api/v1/agro/sku-manifest")
    assert r_skus.status_code == 200
    skus_data = r_skus.json()
    assert skus_data["project"] == "Agriculture Atlas"
    assert skus_data["domain"] == "https://agricultureatlas.org"
    assert skus_data["api_domain"] == "https://api.agricultureatlas.org"
    assert skus_data["sku_count"] == 4
    assert skus_data["zero_domain_bleed"] is True
    assert skus_data["air_gapped_open_science"] is True

    # 4. GET /api/v1/agro/h3/{h3_index}
    r_h3 = client.get(
        "/api/v1/agro/h3/8765b566affffff",
        params={
            "agro_zone_code": "VN_MKD",
            "temp_min_c": 25.0,
            "temp_max_c": 34.5,
            "estuary_salinity_g_l": 3.8,
            "canal_distance_m": 120.0,
        },
    )
    assert r_h3.status_code == 200
    h3_data = r_h3.json()
    assert h3_data["country_code"] == "VN"
    assert h3_data["sovereignty_verified"] is True
    for indicator_key in REQUIRED_SEVEN_INDICATORS:
        assert indicator_key in h3_data
        assert indicator_key in h3_data["indicators"]
    assert h3_data["traffic_light_status"] in ("GREEN", "AMBER", "RED")
    assert len(h3_data["voice_advisory_vi"]) > 20
    assert not re.search(r"cảnh báo|báo động|dự báo", h3_data["voice_advisory_vi"], re.IGNORECASE), (
        f"Forbidden KTTV term in API voice_advisory_vi: {h3_data['voice_advisory_vi']}"
    )
    assert "active_open_science_skus" in h3_data
    assert len(h3_data["active_open_science_skus"]) == 4

    # 5. GET /api/v1/agro/delta-packet/{h3_index}
    r_delta = client.get("/api/v1/agro/delta-packet/8765f1a2affffff?agro_zone_code=VN_HS_TS")
    assert r_delta.status_code == 200
    delta_data = r_delta.json()
    assert delta_data["agro_zone_code"] == "VN_HS_TS"
    assert delta_data["payload_bytes"] < 5120
    assert delta_data["within_5kb_budget"] is True


def test_contract_lock_sha256_integrity() -> None:
    """Verify configs/contract_lock.json locks agricultureatlas.org, Air-Gapped flag, and exact SHA-256 hashes."""
    repo_root = Path(__file__).resolve().parents[1]
    contract_file = repo_root / "configs" / "contract_lock.json"
    contract = json.loads(contract_file.read_text(encoding="utf-8"))

    assert contract["project_name"] == "Agriculture Atlas"
    assert contract["domain"] == "https://agricultureatlas.org"
    assert contract["api_domain"] == "https://api.agricultureatlas.org"
    assert contract["air_gapped_open_science"] is True

    for rel_path, expected_sha in contract["sha256_contracts"].items():
        actual_sha = hashlib.sha256((repo_root / rel_path).read_bytes()).hexdigest()
        assert actual_sha == expected_sha, f"SHA-256 mismatch for {rel_path}: {actual_sha} != {expected_sha}"


def test_repo_wide_brand_and_air_gapped_discipline() -> None:
    """Ensure zero leftover agriatlas.io, commercial leaks, personal paths, internal agent codes, legacy cloud/model leaks, or font CDNs."""
    repo_root = Path(__file__).resolve().parents[1]
    ignored_dirs = {".git", "node_modules", "dist", ".astro", ".pytest_cache", "__pycache__"}
    checked_exts = {".md", ".json", ".sql", ".py", ".html", ".css", ".js", ".ts", ".mjs", ".dart", ".astro"}
    self_exempt = {Path("tests/test_agro_physics_and_api.py"), Path("tests/test_landing_static_build.py")}

    legacy_or_commercial_re = re.compile(
        r"agriatlas\.io|goweather|gosunai|\bvm26\b|starryboo|/Users/|fonts\.googleapis\.com|fonts\.gstatic\.com|gemini\.md|/hoi-dong|/nguoi-dung",
        re.IGNORECASE,
    )
    deprecated_stack_re = re.compile(
        r"google trc|tpu research cloud|vertex ai|timesfm",
        re.IGNORECASE,
    )
    internal_agent_code_re = re.compile(r"\b(?:W00|W03|W04|W06[a-z0-9_-]*|W12|W16|W99[a-z]*)\b", re.IGNORECASE)
    old_camelcase_brand_re = re.compile(r"\bAgriAtlas\b")

    violations: list[str] = []
    for path in sorted(repo_root.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in checked_exts:
            continue
        rel = path.relative_to(repo_root)
        if ignored_dirs & set(rel.parts) or path.name.startswith(".env"):
            continue
        if rel in self_exempt:
            continue
        text = path.read_text(encoding="utf-8")
        for m in legacy_or_commercial_re.finditer(text):
            violations.append(f"{rel}: forbidden token '{m.group(0)}'")
        for m in internal_agent_code_re.finditer(text):
            violations.append(f"{rel}: internal agent code '{m.group(0)}'")
        for m in old_camelcase_brand_re.finditer(text):
            violations.append(f"{rel}: legacy brand '{m.group(0)}'")

        is_tech_report = len(rel.parts) >= 2 and rel.parts[0] == "docs" and rel.parts[1] == "technical-report"
        is_tests_dir = len(rel.parts) >= 1 and rel.parts[0] == "tests"
        if not is_tech_report and not is_tests_dir:
            for m in deprecated_stack_re.finditer(text):
                violations.append(f"{rel}: deprecated stack token '{m.group(0)}'")

    assert not violations, "Brand / Air-Gapped / Hygiene violations found:\n" + "\n".join(violations)


def test_open_science_citation_and_zenodo_metadata() -> None:
    """Validate CITATION.cff, .zenodo.json, LICENSE, DATA_LICENSE.md, and Technical Report v1."""
    repo_root = Path(__file__).resolve().parents[1]
    citation_cff = repo_root / "CITATION.cff"
    zenodo_json = repo_root / ".zenodo.json"
    license_file = repo_root / "LICENSE"
    data_license_file = repo_root / "DATA_LICENSE.md"
    tech_report = repo_root / "docs" / "technical-report" / "AGRICULTURE_ATLAS_TECHNICAL_REPORT_V1.md"

    for required_file in (citation_cff, zenodo_json, license_file, data_license_file, tech_report):
        assert required_file.is_file(), f"Missing required Open-Science artifact: {required_file.relative_to(repo_root)}"
        assert required_file.read_text(encoding="utf-8").strip(), f"Empty Open-Science artifact: {required_file.relative_to(repo_root)}"

    cff_text = citation_cff.read_text(encoding="utf-8")
    assert "cff-version:" in cff_text
    try:
        import yaml  # type: ignore[import-untyped]
        parsed_cff = yaml.safe_load(cff_text)
        assert isinstance(parsed_cff, dict) and "cff-version" in parsed_cff
    except ImportError:
        pass

    zenodo_text = zenodo_json.read_text(encoding="utf-8")
    parsed_zenodo = json.loads(zenodo_text)
    assert isinstance(parsed_zenodo, dict)
    assert parsed_zenodo.get("title")
    assert parsed_zenodo.get("creators")

    report_text = tech_report.read_text(encoding="utf-8")
    required_tokens = (
        "0009-0005-3514-106X",
        "https://github.com/vantbhp/agricultureatlas",
        "https://agricultureatlas.org",
    )
    for label, content in (
        ("CITATION.cff", cff_text),
        (".zenodo.json", zenodo_text),
        ("docs/technical-report/AGRICULTURE_ATLAS_TECHNICAL_REPORT_V1.md", report_text),
    ):
        for token in required_tokens:
            assert token in content, f"{label}: missing required metadata token '{token}'"

