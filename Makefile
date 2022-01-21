help: ## Show this help message.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

clean: ## Cleans up compiled assets.
	rm -rf dist src/*.egg-info
	rm -rf src/napari_sphinx_theme/napari/static/dist
	cd theme && make clean

uninstall: ## Uninstalls napari theme.
	pip uninstall -y napari_sphinx_theme

build: ## Builds the theme assets and packages it into a wheel.
	cd theme && make theme
	cp -R theme/dist src/napari_sphinx_theme/napari/static
	python -m build .

install: clean uninstall build ## Installs the napari theme using pip.
	pip install dist/napari_sphinx_theme*.whl
