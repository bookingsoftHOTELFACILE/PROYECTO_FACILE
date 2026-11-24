import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

/**
 * Fase 3 — RF-013: modificar una reserva existente desde el PMS.
 *
 * Flujo cubierto:
 *  1. Con una reserva confirmada, recepción abre "Editar" en la tabla.
 *  2. Cambia la fecha de salida y deja una observación interna.
 *  3. El backend recibe el PATCH, recalcula la cotización y el modal se cierra.
 *  4. La BD confirma los cambios (fechas y notas) — y el afterAll limpia la reserva.
 *
 * La reserva de trabajo se crea directamente en la BD para que el spec sea
 * determinista (id > 2) y se elimina al final junto con cualquier pago residual.
 */

const PSQL = 'docker exec -i bookingsoft-db psql -U bookingsof4 -d bookingsoft -t -A -F"|"';

const psql = (sql) => {
  try {
    return execSync(`${PSQL} -c "${sql}"`, {
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 8000,
    })
      .toString()
      .trim();
  } catch {
    return '';
  }
};

const limpiar = () => {
  psql("DELETE FROM pago WHERE id_reserva > 2;");
  psql("DELETE FROM factura WHERE id_reserva > 2;");
  psql("DELETE FROM reserva_habitacion WHERE id_reserva > 2;");
  psql("UPDATE reserva_habitacion SET estado = 'Confirmada' WHERE id_reserva IN (1, 2);");
};

let idReserva;

test.beforeAll(() => {
  limpiar();
  const salida = psql(
    "INSERT INTO reserva_habitacion (id_huesped, id_habitacion, fecha_entrada, fecha_salida, estado, creado_por) " +
      "SELECT 1, id_habitacion, CURRENT_DATE + 400, CURRENT_DATE + 403, 'Confirmada', 'E2E Fase 3' " +
      "FROM habitacion WHERE numero = '101A' RETURNING id_reserva;"
  );
  idReserva = Number.parseInt(salida.split('\n')[0], 10);
  expect(Number.isInteger(idReserva)).toBeTruthy();
});

test.afterAll(limpiar);

test('RF-013: editar fechas y observaciones de una reserva confirmada', async ({ page }) => {
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  await page.goto('/');

  await page.getByRole('button', { name: /Acceso Personal Autorizado/i }).click();
  await page.getByLabel('Usuario').fill('bookingsoft_admin');
  await page.getByLabel('Contraseña').fill('Admin2026!');
  await page.getByRole('button', { name: 'Entrar al Sistema' }).click();

  // Sub-pestaña de reservas del PMS
  await page.getByRole('button', { name: /Recepción \(Walk-in\)/i }).click();
  await page.getByRole('button', { name: /Reservas/i }).click();

  // 1) Abrir el modal de edición de la reserva creada para la prueba
  await page.locator(`#pms-editar-${idReserva}`).click();
  const modal = page.locator('#pms-editar-reserva-modal');
  await expect(modal).toBeVisible();
  await expect(modal.getByText(new RegExp(`Editar reserva #${idReserva}`))).toBeVisible();

  // 2) Cambiar salida (5 noches) y dejar una nota
  const salida = new Date();
  salida.setDate(salida.getDate() + 405);
  const salidaIso = salida.toISOString().slice(0, 10);

  await page.locator('#editar-reserva-salida').fill(salidaIso);
  await page.locator('#editar-reserva-observaciones').fill('Cuna y llegada tarde (E2E RF-013)');

  // El preview usa la política única de descuentos del sistema.
  await expect(modal.getByText(/noches/)).toBeVisible();

  // 3) Guardar
  await page.locator('#editar-reserva-guardar').click();

  // ASSERT — feedback al usuario y cierre del modal
  await expect(page.getByText(new RegExp(`Reserva #${idReserva} actualizada`, 'i'))).toBeVisible();
  await expect(modal).toHaveCount(0);

  // ASSERT — persistencia real en PostgreSQL
  const fila = psql(
    `SELECT fecha_salida, observaciones FROM reserva_habitacion WHERE id_reserva = ${idReserva};`
  );
  expect(fila).toContain(salidaIso);
  expect(fila).toContain('E2E RF-013');
});
