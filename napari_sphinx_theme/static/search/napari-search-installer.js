// Opens the unified napari.org search from a host page's own search button.
//
// Load it from <site>/_static/search/, next to napari-sites.json, with:
//   data-site:        this site's name in napari-sites.json (required)
//   data-hook-button: selector for the host's search button
//
// The search only loads when first opened, so ordinary page views don't fetch
// every sibling's index. If it can't load, the host's own search takes over.

(function () {
  const PROBE_TIMEOUT_MS = 4000;

  // A site searches its own current version, so it must not merge itself. It
  // is matched by name because docs is served from /stable/, /dev/ and version
  // folders such as /0.11.0/.
  function siblingsOf(sites, siteName) {
    return sites.filter((site) => site.name !== siteName);
  }

  async function isBundleReachable(site, baseUrl, fetchFn, timeoutMs) {
    const entryUrl = new URL(`${site.bundlePath}pagefind-entry.json`, baseUrl);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchFn(entryUrl.href, {
        signal: controller.signal,
      });
      if (!response.ok) return false;
      const entry = JSON.parse(await response.text());
      return Boolean(entry) && typeof entry === 'object';
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  }

  // Pagefind hangs on "Searching for..." if a merged bundle is missing, so only
  // the bundles that respond are handed to it. Sites can therefore be listed
  // before they opt in, and local builds simply search themselves.
  async function reachableSites(
    sites,
    baseUrl,
    fetchFn = fetch,
    timeoutMs = PROBE_TIMEOUT_MS,
  ) {
    const reachable = await Promise.all(
      sites.map((site) => isBundleReachable(site, baseUrl, fetchFn, timeoutMs)),
    );
    return sites.filter((_, index) => reachable[index]);
  }

  function instanceOptions(bundleUrl, siblings) {
    return {
      bundlePath: bundleUrl,
      mergeIndex: siblings.map((site) => ({ bundlePath: site.bundlePath })),
      excerptLength: 15,
    };
  }

  function isSearchShortcut(event) {
    return (
      (event.metaKey || event.ctrlKey) &&
      !event.shiftKey &&
      !event.altKey &&
      event.key.toLowerCase() === 'k'
    );
  }

  function loadStylesheet(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function loadModule(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  async function loadSearch(assetsUrl, bundleUrl, siteName) {
    // Our own bundle can be missing too, and Pagefind hangs on that as well,
    // so the host's search takes over instead.
    const [own] = await reachableSites(
      [{ bundlePath: bundleUrl }],
      window.location.href,
    );
    if (!own) throw new Error(`No search index at ${bundleUrl}`);

    const response = await fetch(`${assetsUrl}napari-sites.json`);
    const { sites } = await response.json();
    const siblings = await reachableSites(
      siblingsOf(sites, siteName),
      window.location.href,
    );

    // Pagefind declares its defaults on :root too, so our stylesheet has to
    // come second for its --pf-* values to win.
    loadStylesheet(`${bundleUrl}pagefind-component-ui.css`);
    loadStylesheet(`${assetsUrl}napari-search.css`);
    await loadModule(`${bundleUrl}pagefind-component-ui.js`);

    window.PagefindComponents.configureInstance(
      'default',
      instanceOptions(bundleUrl, siblings),
    );
    const modal = document.createElement('pagefind-modal');
    document.body.appendChild(modal);
    return modal;
  }

  function start(script) {
    const { site: siteName, hookButton } = script.dataset;
    if (!siteName) {
      console.error('napari-search-installer: data-site is required');
      return;
    }
    const assetsUrl = new URL('.', script.src).href;
    const bundleUrl = new URL('../../pagefind/', assetsUrl).href;

    let modalPromise = null;
    let failed = false;

    async function openSearch() {
      modalPromise ??= loadSearch(assetsUrl, bundleUrl, siteName);
      try {
        (await modalPromise).open();
      } catch (error) {
        console.error('napari-search-installer: using host search', error);
        failed = true;
        if (hookButton) document.querySelector(hookButton)?.click();
      }
    }

    function intercept(event) {
      // Capture phase, and this script is not deferred so its listeners register
      // first. The host's own handlers (React's included) then never see
      // the event and can't open a second search.
      event.preventDefault();
      event.stopImmediatePropagation();
      openSearch();
    }

    if (hookButton) {
      document.addEventListener(
        'click',
        (event) => {
          if (!failed && event.target.closest?.(hookButton)) intercept(event);
        },
        true,
      );
    }
    window.addEventListener(
      'keydown',
      (event) => {
        if (!failed && isSearchShortcut(event)) intercept(event);
      },
      true,
    );
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = {
      instanceOptions,
      isSearchShortcut,
      reachableSites,
      siblingsOf,
    };
  } else {
    start(document.currentScript);
  }
})();
