import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Base './' porque el build se abre con file:// dentro de Electron y con el
// esquema local del WebView de Capacitor: las rutas absolutas ('/assets/...')
// no resuelven en ninguno de los dos, hacen falta rutas relativas.
export default defineConfig({
  base: './',
  plugins: [svelte()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
