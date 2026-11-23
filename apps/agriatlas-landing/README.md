# Agriculture Atlas Public Open-Science Portal (`https://agricultureatlas.org`)

Public static open-science landing site and bilingual `/research` lab portal for **Agriculture Atlas** (`https://agricultureatlas.org`), built with **Astro 7** and deployed on **Microsoft Azure Static Web Apps** behind **Cloudflare**.

- **GitHub Repository:** `https://github.com/vantbhp/agricultureatlas`
- **Principal Investigator:** Van Le (Lê Thành Văn) — ORCID [`0009-0005-3514-106X`](https://orcid.org/0009-0005-3514-106X)
- **Institutional Contacts:** `van.le@agricultureatlas.org` · `research@agricultureatlas.org` · `grants@agricultureatlas.org` · `hello@agricultureatlas.org`

## Live Routes & Surfaces

| Route / Host | Role | Source |
|---|---|---|
| `https://agricultureatlas.org/` & `/vi/` | Bilingual Open-Science Landing Portal (EN default, VI at `/vi/`) | `apps/agriatlas-landing/` |
| `https://agricultureatlas.org/research/` & `/vi/research/` | Bilingual Open-Science Research Lab Portal (RQ1–RQ4, 4-SKU Golden Stack, FAIR DMP, Citation & Status) | `apps/agriatlas-landing/src/components/ResearchView.astro` |
| `https://agricultureatlas.org/en/chat` & `/vi/chat` | Reference agronomic indices assistant & H3 map standby/preview | `apps/agriatlas-landing/src/components/ChatStandbyView.astro` & `apps/agriatlas-web/` |
| `https://agricultureatlas.org/privacy/` & `/terms/` (`+ /vi/`) | Privacy Policy & Terms of Use (KTTV Law reference-only positioning) | `apps/agriatlas-landing/src/i18n/legal.ts` |
| `https://api.agricultureatlas.org` | API Gateway (FastAPI) | `services/agriatlas-gateway/` |

## Open-Science Model & Data Stack (2026-11-23)

- **AA-SKU-1 (Earth-System Simulation Backbone):** `microsoft/aurora` (`v1.5 / 0.1° / Wave / Air Pollution`, MIT License, *Nature* 2025), `nvidia/cbottle`, `nvidia/fourcastnet3` (Apache-2.0)
- **AA-SKU-2 (Earth-Observation Foundation Stack):** `TerraMind-1.0-base`, `THOR-1.0-base` (Apache-2.0), Microsoft Planetary Computer STAC & Google Earth Engine (Non-Commercial Research Access)
- **AA-SKU-3 (Bilingual Reasoning & Vietnamese Voice):** `Qwen/Qwen3.8-27B` / `nvidia/Qwen3.8-27B-NVFP4`, `Qwen3.6-35B-A3B`, `Qwen3-ASR-1.7B`, `VieNeu-TTS-v3-Turbo`
- **AA-SKU-4 (Offline Zero-Literacy Edge):** `MobileNetV4`, `VieNeu-TTS-v3-Nano`, `Gemma-4-E2B-it` / `Qwen3.5-0.8B` (`<5 KB` H3 edge packet)
- **Cross-Validation:** ECMWF AIFS 2.0 (`CC-BY-4.0`) and approved non-commercial multi-model earth-system research feeds

> **Regulatory & Epistemic Scope:** Agriculture Atlas computes **reference agronomic indices and research simulations only**. It does not provide official weather forecasts or official hydro-meteorological warnings.

## Local Development & Build

Requires Node `>= 22.12.0`.

```bash
cd apps/agriatlas-landing
npm install
npm run dev       # http://localhost:8080
npm run build     # astro check && astro build -> dist/
npm run preview   # preview built dist/ at http://localhost:8080
```

Automated verification (from repository root after `npm run build`):

```bash
python3 -m pytest tests/test_landing_static_build.py tests/test_ui_typography_and_states.py -q
```

## Directory Structure

```text
src/
├── i18n/types.ts        # Bilingual contract: Lang, DICT_KEYS, institutional URLs, localePath()
├── i18n/ui.ts           # Complete EN/VI UI & Research Lab dictionary
├── i18n/legal.ts        # EN/VI Privacy Policy & Terms of Use
├── layouts/BaseLayout.astro
├── components/          # SiteHeader, SiteFooter, LanguageSwitcher, HomeView, ResearchView, LegalView, ChatStandbyView
├── styles/              # tokens.css, global.css (self-hosted fonts only; zero external font CDNs)
└── pages/               # /, /research, /privacy, /terms, /en/chat, /404 + /vi/ equivalents
public/                  # favicon.svg, logo.svg, og-default.svg, robots.txt, _headers, staticwebapp.config.json
```

## Deployment (Azure Static Web Apps + Cloudflare)

1. Build static output into `dist/` via `npm run build`.
2. Deploy `dist/` to **Azure Static Web Apps** (routing and headers configured in `public/staticwebapp.config.json` and `public/_headers`).
3. Front with **Cloudflare** DNS/TLS for `agricultureatlas.org` (apex + `www` 301 redirect to apex) and `api.agricultureatlas.org`.
4. Submit `https://agricultureatlas.org/sitemap-index.xml` to search indexing services.
