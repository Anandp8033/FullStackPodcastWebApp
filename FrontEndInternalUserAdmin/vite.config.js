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
        upload: resolve(__dirname, 'upload.html'),
      }
    }
  },
  server: {
    port: 3001,
    open: false,
  },
});