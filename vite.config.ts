import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    host: '127.0.0.1', // Forza Vite su IPv4
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8788',
        changeOrigin: true,
        secure: false,
        // Evita il proxy se la richiesta proviene già da Wrangler per evitare loop
        bypass: (req) => {
          if (req.headers['x-forwarded-host']?.includes('8788')) {
            return req.url;
          }
        }
      },
    },
  },
})