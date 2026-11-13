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
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**'],
      exclude: ['src/main.jsx'],
      // Hallazgo B-06: los umbrales estaban en 0, de modo que `--coverage` nunca
      // fallaba. Se fija una base medida con `npx vitest run --coverage` el
      // 2026-11-12: 1.25% líneas · 1.25% sentencias · 50.98% ramas · 10.71%
      // funciones, con margen para que la suite siga siendo el detector de
      // regresiones (el portal tiene cobertura E2E, no unitaria) sin bloquear
      // crecimiento. Subir estos valores es el objetivo a medida que se añadan
      // pruebas: borrar las existentes rompe el build.
      thresholds: { lines: 1, statements: 1, functions: 8, branches: 45 },
    },
  }
})
