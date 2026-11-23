"""FastAPI Gateway for Agriculture Atlas Virtual Agro-Sensor Twin & Open-Science SKUs."""

from __future__ import annotations

from dataclasses import asdict
from pathlib import Path as FilePath
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException, Path, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app import (
    __api_domain__,
    __chat_domain__,
    __chat_domain_en__,
    __chat_domain_vi__,
    __compute_platform__,
    __domain__,
    __github_repo__,
    __orcid__,
    __principal_investigator__,
    __project__,
    __research_domain_en__,
    __research_domain_vi__,
    __version__,
)
from app.core.agro_physics_engine import (
    OPEN_SCIENCE_AZURE_AURORA_SKUS,
    VIETNAM_AGRO_ZONES,
    VirtualAgroSensorInput,
    build_h3_agro_delta_packet,
    evaluate_virtual_agro_sensor_twin,
    get_open_science_sku_manifest,
    get_vietnam_agro_zones,
    resolve_agro_zone_for_h3,
)

app = FastAPI(
    title="Agriculture Atlas Virtual Agro-Sensor & Open-Science SKU Gateway",
    version=__version__,
    description=(
        "100% Non-Commercial Open-Science Reference Agronomic Indices & Zero-IoT "
        "Virtual Agro-Sensor Gateway (https://agricultureatlas.org | https://api.agricultureatlas.org)"
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/healthz", tags=["System"])
def healthz() -> Dict[str, Any]:
    """Liveness, Air-Gapped Open-Science, and sovereignty readiness check for Agriculture Atlas Gateway."""
    return {
        "status": "ok",
        "project": __project__,
        "domain": __domain__,
        "chat_domain": __chat_domain__,
        "chat_domain_en": __chat_domain_en__,
        "chat_domain_vi": __chat_domain_vi__,
        "research_domain_en": __research_domain_en__,
        "research_domain_vi": __research_domain_vi__,
        "api_domain": __api_domain__,
        "github_repo": __github_repo__,
        "principal_investigator": __principal_investigator__,
        "orcid": __orcid__,
        "compute_platform": __compute_platform__,
        "version": __version__,
        "legal_posture": "100% Non-Commercial Open Science Public Good",
        "zero_domain_bleed": True,
        "air_gapped_open_science": True,
        "country_code": "VN",
        "sovereignty_verified": True,
        "vietnam_zone_count": len(VIETNAM_AGRO_ZONES),
        "sku_count": len(OPEN_SCIENCE_AZURE_AURORA_SKUS),
    }


@app.get("/api/v1/agro/vietnam-zones", tags=["Agro-Atlas Vietnam Pilot"])
def read_vietnam_agro_zones() -> Dict[str, Any]:
    """Return Phase 1 Vietnam 5 Agro-Ecological Zones including Hoang Sa & Truong Sa."""
    return get_vietnam_agro_zones()


@app.get("/api/v1/agro/sku-manifest", tags=["Open-Science Azure Aurora SKUs"])
def read_open_science_sku_manifest() -> Dict[str, Any]:
    """Return the 4 Open-Science Azure/Aurora & NVIDIA Earth-2 Agro SKUs (AA-SKU-1 to AA-SKU-4)."""
    return get_open_science_sku_manifest()


@app.get("/api/v1/agro/h3/{h3_index}", tags=["Virtual Agro-Sensor Twin"])
def read_h3_virtual_sensor_twin(
    h3_index: str = Path(..., min_length=5, max_length=32, description="H3 Res-7 or Res-8 index"),
    agro_zone_code: Optional[str] = Query(
        None, description="Optional Vietnam Agro-Ecological Zone code (VN_MKD, VN_CH, VN_RRD_NWM, VN_CCC, VN_HS_TS)"
    ),
    dominant_land_use: Optional[str] = Query(
        None, description="OvertureMaps land_use subtype (paddy, orchard, cropland, farmland, vineyard, aquaculture)"
    ),
    temp_min_c: Optional[float] = Query(None, ge=-15.0, le=50.0),
    temp_max_c: Optional[float] = Query(None, ge=-10.0, le=55.0),
    relative_humidity_pct: Optional[float] = Query(None, ge=1.0, le=100.0),
    wind_speed_2m_ms: Optional[float] = Query(None, ge=0.0, le=45.0),
    solar_radiation_mj_m2_day: Optional[float] = Query(None, ge=0.0, le=45.0),
    precip_mm_24h: Optional[float] = Query(None, ge=0.0, le=600.0),
    elevation_m: Optional[float] = Query(None, ge=-20.0, le=4500.0),
    smap_surface_moisture_pct: Optional[float] = Query(None, ge=0.0, le=100.0),
    sar_vh_vv_db: Optional[float] = Query(None, ge=-35.0, le=5.0),
    ndwi_sentinel2: Optional[float] = Query(None, ge=-1.0, le=1.0),
    estuary_salinity_g_l: Optional[float] = Query(None, ge=0.0, le=40.0),
    canal_distance_m: Optional[float] = Query(None, ge=1.0, le=50000.0),
    tidal_surge_m: Optional[float] = Query(None, ge=-2.0, le=6.0),
    crop_base_temp_c: Optional[float] = Query(None, ge=0.0, le=25.0),
    prior_gdd_accumulated: Optional[float] = Query(None, ge=0.0, le=5000.0),
) -> Dict[str, Any]:
    """Compute the 7 Virtual Agro-Sensor Twin indicators + 3-Color Traffic Light for an H3 cell."""
    if agro_zone_code is not None and agro_zone_code not in VIETNAM_AGRO_ZONES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported agro_zone_code '{agro_zone_code}'. Must be one of {list(VIETNAM_AGRO_ZONES.keys())}",
        )

    zone = resolve_agro_zone_for_h3(h3_index=h3_index, requested_zone=agro_zone_code)
    defaults = zone["default_meteo"]

    t_min = temp_min_c if temp_min_c is not None else defaults["temp_min_c"]
    t_max = temp_max_c if temp_max_c is not None else max(t_min, defaults["temp_max_c"])
    if t_max < t_min:
        t_max = t_min

    sensor_input = VirtualAgroSensorInput(
        h3_index=h3_index,
        agro_zone_code=zone["zone_code"],
        dominant_land_use=dominant_land_use or zone["default_land_use"],
        temp_min_c=t_min,
        temp_max_c=t_max,
        relative_humidity_pct=(
            relative_humidity_pct
            if relative_humidity_pct is not None
            else defaults["relative_humidity_pct"]
        ),
        wind_speed_2m_ms=(
            wind_speed_2m_ms if wind_speed_2m_ms is not None else defaults["wind_speed_2m_ms"]
        ),
        solar_radiation_mj_m2_day=(
            solar_radiation_mj_m2_day
            if solar_radiation_mj_m2_day is not None
            else defaults["solar_radiation_mj_m2_day"]
        ),
        precip_mm_24h=precip_mm_24h if precip_mm_24h is not None else defaults["precip_mm_24h"],
        elevation_m=elevation_m if elevation_m is not None else defaults["elevation_m"],
        smap_surface_moisture_pct=(
            smap_surface_moisture_pct
            if smap_surface_moisture_pct is not None
            else defaults["smap_surface_moisture_pct"]
        ),
        sar_vh_vv_db=sar_vh_vv_db if sar_vh_vv_db is not None else defaults["sar_vh_vv_db"],
        ndwi_sentinel2=(
            ndwi_sentinel2 if ndwi_sentinel2 is not None else defaults["ndwi_sentinel2"]
        ),
        estuary_salinity_g_l=(
            estuary_salinity_g_l
            if estuary_salinity_g_l is not None
            else defaults["estuary_salinity_g_l"]
        ),
        canal_distance_m=(
            canal_distance_m if canal_distance_m is not None else defaults["canal_distance_m"]
        ),
        tidal_surge_m=tidal_surge_m if tidal_surge_m is not None else defaults["tidal_surge_m"],
        crop_base_temp_c=(
            crop_base_temp_c
            if crop_base_temp_c is not None
            else zone["default_crop_base_temp_c"]
        ),
        prior_gdd_accumulated=(
            prior_gdd_accumulated
            if prior_gdd_accumulated is not None
            else defaults["prior_gdd_accumulated"]
        ),
    )

    reading = evaluate_virtual_agro_sensor_twin(sensor_input)
    payload = asdict(reading)
    payload["indicators"] = {
        "soil_moisture_root_zone": reading.soil_moisture_root_zone,
        "et0_mm_day": reading.et0_mm_day,
        "gdd_accumulated": reading.gdd_accumulated,
        "salinity_risk_index": reading.salinity_risk_index,
        "frost_risk_index": reading.frost_risk_index,
        "leaf_wetness_hours": reading.leaf_wetness_hours,
        "crop_stress_gravity_score": reading.crop_stress_gravity_score,
    }
    return payload


@app.get("/api/v1/agro/delta-packet/{h3_index}", tags=["Offline Field Delta Packet (<5KB)"])
def read_h3_agro_delta_packet(
    h3_index: str = Path(..., min_length=5, max_length=32, description="H3 Res-7 or Res-8 index"),
    agro_zone_code: Optional[str] = Query(
        None, description="Optional Vietnam Agro-Ecological Zone code"
    ),
    forecast_days: int = Query(14, ge=1, le=30, description="Forecast horizon in days (default 14)"),
) -> Dict[str, Any]:
    """Generate a zlib-compressed 14-day Offline Field Delta Packet guaranteed < 5 KB (< 5120 bytes)."""
    if agro_zone_code is not None and agro_zone_code not in VIETNAM_AGRO_ZONES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported agro_zone_code '{agro_zone_code}'. Must be one of {list(VIETNAM_AGRO_ZONES.keys())}",
        )
    return build_h3_agro_delta_packet(
        h3_index=h3_index,
        agro_zone_code=agro_zone_code,
        forecast_days=forecast_days,
    )


