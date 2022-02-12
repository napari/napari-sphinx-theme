import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import environment from 'vite-plugin-environment';
import { viteExternalsPlugin } from 'vite-plugin-externals';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [
    react(),
    environment({
      ENV: 'local',
      GOOGLE_CALENDAR_API_KEY: '',
      GOOGLE_CALENDAR_ID: '',
      NODE_ENV: 'development',
    }),
    viteExternalsPlugin({
      jquery: 'jQuery',
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/napari_sphinx_theme/assets'),
    },
  },

  build: {
    outDir: 'dist-theme',
    lib: {
      name: 'napari',
      entry: path.resolve(
        __dirname,
        'src/napari_sphinx_theme/assets/napari.tsx',
      ),
      formats: ['es'],
    },

    rollupOptions: {
      output: {
        assetFileNames: ({ name = '' }) =>
          name === 'style.css' ? 'napari-sphinx-theme.css' : name,
        entryFileNames: ({ name }) =>
          `${name === 'napari' ? 'napari-sphinx-theme' : name}.js`,
      },
    },
  },
});
