import os
from pathlib import Path

__version__ = "0.0.1dev"


def update_templates(app, pagename, templatename, context, doctree):
    """Update template names for page build."""
    template_sections = [
        "theme_navbar_start",
        "theme_navbar_center",
        "theme_navbar_end",
        "theme_footer_items",
        "theme_page_sidebar_items",
        "theme_left_sidebar_end",
        "sidebars",
    ]

    for section in template_sections:
        if context.get(section):
            # Break apart `,` separated strings so we can use , in the defaults
            if isinstance(context.get(section), str):
                context[section] = [
                    ii.strip() for ii in context.get(section).split(",")
                ]

            # Add `.html` to templates with no suffix
            for ii, template in enumerate(context.get(section)):
                if not os.path.splitext(template)[1]:
                    context[section][ii] = template + ".html"

def set_config_defaults(app):

    try:
        theme = app.builder.theme_options
    except AttributeError:
        theme = None
    if not theme:
        theme = {}

    # Update the HTML theme config
    app.builder.theme_options = theme


def get_html_theme_path():
    """Return list of HTML theme paths."""
    return [str(Path(__file__).parent.parent.resolve())]


# def setup_html_page_context(app, pagename, templatename, context, doctree):
#     """Add a mpl_path template function."""
#     navbar_links = context['theme_navbar_links']
#     if navbar_links not in ['internal', 'absolute', 'server-stable']:
#         raise ValueError(f'Invalid navbar_links theme option: {navbar_links}')

#     def mpl_path(path):
#         if navbar_links == 'internal':
#             pathto = context['pathto']
#             return pathto(path)
#         elif navbar_links == 'absolute':
#             return f'https://matplotlib.org/stable/{path}'
#         elif navbar_links == 'server-stable':
#             return f'/stable/{path}'
#         else:
#             raise ValueError(
#                 f'Invalid navbar_links theme option: {navbar_links}')
#     context['mpl_path'] = mpl_path


# For more details, see:
# https://www.sphinx-doc.org/en/master/development/theming.html#distribute-your-theme-as-a-python-package
def setup(app):
    here = Path(__file__).parent.resolve()
    # Include component templates
    # app.config.templates_path.append(str(here / "components"))
    app.add_html_theme("napari_sphinx_theme", str(here))
    app.connect("builder-inited", set_config_defaults)
    app.connect("html-page-context", update_templates)

    # Include templates for sidebar
    app.config.templates_path.append(str(here / "_templates"))

    return {'version': __version__, 'parallel_read_safe': True}
