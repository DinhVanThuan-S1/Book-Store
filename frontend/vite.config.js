/**
 * ==============================================
 * VITE CONFIGURATION
 * ==============================================
 * Author: DinhVanThuan-S1
 * Date: 2025-10-31
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Resolve alias
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@api': path.resolve(__dirname, './src/api'),
      '@redux': path.resolve(__dirname, './src/redux'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@routes': path.resolve(__dirname, './src/routes'),
    },
  },
  
  // Server config
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  
  // Build config
  build: {
    outDir: 'dist',
    sourcemap: false,
  },

  // CSS config for SCSS
  // Có thời gian fix cảnh báo của vite về scss : @import '@styles/variables.scss';
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },
});