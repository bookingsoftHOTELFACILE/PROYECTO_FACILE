import { test, expect } from '@playwright/test';

/**
 * =============================================================================
 * PRUEBA E2E: Inicio de Sesión de Empleado en BookingSoft PMS
 * =============================================================================
 * Objetivo:
 *   Verificar que un empleado administrativo con credenciales válidas pueda
 *   autenticarse exitosamente en el sistema, recibir su token JWT y acceder
 *   a la interfaz protegida del PMS (Panel de Control Hotelero).
 *
 * Estructura: Patrón AAA (Arrange - Act - Assert)
 * Buenas prácticas:
 *   - Localizadores accesibles (getByRole, getByLabel).
 *   - Sin esperas fijas (Playwright maneja auto-waiting en cada aserción y acción).
 *   - Verificación de estado real autenticado (elementos exclusivos de la sesión).
 * =============================================================================
 */

test('Successful login to the PMS system with valid employee credentials', async ({ page }) => {
  // ---------------------------------------------------------------------------
  // 1. ARRANGE (Preparar el estado y navegar a la página inicial)
  // ---------------------------------------------------------------------------
  await page.goto('/');

  // ---------------------------------------------------------------------------
  // 2. ACT (Ejecutar las acciones del usuario para iniciar sesión)
  // ---------------------------------------------------------------------------
  // Abrir el modal de acceso administrativo desde el enlace del footer público
  await page.getByRole('button', { name: /Acceso Personal Autorizado/i }).click();

  // Diligenciar los campos mediante etiquetas accesibles (labels)
  await page.getByLabel('Usuario').fill('bookingsoft_admin');
  await page.getByLabel('Contraseña').fill('Admin2026!');

  // Enviar el formulario de inicio de sesión
  await page.getByRole('button', { name: 'Entrar al Sistema' }).click();

  // ---------------------------------------------------------------------------
  // 3. ASSERT (Verificar que se alcanzó el estado autenticado en el PMS)
  // ---------------------------------------------------------------------------
  // Comprobar la presencia del encabezado exclusivo del Panel PMS
  await expect(page.getByRole('heading', { name: 'Panel de Control Hotelero (PMS)' })).toBeVisible();

  // Comprobar la presencia del botón de cierre de sesión exclusivo de usuarios autenticados
  await expect(page.getByRole('button', { name: /Salir/i })).toBeVisible();

  // Comprobar el distintivo del sistema interno PMS
  await expect(page.getByText('PMS HOTELERO')).toBeVisible();
});
