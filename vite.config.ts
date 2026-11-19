import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const targetUrl = env.VITE_API_BASE_URL || 'http://34.95.113.61';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: targetUrl,
          changeOrigin: true,
          secure: false,
        },
        '/upload': {
          target: env.VITE_UPLOADER_BASE_URL || targetUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
