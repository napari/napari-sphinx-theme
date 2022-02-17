import { $ } from 'zx';

import { THEME_STATIC_DIR } from './constants.mjs';

const filePatterns = [
  'dist-theme',
  `${THEME_STATIC_DIR}/scripts`,
  `${THEME_STATIC_DIR}/styles/napari-sphinx-theme.css`,
  `${THEME_STATIC_DIR}/fa`,
  `${THEME_STATIC_DIR}/webfonts`,
];

async function clean() {
  await Promise.all(filePatterns.map((pattern) => $`rm -rf ${pattern}`));
}

clean();
