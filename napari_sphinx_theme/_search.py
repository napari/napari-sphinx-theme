"""Build tooling for the unified napari.org search.

Each site builds its own Pagefind index from its own HTML. The theme only
provides the machinery around it, so sites don't each carry a copy.
"""

from __future__ import annotations

import html
import importlib.util
import json
import shutil
import subprocess
import sys
from pathlib import Path

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
