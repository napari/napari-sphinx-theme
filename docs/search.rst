Unified napari.org search
=========================

The theme can replace Sphinx's search with one search box across the napari.org
sites, built on `Pagefind <https://pagefind.app>`__. A search from any
participating site also returns results from the others.

It is opt-in, and the default is still Sphinx's search.

Opting in
---------

Set the search provider and this site's name in ``conf.py``:

.. code-block:: python

   html_theme_options = {
       "search": "pagefind",
       "search_site": "napari-metadata",
   }

Then depend on the theme's ``search`` extra, which brings the Pagefind binary:

.. code-block:: text

   napari-sphinx-theme[search]

Remove any Pagefind step from the site's CI, because the theme now runs it at the
end of each HTML build.

``search_site`` must match a ``name`` in
``napari_sphinx_theme/static/search/napari-sites.json``, and the build fails if
it doesn't. To add a site, add it to that list in a theme PR. Every site picks it
up the next time it builds with that theme release.

How it works
------------

**Each site builds its own index.** Pagefind reads the site's finished HTML and
writes a bundle to ``<site>/pagefind/``. An index can't be shipped with the theme,
because it is made from each site's content.

**Results are merged in the browser.** When search is first opened, the theme's
script reads ``napari-sites.json`` and points one Pagefind instance at the current
site plus its siblings. Ordinary page views don't fetch any index.

**A missing sibling is skipped.** Pagefind hangs on "Searching for..." if a merged
bundle is missing, so the script checks that each sibling responds first and only
passes on the ones that do. Sites can therefore be listed before they opt in, and
a local build simply searches itself. The 404s this leaves in the browser's
network log are expected.

**Each site searches its own current version plus its siblings' stable
versions.** A site is recognized by its declared name, so docs doesn't merge with
itself whether it is served from ``/stable/``, ``/dev/`` or ``/0.11.0/``.

**The host's search button stays.** The script opens the search from the existing
button and from :kbd:`Ctrl+K` or :kbd:`Cmd+K`. It doesn't add or remove any page
elements, which would break sites hydrated by React. If Pagefind can't load, the
host's own search opens instead.

What gets indexed
-----------------

Pagefind indexes the article content of each page, including the API reference
and gallery, so navigation and sidebars stay out of results. These generated
pages are left out: ``genindex``, ``py-modindex``, ``np-modindex``, ``search`` and
source pages under ``_modules/``.

To leave out part of a page, add a ``data-pagefind-ignore`` attribute to it.

When the build fails
--------------------

A site that has opted in fails its build if the index can't be built, for example
because the ``search`` extra isn't installed. Otherwise it could deploy without an
index and quietly drop out of every other site's results. A failed build also
stops that site's deploy, and switching back to ``"search": "sphinx"`` opts out.

Live previews
-------------

Running Pagefind on every rebuild would be slow, and a partial build would produce
a partial index. Live-preview targets should turn it off for that build:

.. code-block:: text

   sphinx-autobuild docs docs/_build/html -D html_theme_options.search=sphinx

These previews use Sphinx's search. To try the unified search, make a full build
and serve the output:

.. code-block:: text

   sphinx-build -b html docs docs/_build/html
   python -m http.server --directory docs/_build/html

Siblings won't be reachable from a local server, so only the current site's
results appear.

Pagefind versions
-----------------

Merged indexes are searched with the main site's WASM, so sites should build with
the same Pagefind version. The theme's ``search`` extra pins one exact version,
and bumps ride theme releases. Sites will differ briefly while they each pick up
a release, and Pagefind logs a console message when merged versions differ.

Known limitations
-----------------

- A site's ``/stable/`` index only appears after its next release, so until then
  other sites won't return its results.
- Older docs versions keep Sphinx's search, because they aren't rebuilt.

Testing
-------

CI runs without a browser:

.. code-block:: text

   uv run --extra search pytest tests/
   node --test tests/test_search_installer.js

These tests can't cover real merging in the browser's WASM, or a shortcut opening
exactly one search. Check those by hand on Pagefind bumps and theme releases: the
search button and :kbd:`Ctrl+K` should each open one modal, dark mode should
restyle it, and the console should show no errors.
