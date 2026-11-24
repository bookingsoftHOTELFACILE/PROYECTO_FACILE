import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4001',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:4001',
        changeOrigin: true,
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/utils/**', 'src/data/catalogo.js'],
      // Semana 8: Umbral mínimo obligatorio del 80% en CI para sustentación
      thresholds: { lines: 80, statements: 80, functions: 80, branches: 80 },
    },
  }
})
