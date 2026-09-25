import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [react()],
    define: { global: 'globalThis' },
    resolve: { alias: { '@': path.resolve(__dirname, 'src'), 'sockjs-client': 'sockjs-client/dist/sockjs' } },
    optimizeDeps: { include: ['sockjs-client/dist/sockjs'] },
    server: {
      port: 5173, strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_TARGET || 'http://localhost:8080',
          ws: true, changeOrigin: true,
          rewrite: (url) => url.replace(/^\/api(?=\/|$)/, ''),
          cookiePathRewrite: { '/auth': '/api/auth' },
        },
      },
    },
  };
});
