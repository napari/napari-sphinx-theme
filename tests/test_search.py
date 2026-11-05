"""Tests for the unified search's Sphinx integration and index build."""

from __future__ import annotations

import gzip
import json
import textwrap
from pathlib import Path
from typing import Any
from unittest.mock import Mock, patch

import pytest
from sphinx.application import Sphinx
from sphinx.errors import ExtensionError

from napari_sphinx_theme import _search as search

SIDEBAR_ONLY_WORD = "zzsidebarword"


def build(
    tmp_path: Path, options: dict[str, Any] | None = None, **overrides: Any
) -> Path:
    """Build a tiny site with the theme and return its HTML directory."""
    src = tmp_path / "src"
    src.mkdir()
    (src / "conf.py").write_text(
        textwrap.dedent(
            f"""
            project = "Fixture"
            html_theme = "napari_sphinx_theme"
            html_theme_options = {options or {}!r}
            html_sidebars = {{"**": ["about-word.html"]}}
            templates_path = ["_templates"]
            """
        )
    )
    templates = src / "_templates"
    templates.mkdir()
    (templates / "about-word.html").write_text(f"<p>{SIDEBAR_ONLY_WORD}</p>")
    (src / "index.rst").write_text(
        "Fixture\n=======\n\nHome page text.\n\n"
        ".. toctree::\n\n   api\n\n.. index:: indexedterm\n"
    )
    (src / "api.rst").write_text(
        "API\n===\n\n.. py:function:: napari.layers.Image()\n\n"
        "   Docstring for the image layer.\n\n"
        ".. py:module:: fixturemodule\n"
    )
    out = tmp_path / "html"
    app = Sphinx(
        str(src),
        str(src),
        str(out),
        str(tmp_path / "doctrees"),
        "html",
        status=None,
        warning=None,
        confoverrides=overrides,
    )
    app.build()
    return out


def indexed_pages(html: Path) -> dict[str, str]:
    """Return each indexed page's URL and text from the Pagefind bundle."""
    pages = {}
    for path in (html / "pagefind" / "fragment").glob("*.pf_fragment"):
        raw = gzip.decompress(path.read_bytes())
        fragment = json.loads(raw[raw.index(b"{") :])
        pages[fragment["url"]] = fragment["content"]
    return pages


def installer_tag(html: Path) -> str:
    """Return the installer's script tag from the home page, if there is one."""
    for line in (html / "index.html").read_text(encoding="utf-8").splitlines():
        if "napari-search-installer.js" in line:
            return line
    return ""


def test_default_is_sphinx_search(tmp_path: Path) -> None:
    with patch("napari_sphinx_theme._search.build_index") as build_index:
        html = build(tmp_path)
    build_index.assert_not_called()
    assert not installer_tag(html)
    assert "data-pagefind-body" not in (html / "index.html").read_text(encoding="utf-8")


def test_opted_in_site_loads_installer(tmp_path: Path) -> None:
    options = {"search": "pagefind", "search_site": "docs"}
    with patch("napari_sphinx_theme._search.build_index") as build_index:
        html = build(tmp_path, options)
    build_index.assert_called_once()
    tag = installer_tag(html)
    assert 'data-site="docs"' in tag
    assert 'data-hook-button=".search-button__button"' in tag
    assert (html / "_static/search/napari-sites.json").is_file()
    assert (html / "_static/search/napari-search.css").is_file()


def test_override_turns_pagefind_off(tmp_path: Path) -> None:
    options = {"search": "pagefind", "search_site": "docs"}
    with patch("napari_sphinx_theme._search.build_index") as build_index:
        html = build(tmp_path, options, **{"html_theme_options.search": "sphinx"})
    build_index.assert_not_called()
    assert not installer_tag(html)


@pytest.mark.parametrize(
    "options",
    [
        {"search": "pagefind"},
        {"search": "pagefind", "search_site": "not-a-site"},
        {"search": "algolia"},
    ],
)
def test_bad_options_fail(tmp_path: Path, options: dict[str, str]) -> None:
    with pytest.raises(ExtensionError):
        build(tmp_path, options)


def test_index_failure_fails_build(tmp_path: Path) -> None:
    options = {"search": "pagefind", "search_site": "docs"}
    with (
        patch(
            "napari_sphinx_theme._search.importlib.util.find_spec",
            return_value=None,
        ),
        pytest.raises(ExtensionError, match=r"napari-sphinx-theme\[search\]"),
    ):
        build(tmp_path, options)


def test_build_index_reports_pagefind_failure(tmp_path: Path) -> None:
    failed = Mock(returncode=1, stdout="out", stderr="boom")
    with (
        patch("importlib.util.find_spec"),
        patch("subprocess.run", return_value=failed),
        pytest.raises(search.SearchIndexError, match="boom"),
    ):
        search.build_index(tmp_path)


def test_build_index_requires_entry_file(tmp_path: Path) -> None:
    passed = Mock(returncode=0, stdout="", stderr="")
    with (
        patch("importlib.util.find_spec"),
        patch("subprocess.run", return_value=passed),
        pytest.raises(search.SearchIndexError, match="pagefind-entry.json"),
    ):
        search.build_index(tmp_path)


def test_real_index_covers_articles_only(tmp_path: Path) -> None:
    pytest.importorskip("pagefind")
    html = build(tmp_path, {"search": "pagefind", "search_site": "docs"})

    assert (html / "pagefind" / "pagefind-entry.json").is_file()
    assert (html / "pagefind" / "pagefind-component-ui.js").is_file()

    pages = indexed_pages(html)
    urls = set(pages)
    assert any("api" in url for url in urls)
    assert not any(
        word in url for url in urls for word in ("genindex", "py-modindex", "search")
    )
    assert "Docstring for the image layer" in " ".join(pages.values())
    assert SIDEBAR_ONLY_WORD not in " ".join(pages.values())
    assert SIDEBAR_ONLY_WORD in (html / "api.html").read_text(encoding="utf-8")
