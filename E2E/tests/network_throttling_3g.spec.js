/**
 * E2E/tests/network_throttling_3g.spec.js
 *
 * Semana 7 — Playwright a Fondo: Conexión Lenta (Network Throttling 3G con CDPClient)
 * Integrante: Maicol Mayor (@maicolmayor23-code) — Capa E2E
 * Rama: test/e2e-network-throttling
 *
 * Escenario asignado:
 *   Simular una conexión de internet lenta (3G) usando las APIs de emulación de
 *   Playwright (`CDPSession` / `CDPClient` -> `Network.emulateNetworkConditions`).
 *
 * Reglas validadas:
 *   1. La interfaz muestra de inmediato el skeleton y spinner accesible (`role="status"`)
 *      durante la descarga lenta en 3G y jamás presenta pantallas en blanco rotas.
 *   2. Al completarse la transferencia 3G, el skeleton desaparece y se renderizan los
 *      alojamientos reales e interactivos sin pérdida de estado.
 *   3. El modal de Folio financiero con sesión reutilizada muestra su spinner accesible
 *      bajo red 3G lenta antes de pintar el desglose tributario.
 *   4. Ante latencia o caída súbita de la red móvil (`offline: true`), los botones se
 *      deshabilitan mientras procesan y se informa el error al usuario sin romper el DOM.
 */
import { test, expect } from '@playwright/test';
import {
  CatalogoThrottlingPage,
  PERFIL_RED_3G,
  PERFIL_RED_3G_ESTRICTA,
  PERFIL_SIN_CONEXION,
  emularCondicionesRedCDP,
  prepararSesionEmpleadoPorApi,
  configurarRedBackend3G,
} from './support/catalogo-throttling-page.js';

