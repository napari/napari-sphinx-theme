help: ## Show this help message.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

clean: ## Cleans the compiled frontend assets.
	rm -rf dist

theme: clean ## Builds the theme frontend assets.
	yarn
	vite build
