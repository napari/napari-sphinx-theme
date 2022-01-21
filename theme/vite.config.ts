import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.tsx'),
      formats: ['es'],
    },

    rollupOptions: {
      output: {
        preserveModules: true,
        entryFileNames: ({ name }) => `${name === 'main' ? 'napari' : name}.js`,
      },
    },
  },
});
