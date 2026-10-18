import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Em desenvolvimento, as chamadas para /api são repassadas ao backend local
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
