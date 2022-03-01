/* eslint-disable class-methods-use-this */
/* eslint-disable no-await-in-loop */

import * as cheerio from 'cheerio';
import { createHash } from 'crypto';
import express from 'express';
import fs from 'fs-extra';
import { resolve } from 'path';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import { $ } from 'zx';

import webpackConfig from '../webpack.config.js';

const OUT_DIR = resolve(__dirname, '../dist');

/**
 * @param {string} file The file to check
 * @returns True if the file exists and is a regular file, false otherwise.
 */
async function exists(file) {
  return (await fs.pathExists(file)) && (await fs.stat(file)).isFile();
}

/**
 * Starts an express server for hosting the docs HTML.
 */
async function startDevServer() {
  const app = express();
  const compiler = webpack(webpackConfig);

  // Middleware for compiling webpack assets in memory.
  app.use(webpackDevMiddleware(compiler));

  // Middleware to enable hot reloading of webpack assets.
  app.use(webpackHotMiddleware(compiler));

  // Catch all middleware responsible for serving the requested file.
  app.use(async (req, res) => {
    const url = new URL(req.url, 'http://tmp.com');
    let file = resolve(OUT_DIR, url.pathname.slice(1));
    const originalFile = file;

    if (!(await exists(file))) {
      // Try HTML file.
      file = `${file}.html`;
    }

    if (!(await exists(file))) {
      // Try index HTML file.
      file = resolve(originalFile, 'index.html');
    }

    if (!(await exists(file))) {
      res.status(404).send(`"${originalFile}" not found`);
      return;
    }

    // If file is not an HTML file, then just return it directly.
    if (!file.endsWith('.html')) {
      fs.createReadStream(file).pipe(res);
      return;
    }

    const html = await fs.readFile(file, 'utf-8');
    const $html = cheerio.load(html);

    const $css = $html('link')
      .toArray()
      .filter(Boolean)
      .map((node) => $html(node))
      .find(($node) => $node.attr('href').endsWith('napari-sphinx-theme.css'));

    const $js = $html('script')
      .toArray()
      .filter(Boolean)
      .map((node) => $html(node))
      .filter(($node) => $node.attr('src'))
      .find(($node) => $node.attr('src').endsWith('napari-sphinx-theme.js'));

    // Replace main JS / CSS entrypoint with assets from `webpack-hot-middleware`.
    $css.attr('href', '/styles/napari-sphinx-theme.css');
    $js.attr('src', '/scripts/napari-sphinx-theme.js');

    // Send modified HTML to the client.
    res.send($html.html());
  });

  app.listen(8080, () =>
    console.log('Started dev server at http://localhost:8080'),
  );
}

/**
 * @param {string} dir The directory to read from.
 * @returns The list of files for the directory.
 */
async function getFiles(dir) {
  const files = await fs.readdir(dir);
  return files.map((file) => resolve(dir, file));
}

/**
 * @param {string} dir The directory to get files from.
 * @returns Recursively gets all files within a directory.
 */
async function getAllFiles(dir) {
  const dirStack = await getFiles(dir);
  const files = [];

  while (dirStack.length > 0) {
    const fileOrDir = dirStack.pop();
    const stats = await fs.stat(fileOrDir);

    if (stats.isFile()) {
      files.push(fileOrDir);
    }

    if (stats.isDirectory()) {
      const nextFiles = await getFiles(fileOrDir);
      dirStack.push(...nextFiles.map((file) => resolve(fileOrDir, file)));
    }
  }

  return Array.from(new Set(files));
}

const THEME_SRC_DIR = resolve(__dirname, '../src');
const THEME_DOCS_DIR = resolve(__dirname, '../docs');
const THEME_HASH_FILE = resolve(__dirname, '../dist/theme-build-hash');

/**
 * Computes the content hash of all files in the theme directory.
 *
 * @returns The theme hash.
 */
async function getThemeHash() {
  const files = (
    await Promise.all([getAllFiles(THEME_SRC_DIR), getAllFiles(THEME_DOCS_DIR)])
  ).flat();
  const filesToHash = files.filter(
    (file) => !file.includes('/assets/') && !file.includes('/static/'),
  );

  const hash = createHash('sha1');

  for (const file of filesToHash) {
    const content = await fs.readFile(file);
    hash.write(content);
  }

  return hash.digest('hex');
}

/**
 * @returns The previously computed theme hash.
 */
async function readThemeHash() {
  if (!(await fs.pathExists(THEME_HASH_FILE))) {
    return null;
  }

  return fs.readFile(THEME_HASH_FILE, 'utf-8');
}

async function buildDocs() {
  await $`make install`;
  await $`sphinx-build -b=html docs dist`;
}

async function dev() {
  const hash = await getThemeHash();
  const prevHash = await readThemeHash();

  if (hash === prevHash) {
    console.log(`Skipping docs build: ${hash}`);
  } else {
    await buildDocs();
    console.log(`Finished docs build: ${hash}`);
    await fs.writeFile(THEME_HASH_FILE, hash);
  }

  startDevServer();
}

dev();
