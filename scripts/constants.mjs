import { resolve } from 'path';

export const ROOT_DIR = resolve(__dirname, '..');

export const THEME_STATIC_DIR = resolve(
  ROOT_DIR,
  'src/napari_sphinx_theme/theme/napari_sphinx_theme/static',
);
