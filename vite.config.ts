import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ✅ global 참조를 브라우저에서 살려줌
  define: {
    global: 'globalThis',
  },

  // ✅ 어떤 코드가 'sockjs-client'를 import해도 dist를 쓰게 강제
  resolve: {
    alias: {
      'sockjs-client': 'sockjs-client/dist/sockjs',
    },
  },

  // ✅ Vite prebundle 단계에서도 dist를 포함하도록
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
