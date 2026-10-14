import { defineConfig, devices } from '@playwright/test';

// Puerto del frontend. Por defecto 3001 (Docker) o configurable con FRONT_PORT
const port = Number(process.env.FRONT_PORT ?? 3001);
const baseURL = process.env.BASE_URL ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: '.',
  /* Falla la prueba si tarda más de 60 segundos */
  timeout: 60 * 1000,
  /* Ejecuta las pruebas en paralelo */
  fullyParallel: true,
  /* La ruta base de tu frontend en Docker/Local */
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  /* Lista en la terminal + reporte HTML que abres con pnpm report */
  reporter: [['list'], ['html', { open: 'never' }]],
  retries: process.env.CI ? 1 : 0,
  /* Configuramos solo Chromium (Chrome) para empezar rápido */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  /* Playwright levanta el frontend si no está corriendo */
  webServer: {
    command: `node node_modules/vite/bin/vite.js --port ${port} --strictPort`,
    cwd: '../frontend',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});