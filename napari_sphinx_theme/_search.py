"""The unified napari.org search.

Each site builds its own Pagefind index from its own HTML. The theme only
provides the machinery around it, so sites don't each carry a copy: the
Sphinx hooks registered by ``setup`` and the indexing they share with the
command for non-Sphinx sites.
"""

from __future__ import annotations

import html
import importlib.util
import json
import shutil
import subprocess
import sys
from fnmatch import fnmatch
from pathlib import Path
from typing import TYPE_CHECKING, Any

from sphinx.errors import ExtensionError

if TYPE_CHECKING:
    from docutils.nodes import Node
    from sphinx.application import Sphinx

ASSET_DIR = Path(__file__).parent / "static" / "search"
SITES_FILE = ASSET_DIR / "napari-sites.json"
INSTALLER = "napari-search-installer.js"


class SearchIndexError(RuntimeError):
    """The Pagefind index could not be built."""


def site_names() -> set[str]:
    """Return the names of the sites in the shared merge list."""
    sites = json.loads(SITES_FILE.read_text(encoding="utf-8"))["sites"]
    return {site["name"] for site in sites}


def build_index(
    site_dir: Path | str,
    exclude_selectors: tuple[str, ...] = (".headerlink",),
    root_selector: str | None = None,
) -> None:
    """Run Pagefind over a built site, raising if no usable index results."""
    if importlib.util.find_spec("pagefind") is None:
        msg = (
            "search='pagefind' needs the Pagefind binary; install "
            "napari-sphinx-theme[search]."
        )
        raise SearchIndexError(msg)

    command = [sys.executable, "-m", "pagefind", "--site", str(site_dir)]
    for selector in exclude_selectors:
        command += ["--exclude-selectors", selector]
    if root_selector:
        command += ["--root-selector", root_selector]
    result = subprocess.run(command, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        msg = f"Pagefind failed:\n{result.stdout}\n{result.stderr}"
        raise SearchIndexError(msg)

    entry = Path(site_dir) / "pagefind" / "pagefind-entry.json"
    if not entry.is_file():
        msg = f"Pagefind reported success but did not write {entry}."
        raise SearchIndexError(msg)


def inject(
    site_dir: Path | str,
    site_name: str,
    hook_button: str,
    base_url: str = "",
) -> int:
    """Copy the search assets into a built site and load them on each page.

    The script goes in as a page element only. It opens the search from the
    host's own button, because removing host elements breaks React-hydrated
    pages. Returns the number of pages changed, and running it twice is safe.
    """
    site = Path(site_dir)
    assets = site / "_static" / "search"
    shutil.copytree(ASSET_DIR, assets, dirs_exist_ok=True)

    base = base_url.rstrip("/")
    tag = (
        f'<script src="{html.escape(base)}/_static/search/{INSTALLER}" '
        f'data-site="{html.escape(site_name)}" '
        f'data-hook-button="{html.escape(hook_button)}"></script>'
    )
    count = 0
    for page in site.rglob("*.html"):
        # Bytes, so Windows doesn't rewrite the page's line endings.
        text = page.read_bytes().decode("utf-8")
        if INSTALLER in text or "</head>" not in text:
            continue
        page.write_bytes(text.replace("</head>", f"{tag}</head>", 1).encode("utf-8"))
        count += 1
    return count


def _search_options(app: Sphinx) -> dict[str, Any]:
    """Return the HTML builder's theme options, or nothing for other builders."""
    return getattr(app.builder, "theme_options", None) or {}


def setup_search(app: Sphinx) -> None:
    """Check the search options and load the unified search on every page."""
    options = _search_options(app)
    provider = options.get("search", "sphinx")
    if provider == "sphinx":
        return
    if provider != "pagefind":
        msg = (
            f"napari-sphinx-theme: unknown search provider {provider!r}; "
            "use 'sphinx' or 'pagefind'."
        )
        raise ExtensionError(msg)

    site = options.get("search_site")
    names = site_names()
    if site not in names:
        msg = (
            "napari-sphinx-theme: search='pagefind' needs search_site set to "
            f"one of {sorted(names)}, got {site!r}. New sites are added to "
            "static/search/napari-sites.json in the theme."
        )
        raise ExtensionError(msg)

    for pattern, weight in _page_weights(app).items():
        is_number = isinstance(weight, int | float) and not isinstance(weight, bool)
        if not is_number or not 0 <= weight <= 10:
            msg = (
                "napari-sphinx-theme: search_page_weights values must be "
                f"numbers from 0 to 10, got {weight!r} for {pattern!r}."
            )
            raise ExtensionError(msg)

    app.add_js_file(
        "search/napari-search-installer.js",
        **{"data-site": site, "data-hook-button": ".search-button__button"},
    )


def _page_weights(app: Sphinx) -> dict[str, float]:
    """Return the page weights, ignoring theme.conf's empty default."""
    weights = _search_options(app).get("search_page_weights")
    return weights if isinstance(weights, dict) else {}


def set_search_weight(
    app: Sphinx,
    pagename: str,
    templatename: str,
    context: dict[str, Any],
    doctree: Node,
) -> None:
    """Give the page the weight of the first pattern it matches, if any."""
    context["napari_search_weight"] = next(
        (
            weight
            for pattern, weight in _page_weights(app).items()
            if fnmatch(pagename, pattern)
        ),
        None,
    )


def build_search_index(app: Sphinx, exception: BaseException | None) -> None:
    """Index the finished site, failing the build if that isn't possible.

    A site that opted in would otherwise deploy without its index and silently
    drop out of every other site's results.
    """
    if exception is not None:
        return
    if _search_options(app).get("search", "sphinx") != "pagefind":
        return
    try:
        build_index(app.outdir)
    except SearchIndexError as error:
        msg = f"napari-sphinx-theme: {error}"
        raise ExtensionError(msg) from error


def setup(app: Sphinx) -> None:
    """Register the search hooks, which do nothing unless a site opts in."""
    app.connect("builder-inited", setup_search)
    app.connect("html-page-context", set_search_weight)
    app.connect("build-finished", build_search_index)
