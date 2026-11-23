-- ==============================================================================
-- AGRICULTURE ATLAS MIGRATION 001: CLICKHOUSE H3 VIRTUAL AGRO-SENSOR TWIN (VN)
-- Planetary Food Security & Zero-IoT Open-Science Reference Agronomic Atlas
-- Domain: https://agricultureatlas.org | API: https://api.agricultureatlas.org
--
-- 100% Air-Gapped Non-Commercial Open-Science Time-Series Architecture:
--   - Distributed ReplacingMergeTree (Cloud & Open-Science Cluster compatible)
--   - Temporal Causality & Zero-Future-Leakage Guarantee (`model_init_time_utc <= valid_time_utc`)
--   - DoubleDelta + ZSTD time-series codecs & LowCardinality strings for ultra-compact storage
--   - Air-Gapped Isolation: Dedicated `agriatlas_analytics` database & pure agro-physics columns
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS agriatlas_analytics;

-- ==============================================================================
-- 1. VIRTUAL AGRO-SENSOR TWIN OBSERVED & PHYSICS LEDGER (H3 RES-7 & RES-8)
-- Synthesizes Microsoft Planetary Computer & Google Earth Engine (Sentinel-1 SAR,
-- Sentinel-2 L2A, Sentinel-3 SLSTR, NASA SMAP L4) + Microsoft Aurora 1.5 +
-- NVIDIA Earth-2 + IBM-ESA TerraMind & THOR + FAO-56 Penman-Monteith Physics
-- ==============================================================================

CREATE TABLE IF NOT EXISTS agriatlas_analytics.agro_h3_virtual_sensor_twin (
    h3_res7 LowCardinality(FixedString(15)),
    h3_res8 LowCardinality(FixedString(15)),
    country_code LowCardinality(FixedString(2)) DEFAULT 'VN',
    agro_zone_code LowCardinality(String) DEFAULT 'VN_MKD',
    elevation_band_100m Int16 CODEC(DoubleDelta, ZSTD(3)),
    valid_time_utc DateTime('UTC') CODEC(DoubleDelta, ZSTD(3)),
    sensor_fusion_source LowCardinality(String) DEFAULT 'PLANETARY_COMPUTER_GEE_AURORA_TERRAMIND_THOR',
    dominant_land_use LowCardinality(String) DEFAULT 'paddy',

    -- Core Meteorological Drivers
    temp_air_2m_c Float32 CODEC(ZSTD(3)),
    temp_min_24h_c Float32 CODEC(ZSTD(3)),
    temp_max_24h_c Float32 CODEC(ZSTD(3)),
    land_surface_temp_c Float32 CODEC(ZSTD(3)),
    relative_humidity_pct UInt8 CODEC(ZSTD(3)),
    wind_speed_2m_ms Float32 CODEC(ZSTD(3)),
    solar_radiation_mj_m2_day Float32 CODEC(ZSTD(3)),
    precip_mm_24h Float32 CODEC(ZSTD(3)),

    -- Satellite Vegetation & Radar Indices (Microsoft Planetary Computer STAC & GEE Non-Commercial)
    ndvi_sentinel2 Float32 CODEC(ZSTD(3)),
    ndwi_sentinel2 Float32 CODEC(ZSTD(3)),
    sar_vh_vv_backscatter_db Float32 CODEC(ZSTD(3)),

    -- 7 Mandatory Virtual Agro-Sensor Twin Indicators (Zero-IoT Hardware Required)
    soil_moisture_root_zone Float32 CODEC(ZSTD(3)),     -- Volumetric % (0-100%) in 0-28cm root zone (SMAP + SAR + Water Balance)
    et0_mm_day Float32 CODEC(ZSTD(3)),                  -- FAO-56 Penman-Monteith Reference Evapotranspiration (mm/day)
    gdd_accumulated Float32 CODEC(ZSTD(3)),             -- Accumulated Growing Degree Days above crop base temp (degC-days)
    salinity_risk_index Float32 CODEC(ZSTD(3)),         -- Salinity intrusion risk 0-100 (Mekong Delta / Coastal tidal estuaries)
    frost_risk_index Float32 CODEC(ZSTD(3)),            -- Radiative/advective frost & hoarfrost risk 0-100 (Northwest Highlands)
    leaf_wetness_hours Float32 CODEC(ZSTD(3)),          -- Hours of free canopy moisture in last 24h (0-24h, Rice Blast / Phytophthora risk)
    crop_stress_gravity_score Float32 CODEC(ZSTD(3)),   -- AA-SKU-2 composite food security & yield-loss risk score (0-100)

    -- Zero-Literacy Traffic Light Classification
    traffic_light_status Enum8('GREEN' = 1, 'AMBER' = 2, 'RED' = 3) DEFAULT 'GREEN',
    recommended_irrigation_mm Float32 DEFAULT 0 CODEC(ZSTD(3)),
    ingested_at_utc DateTime('UTC') DEFAULT now('UTC') CODEC(DoubleDelta, ZSTD(3)),

    CONSTRAINT chk_soil_moisture_bounds CHECK soil_moisture_root_zone >= 0.0 AND soil_moisture_root_zone <= 100.0,
    CONSTRAINT chk_et0_non_negative CHECK et0_mm_day >= 0.0 AND et0_mm_day <= 25.0,
    CONSTRAINT chk_leaf_wetness_bounds CHECK leaf_wetness_hours >= 0.0 AND leaf_wetness_hours <= 24.0,
    CONSTRAINT chk_gravity_score_bounds CHECK crop_stress_gravity_score >= 0.0 AND crop_stress_gravity_score <= 100.0,
    INDEX idx_agro_valid_time_minmax valid_time_utc TYPE minmax GRANULARITY 4,
    INDEX idx_agro_zone_set agro_zone_code TYPE set(32) GRANULARITY 4
) ENGINE = ReplacingMergeTree(ingested_at_utc)
PARTITION BY toYYYYMM(valid_time_utc)
ORDER BY (country_code, agro_zone_code, h3_res7, h3_res8, valid_time_utc)
TTL valid_time_utc + INTERVAL 3650 DAY
SETTINGS index_granularity = 8192;

