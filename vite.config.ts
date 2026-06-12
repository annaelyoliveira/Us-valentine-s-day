import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production' || process.env.NODE_ENV === 'production';
  return {
    base: isProd ? '/Us-valentine-s-day/' : '/',
    build: {
      outDir: 'docs', 
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
  };
});