test.describe('Semana 7 — Playwright a Fondo: Conexión Lenta 3G con CDPClient (Maicol Mayor)', () => {
  test('debe mostrar el skeleton y spinner accesible del catálogo bajo red 3G y nunca una pantalla en blanco rota', async ({ page }) => {
    // 1. ARRANGE: Monitorear errores fatales de renderizado y configurar red 3G vía CDPClient
    const erroresRenderizado = [];
    page.on('pageerror', (err) => erroresRenderizado.push(err.message));

    await configurarRedBackend3G(page, { latenciaHabitacionesMs: 1600 });
    const catalogoPage = new CatalogoThrottlingPage(page);

    // 2. ACT: Montar el shell SPA y activar de inmediato el throttling 3G por protocolo CDP
    //         mientras la sincronización de disponibilidad sigue en tránsito por la red móvil
    await catalogoPage.irAPortal();
    const cdpClient = await emularCondicionesRedCDP(page, PERFIL_RED_3G);
    await catalogoPage.abrirCatalogoApartamentos();

    // 3. ASSERT (Durante la carga 3G):
    //    - La estructura visual (encabezados y raíz) está presente: cero pantalla en blanco rota.
    //    - El skeleton + spinner accesible (role="status") es visible para la persona usuaria.
    await expect(catalogoPage.contenedorRaiz).not.toBeEmpty();
    await expect(catalogoPage.encabezadoCatalogo).toBeVisible();
    await expect(catalogoPage.estadoCargaCatalogo).toBeVisible();
    await expect(catalogoPage.estadoCargaCatalogo).toContainText(
      'Sincronizando disponibilidad de alojamientos…'
    );

    // 4. ASSERT (Al terminar la transferencia 3G):
    //    - El skeleton desaparece automáticamente (auto-waiting web-first, sin waitForTimeout).
    //    - Se muestran las categorías reales y botones de reserva habilitados.
    await expect(catalogoPage.estadoCargaCatalogo).toBeHidden({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Dúplex' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dobles' })).toBeVisible();
    await expect(catalogoPage.botonesReservar.first()).toBeVisible();
    await expect(catalogoPage.botonesReservar.first()).toBeEnabled();
    expect(erroresRenderizado).toEqual([]);

    await cdpClient.detach();
  });

  test('debe mostrar el spinner accesible del folio de reserva con sesión reutilizada bajo conexión 3G estricta', async ({ page, request }) => {
    // 1. ARRANGE: Sesión preparada por API/storageState (sin repetir login por UI) + red 3G estricta
    const erroresRenderizado = [];
    page.on('pageerror', (err) => erroresRenderizado.push(err.message));

    await prepararSesionEmpleadoPorApi(page, request);
    await configurarRedBackend3G(page, {
      latenciaHabitacionesMs: 200,
      latenciaFolioMs: 1300,
    });

    const catalogoPage = new CatalogoThrottlingPage(page);
    await catalogoPage.irAPortal();
    await expect(catalogoPage.encabezadoPms).toBeVisible();

    // Activamos condiciones Slow 3G reales en Chromium justo antes de consultar el folio
    const cdpClient = await emularCondicionesRedCDP(page, PERFIL_RED_3G_ESTRICTA);

    // 2. ACT: Abrir el folio financiero de la primera reserva activa
    await catalogoPage.abrirPrimerFolioDeReserva();

    // 3. ASSERT: Muestra el spinner accesible mientras descarga en 3G y luego renderiza el folio completo
    await expect(catalogoPage.estadoCargaFolio).toBeVisible();
    await expect(catalogoPage.estadoCargaFolio).toContainText('Cargando folio de la reserva…');

    await expect(catalogoPage.estadoCargaFolio).toBeHidden({ timeout: 15000 });
    await expect(page.getByText(/Folio de la Reserva/i)).toBeVisible();
    await expect(page.getByText(/IVA 19%/i)).toBeVisible();
    expect(erroresRenderizado).toEqual([]);

    await cdpClient.detach();
  });

  test('debe deshabilitar el envío con estado de carga en 3G y mostrar error claro si se pierde la conexión móvil', async ({ page }) => {
    // 1. ARRANGE: Abrir el portal y activar Slow 3G en CDPClient con latencia en autenticación
    const erroresRenderizado = [];
    page.on('pageerror', (err) => erroresRenderizado.push(err.message));

    await configurarRedBackend3G(page, {
      latenciaHabitacionesMs: 150,
      latenciaLoginMs: 1100,
    });

    const catalogoPage = new CatalogoThrottlingPage(page);
    await catalogoPage.irAPortal();
    await expect(catalogoPage.estadoCargaCatalogo).toBeHidden({ timeout: 10000 });

    const cdpClient = await emularCondicionesRedCDP(page, PERFIL_RED_3G_ESTRICTA);

    // 2. ACT (Parte A - Petición en tránsito bajo 3G): Abrir login de personal y enviar formulario
    await catalogoPage.abrirModalEmpleado();
    const idIntentoUnico = `operador_3g_${Date.now()}`;
    await catalogoPage.diligenciarCredencialesEmpleado(idIntentoUnico, 'ClaveIncorrecta3G!');
    await catalogoPage.botonEntrarSistema.click();

    // 3. ASSERT (Parte A): Mientras responde la red 3G, el botón indica "Validando..." y está deshabilitado
    await expect(catalogoPage.botonValidandoSistema).toBeVisible();
    await expect(catalogoPage.botonValidandoSistema).toBeDisabled();
    await expect(page.getByText('Credenciales incorrectas.')).toBeVisible({ timeout: 15000 });

    // 4. ACT (Parte B - Caída total de red móvil vía CDPClient offline: true):
    await page.unroute('**/api/**');
    await cdpClient.send('Network.emulateNetworkConditions', PERFIL_SIN_CONEXION);
    await catalogoPage.botonEntrarSistema.click();

    // 5. ASSERT (Parte B): Se informa el error de conexión sin dejar la pantalla en blanco ni rota
    await expect(
      page.getByText(/No se pudo conectar con el servidor/i)
    ).toBeVisible({ timeout: 10000 });
    await expect(catalogoPage.contenedorRaiz).not.toBeEmpty();
    expect(erroresRenderizado).toEqual([]);

    await cdpClient.detach();
  });

  test('debe conservar el catálogo funcional y sin pantalla en blanco si una respuesta 3G llega truncada o nula', async ({ page }) => {
    // 1. ARRANGE: Simular respuesta JSON truncada (null) bajo conexión 3G inestable
    const erroresRenderizado = [];
    page.on('pageerror', (err) => erroresRenderizado.push(err.message));

    await configurarRedBackend3G(page, {
      latenciaHabitacionesMs: 1500,
      habitacionesCorruptas: true,
    });

    const catalogoPage = new CatalogoThrottlingPage(page);

    // 2. ACT: Cargar el portal, activar conexión 3G con CDPClient y filtrar la categoría Dúplex
    await catalogoPage.irAPortal();
    const cdpClient = await emularCondicionesRedCDP(page, PERFIL_RED_3G);
    await catalogoPage.abrirCatalogoApartamentos();
    await expect(catalogoPage.estadoCargaCatalogo).toBeVisible();
    await expect(catalogoPage.estadoCargaCatalogo).toBeHidden({ timeout: 15000 });
    await catalogoPage.filtrarPorDuplex();

    // 3. ASSERT: Cero TypeError / cero pantalla blanca; se muestran las unidades de respaldo operativas
    await expect(page.getByRole('heading', { name: /Apartamento Dúplex/i })).toBeVisible();
    await expect(catalogoPage.botonesReservar.first()).toBeVisible();
    await expect(catalogoPage.contenedorRaiz).not.toBeEmpty();
    expect(erroresRenderizado).toEqual([]);

    await cdpClient.detach();
  });
});