-- ==============================================================================
-- 2. AA-SKU-1 (MICROSOFT AURORA 1.5 + NVIDIA EARTH-2 + FAO-56) 14-TO-60 DAY ROLLOUT VINTAGE
-- Enforces strict Zero-Future-Leakage (`model_init_time_utc <= valid_time_utc`)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS agriatlas_analytics.agro_h3_aurora_rollout_vintage (
    h3_res7 LowCardinality(FixedString(15)),
    h3_res8 LowCardinality(FixedString(15)),
    agro_zone_code LowCardinality(String) DEFAULT 'VN_MKD',
    valid_time_utc DateTime('UTC') CODEC(DoubleDelta, ZSTD(3)),
    lead_days UInt8 CODEC(ZSTD(3)),
    sku_model_id LowCardinality(String) DEFAULT 'microsoft/aurora-1.5',
    model_init_time_utc DateTime('UTC') CODEC(DoubleDelta, ZSTD(3)),

    soil_moisture_p10_pct Float32 CODEC(ZSTD(3)),
    soil_moisture_p50_pct Float32 CODEC(ZSTD(3)),
    soil_moisture_p90_pct Float32 CODEC(ZSTD(3)),
    et0_p50_mm_day Float32 CODEC(ZSTD(3)),
    gdd_increment_p50 Float32 CODEC(ZSTD(3)),
    salinity_risk_p90 Float32 CODEC(ZSTD(3)),
    frost_risk_p90 Float32 CODEC(ZSTD(3)),
    leaf_wetness_p90_hours Float32 CODEC(ZSTD(3)),
    crop_stress_gravity_p50 Float32 CODEC(ZSTD(3)),
    predicted_traffic_light Enum8('GREEN' = 1, 'AMBER' = 2, 'RED' = 3) DEFAULT 'GREEN',

    ingested_at_utc DateTime('UTC') DEFAULT now('UTC') CODEC(DoubleDelta, ZSTD(3)),

    CONSTRAINT chk_agro_fcst_zero_leakage CHECK model_init_time_utc <= valid_time_utc,
    INDEX idx_fcst_valid_time_minmax valid_time_utc TYPE minmax GRANULARITY 4,
    INDEX idx_fcst_init_time_minmax model_init_time_utc TYPE minmax GRANULARITY 4
) ENGINE = ReplacingMergeTree(ingested_at_utc)
PARTITION BY toYYYYMM(valid_time_utc)
ORDER BY (agro_zone_code, h3_res7, h3_res8, valid_time_utc, lead_days, sku_model_id)
TTL valid_time_utc + INTERVAL 1095 DAY
SETTINGS index_granularity = 8192;

-- ==============================================================================
-- 3. ZERO-LEAKAGE MICROSOFT AURORA 1.5 + NVIDIA EARTH-2 TRAINING PAIRS VIEW
-- Guarantees `model_init_time_utc <= subtractDays(obs.valid_time_utc, lead_days)`
-- ==============================================================================

CREATE OR REPLACE VIEW agriatlas_analytics.v_aurora_zero_leakage_agro_pairs AS
SELECT
    obs.country_code AS country_code,
    obs.agro_zone_code AS agro_zone_code,
    obs.h3_res7 AS h3_res7,
    obs.h3_res8 AS h3_res8,
    obs.valid_time_utc AS valid_time_utc,
    fcst.lead_days AS lead_days,
    fcst.sku_model_id AS sku_model_id,
    fcst.model_init_time_utc AS model_init_time_utc,
    obs.dominant_land_use AS dominant_land_use,
    obs.soil_moisture_root_zone AS obs_soil_moisture_pct,
    fcst.soil_moisture_p50_pct AS fcst_soil_moisture_p50_pct,
    toFloat32(obs.soil_moisture_root_zone - fcst.soil_moisture_p50_pct) AS soil_moisture_residual_pct,
    obs.et0_mm_day AS obs_et0_mm_day,
    fcst.et0_p50_mm_day AS fcst_et0_p50_mm_day,
    toFloat32(obs.et0_mm_day - fcst.et0_p50_mm_day) AS et0_residual_mm_day,
    obs.salinity_risk_index AS obs_salinity_risk,
    obs.frost_risk_index AS obs_frost_risk,
    obs.leaf_wetness_hours AS obs_leaf_wetness_hours,
    obs.crop_stress_gravity_score AS obs_crop_stress_gravity_score
FROM agriatlas_analytics.agro_h3_virtual_sensor_twin AS obs FINAL
INNER JOIN agriatlas_analytics.agro_h3_aurora_rollout_vintage AS fcst FINAL
    ON obs.agro_zone_code = fcst.agro_zone_code
   AND obs.h3_res7 = fcst.h3_res7
   AND obs.h3_res8 = fcst.h3_res8
   AND obs.valid_time_utc = fcst.valid_time_utc
WHERE fcst.model_init_time_utc <= subtractDays(obs.valid_time_utc, toInt32(fcst.lead_days))
  AND fcst.model_init_time_utc <= obs.valid_time_utc;
