import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  /* Falla la prueba si tarda más de 60 segundos */
  timeout: 60 * 1000,
  /* Ejecuta las pruebas en paralelo */
  fullyParallel: true,
  /* La ruta base de tu frontend en Docker/Local */
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    launchOptions: {
        slowMo: 2000,
    },
  },
  /* Configuramos solo Chromium (Chrome) para empezar rápido */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});