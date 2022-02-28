from docutils import nodes
from docutils.parsers.rst import directives
from sphinx.directives import SphinxDirective
from sphinx.util.typing import OptionSpec
from typing import List

class CalendarDirective(SphinxDirective):
    has_content = True
    option_spec: OptionSpec = {
        'show-filters': directives.flag,
    }

    def run(self) -> List[nodes.Node]:
        classes = ['napari-calendar']

        if 'show-filters' in self.options:
          classes.append('show-filters')

        calendar = nodes.container(
          '',
          is_div=True,
          classes=classes,
        )

        return [calendar]
