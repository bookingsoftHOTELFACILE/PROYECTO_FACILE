import { test, expect } from '@playwright/test';

test('Successful cancellation of an existing room reservation', async ({ page }) => {
  // ARRANGE
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  await page.goto('/');

  // ACT
  await page.getByRole('button', { name: /Acceso Personal Autorizado/i }).click();
  await page.getByLabel('Usuario').fill('admin');
  await page.getByLabel('Contraseña').fill('Admin2026!');
  await page.getByRole('button', { name: 'Entrar al Sistema' }).click();

  await page.getByRole('button', { name: /Reservas/i }).click();

  const botonCancelar = page.locator('#pms-reservas-table button', { hasText: 'Cancelar' }).first();
  const hayReserva = await botonCancelar.isVisible().catch(() => false);

  if (!hayReserva) {
    await page.getByRole('button', { name: /Recepción/i }).click();
    await page.locator('input[name="documento"]').fill('12345678');
    await page.locator('input[name="documento"]').press('Enter');

    const selectHab = page.locator('select[name="id_habitacion"]');
    await selectHab.selectOption({ index: 1 });

    const offset = Math.floor(Math.random() * 60) + 15;
    const entrada = new Date(Date.now() + offset * 86400000).toISOString().split('T')[0];
    const salida = new Date(Date.now() + (offset + 3) * 86400000).toISOString().split('T')[0];

    await page.locator('input[name="fecha_entrada"]').fill(entrada);
    await page.locator('input[name="fecha_salida"]').fill(salida);
    await page.getByRole('button', { name: /Confirmar Reserva Presencial/i }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /Reservas/i }).click();
  }

  await expect(botonCancelar).toBeVisible();
  await botonCancelar.click();

  // ASSERT
  await expect(page.getByText(/cancelada exitosamente/i)).toBeVisible();
});
