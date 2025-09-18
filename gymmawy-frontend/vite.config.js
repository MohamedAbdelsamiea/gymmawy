import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5173, // Default Vite port
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // Backend runs on port 4000
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
