import './clean.mjs';

import { resolve } from 'path';
import { $ } from 'zx';

import { ROOT_DIR, THEME_STATIC_DIR } from './constants.mjs';

const THEME_FONT_DIR = resolve(THEME_STATIC_DIR, 'fa');
const FONT_DIR = resolve(
  ROOT_DIR,
  'node_modules/@fortawesome/fontawesome-free',
);
const FONT_CSS_FILE = resolve(FONT_DIR, 'css/all.min.css');
const WEBFONTS_DIR = resolve(FONT_DIR, 'webfonts');

async function build() {
  await $`mkdir -p ${THEME_FONT_DIR}`;
  await $`cp -f ${FONT_CSS_FILE} ${THEME_FONT_DIR}`;
  await $`cp -fr ${WEBFONTS_DIR} ${THEME_STATIC_DIR}`;
  await $`webpack build`;
}

build();
