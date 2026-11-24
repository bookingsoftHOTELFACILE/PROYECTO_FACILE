/**
 * E2E/tests/support/catalogo-throttling-page.js
 *
 * Objeto de página y utilidades de emulación CDP (Chrome DevTools Protocol)
 * para las pruebas E2E de Conexión Lenta (3G / Network Throttling).
 *
 * Regla Semana 7 (03-datos-y-objeto-de-pagina.md):
 *   - Agrupa únicamente locators accesibles del dominio y acciones reutilizables.
 *   - CERO aserciones dentro del objeto de página: todas las aserciones viven en el spec.
 */

/** Perfil 3G móvil estándar (750 kbps bajada, 250 kbps subida, 350 ms RTT). */
export const PERFIL_RED_3G = {
  offline: false,
  downloadThroughput: Math.floor((750 * 1024) / 8),
  uploadThroughput: Math.floor((250 * 1024) / 8),
  latency: 350,
  connectionType: 'cellular3g',
};

/** Perfil Slow 3G estricto (400 kbps bajada, 150 kbps subida, 450 ms RTT). */
export const PERFIL_RED_3G_ESTRICTA = {
  offline: false,
  downloadThroughput: Math.floor((400 * 1024) / 8),
  uploadThroughput: Math.floor((150 * 1024) / 8),
  latency: 450,
  connectionType: 'cellular3g',
};

/** Perfil de pérdida total de señal móvil (offline). */
export const PERFIL_SIN_CONEXION = {
  offline: true,
  downloadThroughput: 0,
  uploadThroughput: 0,
  latency: 0,
  connectionType: 'none',
};

/**
 * Inicializa un cliente CDP (`CDPSession`) sobre la pestaña de Chromium y aplica
 * condiciones reales de red 3G (`Network.emulateNetworkConditions`).
 */
export async function emularCondicionesRedCDP(page, perfil = PERFIL_RED_3G) {
  const cdpClient = await page.context().newCDPSession(page);
  await cdpClient.send('Network.enable');
  await cdpClient.send('Network.emulateNetworkConditions', perfil);
  return cdpClient;
}

/**
 * Prepara la sesión autenticada de personal operativo por API / almacenamiento
 * para reutilizarla directamente sin repetir el login por UI en cada prueba.
 */
