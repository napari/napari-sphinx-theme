# Contributing to this theme

Contributions are very welcome! Installing the development version, building
the demo docs and developing the css/js of the theme, etc, is explained in
more detail in the contributing section of the documentation:

- [Contributing source files](docs/contributing.md)
- [Contributing rendered docs](https://pydata-sphinx-theme.readthedocs.io/en/latest/contributing.html)

The files located in the `docs/` directory are only used to generate a demo site using the theme.
The `docs/` directory is not used to package the theme for distribution.

## Quickstart with uv

Build the demo docs one time and results are found in `docs/_build`:

```bash
uv run make docs
```

Start a live preview server for the demo docs:

```bash
uv run make docs-live
```
