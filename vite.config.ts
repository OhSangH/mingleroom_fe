import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'sockjs-client': 'sockjs-client/dist/sockjs',
    },
  },
  optimizeDeps: {
    include: ['sockjs-client/dist/sockjs'],
  },
  server: {
    proxy: {
      '/ws-stomp': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
