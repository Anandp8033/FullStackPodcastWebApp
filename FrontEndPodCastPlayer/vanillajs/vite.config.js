import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',

  build: {
    outDir: 'dist',
    emptyOutDir: true,

    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        podcast: resolve(__dirname, 'podcast.html')
      }
    }
  },

  server: {
    port: 3000,
    open: false
  }
});