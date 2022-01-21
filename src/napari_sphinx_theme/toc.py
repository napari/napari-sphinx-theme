from bs4 import BeautifulSoup
from functools import lru_cache

@lru_cache(maxsize=None)
def get_page_toc(toc_html: str) -> str:
    if not toc_html:
        return toc_html

    soup = BeautifulSoup(toc_html, 'html.parser')

    nodes = [
      child
      for child in soup.ul
      if child.name == 'li' and child.find('ul')
    ]

    links = []

    for node in nodes:
      h2_items = node.find('ul')
      for child in h2_items:
        if child.name == 'li':
          links.append(child.a)

    new_list = soup.new_tag('ul')
    for link in links:
      list_item = soup.new_tag('li')
      list_item.append(link)
      new_list.append(list_item)

    return str(new_list)



GLOBAL_TOC_MAX_LEVELS = 3

@lru_cache(maxsize=None)
def get_global_toc(global_toc_html: str) -> str:
    if not global_toc_html:
        return global_toc_html

    soup = BeautifulSoup(global_toc_html, 'html.parser')

    new_list = soup.new_tag('ul')
    new_list.attrs['class'] = soup.ul.attrs.get('class', [])

    def add_nodes(current_node, level = 1, current = False):
        if level > GLOBAL_TOC_MAX_LEVELS:
            return

        nodes = [
            node
            for node in current_node.find_all('li')
            if f'toctree-l{level}' in node.attrs.get('class', [])
        ]

        for node in nodes:
            item_class = node.attrs.get('class', [])
            if current and 'current' not in item_class:
              item_class.append('current')

            new_item = soup.new_tag('li')
            new_item.attrs['class'] = item_class

            link_container = soup.new_tag('span')
            link_container.append(node.a)

            new_item.append(link_container)
            new_list.append(new_item)

            if node.ul:
                add_nodes(
                  current_node=node.ul,
                  level=level + 1,
                  current='current' in item_class,
                )

    add_nodes(soup)

    return str(new_list)
