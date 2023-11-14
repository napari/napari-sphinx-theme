# napari-sphinx-theme

A Sphinx theme based on the awesome
[pydata-sphinx-theme](https://github.com/pydata/pydata-sphinx-theme) with the
look and feel of napari.

This is currently a work-in-progress, but since it extends the
pydata-sphinx-theme, all the existing configurations and affordances are already
available. Check out the
[PyData Docs](https://pydata-sphinx-theme.readthedocs.io/en/latest/) for more
info.

## Installing for development

After creating a virtual environment, install the theme in editable mode:

```bash
python -m pip install -e .
```

## Building a demo site

To build the demo site, run:

```bash
cd docs/
make html
```

## Using it to build the napari website

To build the napari website, install the theme as a dependency.
