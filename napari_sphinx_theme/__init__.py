from __future__ import annotations

from fnmatch import fnmatch
from pathlib import Path
from typing import TYPE_CHECKING, Any

from docutils.nodes import Node
from sphinx.errors import ExtensionError

from . import _search
from .napari_code_theme import NapariCodeTheme

if TYPE_CHECKING:
    from sphinx.application import Sphinx

try:
    from ._version import version as __version__
except ImportError:
    __version__ = "not-installed"

__all__ = ["NapariCodeTheme", "__version__", "get_html_theme_path", "setup"]

TEMPLATE_SECTIONS: list[str] = [
    "theme_navbar_start",
    "theme_navbar_center",
    "theme_navbar_end",
    "theme_footer_items",
    "theme_page_sidebar_items",
    "theme_left_sidebar_end",
    "sidebars",
]


def setup_html_template_context(
    app: Sphinx,
    pagename: str,
    templatename: str,
    context: dict[str, Any],
    doctree: Node,
) -> None:
    """Update template names for page build and setup html context."""

    for section in TEMPLATE_SECTIONS:
        section_value = context.get(section)
        if section_value:
            # Break apart `,` separated strings so we can use , in the defaults
            if isinstance(section_value, str):
                context[section] = [ii.strip() for ii in section_value.split(",")]

            # Add `.html` to templates with no suffix
            section_value = context.get(section)
            if isinstance(section_value, list):
                for ii, template in enumerate(section_value):
                    if not Path(template).suffix:
                        context[section][ii] = template + ".html"


def set_config_defaults(app: Sphinx) -> None:
    """Set default config values for theme."""
    try:
        theme: dict[str, Any] | None = app.builder.theme_options
    except AttributeError:
        theme = None
    if not theme:
        theme = {}

    # Note: If there are custom options for the theme that you would like to set,
    #       do so here. For example:
    #       theme['logo'] = logo.svg

    # Update the HTML theme config
    app.builder.theme_options = theme


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
    names = _search.site_names()
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
        _search.build_index(app.outdir)
    except _search.SearchIndexError as error:
        msg = f"napari-sphinx-theme: {error}"
        raise ExtensionError(msg) from error


def get_html_theme_path() -> list[str]:
    """Return list of HTML theme paths."""
    return [str(Path(__file__).parent.parent.resolve())]


# For more details, see:
# https://www.sphinx-doc.org/en/master/development/theming.html#distribute-your-theme-as-a-python-package
def setup(app: Sphinx) -> dict[str, Any]:
    """Setup the Sphinx theme extension."""
    here = Path(__file__).parent.resolve()

    # register theme with Sphinx
    app.add_html_theme("napari_sphinx_theme", str(here))

    # connect event handlers for configuration and template processing
    app.connect("builder-inited", set_config_defaults)
    app.connect("builder-inited", setup_search)
    app.connect("html-page-context", setup_html_template_context)
    app.connect("html-page-context", set_search_weight)
    app.connect("build-finished", build_search_index)

    # add sidebar templates to the search path for templates
    app.config.templates_path.append(str(here / "_templates"))

    return {"version": __version__, "parallel_read_safe": True}
