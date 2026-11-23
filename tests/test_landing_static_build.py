"""Static-build audit for the temporary agricultureatlas.org landing (apps/agriatlas-landing).

Run after `npm run build` inside apps/agriatlas-landing. Skips (with reason) when
`dist/` has not been built yet, so the rest of the suite stays runnable offline.
"""
from __future__ import annotations

from pathlib import Path
import re

import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]
LANDING_DIR = REPO_ROOT / "apps" / "agriatlas-landing"
DIST_DIR = LANDING_DIR / "dist"
CHAT_URLS = {
    "index.html": "https://agricultureatlas.org/en/chat",
    "vi/index.html": "https://agricultureatlas.org/vi/chat",
}
MIN_FONT_SIZE_PX = 11.0

PAGES = {
    "index.html": "en",
    "vi/index.html": "vi",
    "en/chat/index.html": "en",
    "vi/chat/index.html": "vi",
    "research/index.html": "en",
    "vi/research/index.html": "vi",
    "privacy/index.html": "en",
    "vi/privacy/index.html": "vi",
    "terms/index.html": "en",
    "vi/terms/index.html": "vi",
}

requires_build = pytest.mark.skipif(
    not (DIST_DIR / "index.html").is_file(),
    reason="apps/agriatlas-landing/dist not built — run `npm run build` first",
)

FONT_SIZE_PX_RE = re.compile(r"font-size\s*:\s*([0-9]+(?:\.[0-9]+)?)px", re.I)
FORBIDDEN_RE = re.compile(r"goweather|lorem ipsum|\bTODO\b|placeholder text", re.I)


def _read(rel: str) -> str:
    return (DIST_DIR / rel).read_text(encoding="utf-8")


def _built_text_files() -> list[Path]:
    return [p for p in DIST_DIR.rglob("*") if p.is_file() and p.suffix in {".html", ".css", ".js", ".xml"}]


def test_landing_source_scaffold_exists() -> None:
    for rel in ("package.json", "astro.config.mjs", "src/i18n/types.ts", "src/i18n/ui.ts"):
        assert (LANDING_DIR / rel).is_file(), f"missing {rel}"


def test_i18n_dictionary_keys_match_contract() -> None:
    types_src = (LANDING_DIR / "src/i18n/types.ts").read_text(encoding="utf-8")
    block = types_src.split("DICT_KEYS = [", 1)[1].split("] as const", 1)[0]
    contract = set(re.findall(r"'([a-z0-9_.]+)'", block))
    assert len(contract) > 50

    ui_src = (LANDING_DIR / "src/i18n/ui.ts").read_text(encoding="utf-8")
    for lang in ("en", "vi"):
        m = re.search(rf"\n\s*{lang}\s*:\s*\{{(.*?)\n\s*\}},?\s*\n", ui_src, re.S)
        assert m, f"cannot locate `{lang}` dictionary block in ui.ts"
        keys = set(re.findall(r"['\"]([a-z0-9_.]+)['\"]\s*:", m.group(1)))
        assert keys == contract, (
            f"{lang}: missing={sorted(contract - keys)} extra={sorted(keys - contract)}"
        )


@requires_build
@pytest.mark.parametrize("rel,lang", PAGES.items())
def test_page_lang_hreflang_canonical(rel: str, lang: str) -> None:
    html = _read(rel)
    assert re.search(rf'<html[^>]*\blang="{lang}"', html), f"{rel}: wrong <html lang>"
    for hl in ("en", "vi", "x-default"):
        assert re.search(rf'hreflang="{hl}"', html), f"{rel}: missing hreflang={hl}"
    assert re.search(r'rel="canonical"[^>]*href="https://agricultureatlas\.org/', html) or re.search(
        r'href="https://agricultureatlas\.org/[^"]*"[^>]*rel="canonical"', html
    ), f"{rel}: missing canonical"


@requires_build
def test_required_artifacts_built() -> None:
    for rel in ("404.html", "sitemap-index.xml", "robots.txt", "favicon.svg", "_headers", "staticwebapp.config.json"):
        assert (DIST_DIR / rel).is_file(), f"missing dist/{rel}"


