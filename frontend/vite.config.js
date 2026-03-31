import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Use this for develoopment
        // target:'https://async-rush-backend.onrender.com', // Use this for production
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
