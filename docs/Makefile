# Minimal makefile for Sphinx documentation
#

# You can set these variables from the command line, and also
# from the environment for the first two.
SPHINXOPTS    ?=
SPHINXBUILD   ?= sphinx-build
SOURCEDIR     = .
BUILDDIR      = _build

# Put it first so that "make" without argument is like "make help".
help:
	@$(SPHINXBUILD) -M help "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

ifeq ($(OS),Windows_NT)
clean:
	@python -c "import shutil; shutil.rmtree('$(BUILDDIR)', ignore_errors=True)"
else
clean:
	rm -rf "$(BUILDDIR)"
endif

livehtml:
	sphinx-autobuild \
		-b html \
		"$(SOURCEDIR)" \
		"$(BUILDDIR)/html" \
		$(SPHINXOPTS) \
		$(O) \
		--watch "../napari_sphinx_theme" \
		--open-browser \
		--port 0

.PHONY: help clean livehtml Makefile

# Catch-all target: route all unknown targets to Sphinx using the new
# "make mode" option.  $(O) is meant as a shortcut for $(SPHINXOPTS).
%: Makefile
	@$(SPHINXBUILD) -M $@ "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O) -vvv
