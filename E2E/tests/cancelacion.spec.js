import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.beforeEach(() => {
  try {
    execSync('docker exec -i bookingsoft-db psql -U bookingsof4 -d bookingsoft -c "UPDATE reserva_habitacion SET estado = \'Confirmada\' WHERE id_reserva IN (1, 2);"', { stdio: 'ignore' });
  } catch {
  }
});

test('Successful cancellation of an existing room reservation', async ({ page }) => {
  // ARRANGE
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  await page.goto('/');

  // ACT
  await page.getByRole('button', { name: /Acceso Personal Autorizado/i }).click();
  await page.getByLabel('Usuario').fill('bookingsoft_admin');
  await page.getByLabel('Contraseña').fill('Admin2026!');
  await page.getByRole('button', { name: 'Entrar al Sistema' }).click();

  await page.getByRole('button', { name: /Reservas/i }).click();
  await page.getByRole('button', { name: 'Cancelar' }).first().click();

  // ASSERT
  await expect(page.getByText(/cancelada exitosamente/i)).toBeVisible();
});

