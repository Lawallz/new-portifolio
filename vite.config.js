import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    target: 'es2022',
    // three.js é carregado via import() dinâmico (ver src/main.js),
    // então ele vira um chunk separado automaticamente.
    chunkSizeWarningLimit: 800,
  },
});
