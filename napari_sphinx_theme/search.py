"""Command line for adding the unified napari.org search to a non-Sphinx site.

Run it after the site's own build::

    python -m napari_sphinx_theme.search prepare --site docs/_build/html \
        --site-name workshops --hook-button .myst-search-bar \
        --root-selector article --base-url /workshops/
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from . import _search


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="python -m napari_sphinx_theme.search",
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    commands = parser.add_subparsers(dest="command", required=True)
    prepare = commands.add_parser(
        "prepare", help="build the index, copy assets and inject the script"
    )
    prepare.add_argument(
        "--site", required=True, type=Path, help="the built HTML directory"
    )
    prepare.add_argument(
        "--site-name",
        required=True,
        choices=sorted(_search.site_names()),
        help="this site's name in napari-sites.json",
    )
    prepare.add_argument(
        "--hook-button",
        required=True,
        metavar="SELECTOR",
        help="the host's search button, which will open the search",
    )
    prepare.add_argument(
        "--root-selector",
        metavar="SELECTOR",
        help="only index inside this element, such as article",
    )
    prepare.add_argument(
        "--exclude-selector",
        action="append",
        default=[],
        dest="exclude_selectors",
        metavar="SELECTOR",
        help="leave this element out of the index (repeatable)",
    )
    prepare.add_argument(
        "--base-url",
        default=os.environ.get("BASE_URL", ""),
        help="the path the site is deployed under (default: $BASE_URL)",
    )
    args = parser.parse_args(argv)

    try:
        _search.build_index(
            args.site,
            exclude_selectors=(".headerlink", *args.exclude_selectors),
            root_selector=args.root_selector,
        )
    except _search.SearchIndexError as error:
        print(f"napari-sphinx-theme: {error}", file=sys.stderr)
        return 1
    count = _search.inject(args.site, args.site_name, args.hook_button, args.base_url)
    print(f"napari-sphinx-theme: indexed the site, added search to {count} pages")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