@requires_build
@pytest.mark.parametrize("rel,chat_url", CHAT_URLS.items())
def test_home_ctas_point_to_chat(rel: str, chat_url: str) -> None:
    html = _read(rel)
    assert html.count(f'href="{chat_url}"') >= 3, f"{rel}: expected >=3 CTAs to {chat_url}"
    assert "AgriAtlas" not in html and "agriatlas.io" not in html, f"{rel}: leftover old brand/domain"
    assert "Agriculture Atlas" in html, f"{rel}: missing brand name Agriculture Atlas"
    for anchor in ('id="how"', 'id="indices"', 'id="regions"', 'id="data"'):
        assert anchor in html, f"{rel}: missing section {anchor}"


@requires_build
def test_no_forbidden_strings_in_build() -> None:
    hits = [
        f"{p.relative_to(DIST_DIR)}: {m.group(0)}"
        for p in _built_text_files()
        for m in [FORBIDDEN_RE.search(p.read_text(encoding="utf-8"))]
        if m
    ]
    assert not hits, "forbidden strings found:\n" + "\n".join(hits)


@requires_build
def test_built_css_font_sizes_respect_legibility_floor() -> None:
    """Landing is exempt from the 22px ceiling (Founder decision 2026-11-04) but no text below 11px."""
    sizes: list[tuple[str, float]] = []
    for p in _built_text_files():
        if p.suffix not in {".css", ".html"}:
            continue
        for m in FONT_SIZE_PX_RE.finditer(p.read_text(encoding="utf-8")):
            sizes.append((str(p.relative_to(DIST_DIR)), float(m.group(1))))
    assert sizes, "no px font-size declarations found in build"
    under = [f"{f}: {s}px" for f, s in sizes if s < MIN_FONT_SIZE_PX]
    assert not under, "font-size < 11px:\n" + "\n".join(under)


# Regulatory positioning safeguard (2026-11-04): reference agronomic indices only.
# These phrases implied forecasts, warnings, definitive advice or live data and must not return.
BANNED_POSITIONING_PHRASES = [
    "early warning", "cảnh báo sớm", "know when to", "biết khi nào", "lời khuyên",
    "plain advice", "simple advice", "decision atlas", "hỗ trợ quyết định",
    "graphcast forecasts", "dự báo google", "aurora forecasts", "dự báo aurora",
    "feed each cell", "cung cấp dữ liệu cho từng ô",
    "non-commercial licenses, which is why", "giấy phép phi thương mại riêng của từng nguồn",
]


@requires_build
@pytest.mark.parametrize("rel", ["index.html", "vi/index.html", "terms/index.html", "vi/terms/index.html"])
def test_reference_indices_positioning(rel: str) -> None:
    html = _read(rel).lower()
    hits = [p for p in BANNED_POSITIONING_PHRASES if p in html]
    assert not hits, f"{rel}: banned positioning phrases {hits}"


@requires_build
@pytest.mark.parametrize("rel,needle", [
    ("index.html", "not weather forecasts or official warnings"),
    ("vi/index.html", "không phải bản tin dự báo hay cảnh báo chính thức"),
    ("terms/index.html", "not a forecast or warning service"),
    ("vi/terms/index.html", "không phải dịch vụ dự báo, cảnh báo"),
])
def test_reference_only_disclaimer_present(rel: str, needle: str) -> None:
    assert needle in _read(rel).lower(), f"{rel}: missing disclaimer '{needle}'"


@requires_build
@pytest.mark.parametrize("rel", ["index.html", "vi/index.html", "en/chat/index.html", "vi/chat/index.html"])
def test_research_leadership_footer_present(rel: str) -> None:
    html = _read(rel)
    for token in (
        "Principal Investigator &amp; Lead AI Systems Architect",
        "Van Le (Lê Thành Văn)",
        "van.le@agricultureatlas.org",
        "research@agricultureatlas.org",
        "https://orcid.org/0009-0005-3514-106X",
        "0009-0005-3514-106X",
    ):
        assert token in html, f"{rel}: missing research leadership token '{token}'"


@requires_build
@pytest.mark.parametrize("rel", ["research/index.html", "vi/research/index.html"])
def test_research_pages_built_and_open_science_content(rel: str) -> None:
    assert (DIST_DIR / rel).is_file(), f"missing built research route dist/{rel}"
    html = _read(rel)
    for token in (
        "microsoft/aurora",
        "TerraMind",
        "Qwen3.8-27B",
        "github.com/vantbhp/agricultureatlas",
        "0009-0005-3514-106X",
    ):
        assert token in html, f"{rel}: missing Open-Science research token '{token}'"
