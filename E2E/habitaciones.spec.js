import { test, expect } from '@playwright/test';

test('Successful registration of a new guest with unique dynamic data', async ({ page }) => {
  // ARRANGE
  const uniqueId = Date.now();
  const email = `test${uniqueId}@example.com`;
  const documento = String(uniqueId).slice(-8);
  const telefono = `310${String(uniqueId).slice(-7)}`;

  await page.goto('/');

  // ACT
  await page.getByRole('button', { name: 'Inicia sesión o regístrate como Huésped' }).click();
  await page.getByRole('button', { name: 'Crear cuenta nueva' }).click();

  await page.getByLabel('Nombre(s)').fill('Liliana');
  await page.getByLabel('Apellido(s)').fill('Restrepo');
  await page.getByLabel('Documento (Cédula/Pasaporte)').fill(documento);
  await page.getByLabel('Teléfono de contacto').fill(telefono);
  await page.getByLabel('Fecha de nacimiento').fill('1995-05-15');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill('Liliana123');
  await page.getByRole('checkbox', { name: /Autorizo expresamente/ }).check();
  await page.getByRole('button', { name: 'Aceptar y continuar' }).click();

  // ASSERT
  await expect(page.getByText('Nuestro compromiso de la comunidad')).toBeVisible();
});

test('Complete the room reservation flow for an authenticated user', async ({ page }) => {
  // ARRANGE
  await page.goto('/');

  // ACT
  await page.getByRole('button', { name: 'Inicia sesión o regístrate como Huésped' }).click();
  await page.getByRole('button', { name: 'ya tengo registro' }).click();
  await page.getByLabel('Número de Documento o Correo Electrónico').fill('john.doe@example.com');
  await page.getByLabel('Contraseña').fill('john123');
  await page.getByRole('button', { name: 'Iniciar Sesión y Continuar' }).click();

  await page.getByRole('button', { name: 'Apartamentos' }).click();
  await page.getByRole('button', { name: 'Reservar' }).first().click();
  await page.getByRole('button', { name: '1', exact: true }).click();
  await page.getByRole('button', { name: '7', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar Reserva' }).click();

  // ASSERT
  await expect(page.getByText('Reserva presencial')).toBeVisible();
});
