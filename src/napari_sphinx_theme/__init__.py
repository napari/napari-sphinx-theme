import os.path as osp
import logging
from pathlib import Path
from sphinx.application import Sphinx
from typing import Any, Dict

from .toc import get_global_toc, get_page_toc

THEME_PATH = (Path(__file__).parent / 'napari').resolve()

__version__ = '0.1.0'

logger = logging.getLogger(osp.basename(__file__))
logging.basicConfig(level=logging.INFO)

def _get_global_toc(context: Dict[str, Any]) -> str:
    if 'toctree' in context:
        get_toctree = context['toctree']
        toctree_html = get_toctree(
            collapse=False,
            titles_only=True,
            maxdepth=-1,
            includehidden=True,
        )
    else:
        toctree_html = ''

    return get_global_toc(toctree_html)


def _init_page_context(
    app: Sphinx,
    pagename: str,
    templatename: str,
    context: Dict[str, Any],
    doctree: Any,
):
    context['napari_global_toc'] = _get_global_toc(context)
    context['napari_page_toc'] = get_page_toc(context.get('toc', ''))

def setup(app: Sphinx) -> Dict[str, any]:
    app.require_sphinx('3.0')
    app.add_html_theme('napari', THEME_PATH)
    app.connect('html-page-context', _init_page_context)

    return {
        'parallel_read_safe': True,
        'parallel_write_safe': True,
        'version': __version__,
    }
