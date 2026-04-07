help: ## Show this help message.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

.PHONY: help clean uninstall build install docs docs-live docs-clean docs-help

clean: ## Cleans up compiled assets.
	rm -rf dist src/*.egg-info
	rm -rf src/napari_sphinx_theme/theme/napari_sphinx_theme/static/{scripts,styles}/napari*

uninstall: ## Uninstalls napari theme.
	pip uninstall -y napari_sphinx_theme

build: ## Builds the theme assets and packages it into a wheel.
	python -m build

install: clean uninstall build ## Installs the napari theme using pip.
	pip install dist/napari_sphinx_theme*.whl

docs-help: ## Shows the available Sphinx targets for the demo docs.
	$(MAKE) -C docs help

docs-clean: ## Removes built demo docs.
	$(MAKE) -C docs clean

docs: ## Builds the demo docs HTML from the repo root.
	$(MAKE) -C docs html

docs-live: ## Starts a live-reloading demo docs server and opens it in a browser.
	$(MAKE) -C docs livehtml
