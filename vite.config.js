import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Optional: helps if you ever add aliases like @/components
      '@': '/src',
    },
  },
  build: {
    // Ensure Vercel gets a clean build
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false, // optional: reduce bundle size
  },
  server: {
    // For local dev only
    port: 3000,
    open: true,
  },
});
