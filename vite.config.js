import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  server: {
    historyApiFallback: true, // this enables client-side routing with clean URLs
  },
});
