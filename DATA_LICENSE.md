# Data, Model & Documentation Licensing Policy — Agriculture Atlas

**Project:** Agriculture Atlas Open-Science Initiative (`https://agricultureatlas.org`)  
**Repository:** `https://github.com/vantbhp/agricultureatlas`  
**Principal Investigator:** Van Le (Lê Thành Văn) — ORCID: `https://orcid.org/0009-0005-3514-106X`  
**Contact:** `research@agricultureatlas.org` | `van.le@agricultureatlas.org` | `grants@agricultureatlas.org`  
**Effective Date:** 2026-11-23

---

## 1. First-Party Licensing Summary

Agriculture Atlas uses a clean, permissive open-science dual-licensing structure for all first-party artifacts created by the initiative:

| Artifact Category | Path Scope | License |
| :--- | :--- | :--- |
| **Source Code, Migrations, APIs, Tests & Configs** | `services/`, `apps/`, `migrations/`, `configs/`, `tests/` | **Apache License 2.0** (see [`LICENSE`](LICENSE)) |
| **Technical Report, Scientific Documentation & Original Reference Datasets** | `docs/technical-report/`, `README.md`, `PRD.md`, and original Agriculture Atlas reference tables/derived indices | **Creative Commons Attribution 4.0 International (CC-BY-4.0)** |

### Attribution Requirement (CC-BY-4.0)
When reusing the Technical Report, documentation, or derived reference agronomic datasets produced by Agriculture Atlas, please credit:

> Le, Van (Lê Thành Văn), 2026. *Agriculture Atlas: Zero-IoT Virtual Agro-Sensor Twins and Offline Zero-Literacy Agronomic Reference Systems for Climate-Vulnerable Smallholder Farming*. Agriculture Atlas Open-Science Initiative (`https://agricultureatlas.org`), CC-BY-4.0. ORCID: `0009-0005-3514-106X`.

---

## 2. Core 4-SKU "Golden Stack" Upstream Model Licenses

All production-core models in the Agriculture Atlas 4-SKU Golden Stack are strictly **MIT** or **Apache-2.0**. Experimental comparison baselines under non-Apache licenses are isolated from the core stack and explicitly flagged below.

| SKU | Upstream Model / Checkpoint | License | Core Stack Status |
| :--- | :--- | :--- | :--- |
| **`AA-SKU-1`** | `microsoft/aurora` (`aurora-0.25-v1.5.ckpt`, `aurora-0.25-v1.5-ensemble.ckpt`, `aurora-0.1-finetuned.ckpt`, `aurora-0.25-wave.ckpt`, `aurora-0.4-air-pollution.ckpt`, `aurora-0.25-small-pretrained.ckpt`) | **MIT** | Core |
| **`AA-SKU-1`** | `nvidia/cbottle` (`cBottle-SR`, 330M) | **Apache-2.0** | Core |
| **`AA-SKU-1`** | `nvidia/fourcastnet3` (710.9M) | **Apache-2.0** | Core |
| **`AA-SKU-2`** | `ibm-esa-geospatial/TerraMind-1.0-base` (incl. `TerraMind-base-Flood`, `TerraMind-base-Fire`) | **Apache-2.0** | Core |
| **`AA-SKU-2`** | `FM4CS/THOR-1.0-base` (TerraTorch) | **Apache-2.0** | Core |
| **`AA-SKU-2`** | `ibm-nasa-geospatial/Prithvi-EO-2.0-300M-TL` | **Apache-2.0** | Optical Baseline |
| **`AA-SKU-3`** | `Qwen/Qwen3.8-27B` & `nvidia/Qwen3.8-27B-NVFP4` (27.78B) | **Apache-2.0** | Core |
| **`AA-SKU-3`** | `Qwen/Qwen3.6-35B-A3B` (MoE 3B active) | **Apache-2.0** | Core |
| **`AA-SKU-3`** | `Qwen/Qwen3-ASR-1.7B` | **Apache-2.0** | Core Vietnamese ASR |
| **`AA-SKU-3`** | `pnnbao-ump/VieNeu-TTS-v3-Turbo` (130.9M, 48 kHz) | **Apache-2.0** | Core Vietnamese TTS |
| **`AA-SKU-3`** | `nvidia/nemotron-3.5-asr-streaming-0.6b` & `vinai/PhoWhisper-large` | Upstream repo licenses (benchmark only) | ASR Benchmark Baselines |
| **`AA-SKU-3`** | `openbmb/VoxCPM2` & `Zyphra/ZONOS3-Mini` | Upstream repo licenses (Phase 2 ASEAN backup) | Regional Backup Only |
| **`AA-SKU-4`** | `timm/mobilenetv4_conv_small.e2400_r224_in1k` (3.8M) | **Apache-2.0** | Tier-0 Edge Vision Core |
| **`AA-SKU-4`** | `pnnbao-ump/VieNeu-TTS-v3-Nano` (48M ONNX) | **Apache-2.0** | Tier-0 Edge TTS Core |
| **`AA-SKU-4`** | `google/gemma-4-E2B-it` (`litert-community/gemma-4-E2B-it-litert-lm`) | **Apache-2.0** | Tier-1 Edge Multimodal Default |
| **`AA-SKU-4`** | `Qwen/Qwen3.5-0.8B` (`Q4_0`, 563 MB) & `Qwen/Qwen3-ASR-0.6B-hf` | **Apache-2.0** | Tier-1 Edge Lightweight Default |
| **`AA-SKU-4`** | `LiquidAI/LFM3-Omni-2B-GGUF` (1.27 GB) | **LFM Open License v1.0** | **Experimental Comparison Baseline Only (NOT Apache-2.0 Core)** |

