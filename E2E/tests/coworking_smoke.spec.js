import { test, expect } from '@playwright/test';

/**
 * Fase 3 — RF-015: humo del módulo de Salas & Coworking en el PMS.
 *
 * La lógica de negocio (tarifas, paquetes, solapamientos) está cubierta por
 * `backend/tests/test_centro_negocios.py`; este spec garantiza que la pestaña
 * monta el módulo con los espacios reales del backend y no rompe el SPA.
 */
test('RF-015: el módulo de Salas & Coworking monta con los espacios reales', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /Acceso Personal Autorizado/i }).click();
  await page.getByLabel('Usuario').fill('bookingsoft_admin');
  await page.getByLabel('Contraseña').fill('Admin2026!');
  await page.getByRole('button', { name: 'Entrar al Sistema' }).click();

  await page.getByRole('button', { name: /Salas & Coworking/i }).click();

  await expect(page.getByText('NUEVA RESERVA DE SALA / COWORKING')).toBeVisible();
  await expect(page.getByText(/Salas Disponibles:/)).toBeVisible();
  await expect(page.getByText('Coworking Flex:')).toBeVisible();
  await expect(page.getByText('15 Puestos')).toBeVisible();
});
