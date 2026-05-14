import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/e2e/**', '**/.next/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@contexts': path.resolve(__dirname, 'app/contexts'),
      '@components': path.resolve(__dirname, 'app/components'),
      '@lib': path.resolve(__dirname, 'app/lib'),
      '@utils': path.resolve(__dirname, 'app/utils'),
    },
  },
});