_PROJECT_ROOT = FilePath(__file__).resolve().parents[3]
_WEB_ATLAS_DIR = _PROJECT_ROOT / "apps" / "agriatlas-web"
_MOBILE_SIM_FILE = (
    _PROJECT_ROOT
    / "apps"
    / "agriatlas-mobile-zero-literacy"
    / "preview"
    / "zero-literacy-simulator.html"
)


@app.get("/", include_in_schema=False)
def serve_web_scientific_atlas() -> FileResponse:
    """Serve the Web Scientific Atlas (https://agricultureatlas.org/vi/chat) root UI."""
    return FileResponse(_WEB_ATLAS_DIR / "index.html", media_type="text/html")


@app.get("/mobile", include_in_schema=False)
def serve_mobile_zero_literacy_simulator() -> FileResponse:
    """Serve the Zero-Literacy Sensory Mobile UX interactive simulator."""
    return FileResponse(_MOBILE_SIM_FILE, media_type="text/html")


if (_WEB_ATLAS_DIR / "styles").is_dir():
    app.mount(
        "/styles",
        StaticFiles(directory=str(_WEB_ATLAS_DIR / "styles")),
        name="web_styles",
    )

if (_WEB_ATLAS_DIR / "js").is_dir():
    app.mount(
        "/js",
        StaticFiles(directory=str(_WEB_ATLAS_DIR / "js")),
        name="web_js",
    )


