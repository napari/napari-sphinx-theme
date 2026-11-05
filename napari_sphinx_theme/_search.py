"""Build tooling for the unified napari.org search.

Each site builds its own Pagefind index from its own HTML. The theme only
provides the machinery around it, so sites don't each carry a copy.
"""

from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
from pathlib import Path

ASSET_DIR = Path(__file__).parent / "static" / "search"
SITES_FILE = ASSET_DIR / "napari-sites.json"


class SearchIndexError(RuntimeError):
    """The Pagefind index could not be built."""


def site_names() -> set[str]:
    """Return the names of the sites in the shared merge list."""
    sites = json.loads(SITES_FILE.read_text(encoding="utf-8"))["sites"]
    return {site["name"] for site in sites}


def build_index(
    site_dir: Path | str,
    exclude_selectors: tuple[str, ...] = (".headerlink",),
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
    result = subprocess.run(command, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        msg = f"Pagefind failed:\n{result.stdout}\n{result.stderr}"
        raise SearchIndexError(msg)

    entry = Path(site_dir) / "pagefind" / "pagefind-entry.json"
    if not entry.is_file():
        msg = f"Pagefind reported success but did not write {entry}."
        raise SearchIndexError(msg)