---

## 3. Upstream Earth Observation, Geospatial & Agronomic Datasets

Agriculture Atlas does **not** redistribute raw upstream third-party datasets inside this repository. Users and downstream researchers must retrieve upstream datasets directly from their authoritative providers under each provider's license and attribution terms:

### A. Earth Observation, Hydrology & Climate Verification Sources
| Source | Coverage / Role | License / Access Governance |
| :--- | :--- | :--- |
| **Microsoft Planetary Computer STAC** | Copernicus Sentinel-1 SAR, Sentinel-2 L2A, Sentinel-3 SLSTR, NASA SMAP, DEM | Open data per underlying agency (ESA Copernicus Open Access, NASA Earthdata Open Policy); attribution required |
| **Google Earth Engine (GEE)** | Satellite preprocessing & non-commercial EO pipelines | **Approved Non-Commercial Research Access** — strictly non-commercial usage only |
| **ECMWF AIFS-ENS 2.0 (`ecmwf/aifs-ens-2.0`)** | Independent cross-model atmospheric hindcast verification | **CC-BY-4.0** (attribution to ECMWF required) |
| **Google DeepMind WeatherNext** | Independent cross-model atmospheric hindcast verification | **Approved Non-Commercial Research Access** — strictly non-commercial research verification only |
| **Overture Maps Foundation** | Agricultural `land_use` (`paddy`, `cropland`, `orchard`, `farmland`, `aquaculture`, `vineyard`) & `water` themes | Theme-specific open licenses (**ODbL 1.0** / **CDLA-Permissive-2.0** per Overture Maps release manifest) |

### B. Open Vietnam & Global Agronomic Evaluation Datasets (OSF Preregistration)
| Dataset Identifier | Size & Scope | License | Persistent Identifier |
| :--- | :--- | :--- | :--- |
| `minhhungg/rice-disease-dataset` | 37,978 images, 21 rice disease classes (Vietnam) | **Apache-2.0** | DOI: `10.57967/hf/8245` |
| `Project-AgML/durian_disease_classification_vietnam` | 2,595 durian disease images (Vietnam) | **CC-BY-4.0** | Hugging Face Hub |
| `farrel227/durian-disease-vinh-long` | Vinh Long durian disease field images (Mekong Delta) | **CC-BY-4.0** | Mendeley DOI: `10.17632/mhjwyb5p48.1` |
| `Project-AgML/arabica_coffee_leaf_disease_classification` | 58,549 Arabica coffee leaf disease images | **CC-BY-4.0** | Hugging Face Hub |
| `Project-AgML/iNatAg` | 4.72M agricultural organism images | **Apache-2.0** | Hugging Face Hub |
| `wangyi111/EuroSAT-SAR` | 27,000 Sentinel-1 SAR patches | **MIT** | Hugging Face Hub |

---

## 4. Non-Commercial Public-Good Charter & Legal Disclaimer

1. **Strict Air-Gapped Non-Commercial Boundary:** Agriculture Atlas is operated as a 100% non-commercial, non-profit open-science public-good initiative aligned with **UN SDG #2 (Zero Hunger)** and **UN SDG #13 (Climate Action)**. Any access granted under non-commercial research terms (including Google Earth Engine Non-Commercial and DeepMind WeatherNext Non-Commercial Research Access) is strictly segregated from commercial exploitation.
2. **Reference Agronomic Indices Only (Vietnam Law Compliance):** In accordance with the **Law on Hydrometeorology of the Socialist Republic of Vietnam (Law No. 90/2015/QH13)** and **Decree No. 38/2016/ND-CP**, outputs of Agriculture Atlas represent **reference agronomic indices** derived from deterministic physical equations (`FAO-56 Penman-Monteith`) and open Earth-observation datasets. They are **not** official hydrometeorological forecasts, storm advisories, or statutory disaster warnings.
3. **Sovereignty & Neutral Geospatial Standards:** All Phase 1 Vietnam geospatial schemas lock `country_code = 'VN'` across mainland Vietnam and Vietnam's islands, including **Hoàng Sa (Đà Nẵng)** and **Trường Sa (Khánh Hòa)** archipelagos.
