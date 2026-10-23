import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.beforeEach(() => {
  try {
    execSync('docker exec -i bookingsoft-db psql -U bookingsof4 -d bookingsoft -c "DELETE FROM reserva_habitacion WHERE id_huesped = 1 AND id_reserva > 2;"', { stdio: 'ignore' });
  } catch {
    // Si no hay acceso a docker directo, se continúa la ejecución normal
  }
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
  await page.getByRole('button', { name: 'Mes Sig. ▶' }).click();
  await page.getByRole('button', { name: '20', exact: true }).click();
  await page.getByRole('button', { name: '25', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar Reserva' }).click();

  // ASSERT
  await expect(page.getByText('Reserva presencial')).toBeVisible();
});
