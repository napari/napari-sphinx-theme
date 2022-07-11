from docutils import nodes
from docutils.parsers.rst import directives
from sphinx.directives import SphinxDirective
from sphinx.util.typing import OptionSpec
from typing import List

class CalendarDirective(SphinxDirective):
    has_content = True
    option_spec: OptionSpec = {
        'show-filters': directives.flag,
        'calendar-id': directives.unchanged_required,
    }

    def run(self) -> List[nodes.Node]:
        classes = [
          'napari-calendar',
          # Hacky approach to pass calendar ID to div since it's not possible to
          # pass HTML attributes using docutils :(
          f'calendar-id-{self.options["calendar-id"]}',
        ]

        if 'show-filters' in self.options:
          classes.append('show-filters')

        calendar = nodes.container(
          '',
          is_div=True,
          classes=classes,
        )

        return [calendar]
