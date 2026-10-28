import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Relative asset paths so the same build works from the domain root
  // (Netlify) and from the `/Realm-Raiders/` subpath (GitHub Pages).
  base: './',
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
