# napari-sphinx-theme

[![Code style: Ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/format.json)](https://github.com/astral-sh/ruff)

A Sphinx theme with the look and feel of napari based on the awesome
[pydata-sphinx-theme](https://github.com/pydata/pydata-sphinx-theme).

## Description

Since the napari-sphinx-theme extends the pydata-sphinx-theme,
the configurations and affordances provided by the
[PyData Sphinx Theme](https://pydata-sphinx-theme.readthedocs.io/en/latest/)
can be used within the [napari docs](https://github.com/napari/docs).

## Installation

After creating a virtual environment, install the theme in editable mode:

```bash
python -m pip install -e .
```

## Theme development

### Configuration options

Modify options in `theme.conf` to customize the `pydata-sphinx-theme` for napari.

### Styling (CSS)

Styling settings and napari's custom CSS is found in the
`static/css/napari-sphinx-theme.css` file.

The styling of code snippets is configured in `napari_sphinx_theme/napari_code_theme.py`.

### Templates (HTML)

To modify page layouts, modify the html template files in the `napari_sphinx_theme`
and `napari_sphinx_theme/partials` directories.

### Build and test

To build the demo site found in this repo, run:

```bash
cd docs/
make html
```

Use the demo site to manually test changes to styles and page layouts.

## The napari website

The [napari website](https://napari.org) is built using the
[napari docs repo](https://github.com/napari/docs).
The styling of the website is based on this theme.
Install this theme as a dependency in the napari docs repo.

To modify the website's styling, minor changes to CSS can be made in the docs
repo. More significant changes, such as those that may impact the entire
website and docs, should be made here.
