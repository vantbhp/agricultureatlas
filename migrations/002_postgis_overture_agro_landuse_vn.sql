-- ==============================================================================
-- AGRICULTURE ATLAS MIGRATION 002: POSTGIS + OVERTUREMAPS AGRO LAND-USE (VN)
-- Planetary Food Security & Zero-IoT Open-Science Reference Agronomic Atlas
-- Domain: https://agricultureatlas.org | API: https://api.agricultureatlas.org
--
-- 100% Air-Gapped Non-Commercial Open-Science Spatial Architecture:
--   - Dedicated OvertureMaps filter for Agricultural Land-Use & Irrigation Hydrology
--   - Enforces GIST geometry indexing, GIN metadata indexing, and H3 Res-7/Res-8 keys
--   - Enforces 100% Vietnam Sovereignty (including Hoang Sa & Truong Sa Archipelagos)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==============================================================================
-- 1. VIETNAM AGRO-ECOLOGICAL ZONES & SOVEREIGNTY ANCHORS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS agro_ecological_zones (
    zone_code VARCHAR(32) PRIMARY KEY,
    country_code CHAR(2) NOT NULL DEFAULT 'VN',
    zone_name_vi VARCHAR(128) NOT NULL,
    zone_name_en VARCHAR(128) NOT NULL,
    primary_crops TEXT[] NOT NULL,
    primary_hazards TEXT[] NOT NULL,
    default_crop_base_temp_c NUMERIC(4, 1) NOT NULL DEFAULT 10.0,
    sovereignty_verified BOOLEAN NOT NULL DEFAULT TRUE,
    bbox_geom GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agro_zones_bbox_gist
    ON agro_ecological_zones USING GIST (bbox_geom);

-- ==============================================================================
-- 2. OVERTUREMAPS AGRICULTURAL PARCELS & H3 RES-8 SENSOR TWINS
-- Supports `land_use` classes: farmland, cropland, orchard, vineyard, paddy, aquaculture
-- ==============================================================================

CREATE TABLE IF NOT EXISTS agro_overture_parcels (
    parcel_id UUID PRIMARY KEY,
    overture_gers_id VARCHAR(128) UNIQUE,
    country_code CHAR(2) NOT NULL DEFAULT 'VN',
    zone_code VARCHAR(32) NOT NULL REFERENCES agro_ecological_zones(zone_code),
    province_name_vi VARCHAR(128) NOT NULL,
    district_name_vi VARCHAR(128) NOT NULL,
    commune_name_vi VARCHAR(128) NOT NULL,
    h3_res7 VARCHAR(15) NOT NULL,
    h3_res8 VARCHAR(15) NOT NULL,
    overture_subtype VARCHAR(32) NOT NULL CHECK (
        overture_subtype IN ('paddy', 'cropland', 'orchard', 'farmland', 'aquaculture', 'vineyard')
    ),
    crop_type_code VARCHAR(64) NOT NULL,
    soil_texture_class VARCHAR(32) NOT NULL DEFAULT 'ALLUVIAL_CLAY_LOAM',
    root_depth_cm SMALLINT NOT NULL DEFAULT 28 CHECK (root_depth_cm BETWEEN 5 AND 200),
    field_capacity_pct NUMERIC(5, 2) NOT NULL DEFAULT 42.0,
    wilting_point_pct NUMERIC(5, 2) NOT NULL DEFAULT 18.0,
    elevation_m NUMERIC(6, 1) NOT NULL DEFAULT 5.0,
    slope_deg NUMERIC(4, 1) NOT NULL DEFAULT 0.5,
    nearest_water_distance_m NUMERIC(8, 1) NOT NULL DEFAULT 150.0,
    local_dialect_locale VARCHAR(16) NOT NULL DEFAULT 'vi-VN',
    geom GEOMETRY(Geometry, 4326) NOT NULL,
    centroid GEOMETRY(Point, 4326) NOT NULL,
    agro_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agro_parcels_geom_gist
    ON agro_overture_parcels USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_agro_parcels_centroid_gist
    ON agro_overture_parcels USING GIST (centroid);

CREATE INDEX IF NOT EXISTS idx_agro_parcels_h3_res8
    ON agro_overture_parcels (h3_res8, overture_subtype);

CREATE INDEX IF NOT EXISTS idx_agro_parcels_h3_res7
    ON agro_overture_parcels (h3_res7, zone_code);

CREATE INDEX IF NOT EXISTS idx_agro_parcels_metadata_gin
    ON agro_overture_parcels USING GIN (agro_metadata jsonb_path_ops);

-- ==============================================================================
-- 3. OVERTUREMAPS IRRIGATION CANALS, RIVERS, RESERVOIRS & SALINITY STATIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS agro_hydrology_network (
    water_id UUID PRIMARY KEY,
    overture_gers_id VARCHAR(128) UNIQUE,
    country_code CHAR(2) NOT NULL DEFAULT 'VN',
    zone_code VARCHAR(32) NOT NULL REFERENCES agro_ecological_zones(zone_code),
    water_name_vi VARCHAR(128) NOT NULL,
    water_class VARCHAR(32) NOT NULL CHECK (
        water_class IN ('river', 'canal', 'reservoir', 'pond', 'estuary', 'drainage_ditch')
    ),
    h3_res7 VARCHAR(15) NOT NULL,
    tidal_salinity_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
    geom GEOMETRY(Geometry, 4326) NOT NULL,
    hydro_metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_agro_hydro_geom_gist
    ON agro_hydrology_network USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_agro_hydro_h3_res7
    ON agro_hydrology_network (h3_res7, water_class);

-- ==============================================================================
-- 4. SEED PHASE-1 VIETNAM AGRO-ECOLOGICAL ZONES (INCLUDING HOANG SA & TRUONG SA)
-- ==============================================================================

INSERT INTO agro_ecological_zones (
    zone_code, country_code, zone_name_vi, zone_name_en,
    primary_crops, primary_hazards, default_crop_base_temp_c, sovereignty_verified, bbox_geom
) VALUES
(
    'VN_MKD', 'VN',
    'Đồng bằng Sông Cửu Long', 'Mekong River Delta',
    ARRAY['rice_paddy_3crop', 'durian_ri6', 'mango_cat_hoa_loc', 'brackish_shrimp', 'pangasius'],
    ARRAY['salinity_intrusion', 'rice_blast_fungus', 'acid_sulfate_soil', 'tidal_flooding'],
    10.0, TRUE,
    ST_MakeEnvelope(104.40, 8.55, 106.80, 11.05, 4326)
),
(
    'VN_CH', 'VN',
    'Tây Nguyên', 'Central Highlands',
    ARRAY['robusta_coffee', 'arabica_coffee', 'durian_monthong', 'black_pepper', 'avocado'],
    ARRAY['dry_season_drought_et0', 'phytophthora_root_rot', 'red_basalt_leaching'],
    12.0, TRUE,
    ST_MakeEnvelope(107.10, 11.20, 108.95, 15.00, 4326)
),
(
    'VN_RRD_NWM', 'VN',
    'Đồng bằng Sông Hồng & Miền núi Phía Bắc', 'Red River Delta & Northern Midlands/Highlands',
    ARRAY['spring_winter_rice', 'winter_vegetables', 'shan_tuyet_tea', 'temperate_plum_peach', 'lychee'],
    ARRAY['hoarfrost_ret_dam_ret_hai', 'cold_spell_panicle_sterility', 'flash_flood_slope_erosion'],
    10.0, TRUE,
    ST_MakeEnvelope(102.14, 19.80, 108.05, 23.39, 4326)
),
(
    'VN_CCC', 'VN',
    'Duyên hải Miền Trung', 'Central Coastal Vietnam',
    ARRAY['short_duration_rice', 'dragon_fruit', 'phan_rang_grape', 'ly_son_garlic', 'coastal_aquaculture'],
    ARRAY['foehn_hot_dry_wind', 'typhoon_inundation', 'sandy_soil_water_deficit'],
    10.0, TRUE,
    ST_MakeEnvelope(105.50, 10.50, 109.50, 19.80, 4326)
),
(
    'VN_HS_TS', 'VN',
    'Quần đảo Hoàng Sa (Đà Nẵng) & Trường Sa (Khánh Hòa) - Việt Nam',
    'Hoang Sa (Paracel) & Truong Sa (Spratly) Archipelagos - Vietnam Sovereignty',
    ARRAY['island_halophyte_vegetables', 'storm_resilient_coastal_flora', 'offshore_fisheries_logistics'],
    ARRAY['severe_typhoon_swell', 'salt_spray_stress', 'freshwater_lens_scarcity'],
    12.0, TRUE,
    ST_MakeEnvelope(111.00, 6.00, 117.50, 17.50, 4326)
)
ON CONFLICT (zone_code) DO NOTHING;
