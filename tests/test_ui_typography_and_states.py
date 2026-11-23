from __future__ import annotations

from pathlib import Path
import re
import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]
APPS_DIR = REPO_ROOT / "apps"
WEB_ATLAS_DIR = APPS_DIR / "agriatlas-web"
MOBILE_ZERO_LIT_DIR = APPS_DIR / "agriatlas-mobile-zero-literacy"

MAX_FONT_SIZE_PX = 22.0

# Matches CSS `font-size: 16px` or `font-size: 13.5px`
CSS_FONT_SIZE_RE = re.compile(
    r"font-size\s*:\s*([0-9]+(?:\.[0-9]+)?)\s*px",
    re.IGNORECASE,
)

# Matches Dart `fontSize: 16.5` or `fontSize: 19`
DART_FONT_SIZE_RE = re.compile(
    r"fontSize\s*:\s*([0-9]+(?:\.[0-9]+)?)",
)


# Third-party / generated output must not be audited as first-party UI source.
IGNORED_DIRS = {"node_modules", "dist", ".astro"}
# Founder decision 2026-11-04: the public marketing landing is exempt from the 22px
# product-UI ceiling (it has its own floor check in tests/test_landing_static_build.py).
CEILING_EXEMPT_APPS = {"agriatlas-landing"}


def _iter_ui_source_files() -> list[Path]:
    extensions = {".css", ".html", ".dart", ".astro"}
    files = [
        p
        for p in APPS_DIR.rglob("*")
        if p.is_file()
        and p.suffix.lower() in extensions
        and not (IGNORED_DIRS & set(p.relative_to(APPS_DIR).parts))
    ]
    return sorted(files)


def test_ui_source_files_exist() -> None:
    files = _iter_ui_source_files()
    assert len(files) >= 3, f"Expected UI source files in {APPS_DIR}, found {files}"
    assert (
        MOBILE_ZERO_LIT_DIR / "lib" / "zero_literacy_home_screen.dart"
    ).is_file()
    assert (
        MOBILE_ZERO_LIT_DIR / "preview" / "zero-literacy-simulator.html"
    ).is_file()


def test_all_css_html_dart_font_sizes_strictly_at_or_below_22px() -> None:
    """
    Product UI Typography Rule:
    UI Typography Ceiling <= 22px across all CSS, HTML, and Dart files in apps/.
    """
    files = [
        p for p in _iter_ui_source_files()
        if p.relative_to(APPS_DIR).parts[0] not in CEILING_EXEMPT_APPS
    ]
    violations: list[str] = []
    total_declarations_checked = 0

    for file_path in files:
        content = file_path.read_text(encoding="utf-8")
        rel_path = file_path.relative_to(REPO_ROOT)

        for match in CSS_FONT_SIZE_RE.finditer(content):
            total_declarations_checked += 1
            size_val = float(match.group(1))
            if size_val > MAX_FONT_SIZE_PX:
                violations.append(
                    f"{rel_path}: CSS font-size {size_val}px > {MAX_FONT_SIZE_PX}px"
                )

        if file_path.suffix.lower() == ".dart":
            for match in DART_FONT_SIZE_RE.finditer(content):
                total_declarations_checked += 1
                size_val = float(match.group(1))
                if size_val > MAX_FONT_SIZE_PX:
                    violations.append(
                        f"{rel_path}: Dart fontSize {size_val} > {MAX_FONT_SIZE_PX}"
                    )

    assert total_declarations_checked > 0, "No font-size/fontSize declarations found"
    assert not violations, "Typography ceiling (>22px) violations:\n" + "\n".join(
        violations
    )


def test_brand_and_traffic_light_colors_present() -> None:
    """
    Verify mandatory accent #00F0FF and traffic light colors #10B981, #F59E0B, #EF4444.
    """
    files = _iter_ui_source_files()
    combined_upper = "\n".join(
        p.read_text(encoding="utf-8").upper() for p in files
    )

    assert "#00F0FF" in combined_upper or "0XFF00F0FF" in combined_upper
    assert "#10B981" in combined_upper or "0XFF10B981" in combined_upper
    assert "#F59E0B" in combined_upper or "0XFFF59E0B" in combined_upper
    assert "#EF4444" in combined_upper or "0XFFEF4444" in combined_upper


