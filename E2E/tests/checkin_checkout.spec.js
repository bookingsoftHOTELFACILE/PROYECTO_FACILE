import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

/**
 * HU-005 — Check-in y Check-out desde el PMS.
 *
 * Flujo cubierto:
 *  1. Recepción ofrece el registro de check-in directo (CA-005.2, casilla visible).
 *  2. Check-in de una reserva confirmada desde la tabla de reservas (CA-005.1).
 *  3. Check-out de esa misma reserva, con cierre de la estadía (CA-005.4 / CA-005.5).
 *
 * Se crea una reserva dedicada vía SQL para no depender del estado de las reservas
 * sembradas y se restaura la base en afterAll.
 */
const psql = (sql, { verbose = false } = {}) => {
  const out = execSync(
    `docker exec -i bookingsoft-db psql -U bookingsof4 -d bookingsoft ${verbose ? '-t -A ' : ''}-c "${sql}"`,
    { stdio: ['pipe', 'pipe', 'ignore'] }  // stdout siempre capturado (stdio 'ignore' devuelve null)
  );
  return (out ?? '').toString();
};

let idReserva = null;
let idHabitacion = null;

test.beforeAll(() => {
  try {
    // Limpieza de ejecuciones anteriores y de estados 'Check-In'/'Completada' heredados.
    psql("DELETE FROM reserva_habitacion WHERE creado_por = 'E2E Check-in';");
    psql("UPDATE reserva_habitacion SET estado = 'Confirmada', checkin_at = NULL, checkout_at = NULL WHERE creado_por != 'E2E Check-in' AND estado IN ('Check-In', 'Completada');");

    // Reserva dedicada de prueba (3 noches) en la primera unidad libre.
    psql(
      "INSERT INTO reserva_habitacion (id_huesped, id_habitacion, fecha_entrada, fecha_salida, estado, creado_por) " +
      "SELECT 1, id_habitacion, '2031-01-05', '2031-01-08', 'Confirmada', 'E2E Check-in' " +
      "FROM habitacion WHERE estado = 'Disponible' ORDER BY id_habitacion LIMIT 1;"
    );
    // psql añade el tag 'INSERT 0 1' a la salida: se consulta el id explícitamente.
    idReserva = Number(
      psql("SELECT id_reserva FROM reserva_habitacion WHERE creado_por = 'E2E Check-in' ORDER BY id_reserva DESC LIMIT 1;", { verbose: true }).trim()
    );
    idHabitacion = Number(
      psql(`SELECT id_habitacion FROM reserva_habitacion WHERE id_reserva = ${idReserva};`, { verbose: true }).trim()
    );
  } catch (e) {
    // Sin acceso a docker: el test fallará de forma explícita al no encontrar los botones.
  }
});

test.afterAll(() => {
  try {
    psql("DELETE FROM reserva_habitacion WHERE creado_por = 'E2E Check-in';");
    if (idHabitacion) {
      psql(`UPDATE habitacion SET estado = 'Disponible', modificado_por = 'E2E' WHERE id_habitacion = ${idHabitacion};`);
    }
  } catch {
    // Se ignora: la limpieza es best-effort.
  }
});

test('Check-in y check-out de una reserva desde la tabla del PMS', async ({ page }) => {
  // ARRANGE — los confirm() del flujo se aceptan automáticamente.
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  await page.goto('/');

  await page.getByRole('button', { name: /Acceso Personal Autorizado/i }).click();
  await page.getByLabel('Usuario').fill('bookingsoft_admin');
  await page.getByLabel('Contraseña').fill('Admin2026!');
  await page.getByRole('button', { name: 'Entrar al Sistema' }).click();

  // CA-005.2 — recepción expone el registro de check-in directo (walk-in).
  await page.getByRole('button', { name: /Recepción \(Walk-in\)/i }).click();
  await expect(page.locator('#pms-walkin-checkin')).toBeVisible();

  // ACT — sub-pestaña de reservas del PMS.
  await page.getByRole('button', { name: /Reservas/i }).click();

  const btnCheckin = page.locator(`#pms-checkin-${idReserva}`);
  await expect(btnCheckin).toBeVisible();

  await btnCheckin.click();

  // ASSERT — check-in registrado (CA-005.1)
  await expect(page.getByText(/Check-in registrado/i)).toBeVisible();
  await expect(page.locator(`#pms-checkout-${idReserva}`)).toBeVisible();
  await expect(page.getByText(/Entrada:/).first()).toBeVisible();

  // ACT + ASSERT — check-out con cierre de la estadía (CA-005.4 / CA-005.5)
  await page.locator(`#pms-checkout-${idReserva}`).click();
  await expect(page.getByText(/Check-out registrado/i)).toBeVisible();
  await expect(page.getByText('✓ Estadía finalizada')).toBeVisible();
  await expect(page.getByText(/Salida:/).first()).toBeVisible();
  await expect(btnCheckin).toHaveCount(0);
});
