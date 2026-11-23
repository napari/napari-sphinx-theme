"""The brand folder stays in step with the theme and works without Sphinx."""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).parent.parent
BRAND = ROOT / "napari_sphinx_theme" / "static" / "brand"
THEME_CSS = ROOT / "napari_sphinx_theme" / "static" / "css" / "napari-sphinx-theme.css"

sys.path.insert(0, str(ROOT / "scripts"))
from build_brand import pygments_css  # noqa: E402


def test_pygments_css_is_up_to_date() -> None:
    committed = (BRAND / "pygments.css").read_text(encoding="utf-8")
    assert committed == pygments_css(), (
        "Regenerate it: uv run --no-project --with pygments python scripts/build_brand.py"
    )


def test_theme_css_imports_the_tokens() -> None:
    assert "@import url('../brand/napari-tokens.css');" in THEME_CSS.read_text("utf-8")


def test_every_napari_variable_the_theme_uses_is_defined() -> None:
    """A variable used but defined nowhere is a colour that silently vanishes."""
    tokens = (BRAND / "napari-tokens.css").read_text("utf-8")
    theme = THEME_CSS.read_text("utf-8")
    defined = set(re.findall(r"(--napari-[\w-]+)\s*:", tokens + theme))
    used = set(re.findall(r"var\((--napari-[\w-]+)", tokens + theme))
    assert used <= defined, f"used but not defined: {sorted(used - defined)}"


def test_dark_roles_match_in_both_dark_blocks() -> None:
    """The OS-dark and page-dark blocks must set the same values."""
    tokens = (BRAND / "napari-tokens.css").read_text("utf-8")
    media = re.search(
        r"@media \(prefers-color-scheme: dark\) \{(.*?)\n\}", tokens, re.DOTALL
    )
    assert media, "no prefers-color-scheme: dark block"
    by_os = media[1]
    by_page = tokens.split("html.dark {", 1)[1]
    declarations = re.compile(r"(--napari-[\w-]+):\s*([^;]+);")
    assert dict(declarations.findall(by_os)) == dict(declarations.findall(by_page))


@pytest.mark.parametrize(
    "icon", sorted(BRAND.glob("icons/*.svg")), ids=lambda p: p.name
)
def test_icons_take_the_text_colour(icon: Path) -> None:
    svg = icon.read_text("utf-8")
    assert "currentColor" in svg
    assert not re.search(
        r"(fill|stroke)[=:]\s*\"?(white|#fff\b|#ffffff)", svg, re.IGNORECASE
    )
    assert 'viewBox="' in svg


# Sites paste these SVGs straight into their pages, so an icon is code: it
# runs with the page's permissions. Each pattern is something an SVG can use
# to run script, embed HTML, or load from elsewhere.
UNSAFE_IN_SVG = {
    "script": r"<script\b",
    "event handler": r"\son[a-z]+\s*=",
    "embedded HTML": r"<foreignObject\b",
    "external reference": r"(?:xlink:)?href\s*=\s*[\"'](?!#)",
    "javascript: URL": r"javascript:",
    "CSS that loads something": r"url\(\s*[\"']?(?!#)|@import",
    "animation that sets attributes": r"<(?:set|animate)\b[^>]*attributeName\s*=\s*[\"'](?:href|on)",
}


@pytest.mark.parametrize(
    "icon", sorted(BRAND.glob("icons/*.svg")), ids=lambda p: p.name
)
def test_icons_cannot_run_code_or_load_anything(icon: Path) -> None:
    svg = icon.read_text("utf-8")
    found = [
        what
        for what, pattern in UNSAFE_IN_SVG.items()
        if re.search(pattern, svg, re.IGNORECASE)
    ]
    assert not found, f"{icon.name} contains: {', '.join(found)}"


@pytest.mark.parametrize(
    "icon", sorted(BRAND.glob("icons/*.svg")), ids=lambda p: p.name
)
def test_icons_define_no_ids(icon: Path) -> None:
    """Icons are pasted inline, often more than once a page, and ids must be unique.

    A clashing id makes url(#id) references (clip paths, gradients) point at
    another icon's element.
    """
    assert not re.search(r"\sid\s*=", icon.read_text("utf-8")), (
        f"{icon.name} defines an id"
    )


@pytest.mark.parametrize("name", ["napari-tokens.css", "pygments.css"])
def test_brand_css_loads_nothing(name: str) -> None:
    """Copied CSS must not fetch from elsewhere (tracking, or swapping content)."""
    css = (BRAND / name).read_text("utf-8")
    assert not re.search(r"url\(|@import|expression\(", css, re.IGNORECASE)


def test_pygments_style_needs_no_sphinx() -> None:
    """Importing the package (the Pygments entry point does) must not import Sphinx."""
    code = (
        "import sys, napari_sphinx_theme; "
        "bad = [m for m in ('sphinx', 'docutils') if m in sys.modules]; "
        "sys.exit(f'imported {bad}' if bad else 0)"
    )
    subprocess.run([sys.executable, "-c", code], cwd=ROOT, check=True)