@pytest.mark.parametrize(
    "app_subdir",
    [
        WEB_ATLAS_DIR,
        MOBILE_ZERO_LIT_DIR,
    ],
)
def test_four_mandatory_ui_states_implemented(app_subdir: Path) -> None:
    """
    Verify both Web Scientific Atlas (apps/agriatlas-web/) and
    Mobile Zero-Literacy UI (apps/agriatlas-mobile-zero-literacy/)
    implement all 4 mandatory UI states: Loading, Empty, Error, Populated.
    """
    assert app_subdir.is_dir(), f"Missing app directory: {app_subdir}"
    app_files = [
        p
        for p in app_subdir.rglob("*")
        if p.is_file() and p.suffix.lower() in {".html", ".css", ".dart", ".js", ".ts"}
    ]
    assert app_files, f"No source files found in {app_subdir}"

    combined_lower = "\n".join(
        p.read_text(encoding="utf-8").lower() for p in app_files
    )

    for required_state in ("loading", "empty", "error", "populated"):
        assert required_state in combined_lower, (
            f"App {app_subdir.name} is missing mandatory UI state: {required_state}"
        )


def test_mobile_zero_literacy_sensory_ux_features() -> None:
    """
    Verify Mobile Zero-Literacy Sensory UX implements:
    - Web Speech API (`speechSynthesis`) in simulator HTML
    - Folk units ("một đốt ngón tay" / "1 đốt ngón tay", "nửa nắp chai", "xô 10 lít")
    - AA-SKU-4 Edge Offline stack (MobileNetV4 + VieNeu-TTS-v3-Nano + Gemma-4-E2B / Qwen3.5-0.8B)
    - H3 < 5 KB offline telemetry packet and Outdoor Sun High-Contrast Mode
    - Zero raw AI model/quantization jargon or KTTV forecast/warning terms inside farmer TTS strings
    """
    dart_screen = (
        MOBILE_ZERO_LIT_DIR / "lib" / "zero_literacy_home_screen.dart"
    ).read_text(encoding="utf-8")
    sim_html = (
        MOBILE_ZERO_LIT_DIR / "preview" / "zero-literacy-simulator.html"
    ).read_text(encoding="utf-8")

    assert "speechSynthesis" in sim_html
    assert "<svg" in sim_html
    assert "outdoor-sun-mode" in sim_html
    assert "AA-SKU-4" in dart_screen and "AA-SKU-4" in sim_html
    assert "MobileNetV4" in dart_screen and "MobileNetV4" in sim_html
    assert "VieNeu-TTS" in dart_screen and "VieNeu-TTS" in sim_html
    assert "5120" in dart_screen or "<5KB" in dart_screen
    assert "<5KB" in sim_html or "< 5 KB" in sim_html
    assert "đốt ngón tay" in dart_screen and "đốt ngón tay" in sim_html
    assert "nửa nắp chai" in dart_screen and "nửa nắp chai" in sim_html
    assert "xô 10 lít" in dart_screen and "xô 10 lít" in sim_html

    # Verify farmer-facing TTS voice strings contain zero raw AI jargon or KTTV restricted terms
    dart_tts_strings = re.findall(
        r"spoken(?:Traffic|WaterBucket|SeedSchedule|MorningRadio|LeafDoctor)Prompt:\s*'([^']+)'",
        dart_screen,
    )
    sim_tts_strings = re.findall(
        r'spoken(?:Traffic|Water|Seed|Radio|Doctor):\s*"([^"]+)"',
        sim_html,
    )
    assert len(dart_tts_strings) >= 15, f"Expected >= 15 Dart TTS prompts, found {len(dart_tts_strings)}"
    assert len(sim_tts_strings) >= 15, f"Expected >= 15 Simulator TTS prompts, found {len(sim_tts_strings)}"

    jargon_or_kttv_re = re.compile(
        r"AA-SKU-4|Agri-SKU|MobileNetV4|TurboQuant|MatFormer|Gemma|LiteRT|cảnh báo|báo động|dự báo",
        re.IGNORECASE,
    )
    for tts in dart_tts_strings + sim_tts_strings:
        assert not jargon_or_kttv_re.search(tts), (
            f"Raw AI jargon or restricted KTTV term leaked into farmer TTS prompt: {tts}"
        )
