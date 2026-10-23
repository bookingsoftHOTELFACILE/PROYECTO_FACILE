import { test, expect } from '@playwright/test';

test('Successful registration of a new guest with dynamic data', async ({ page }) => {

  // 1. ARRANGE
  const idUnico = Date.now();
  const email = `ashley_${idUnico}@bookingsoft.com`;
  const documento = `CC${String(idUnico).slice(-8)}`;
  const telefono = `310${String(idUnico).slice(-7)}`;

  await page.goto('/');

  // 2. ACT
  // Clic en los botones para abrir el formulario
  await page.getByRole('button', { name: /Inicia sesión o regístrate como Huésped/i }).click();
  await page.getByRole('button', { name: /Crear cuenta nueva/i }).click();

  // Diligenciar los campos mediante su etiqueta (getByLabel)
  await page.getByLabel('Nombre(s)').fill('Ashley');
  await page.getByLabel('Apellido(s)').fill('Echeverri');
  await page.getByLabel(/Documento/i).fill(documento);
  await page.getByLabel(/Teléfono de contacto/i).fill(telefono);
  await page.getByLabel(/Fecha de nacimiento/i).fill('2000-05-15');
  await page.getByLabel(/Correo electrónico/i).fill(email);
  await page.getByLabel(/Contraseña/i).fill('ClaveSegura2026!');

  // Marcar la casilla de autorización (Habeas Data)
  await page.getByRole('checkbox', { name: /Autorizo expresamente/i }).check();

  // Enviar el formulario
  await page.getByRole('button', { name: 'Aceptar y continuar' }).click();

  // 3. ASSERT
  await expect(page.getByRole('heading', { name: /Este es un lugar para todo el mundo/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rechazar' })).toBeVisible();

});