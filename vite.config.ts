import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, mode }) => {
  const isProd = mode === 'production' || process.env.NODE_ENV === 'production';
  return {
    base: isProd ? '/Us-valentine-s-day/' : '/',
    plugins: [
      react(),
      tailwindcss(),
    ],
  };
});