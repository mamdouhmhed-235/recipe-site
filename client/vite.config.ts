import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
    // Note: PWA is handled by manual service worker in public/sw.js
    // We do NOT use vite-plugin-pwa or Workbox for full control over caching strategies
    // See 03-pwa-service-worker.md for the manual implementation
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5174',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    // Enable source maps only in development mode
    sourcemap: process.env.NODE_ENV === 'development',
  },
})
