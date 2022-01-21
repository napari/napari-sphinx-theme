from bs4 import BeautifulSoup

with open('derp.html') as f:
  html = f.read()

soup = BeautifulSoup(html, 'html.parser')

new_list = soup.new_tag('ul')
new_list.attrs['class'] = soup.ul.attrs['class']

MAX_LEVELS = 3

def add_nodes(current_node, level = 1):
  if level > MAX_LEVELS:
    return

  nodes = [
    node
    for node in current_node.find_all('li')
    if f'toctree-l{level}' in node.attrs['class']
  ]

  for node in nodes:
    new_item = soup.new_tag('li')
    new_item.attrs['class'] = node.attrs['class']
    new_item.append(node.a)
    new_list.append(new_item)

    if node.ul:
      add_nodes(node.ul, level + 1)

add_nodes(soup)

print(new_list.prettify())