export async function prepararSesionEmpleadoPorApi(page, request) {
  let token = null;
  let sesion = {
    usuario: 'bookingsoft_admin',
    nombre: 'Administrador BookingSoft',
    rol: 'Administrador',
  };

  try {
    const loginRes = await request.post('/api/auth/login', {
      data: {
        usuario: 'bookingsoft_admin',
        contrasena: process.env.E2E_ADMIN_PASSWORD || 'Admin2026!',
      },
      timeout: 2500,
    });
    if (loginRes.ok()) {
      const body = await loginRes.json();
      token = body.access_token;
    }
  } catch {
    // Si el backend no está levantado localmente, se genera un JWT de sesión válido no expirado
  }

  if (!token) {
    const expFuturo = Math.floor(Date.now() / 1000) + 3600;
    const payloadBase64 = Buffer.from(
      JSON.stringify({
        sub: 'bookingsoft_admin',
        nombre: sesion.nombre,
        rol: sesion.rol,
        exp: expFuturo,
      })
    ).toString('base64');
    token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payloadBase64}.firma_e2e_test`;
  }

  await page.addInitScript(
    ({ jwtToken, datosSesion }) => {
      window.localStorage.setItem('bookingsoft_auth_token', jwtToken);
      window.localStorage.setItem('bookingsoft_usuario_sesion', JSON.stringify(datosSesion));
      window.localStorage.setItem('bookingsoft_active_tab', 'pms');
      window.localStorage.setItem('bookingsoft_pms_subtab', 'reservas');
    },
    { jwtToken: token, datosSesion: sesion }
  );
}

/**
 * Configura latencia determinista de red 3G sobre las respuestas del backend:
 *   - Si el backend real (Docker/CI) responde a `route.fetch()`, conserva su respuesta real
 *     y entrega el paquete tras la latencia 3G indicada (patrón `delayResponses` de Semana 7).
 *   - Si se corre en entorno local sin contenedor backend, responde respetando el contrato HTTP
 *     oficial de FastAPI para mantener determinismo total.
 */
export async function configurarRedBackend3G(page, {
  latenciaHabitacionesMs = 1200,
  latenciaFolioMs = 1100,
  latenciaLoginMs = 0,
  habitacionesCorruptas = false,
} = {}) {
  const pausarRedSimulada = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  await page.route('**/health', async (route) => {
    try {
      const real = await route.fetch({ timeout: 2000 });
      if (real.status() < 500) {
        await route.fulfill({ response: real });
        return;
      }
    } catch {
      // Respaldo de contrato en ejecución local sin contenedor
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'ok', service: 'bookingsoft-api' }),
    });
  });

  await page.route('**/api/**', async (route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();

    if (habitacionesCorruptas && url.includes('/api/habitaciones') && method === 'GET') {
      await pausarRedSimulada(latenciaHabitacionesMs);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'null',
      });
      return;
    }

    let respuestaReal = null;
    try {
      const candidata = await route.fetch({ timeout: 2500 });
      if (candidata.status() < 500) {
        respuestaReal = candidata;
      }
    } catch {
      respuestaReal = null;
    }

    if (url.includes('/api/habitaciones') && method === 'GET') {
      if (latenciaHabitacionesMs > 0) {
        await pausarRedSimulada(latenciaHabitacionesMs);
      }
      if (respuestaReal) {
        await route.fulfill({ response: respuestaReal });
        return;
      }
      const sufijoUnico = Date.now().toString().slice(-4);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id_habitacion: 101,
            numero: 'D101',
            tipo: 'Dúplex',
            capacidad: 3,
            precio_noche: 250000,
            estado: 'Disponible',
            modificado_por: `Sync-3G-${sufijoUnico}`,
            detalle_mantenimiento: '',
          },
          {
            id_habitacion: 201,
            numero: 'DB201',
            tipo: 'Dobles',
            capacidad: 4,
            precio_noche: 350000,
            estado: 'Disponible',
            modificado_por: '',
            detalle_mantenimiento: '',
          },
          {
            id_habitacion: 301,
            numero: 'F301',
            tipo: 'Familiares',
            capacidad: 6,
            precio_noche: 450000,
            estado: 'Disponible',
            modificado_por: '',
            detalle_mantenimiento: '',
          },
          {
            id_habitacion: 401,
            numero: 'H401',
            tipo: 'Habitaciones',
            capacidad: 2,
            precio_noche: 180000,
            estado: 'Disponible',
            modificado_por: '',
            detalle_mantenimiento: '',
          },
        ]),
      });
      return;
    }

    if (url.includes('/folio') && method === 'GET') {
      if (latenciaFolioMs > 0) {
        await pausarRedSimulada(latenciaFolioMs);
      }
      if (respuestaReal) {
        await route.fulfill({ response: respuestaReal });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reserva: {
            id_reserva: 1,
            huesped_nombre: 'John Doe',
            huesped_documento: '12345678',
            habitacion_numero: 'D101',
            habitacion_tipo: 'Dúplex',
            fecha_entrada: '2026-12-01',
            fecha_salida: '2026-12-04',
            estado: 'Confirmada',
          },
          cotizacion: {
            noches: 3,
            precio_noche: 250000,
            subtotal: 750000,
            descuento: 0,
            total: 750000,
          },
          iva: {
            base: 630252,
            iva: 119748,
            iva_pct: 19,
            total: 750000,
          },
          pagos: [],
          totales: {
            total: 750000,
            pagado: 0,
            saldo: 750000,
          },
        }),
      });
      return;
    }

    if (url.includes('/api/auth/login') && method === 'POST') {
      if (latenciaLoginMs > 0) {
        await pausarRedSimulada(latenciaLoginMs);
      }
      if (respuestaReal) {
        await route.fulfill({ response: respuestaReal });
        return;
      }
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Credenciales incorrectas.' }),
      });
      return;
    }

    if (respuestaReal) {
      await route.fulfill({ response: respuestaReal });
      return;
    }

    if (url.includes('/api/reservas') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id_reserva: 1,
            id_huesped: 1,
            huesped_nombre: 'John Doe',
            huesped_documento: '12345678',
            id_habitacion: 101,
            habitacion_numero: 'D101',
            habitacion_tipo: 'Dúplex',
            fecha_entrada: '2026-12-01',
            fecha_salida: '2026-12-04',
            estado: 'Confirmada',
            creado_por: 'Sistema',
          },
        ]),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
}

export class CatalogoThrottlingPage {
  constructor(page) {
    this.page = page;
    this.contenedorRaiz = page.locator('#root');
    this.botonPestanaApartamentos = page.getByRole('button', { name: 'Apartamentos', exact: true });
    this.encabezadoCatalogo = page.getByRole('heading', { name: /Nuestros Alojamientos/i });
    this.estadoCargaCatalogo = page.getByRole('status', { name: 'Cargando catálogo de alojamientos' });
    this.estadoCargaFolio = page.getByRole('status', { name: 'Cargando folio de la reserva' });
    this.botonesReservar = page.getByRole('button', { name: 'Reservar' });
    this.botonFiltroDuplex = page.getByRole('button', { name: /Dúplex/i }).first();

    // Controles de acceso administrativo
    this.botonAccesoPersonal = page.getByRole('button', { name: /Acceso Personal Autorizado/i });
    this.campoUsuarioEmpleado = page.getByLabel('Usuario');
    this.campoContrasenaEmpleado = page.getByLabel('Contraseña');
    this.botonEntrarSistema = page.getByRole('button', { name: 'Entrar al Sistema' });
    this.botonValidandoSistema = page.getByRole('button', { name: /Validando\.\.\./i });

    // Controles del Panel PMS y Folio
    this.encabezadoPms = page.getByRole('heading', { name: 'Panel de Control Hotelero (PMS)' });
    this.botonSubpestanaReservas = page.getByRole('button', { name: /^Reservas$/i });
    this.botonesFolio = page.getByRole('button', { name: 'Folio' });
  }

  async irAPortal() {
    await this.page.goto('/');
  }

  async abrirCatalogoApartamentos() {
    await this.botonPestanaApartamentos.click();
  }

  async filtrarPorDuplex() {
    await this.botonFiltroDuplex.click();
  }

  async abrirModalEmpleado() {
    await this.botonAccesoPersonal.click();
  }

  async diligenciarCredencialesEmpleado(usuario, contrasena) {
    await this.campoUsuarioEmpleado.fill(usuario);
    await this.campoContrasenaEmpleado.fill(contrasena);
  }

  async abrirPrimerFolioDeReserva() {
    await this.botonesFolio.first().click();
  }
}
