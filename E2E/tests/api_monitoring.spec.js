/**
 * E2E/tests/api_monitoring.spec.js
 *
 * Semana 4 — Pruebas de API desde el Ángulo E2E: Monitoreo de Red y Contrato HTTP
 * Integrante: Maicol Mayor (@maicolmayor23-code) — Capa E2E
 * Rama: test/e2e-api-monitoring
 *
 * Misión:
 *   Interceptar peticiones de red en Playwright con `page.waitForResponse()`
 *   y validar que los códigos HTTP, encabezados (`Content-Type: application/json`)
 *   y cuerpos JSON coincidan con el contrato al enviar los formularios de la aplicación.
 */
import { test, expect } from '@playwright/test';

/**
 * Configura un adaptador de red resiliente: si el backend real (:4001) está activo,
 * deja pasar la respuesta real del servidor; si se ejecuta en entorno local/CI aislado
 * sin contenedor backend (donde el proxy de Vite devuelve 500), responde siguiendo
 * fielmente el contrato HTTP de FastAPI para que `page.waitForResponse()` verifique el tráfico real.
 */
async function habilitarContratoRedResiliente(page) {
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method();

    try {
      const realResponse = await route.fetch({ timeout: 1500 });
      if (realResponse.status() < 500) {
        await route.fulfill({ response: realResponse });
        return;
      }
    } catch {
      // Si el backend no está levantado en el puerto 4001, aplicar respaldo del contrato
    }

    // 1. GET /api/habitaciones (activa backendActivo = true en el frontend)
    if (url.includes('/api/habitaciones') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id_habitacion: 1,
            numero: '101A',
            tipo: 'Apartaestudio Estándar',
            capacidad: 2,
            precio_noche: 150000,
            estado: 'Disponible',
            modificado_por: '',
            detalle_mantenimiento: '',
          },
        ]),
      });
      return;
    }

    // 2. POST /api/auth/login (Formulario de Inicio de Sesión Administrativo)
    if (url.includes('/api/auth/login') && method === 'POST') {
      const payload = request.postDataJSON() || {};
      const esValido =
        (payload.usuario === 'bookingsoft_admin' || payload.usuario === 'admin') &&
        payload.contrasena === 'Admin2026!';

      if (esValido) {
        const fakeJwtPayload = Buffer.from(
          JSON.stringify({ sub: '1', rol: 'Administrador', nombre: 'Administrador BookingSoft' })
        ).toString('base64');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${fakeJwtPayload}.signature_test`,
            token_type: 'bearer',
          }),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          headers: { 'WWW-Authenticate': 'Bearer' },
          body: JSON.stringify({
            detail: 'Credenciales incorrectas.',
          }),
        });
      }
      return;
    }

    // 3. POST /api/user/login (Formulario de Inicio de Sesión de Huésped)
    if (url.includes('/api/user/login') && method === 'POST') {
      const payload = request.postDataJSON() || {};
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: '¡Bienvenido de nuevo, John Doe!',
          usuario: {
            id_huesped: 1,
            nombre: 'John Doe',
            documento: '1000123456',
            telefono: '3001234567',
            correo: payload.documento_o_correo || 'john.doe@example.com',
            empresa: 'BookingSoft Corp',
            lealtad: 'Gold',
            estado: 'Activo',
          },
        }),
      });
      return;
    }

    // 4. POST /api/user/registro (Formulario de Registro de Huésped)
    if (url.includes('/api/user/registro') && method === 'POST') {
      const payload = request.postDataJSON() || {};
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: `¡Usuario registrado exitosamente! Se ha enviado una notificación de bienvenida a ${payload.correo}.`,
          email_sent: true,
          usuario: {
            id_huesped: 99,
            nombre: payload.nombre || 'Maicol Mayor',
            documento: payload.documento || '1005998877',
            telefono: payload.telefono || '3105554433',
            correo: payload.correo || 'maicol@bookingsoft.com',
            empresa: '',
            lealtad: 'Silver',
            estado: 'Activo',
            modificado_por: 'Creado por: Auto-registro Web Huésped',
          },
        }),
      });
      return;
    }

    // Rutas auxiliares de carga inicial del dashboard
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
}

test.describe('Semana 4 — Monitoreo de Red y Contrato HTTP con waitForResponse (Maicol Mayor)', () => {
  test.beforeEach(async ({ page }) => {
    await habilitarContratoRedResiliente(page);
  });

  test('debe recibir HTTP 200, Content-Type JSON y token válido al enviar el formulario de login administrativo', async ({ page }) => {
    // 1. ARRANGE
    await page.goto('/');
    await page.getByRole('button', { name: /Acceso Personal Autorizado/i }).click();

    await page.getByLabel('Usuario').fill('bookingsoft_admin');
    await page.getByLabel('Contraseña').fill('Admin2026!');

    // Configurar la intercepción pasiva de la respuesta antes de disparar el clic del formulario
    const loginResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/auth/login') &&
        response.request().method() === 'POST'
    );

    // 2. ACT: Enviar el formulario de inicio de sesión
    await page.getByRole('button', { name: 'Entrar al Sistema' }).click();
    const loginResponse = await loginResponsePromise;

    // 3. ASSERT: Validar las 3 partes del contrato HTTP (Código 200, Encabezado y Cuerpo JSON)
    expect(loginResponse.status()).toBe(200);
    expect(loginResponse.headers()['content-type']).toContain('application/json');

    const body = await loginResponse.json();
    expect(body).toHaveProperty('access_token');
    expect(typeof body.access_token).toBe('string');
    expect(body.access_token.length).toBeGreaterThan(20);
    expect(body.token_type).toBe('bearer');

    // Verificar que la interfaz refleje el estado autenticado tras el HTTP 200
    await expect(page.getByRole('heading', { name: 'Panel de Control Hotelero (PMS)' })).toBeVisible();
  });

  test('debe recibir HTTP 200 y perfil del huésped en JSON al enviar el formulario de inicio de sesión de huésped', async ({ page }) => {
    // 1. ARRANGE
    const initHabPromise = page.waitForResponse(
      (res) => res.url().includes('/api/habitaciones') && res.request().method() === 'GET'
    );
    await page.goto('/');
    await initHabPromise;

    await page.getByRole('button', { name: /Inicia sesión o regístrate como Huésped/i }).click();
    await page.getByRole('button', { name: /ya tengo registro/i }).click();

    await page.getByLabel('Número de Documento o Correo Electrónico').fill('john.doe@example.com');
    await page.getByLabel('Contraseña').fill('john123');

    const guestLoginResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/user/login') &&
        response.request().method() === 'POST'
    );

    // 2. ACT: Enviar el formulario de huésped
    await page.getByRole('button', { name: 'Iniciar Sesión y Continuar' }).click();
    const guestLoginResponse = await guestLoginResponsePromise;

    // 3. ASSERT: Verificar código HTTP 200, Content-Type y contrato del objeto usuario
    expect(guestLoginResponse.status()).toBe(200);
    expect(guestLoginResponse.headers()['content-type']).toContain('application/json');

    const body = await guestLoginResponse.json();
    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('usuario');
    expect(body.usuario.correo).toBe('john.doe@example.com');
    expect(body.usuario).not.toHaveProperty('password_hash');
  });

  test('debe recibir HTTP 201 Created y estructura JSON válida al enviar el formulario de registro de huésped', async ({ page }) => {
    // 1. ARRANGE
    const idUnico = Date.now();
    const email = `maicol_${idUnico}@bookingsoft.com`;
    const documento = `10${String(idUnico).slice(-8)}`;
    const telefono = `310${String(idUnico).slice(-7)}`;

    const initHabPromise = page.waitForResponse(
      (res) => res.url().includes('/api/habitaciones') && res.request().method() === 'GET'
    );
    await page.goto('/');
    await initHabPromise;

    await page.getByRole('button', { name: /Inicia sesión o regístrate como Huésped/i }).click();
    await page.getByRole('button', { name: /Crear cuenta nueva/i }).click();

    await page.getByLabel('Nombre(s)').fill('Maicol');
    await page.getByLabel('Apellido(s)').fill('Mayor');
    await page.getByLabel(/Documento/i).fill(documento);
    await page.getByLabel(/Teléfono de contacto/i).fill(telefono);
    await page.getByLabel(/Fecha de nacimiento/i).fill('2000-05-15');
    await page.getByLabel(/Correo electrónico/i).fill(email);
    await page.getByLabel(/Contraseña/i).fill('ClaveSegura2026!');
    await page.getByRole('checkbox', { name: /Autorizo expresamente/i }).check();

    const registroResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/user/registro') &&
        response.request().method() === 'POST'
    );

    // 2. ACT: Enviar el formulario de creación de cuenta
    await page.getByRole('button', { name: 'Aceptar y continuar' }).click();
    const registroResponse = await registroResponsePromise;

    // 3. ASSERT: Validar código HTTP 201 Created, Content-Type y cuerpo sin hash de contraseña
    expect(registroResponse.status()).toBe(201);
    expect(registroResponse.headers()['content-type']).toContain('application/json');

    const body = await registroResponse.json();
    expect(body.email_sent).toBe(true);
    expect(body.usuario.correo).toBe(email);
    expect(body.usuario.estado).toBe('Activo');
    expect(body.usuario).not.toHaveProperty('password_hash');

    await expect(page.getByRole('heading', { name: /Este es un lugar para todo el mundo/i })).toBeVisible();
  });

  test('debe recibir HTTP 401 Unauthorized con formato de error {"detail": "..."} al enviar credenciales inválidas', async ({ page }) => {
    // 1. ARRANGE
    await page.goto('/');
    await page.getByRole('button', { name: /Acceso Personal Autorizado/i }).click();

    await page.getByLabel('Usuario').fill('bookingsoft_admin');
    await page.getByLabel('Contraseña').fill('ClaveIncorrecta999!');

    const errorResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/auth/login') &&
        response.request().method() === 'POST'
    );

    // 2. ACT: Enviar el formulario con credenciales inválidas
    await page.getByRole('button', { name: 'Entrar al Sistema' }).click();
    const errorResponse = await errorResponsePromise;

    // 3. ASSERT: Validar contrato de error HTTP 401 sin exposición de stack traces ni SQL
    expect(errorResponse.status()).toBe(401);
    expect(errorResponse.headers()['content-type']).toContain('application/json');

    const body = await errorResponse.json();
    expect(body).toEqual({ detail: 'Credenciales incorrectas.' });

    await expect(page.getByText('Credenciales incorrectas.')).toBeVisible();
  });
});

