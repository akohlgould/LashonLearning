import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 1. Set base to your GitHub Repository name
  base: '/LashonLearning/',
  server: {
    proxy: {
      '/api': {
        target: 'https://www.sefaria.org',
        changeOrigin: true,
      },
    },
  },
  // 2. Ensure the build output goes to the standard 'dist' folder
  build: {
    outDir: 'dist',
  }
})