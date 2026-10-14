import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  },
  test: {
    environment: 'jsdom',
    passWithNoTests: true,
    coverage: {
      include: ['src/**'],
      exclude: ['src/main.jsx'], // arranque de React: no tiene lógica de negocio
      thresholds: { lines: 0, branches: 0, functions: 0, statements: 0 }, // línea base semana 1
    },
  },
})
