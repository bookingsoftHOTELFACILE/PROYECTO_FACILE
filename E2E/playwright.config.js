import { defineConfig, devices } from '@playwright/test';

// Puerto del frontend. Por defecto 3001 (Docker) o configurable con FRONT_PORT
const port = Number(process.env.FRONT_PORT ?? 3001);
const baseURL = process.env.BASE_URL ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: '.',
  timeout: 60 * 1000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL,
    trace: 'on-first-retry',
    launchOptions: {
      slowMo: 2000,
    },
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  retries: process.env.CI ? 1 : 0,
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
    },
  ],
  webServer: {
    command: `node node_modules/vite/bin/vite.js --port ${port} --strictPort`,
    cwd: '../frontend',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});