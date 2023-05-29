import os
import time
import datetime
from napari_sphinx_theme import __version__
# Configuration file for the Sphinx documentation builder for
# matplotlib projects.

version = __version__

# Parse year using SOURCE_DATE_EPOCH, falling back to current time.
# https://reproducible-builds.org/specs/source-date-epoch/
build_date = datetime.datetime.utcfromtimestamp(
    int(os.environ.get('SOURCE_DATE_EPOCH', time.time()))
)

# -- Project information -----------------------------------------------------

project = "napari Sphinx Theme"
copyright = (
    f"2023 - {build_date.year} napari Community"
)
author = "napari Community"


# -- General configuration ---------------------------------------------------

# Add any paths that contain templates here, relative to this directory.
templates_path = ["_templates"]

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]

# -- Options for HTML output -------------------------------------------------

html_theme = "napari_sphinx_theme"

# Define the json_url for our version switcher.
json_url = "https://napari.org/napari-sphinx-theme/_static/switcher.json"
if "dev" in version:
    version_match = "latest"
    # We want to keep the relative reference if we are in dev mode
    # but we want the whole url if we are effectively in a released version
    json_url = "_static/switcher.json"
else:
    version_match = version

html_theme_options = {
    # logo is installed by mpl-sphinx-theme as:
    # "logo": {"link": "https://matplotlib.org/stable/",
    #         "image_light": "_static/logo_light.svg",
    #         "image_dark": "_static/logo_dark.svg"},
    # if this default is OK, then no need to modify "logo"
    # collapse_navigation in pydata-sphinx-theme is slow, so skipped for local
    # and CI builds https://github.com/pydata/pydata-sphinx-theme/pull/386
    "show_toc_level": 1,
    "show_prev_next": False,
    "navbar_end": ["version-switcher", "navbar-icon-links"],
    # "left_sidebar_end": ["custom-template.html", "sidebar-ethical-ads.html"],
    # "footer_items": ['navbar-version', 'napari-footer-links', 'copyright'],
    "switcher": {
        "json_url": "https://napari.org/napari-sphinx-theme/_static/switcher.json",
        "version_match": version_match,
    },
}

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
# html_static_path = ["_static"]

html_sidebars = {
    "**": [
        "search-field",
        "sidebar-nav-bs",
    ],
}

