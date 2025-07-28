from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING, Any

from docutils.nodes import Node

from .napari_code_theme import NapariCodeTheme

if TYPE_CHECKING:
    from sphinx.application import Sphinx

try:
    from ._version import version as __version__  # type: ignore
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
    app.connect("html-page-context", setup_html_template_context)

    # add sidebar templates to the search path for templates
    app.config.templates_path.append(str(here / "_templates"))

    return {"version": __version__, "parallel_read_safe": True}
