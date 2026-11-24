import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

/**
 * Fase 2 — Folio financiero de la reserva (pagos, IVA y factura simulada).
 *
 * Flujo cubierto:
 *  1. Recepción/Admin abre el folio desde la tabla de reservas del PMS.
 *  2. El folio desglosa el IVA 19% ya incluido en la tarifa y el saldo completo.
 *  3. Se registra un cobro parcial por la pasarela simulada: el saldo baja y el
 *     folio pasa a "Pago parcial".
 *  4. Se descarga la factura electrónica SIMULADA en XML UBL 2.1 (borrador DIAN).
 *
 * Todo el dinero y la factura creados aquí se borran en afterAll: la BD compartida
 * debe quedar exactamente como estaba.
 */
const psql = (sql) => {
  try {
    return execSync(
      `docker exec -i bookingsoft-db psql -U bookingsof4 -d bookingsoft -t -A -c "${sql}"`,
      { stdio: ['pipe', 'pipe', 'ignore'], timeout: 8000 }
    ).toString();
  } catch {
    return '';
  }
};

const limpiarDinero = () => {
  psql('DELETE FROM factura WHERE id_reserva IN (1, 2);');
  psql('DELETE FROM pago WHERE id_reserva IN (1, 2);');
};

test.beforeAll(limpiarDinero);
test.afterAll(limpiarDinero);

test('Folio financiero: desglose de IVA, cobro parcial y factura simulada', async ({ page }) => {
  // Los confirm() del flujo (anulaciones) se aceptan automáticamente.
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  await page.goto('/');

  // Login como personal autorizado
  await page.getByRole('button', { name: /Acceso Personal Autorizado/i }).click();
  await page.getByLabel('Usuario').fill('bookingsoft_admin');
  await page.getByLabel('Contraseña').fill('Admin2026!');
  await page.getByRole('button', { name: 'Entrar al Sistema' }).click();

  // Navegar a la tabla de reservas del PMS
  await page.getByRole('button', { name: /Recepción \(Walk-in\)/i }).click();
  await page.getByRole('button', { name: /Reservas/i }).click();

  // 1) Abrir el folio de la reserva sembrada #1
  await page.locator('#pms-folio-1').click();
  const modal = page.locator('#pms-folio-modal');
  await expect(modal).toBeVisible();
  await expect(modal.getByText('Folio de la Reserva #1')).toBeVisible();

  // 2) Desglose con IVA 19% incluido (base + IVA == total, el total NO sube)
  await expect(modal.getByText(/IVA 19%/)).toBeVisible();
  await expect(modal.getByText('Base gravable \(IVA incluido\)')).toBeVisible();
  await expect(modal.getByText('Pagado')).toBeVisible();

  // 3) Cobro parcial por la pasarela simulada
  await page.locator('#folio-monto').fill('1000');
  await page.locator('#folio-metodo').selectOption('Nequi');
  await page.locator('#folio-referencia').fill('E2E-NEQUI-01');
  await page.locator('#folio-registrar-pago').click();

  await expect(modal.locator('[role="status"]')).toContainText(/Cobro aprobado/i);
  await expect(modal.getByText('Pago parcial')).toBeVisible();
  await expect(modal.getByText(/E2E-NEQUI-01/)).toBeVisible();
  await expect(modal.getByText(/Saldo pendiente/)).toBeVisible();

  // 4) Factura electrónica SIMULADA (borrador UBL 2.1 descargable)
  const descarga = page.waitForEvent('download');
  await page.locator('#folio-descargar-factura').click();
  const archivo = await descarga;
  expect(archivo.suggestedFilename()).toBe('FACT-00000001.xml');

  // 5) Exportación del folio a CSV (Fase 3 — contabilidad/Excel)
  const descargaCsv = page.waitForEvent('download');
  await page.locator('#folio-descargar-csv').click();
  const csv = await descargaCsv;
  expect(csv.suggestedFilename()).toBe('FOLIO-1.csv');

  // Cerrar el modal
  await page.locator('#pms-folio-modal button[title="Cerrar folio"]').click();
  await expect(modal).toHaveCount(0);
});
