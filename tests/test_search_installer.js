// Run with: node --test tests/
const assert = require('node:assert/strict');
const { test } = require('node:test');

const {
  instanceOptions,
  isSearchShortcut,
  reachableSites,
  siblingsOf,
} = require('../napari_sphinx_theme/static/search/napari-search-installer.js');
const config = require('../napari_sphinx_theme/static/search/napari-sites.json');
const { sites } = config;

const BASE_URL = 'https://napari.org/0.11.0/index.html';
const docs = { name: 'docs', bundlePath: '/stable/pagefind/' };
const workshops = { name: 'workshops', bundlePath: '/workshops/pagefind/' };
const missing = { name: 'missing', bundlePath: '/missing/pagefind/' };

function respond(body, ok = true) {
  return { ok, text: async () => body };
}

test('the merge list has unique names and absolute bundle paths', () => {
  const names = sites.map((site) => site.name);
  assert.equal(new Set(names).size, names.length);
  for (const site of sites) {
    assert.match(site.bundlePath, /^\/.+\/pagefind\/$/);
  }
});

test('a site does not merge itself, whichever URL it is served from', () => {
  assert.deepEqual(siblingsOf([docs, workshops], 'docs'), [workshops]);
});

test('only reachable bundles are kept', async () => {
  const fetchFn = async (url) =>
    url.includes('/workshops/')
      ? respond('{"version":"1.6.0"}')
      : respond('not found', false);
  assert.deepEqual(await reachableSites([workshops, missing], BASE_URL, fetchFn), [
    workshops,
  ]);
});

test('bundles are looked up at the site root', async () => {
  const urls = [];
  const fetchFn = async (url) => {
    urls.push(url);
    return respond('{}');
  };
  await reachableSites([workshops], BASE_URL, fetchFn);
  assert.deepEqual(urls, [
    'https://napari.org/workshops/pagefind/pagefind-entry.json',
  ]);
});

test('a 200 HTML page does not count as a bundle', async () => {
  const fetchFn = async () => respond('<!DOCTYPE html>');
  assert.deepEqual(await reachableSites([workshops], BASE_URL, fetchFn), []);
});

test('a network error drops only that bundle', async () => {
  const fetchFn = async (url) => {
    if (url.includes('/missing/')) throw new TypeError('network down');
    return respond('{}');
  };
  assert.deepEqual(await reachableSites([missing, workshops], BASE_URL, fetchFn), [
    workshops,
  ]);
});

test('a bundle that never responds is dropped after the timeout', async () => {
  const fetchFn = (_, { signal }) =>
    new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')));
    });
  assert.deepEqual(await reachableSites([workshops], BASE_URL, fetchFn, 5), []);
});

test('siblings reach Pagefind as merged indexes', () => {
  const options = instanceOptions(
    'https://napari.org/dev/pagefind/',
    { sites: [docs, workshops] },
    [workshops],
  );
  assert.deepEqual(options.mergeIndex, [{ bundlePath: '/workshops/pagefind/' }]);
});

test('the current site gets the own-site boost', () => {
  const boosted = { ownSiteBoost: 1.5, sites: [] };
  assert.equal(instanceOptions('', boosted, []).indexWeight, 1.5);
  assert.equal(instanceOptions('', { sites: [] }, []).indexWeight, 1);
});

test('the own-site boost never lowers the current site', () => {
  assert.ok(config.ownSiteBoost >= 1);
});

test('Ctrl+K and Cmd+K open search, other combinations do not', () => {
  const key = (props) => ({
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    key: 'k',
    ...props,
  });
  assert.ok(isSearchShortcut(key({ ctrlKey: true })));
  assert.ok(isSearchShortcut(key({ metaKey: true, key: 'K' })));
  assert.ok(!isSearchShortcut(key({})));
  assert.ok(!isSearchShortcut(key({ ctrlKey: true, shiftKey: true })));
  assert.ok(!isSearchShortcut(key({ ctrlKey: true, key: 'j' })));
});
