import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const PORT = parseInt(env.PORT || '5500', 10);
  
  return {
    plugins: [react()],
    server: {
      port: PORT,
      open: true
    },
    preview: {
      port: PORT,
      open: true
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        }
      }
    }
  };
});
