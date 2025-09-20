import path from 'path';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), mkcert()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    https: {}, // ✅ empty object tells Vite to use HTTPS with mkcert
    host: true, // optional: allows access on LAN
    port: 5173,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
