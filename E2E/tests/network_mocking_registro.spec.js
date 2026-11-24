import { test, expect } from '@playwright/test';

test.describe('Network Mocking en Registro de Huésped (David López)', () => {
  test('intercepta POST /api/user/registro con error HTTP 500 y muestra mensaje de error en pantalla', async ({ page }) => {
    // 1. ARRANGE: Interceptar la llamada de red POST /api/user/registro con page.route()
    let peticionInterceptada = false;

    await page.route('**/api/user/registro', async (route) => {
      if (route.request().method() === 'POST') {
        peticionInterceptada = true;
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            detail: 'Error en el servidor, intente más tarde',
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/');

    // 2. ACT: Abrir el formulario de registro de huésped, diligenciarlo y enviarlo
    await page.getByRole('button', { name: /Inicia sesión o regístrate como Huésped/i }).click();
    await page.getByRole('button', { name: /Crear cuenta nueva/i }).click();

    await page.getByLabel('Nombre(s)').fill('David');
    await page.getByLabel('Apellido(s)').fill('López');
    await page.getByLabel(/Documento/i).fill('1017283944');
    await page.getByLabel(/Teléfono de contacto/i).fill('3154449876');
    await page.getByLabel(/Fecha de nacimiento/i).fill('2000-05-15');
    await page.getByLabel(/Correo electrónico/i).fill('david_mock@bookingsoft.com');
    await page.getByLabel(/Contraseña/i).fill('ClaveSegura2026!');

    await page.getByRole('checkbox', { name: /Autorizo expresamente/i }).check();
    await page.getByRole('button', { name: 'Aceptar y continuar' }).click();

    // 3. ASSERT: Verificar que se interceptó la petición y que la interfaz muestra el error 500
    await expect(page.getByText(/Error en el servidor, intente más tarde/i)).toBeVisible();
    expect(peticionInterceptada).toBe(true);
  });
});