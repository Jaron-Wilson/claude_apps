import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For GitHub Pages deployment:
// - If repo is "username.github.io", use base: '/'
// - If repo is "reponame", use base: '/reponame/'
// - Can also set via: vite build --base=/your-repo/
const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  plugins: [react()],
  base: base,
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
});