def run_zero_footprint_server(host: str = "127.0.0.1", port: int = 8090) -> None:
    """
    Zero-Disk-Footprint Thread-Safe HTTP/ASGI Preview Server on Mac (0 MB pip/Docker overhead).
    Routes all TCP HTTP requests on `http://127.0.0.1:8090` with no-cache headers and thread lock.
    """
    import threading
    from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
    from fastapi.testclient import TestClient

    asgi_client = TestClient(app)
    asgi_lock = threading.Lock()

    class FastAPIBridgeHandler(BaseHTTPRequestHandler):
        def _handle(self, method: str) -> None:
            with asgi_lock:
                if method == "OPTIONS":
                    resp = asgi_client.options(self.path)
                else:
                    resp = asgi_client.get(self.path)
            self.send_response(resp.status_code)
            for key, val in resp.headers.items():
                if key.lower() not in (
                    "content-length",
                    "transfer-encoding",
                    "connection",
                    "server",
                    "date",
                    "cache-control",
                ):
                    self.send_header(key, val)
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            body = b"" if method in ("HEAD", "OPTIONS") else resp.content
            self.send_header("Content-Length", str(len(resp.content) if method == "HEAD" else len(body)))
            self.end_headers()
            if body:
                self.wfile.write(body)

        def do_GET(self) -> None:
            self._handle("GET")

        def do_HEAD(self) -> None:
            self._handle("HEAD")

        def do_OPTIONS(self) -> None:
            self._handle("OPTIONS")

        def log_message(self, fmt: str, *args: Any) -> None:
            return

    ThreadingHTTPServer.allow_reuse_address = True
    server = ThreadingHTTPServer((host, port), FastAPIBridgeHandler)
    print(f"Agriculture Atlas Local Server listening on http://{host}:{port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    run_zero_footprint_server()


