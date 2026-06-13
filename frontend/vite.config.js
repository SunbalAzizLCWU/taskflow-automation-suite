import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_API_URL is read at build time in the app code. The dev server also
// proxies /api to the local backend so you can run without setting it.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
