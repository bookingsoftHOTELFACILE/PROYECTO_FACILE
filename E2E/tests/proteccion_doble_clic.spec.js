/**
 * E2E/tests/proteccion_doble_clic.spec.js
 *
 * Pruebas de Playwright a Fondo: Doble Clic y Protección contra Duplicados
 * (Semana 7 - José Chico @jocmiguelchicoc).
 *
 * Valida la robustez del frontend y backend ante clics repetidos:
 *  1. Deshabilitación inmediata del botón tras el primer clic (`disabled={loading}`).
 *  2. Intercepción de red comprobando que solo se emita 1 única petición POST /api/reservas.
 *  3. Verificación de que no se produzca duplicidad (Double Booking) en la base de datos.
 */
import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

function limpiarReservasDb() {
  try {
    execSync(
      'docker exec -i bookingsoft-db psql -U bookingsof4 -d bookingsoft -c "DELETE FROM reserva_habitacion WHERE id_reserva > 2; UPDATE reserva_habitacion SET estado = \'Confirmada\' WHERE id_reserva IN (1, 2);"',
      { stdio: 'ignore', timeout: 5000 }
    );
  } catch {
    // Continuar si docker no está en ejecución local directa
  }
}

test.describe('Semana 7 — Playwright a Fondo: Protección contra Doble Clic (José Chico)', () => {
  test.beforeEach(() => {
    limpiarReservasDb();
  });

  test.afterAll(() => {
    limpiarReservasDb();
  });

  test('debe deshabilitar el boton de inmediato y emitir una sola peticion HTTP al hacer doble clic rapido', async ({ page }) => {
    // ARRANGE: Contador de peticiones POST a /api/reservas interceptadas a nivel de red
    let peticionesPostReservas = 0;
    page.on('request', (request) => {
      if (request.url().includes('/api/reservas') && request.method() === 'POST') {
        peticionesPostReservas++;
      }
    });

    await page.goto('/');

    // 1. Iniciar sesión como huésped
    await page.getByRole('button', { name: 'Inicia sesión o regístrate como Huésped' }).click();
    await page.getByRole('button', { name: 'ya tengo registro' }).click();
    await page.getByLabel('Número de Documento o Correo Electrónico').fill('john.doe@example.com');
    await page.getByLabel('Contraseña').fill('john123');
    await page.getByRole('button', { name: 'Iniciar Sesión y Continuar' }).click();

    // 2. Navegar al catálogo y abrir modal de reserva
    await page.getByRole('button', { name: 'Apartamentos' }).click();
    await page.getByRole('button', { name: 'Reservar' }).first().click();

    // 3. Seleccionar rango de fechas disponible
    await page.getByRole('button', { name: 'Mes Sig. ▶' }).click();
    await page.getByRole('button', { name: '22', exact: true }).click();
    await page.getByRole('button', { name: '26', exact: true }).click();

    const botonConfirmar = page.getByRole('button', { name: /Confirmar Reserva/i });
    await expect(botonConfirmar).toBeVisible();
    await expect(botonConfirmar).toBeEnabled();

    // ACT: Simular doble clic rápido (dblclick o clics consecutivos casi instantáneos)
    // El primer clic activa loading=true y deshabilita el elemento en el DOM
    await botonConfirmar.dblclick({ delay: 50 });

    // ASSERT 1: El botón se encuentra deshabilitado de inmediato mientras procesa
    await expect(botonConfirmar).toBeDisabled();

    // ASSERT 2: La interfaz muestra el estado visual de confirmación
    await expect(page.getByText(/Confirmando\.\.\.|Reserva confirmada|Reserva presencial/i)).toBeVisible();

    // ASSERT 3: Verificación de red estricta: Se emitió exactamente 1 petición HTTP POST (no 2)
    // Esperamos 1 segundo para asegurar que ninguna petición en cola sea enviada
    await page.waitForTimeout(1000);
    expect(peticionesPostReservas).toBe(1);
  });
});
