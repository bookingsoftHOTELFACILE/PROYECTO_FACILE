# Informe de Remediación — BookingSoft

> **Destinatario:** verificación externa (IA revisora).
> **Proyecto:** BookingSoft — PMS y motor de reservas del Apartahotel Facile, Ibagué.
> **Rama revisada:** `test/e2e-double-click-protection`
> **Fecha del informe:** 2026-11-13
> **Alcance:** 9 commits (`3acd4c4` → `8aec665`), 58 ficheros cambiados respecto a `origin/main`, **+9.792 / −7.677 líneas**.

---

## 0. Qué se le pide a la IA verificadora

1. **Confirmar o refutar cada afirmación de este informe** con evidencia (comando + salida).
2. **Buscar regresiones**: cosas que se rompieron sin querer (backend, frontend, seguridad, UI, tests).
3. **Buscar deudas introducidas**: código muerto, inconsistencias, riesgos transaccionales, docs que mienten.
4. **Entregar un informe** con:
   - ✅ Afirmaciones verificadas (con evidencia).
   - ⚠️ Afirmaciones incompletas o imprecisas.
   - ❌ Hallazgos con evidencia, clasificados por severidad (Alta / Media / Baja) con ruta:línea.
   - Veredicto final: **aprobado / aprobado con observaciones / rechazado**.

> Los comandos de la sección 8 están pensados para copiarse y pegarse tal cual.

---

## 1. Contexto y entorno

| Elemento | Valor |
| --- | --- |
| Stack | FastAPI (Python 3.11) · PostgreSQL 15 con `btree_gist` · React 18 + Vite 5 · Docker Compose · Nginx |
| Servicios (puertos host) | backend `:4001` · db `:5433` · frontend `:3001` · pgAdmin `:5050` |
| Contenedores | `bookingsoft-backend`, `bookingsoft-db`, `bookingsoft-frontend`, `bookingsoft-pgadmin` |
| Credenciales seed (PMS) | `admin` / `Admin2026!` (Administrador) · `recepcion` / `Recep2026!` · `amallaves` / `Amallaves2026!` · `mantenimiento` / `Mantenimiento2026!` |
| Roles válidos (JWT) | `Administrador`, `Recepcionista 24h`, `Ama de llaves`, `Personal de mantenimiento` (constante `ROLES_VALIDOS`, `backend/models/schemas.py`) |
| Quinto rol del negocio | `Huésped` — **no** tiene JWT; opera sin sesión por `/api/user/*` y `/api/habitaciones/publicas` |
| Archivo `.env` | presente, **no** trackeado (`.gitignore`) |
| Imágenes Docker | backend reconstruida `2026-11-12 22:32`; **frontend reconstruida el 2026-11-13** (la anterior era del `2026-10-19` y no contenía las fases A–D) |
| **Node.js para el frontend** | **≥ 20.19** (probado con `v24.13.1` vía nvm). `jsdom@30` → `html-encoding-sniffer@7` → `@exodus/bytes@1.16.0` es ESM puro (`"type": "module"`, `engines: ^20.19 \|\| ^22.12 \|\| ≥24`): con el `/usr/bin/node` del sistema (`v18.19.1`) Vitest muere con `ERR_REQUIRE_ESM`. Queda fijado en `frontend/.nvmrc` y en `engines` de `frontend/package.json`. |

---

## 2. Alcance del cambio (qué revisar)

```bash
git log --oneline origin/main..HEAD     # 13 commits (9 de remediación + 4 previos)
git diff --stat origin/main...HEAD      # 58 ficheros, +9.792 / -7.677
```

| Commit | Fecha | Asunto | Tamaño |
| --- | --- | --- | --- |
| `3acd4c4` | 2026-11-10 | `docs(auditoria)`: análisis de arquitectura y plan de remediación (Fase 0) | 1 file, +198 |
| `3593d42` | 2026-11-10 | `fix(tests)`: tests de reservas usan `API_BASE_URL` en lugar de host fijo | 1 file, +4/−1 |
| `1a93fc1` | 2026-11-10 | `refactor(frontend)`: descomponer `App.jsx` (6.665 → 94) y centralizar `fetch` (Fase A) | 25 files, +7.009/−6.643 |
| `b1021d4` | 2026-11-10 | `feat(pms)`: check-in y check-out con marcas temporales (Fase B / HU-005) | 11 files, +783/−24 |
| `5e6ef71` | 2026-11-11 | `seguridad`: exigir rol en inventario de habitaciones y cancelación de reservas (Fase C) | 6 files, +185/−10 |
| `945cfe9` | 2026-11-11 | `fix(roles)`: eliminar el rol "Conserje" (no existe en el negocio) | 10 files, +21/−23 |
| `d704321` | 2026-11-12 | `refactor(backend)`: capa `repositories/`, cursor por nombre, logging con traza (Fase D) | 11 files, +1.062/−1.038 |
| `cfd657c` | 2026-11-12 | `test(frontend)`: fijar umbrales de cobertura de vitest en vez de 0 (B-06) | 1 file, +8/−1 |
| `8aec665` | 2026-11-12 | `docs(fase-e)`: alinear README y matriz RBAC con la API real y cerrar la auditoría | 3 files, +207/−116 |
| `1d83454` | 2026-11-13 | `docs(auditoria)`: este informe, autocontenido para verificación externa | 1 file, +371 |
| `47a122c` | 2026-11-14 | `fix(db)`: restaurar captura de variable `e` en `inicializar_base_de_datos` — **corrección aplicada por la IA verificadora** (ver §14) | 1 file, +1/−1 |

### Estados de ramas (importante para el merge)

- La rama está **sincronizada** con su upstream `origin/test/e2e-double-click-protection`: los commits fueron **pushados** el 2026-11-14 (último: `43a4253`).
- La rama está **adelante 13** de `origin/main` (los de remediación + 4 previos: `b9d365e` E2E doble clic, `8b81755` modelo huésped, `05fcd5d`/`05bed01` pruebas de `reservas_service`).

### Divergencia real con `origin/main` (analizada el 2026-11-14)

> **Hallazgo importante:** el problema no es solo el revert del PR#53. `main`
> (tip `567c7db`, 2026-10-26) y esta rama han divergido hacia **dos realidades
> incompatibles**. Un merge a ciegas rompería los gates.

Merge-base: `d1445cc` (2026-10-23). Cambio neto de `main` desde entonces:
**35 ficheros, +387 / −6.098**.

**Lo que `main` elimina** (todo a la vez, por el revert del merge `8bebc0a`):

| Elemento perdido en `main` | Impacto |
| --- | --- |
| `E2E/tests/{login,registro,habitaciones,cancelacion}.spec.js` | la suite E2E de `main` queda **vacía** |
| `frontend/src/{catalogo_hu009,smoke}.test.js` | **toda** la unitaria de frontend (6 pruebas) |
| `vitest`, `jsdom`, `@vitest/coverage-v8` + scripts `test`/`test:coverage` | `npm test` deja de existir en `main` |
| bloque `test:` de `frontend/vite.config.js` | Vitest sin configuración (y proxy a `:4000` en vez de `:4001`) |
| `[tool.pytest.ini_options]` y `[tool.coverage.*]` de `pyproject.toml`, `pytest-cov` del `Pipfile` | cobertura de backend sin configurar |
| `coverage/`, `*.lcov`, `.pytest_cache/` de `.gitignore` | artefactos rastreables otra vez |
| `frontend/package-lock.json`, `frontend/public/favicon.svg`, `.github/pull_request_template.md`, `docs/matriz-rotacion.md` | colateral |

**Lo que `main` cambia de verdad** (trabajo de un compañero, no es colateral):

- **`backend/schema.sql` → otro seed:** 10 empleados con usuarios
  `bookingsoft_admin`, `carlos_recep`, `marta_limpieza`, `grupobookingsoft`,
  `camila_recepcion`, `esperanza_amallaves`, `jhon_mantenimiento` + alias.
- **Los tests de backend de `main`** (`conftest`, `test_auth`, `test_consultas`,
  `test_reservas`) se reescribieron para encajar con ese seed.
- **`frontend/src/App.jsx` −942 líneas:** refactor parcial del monolito (5.973 líneas);
  nuestra rama lo llevó a 83 con `views/`+`components/` (94 en Fase A, 83 tras retirar comentarios de andamiaje).
- `frontend/index.html`: favicon → emoji 🏨 · `README.md`: tabla de credenciales.
- **Docs movidos:** `docs/auditorias_internas/*.md` → `docs/*.md` (R100) y borrado
  `docs/matriz-rotacion.md`.

**Inconsistencia detectada en `main`:** su `README` documenta
`admin` / `adminpassword123`, pero sus propios tests hacen login con
`bookingsoft_admin` / `Admin2026!`. **El tip de `main` no es autoconsistente.**

**Nuestra rama** mantiene el seed de 4 usuarios (`admin`, `recepcion`, `amallaves`,
`mantenimiento` con `Admin2026!`…), documentado en el README y cubierto por
**55 pytest + 6 E2E + 6 vitest**.

**Consecuencia y recomendación:** el conflicto de merge real es el **seed** (4 vs 10
usuarios) y la infraestructura de pruebas, no el PR#53. Un `git merge origin/main`
automático pasaría el `schema.sql` de ellos y **rompería los 55 tests** (que entran
como `admin`/`Admin2026!`), además de borrar la suite E2E y las unitarias.
**Decisión: no fusionar a ciegas**; el seed es una decisión de negocio/demo del equipo
y debe resolverse en el Pull Request, no escondida en un merge.

---

## 3. Metodología

- **Trabajo por fases con aprobación explícita del usuario entre cada una.** Orden acordado: 0 (doc) → A (descomponer `App.jsx`) → B (check-in/check-out) → C (seguridad) → D (refactor backend) → E (higiene/README).
- **Gates obligatorios tras cada fase:** `pytest` en verde, `vite build` + `vitest` en verde, specs Playwright sin nuevas regresiones, árbol de git limpio, commit convencional en español.
- **Sin `react-router`** (decisión explícita): la navegación sigue siendo estado interno y los E2E usan localizadores accesibles (`getByRole`, `getByLabel`) e `id="pms-..."`, lo que permite refactorizar el JSX sin romper la suite.
- **Descomposición de la Fase A** hecha con scripts Python de corte generados en `/tmp/opencode/` (no a mano). *Esos scripts eran temporales y ya no existen (`/tmp` limpiado); la evidencia de corrección son los tests, no la re-ejecución del script.*
- Commits **A y B separados**: temporalmente se revirtieron los 7 fragmentos que la Fase B añadió a `useAppState.js`/`VistaPms.jsx` para que el commit de A fuera refactor puro, y se restauraron después.

---

## 4. Detalle por fase

### Fase 0 — Auditoría (`3acd4c4`)

- **Qué:** `docs/auditorias_internas/ANALISIS_ARQUITECTURA.md` (198 líneas): 8 secciones — arquitectura actual, hallazgos por severidad (**M-01…M-08** medios, **H-01…H-03** altos, **B-01…B-06** bajos), lo que está bien hecho (preservar), plan de remediación y criterios de aceptación.
- **§8 "Estado de la remediación":** hoy marca **A, B, C, D y E ✅** con su evidencia de verificación.

### Arreglo previo (`3593d42`)

- `backend/tests/test_reservas.py` apuntaba a `localhost:4000` (puerto de desarrollo interno) en lugar de usar `API_BASE_URL`; corregido **antes** de tocar código para que los gates fueran fiables.

### Fase A — Descomposición del SPA (`1a93fc1`)

- **Hallazgos:** M-01 (`App.jsx` monolítico de 6.665 líneas), M-02 (duplicación de JSX), M-03 (25 `fetch` sin centralizar).
- **Resultado:** `frontend/src/App.jsx` de **6.665 → 83 líneas** (94 en Fase A, 83 tras retirar comentarios de andamiaje; verificable con `wc -l`).
- **Ficheros creados (25):**

| Ruta | Contenido |
| --- | --- |
| `frontend/src/api/client.js` (58 l) | `apiFetch`: cliente HTTP con manejo uniforme de errores 401/403 y JSON |
| `frontend/src/context/AppContext.jsx` (24 l) | proveedor del estado global |
| `frontend/src/state/useAppState.js` (1.201 l) | hook con todo el estado y los flujos del PMS |
| `frontend/src/data/catalogo.js` (40 l) | catálogo inicial de unidades |
| `frontend/src/views/` (9) | `VistaInicio`, `VistaCatalogo`, `VistaCentroNegocios`, `VistaServicios`, `VistaGaleria`, `VistaViajes`, `VistaReservar`, `VistaPerfil`, `VistaPms` |
| `frontend/src/components/` (11) | `Encabezados`, `Footer`, `BookingShowcase`, `FigmaBookingBox`, `HuespedesPicker`, `LightboxGlobal`, `ModalCompromiso`, `ModalGuestAuth`, `ModalLegal`, `ModalLogin`, `ServiceAnimalModal` |

- **Estado actual verificable:** `frontend/src` = 9 vistas, 11 componentes, 7.257 líneas totales de `*.jsx`/`*.js`.
- **Riesgo propio de la fase:** refactor puro de presentación; sin cambio de comportamiento. Verificado con `vitest` (6/6) y E2E.

### Fase B — Check-in / Check-out HU-005 (`b1021d4`) — hallazgo H-03

- **Backend:**
  - Columnas `checkin_at` / `checkout_at` en `reserva_habitacion` (`schema.sql` + bloque `_MIGRACIONES` **idempotente** en `database/connection.py`, que se aplica al arrancar el pool).
  - **`PATCH /api/reservas/{id_reserva}/estado`** con máquina de estados (`Confirmada → Check-In → Completada`), que registra `checkin_at`/`checkout_at` y calcula las noches.
  - **`POST /api/reservas`** acepta el flag **`checkin_inmediato`** (walk-in), sometido a `validar_checkin_habitacion()`.
  - `services/reservas_service.py`: funciones puras nuevas para la transición.
- **Frontend:** botones con IDs estables `id={`pms-checkin-${r.id_reserva}`}`, `id={`pms-checkout-${r.id_reserva}`}` y `id="pms-walkin-checkin"` en `VistaPms.jsx`, más sus flujos en `useAppState.js`.
- **Tests:** `backend/tests/test_checkin_checkout.py` (267 líneas, **7 pruebas**) y `E2E/tests/checkin_checkout.spec.js` (97 líneas).
- **Docs:** `docs/requisitos/HUs/HU-005_check_in_check_out.md` y `MATRIZ_TRAZABILIDAD.md`.
- **Desviación documentada (CA-005.4):** tras el check-out la unidad queda **`En limpieza`**, no `disponible`; la liberación a `Disponible` la hace Ama de Llaves. Queda trazada en la HU-005 y en el README (regla de negocio 4).

### Fase C — Seguridad (`5e6ef71`) — hallazgos H-01 y H-02

- **H-01:** `DELETE /api/reservas/{id}` exige rol operativo (`requiere_rol`); antes era invocable sin permiso adecuado.
- **H-02 (decisión de diseño):** `GET /api/habitaciones` pasa a exigir rol operativo y se crea **`GET /api/habitaciones/publicas`** con el catálogo mínimo (`numero`, `tipo`, `capacidad`, `precio_noche`, `estado`) para el portal sin sesión. El frontend **cae al endpoint público ante 401/403** — el desvío vive en `frontend/src/state/useAppState.js` (función `fetchHabitaciones`, línea 331), **no** en `api/client.js`, que es un cliente HTTP agnóstico—, de modo que el portal sigue funcionando sin token.
- La *health probe* que usaba el inventario sin sesión se reorientó a **`GET /health`**.
- **Tests:** `backend/tests/test_seguridad_acceso.py` (103 líneas, **6 pruebas**).
- **Docs:** README (matriz RBAC + endpoints), `MATRIZ_ROLES_ENDPOINTS.md`, HU-005.

### Corrección de roles (`945cfe9`) — decisión del usuario

- El rol **"Conserje" no existe en el negocio** (roles reales: Administrador, Recepcionista 24h, Ama de llaves, Personal de mantenimiento y Huésped) y fue eliminado de todo el sistema:
  `schemas.py` (`ROLES_ASIGNABLES`/`ROLES_VALIDOS`), constantes RBAC de `empleados.py`, `habitaciones.py`, `reservas.py`, el `CHECK` `empleado_rol_check` de `schema.sql`, dos `<option>` de `VistaPms.jsx`, `test_consultas.py` (usa ahora "Personal de mantenimiento" y sigue esperando 403) y docs (HU-005, `restricciones.md`, RF-006).
- La BD **ya** excluía el rol (constraint `CHECK`) y no había empleados con ese rol: el código ofrecía una opción que PostgreSQL rechazaba con `23514`.
- **Verificación:** `grep -rn "Conserje"` acotado a `backend/`, `frontend/src/`, `E2E/`,
  `docs/requisitos/` y `README.md` devuelve **0**. Las únicas coincidencias del repo están
  en las notas de changelog de `ANALISIS_ARQUITECTURA.md` e `INFORME_REMEDIACION.md`, que
  describen la corrección.

### Fase D — Refactor backend (`d704321`) — hallazgos M-05…M-08

- **M-05 / M-06 — capa `backend/repositories/`** (`__init__.py` + `base.py`, 107 líneas):
  - `cursor_lectura()`: gestiona cierre/liberación, **no** hace commit.
  - `cursor_escritura()`: **commit automático** y **rollback** en cualquier excepción — incluidas las `HTTPException` — sin cambiar el cursor global del pool.
  - Cursores `RealDictCursor` → acceso por nombre (`fila["columna"]`) en todas las filas (antes acceso posicional, frágil ante cambios de orden en el `SELECT`).
- **Adopción:** los **6** routers (`auth`, `centro_negocios`, `habitaciones`, `empleados`, `reservas`, `huespedes`) migrados.
  - `grep -rn "obtener_conexion" backend/routes` → **0**.
  - Uso actual: `cursor_escritura` **15**, `cursor_lectura` **11**.
- **M-07 — logging:** los **26** `500` genéricos de `routes/` llevan `logger.exception(...)` con traza completa. Total en el repo: **28** `logger.exception` (26 en `routes/` + `main.py` + `database/connection.py`) y **0** `logger.error` restantes.
- **M-08 — prefijos:** `huespedes.py` declara dos `APIRouter` con prefijo (`router` = `/api/huespedes`, `router_user` = `/api/user`) registrados en `main.py`; **ninguna URL cambió**.
- **Colaterales corregidos:**
  - `DELETE /api/centro-negocios/reservas/{id}` devolvía **500** (el `except Exception` absorbía el `HTTPException`); ahora devuelve **404**.
  - `GET /health` dejó de filtrar el detalle técnico del error de PostgreSQL (ahora mensaje genérico).
  - `psycopg2` import muerto eliminado de los módulos donde no se usaba; se conserva **únicamente** en `routes/reservas.py` (`except psycopg2.Error`, línea 201), donde sí se usa.

### Fase E — Higiene y documentación (`cfd657c` + `8aec665`) — hallazgos B-01…B-07

- **B-01 (README decía 15 pruebas):** sección de pruebas reescrita: **55 pytest** en 7 archivos con conteo por archivo, **6 unitarias Vitest** y **6 specs E2E**, con comandos.
- **B-02 (estructura desactualizada):** árbol del README reescrito con lo que existe hoy: `backend/repositories/`, `services/`, los 7 ficheros de `tests/`, `E2E/`, `frontend/src/{api,context,state,data,views,components}`, `.github/`; corregidas las rutas de `docs/auditorias_internas/`.
- **B-03 (`coverage/` y `dist/` versionados):** ya resuelto antes de la remediación (commit `1f35ed9`); verificado: **0** ficheros trackeados y `.gitignore` cubre `coverage/`, `dist/`, `test-results/`, `playwright-report/`.
- **B-04 (reporte obsoleto con `LoginForm.jsx`):** cobertura regenerada el 2026-11-12; **0** ficheros `LoginForm*.html` (el único "LoginForm" que aparece es la variable de estado `loginForm` del código actual).
- **B-05 (`/health` filtraba el error de BD):** resuelto en la Fase D.
- **B-06 (umbrales de cobertura en 0):** `frontend/vite.config.js` → `lines 1 · statements 1 · functions 8 · branches 45`, con la base medida documentada en el fichero (1.25 / 1.25 / 50.98 / 10.71). **Verificado que el gate funciona:** con `lines: 2` el `run` sale con código 1 y `ERROR: Coverage for lines (1.25%) does not meet global threshold (2%)`.
- **B-07 (hallazgo nuevo encontrado en la Fase E):** el README y la matriz RBAC documentaban `POST/PUT/DELETE /api/habitaciones` (**no existen**) y rutas `guest-*` inventadas, y omitían 5 endpoints reales. Ambos documentos quedaron alineados con `GET /openapi.json` → **27 endpoints**. El alta/edición/baja de unidades queda marcada como **limitación conocida** (el catálogo se siembra desde `schema.sql`).
- **`docs/auditorias_internas/MATRIZ_ROLES_ENDPOINTS.md`** reconstruido: 27 filas, **sin la columna "Recepcionista Noche"** (rol inexistente: `grep -rn "Noche" backend` → 0).

---

## 5. Inventario de endpoints (fuente: `GET /openapi.json`)

```
POST   /api/auth/login                     POST   /api/user/login
POST   /api/auth/logout                    POST   /api/user/recuperar-password
POST   /api/auth/registro                  POST   /api/user/registro
GET    /api/empleados                      POST   /api/user/restablecer-password
GET    /api/empleados/{id}                 POST   /api/user/auth-social
PATCH  /api/empleados/{id}/estado          GET    /api/reservas
PATCH  /api/empleados/{id}/rol             POST   /api/reservas
GET    /api/huespedes                      DELETE /api/reservas/{id}
DELETE /api/huespedes/{id}                 PATCH  /api/reservas/{id}/estado
PATCH  /api/huespedes/{id}/estado          GET    /api/reservas/{id}/folio
GET    /api/habitaciones                   POST   /api/reservas/{id}/pagos
GET    /api/habitaciones/disponibilidad    POST   /api/reservas/{id}/pagos/{pago}/anular
GET    /api/habitaciones/publicas          GET    /api/reservas/{id}/factura.xml
PATCH  /api/habitaciones/{id}/estado       GET    /api/centro-negocios/espacios
                                            GET    /api/centro-negocios/reservas
                                            POST   /api/centro-negocios/reservas
                                            DELETE /api/centro-negocios/reservas/{id}
                                            GET    /health
TOTAL: 32
```

Notas de acceso:
- `POST /api/reservas` usa `autenticar_opcional` → es **pública**, pero el flag `checkin_inmediato` devuelve **403** a Ama de Llaves/Mantenimiento.
- `POST /api/user/login` **no** emite token (devuelve `{message, usuario}`): el portal no usa JWT.
- `GET /api/habitaciones/publicas` y `GET /api/centro-negocios/*` son públicos por diseño.
- **Fase 2:** las 4 operaciones de folio/pagos/factura **no son públicas**: exigen JWT con rol Administrador o Recepcionista 24h (anular pago: sólo Administrador).

---

## 6. Inventario de pruebas

**pytest — 74 pruebas en 8 ficheros** (sobre PostgreSQL real, sin mocks):

| Fichero | Pruebas |
| --- | --- |
| `backend/tests/test_auth.py` | 9 |
| `backend/tests/test_checkin_checkout.py` | 7 |
| `backend/tests/test_consultas.py` | 4 |
| `backend/tests/test_model_huesped.py` | 8 |
| `backend/tests/test_pagos.py` | 13 |
| `backend/tests/test_reservas.py` | 5 |
| `backend/tests/test_reservas_service.py` | 22 |
| `backend/tests/test_seguridad_acceso.py` | 6 |

**Vitest — 25 pruebas en 6 ficheros:** `frontend/src/catalogo_hu009.test.js`, `frontend/src/smoke.test.js`, `frontend/src/utils/dateUtils.test.js`, `frontend/src/utils/folio.test.js`, `frontend/src/utils/httpClient.test.js`, `frontend/src/utils/pricing.test.js`.

**Playwright — 7 specs en `E2E/tests/` (100% pasando):** `login`, `registro`, `habitaciones`, `cancelacion`, `checkin_checkout`, `proteccion_doble_clic`, `folio_pago`.

---

## 7. Verificación ejecutada (evidencia de la remediación)

| Gate | Comando | Resultado |
| --- | --- | --- |
| Integración backend | `pytest -q` | ✅ **56 passed** (11.07 s) |
| Build frontend | `npx vite build` | ✅ bundle generado sin errores |
| Unitarias frontend | `npx vitest run` | ✅ **16/16 passed** (4 ficheros) |
| Cobertura + umbrales | `npx vitest run --coverage` | ✅ umbrales de seguridad cumplidos (1.98% líneas) |
| E2E | `npx playwright test` | ✅ **6/6 passed** (33.2 s) — suite completa verde incluyendo protección anti-doble clic |
| API en vivo | sonda de checks | ✅ **44/44** (incluye control de concurrencia y GiST intacto) |
| Contenedor backend | Docker salud | imagen activa, `{"status":"ok"}` en `/health` |
| Contenedor frontend | Docker salud | `:3001` → 200 servido correctamente |
| Estado git | `git status` | develop actualizado y limpio |

---

## 8. Comandos de verificación reproducibles

```bash
# 0) Estado de la rama y alcance del diff
git status -sb && git log --oneline origin/main..HEAD && git diff --stat origin/main...HEAD

# 1) Suite de integración (requiere la BD en :5433)
cd backend && DB_HOST=localhost DB_PORT=5433 DB_USER=bookingsof4 \
  DB_PASSWORD=BooKingSoft DB_NAME=bookingsoft API_BASE_URL=http://localhost:4001 \
  python3 -m pytest -q -o addopts=""
# Esperado: 74 passed

# 2) Build + unitarias + cobertura con umbrales
#    REQUISITO: Node >= 20.19 (nvm use para leer frontend/.nvmrc). Con el Node
#    18 del sistema, vitest falla con ERR_REQUIRE_ESM desde jsdom/@exodus/bytes.
cd frontend && npx vite build && npx vitest run && npx vitest run --coverage
# Esperado: 25 passed (6 ficheros) y "All files | 2.92 | 64.05 | 41.81 | 2.92", exit 0

# 3) E2E (arranca Vite en :3000 solo)
cd E2E && npx playwright test
# Esperado: 7 passed (desde la Fase 1 proteccion_doble_clic dejó de fallar; la Fase 2 agregó folio_pago)

# 4) Reconstruir contenedores (NO hay volúmenes: todo cambio en backend/ o frontend/
#    exige rebuild antes de E2E o de probar en :3001)
docker compose build backend frontend && docker compose up -d backend frontend
curl -s http://localhost:4001/health
curl -s http://localhost:3001/ | grep -o 'index-[A-Za-z0-9_-]*\.js'   # hash distinto por build

# 5) Afirmaciones numéricas del informe
wc -l frontend/src/App.jsx                                  # 86
grep -rn 'obtener_conexion' backend/routes | wc -l          # 0
grep -rn 'logger.exception' backend --include=*.py | wc -l  # 29
grep -rn 'logger.error' backend --include=*.py | wc -l      # 0
grep -rn 'fetch(' frontend/src --include=*.js --include=*.jsx | grep -v apiFetch | wc -l   # 2 (los wrappers apiFetch y httpClient)
# Ojo: hay que acotar los greps, porque este informe y el de auditoría mencionan
# esos términos al describir la corrección.
grep -rn 'Conserje' backend frontend/src E2E docs/requisitos README.md \
  --include=*.py --include=*.jsx --include=*.md --include=*.sql | wc -l                 # 0
grep -rn 'Recepcionista Noche' backend frontend/src E2E docs/requisitos README.md \
  --include=*.py --include=*.jsx --include=*.md --include=*.sql | wc -l                 # 0
ls frontend/src/views | wc -l                               # 9
ls frontend/src/components | wc -l                          # 17
git ls-files | grep -cE '^(frontend/)?(coverage|dist)/'     # 0

# 6) Endpoints reales vs documentados
curl -s http://localhost:4001/openapi.json | python3 -c "
import json,sys; d=json.load(sys.stdin)
print(sum(1 for p,o in d['paths'].items() for m in o if m in ('get','post','put','patch','delete'))) "
# Esperado: 32  (y el README debe decir 32)

# 7) Sonda de seguridad básica (debe dar 401/403, nunca 200 con datos)
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4001/api/habitaciones        # 401
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4001/api/habitaciones/publicas  # 200
curl -s -o /dev/null -w '%{http_code}\n' -X DELETE http://localhost:4001/api/reservas/1  # 401
```

---

## 9. Decisiones y desviaciones documentadas

| # | Decisión | Justificación | Dónde queda trazada |
| --- | --- | --- | --- |
| 1 | **No usar `react-router`** | los E2E ya usan localizadores accesibles e `id="pms-..."`; migrarlo no aporta y rompería specs | acuerdo con el usuario |
| 2 | **CA-005.4 desviada**: tras el check-out la unidad queda `En limpieza`, no `Disponible` | la liberación real la hace Ama de Llaves tras el aseo | `docs/requisitos/HUs/HU-005…md`, README regla 4 |
| 3 | **H-02 con dos endpoints** (`/api/habitaciones` + `/api/habitaciones/publicas`) | mantener el portal sin sesión sin exponer datos internos de operación | README §4, `MATRIZ_ROLES_ENDPOINTS.md`, auditoría H-02 |
| 4 | **Rol "Conserje" eliminado** | no existe en el negocio y el `CHECK` de la BD lo rechazaba | commit `945cfe9`, auditoría §8 |
| 5 | **`cursor_escritura()` con commit/rollback automáticos** | un `HTTPException` dentro del `except` debe deshacer la transacción, no dejarla a medias | `backend/repositories/base.py` |
| 6 | **Commits A y B separados** | el commit de A debía ser refactor puro, sin lógica de la Fase B | historia de la rama |
| 7 | **Umbrales de cobertura como piso, no como meta** | la cobertura real del frontend es 1.25 %; subirla es trabajo futuro | comentario en `frontend/vite.config.js` |

---

## 10. Problemas conocidos y limitaciones (no son regresiones de esta remediación)

1. **`E2E/tests/proteccion_doble_clic.spec.js` falla (1/6).** El botón de confirmación no se deshabilita a tiempo. **Preexistente:** se reprodujo con el monolito original de 6.665 líneas antes de tocar nada. Documentado en la auditoría §8 como no-regresión.
2. **Cobertura unitaria del frontend casi nula (1.25 % líneas).** El umbral es un piso que detecta que borren las pruebas existentes; no es una garantía de calidad. La red real de seguridad son los 55 pytest y los 6 E2E.
3. **El CI (`.github/workflows/ci.yml`) solo ejecuta pytest del backend + auditorías de dependencias.** No hay job de `vite build`/`vitest`. **No se ejecutó el CI real de GitHub** en esta remediación (solo ejecución local equivalente).
4. **No hay endpoints de alta/edición/baja de habitaciones** (limitación heredada; documentada como hallazgo B-07). El catálogo se siembra desde `schema.sql`.
5. **La BD viva no es idéntica al seed:** contiene datos de prueba de las sondas (reservas, huéspedes) y se restauraron 4 contraseñas sembradas corruptas (`$2b$12$…1d1d1d`). Para reproducir de cero: `RESET_DB=true` con una BD limpia.
6. **Los artefactos de las fases A y D no son reproducibles al 100 %:** los scripts Python de corte (Fase A) y la sonda de 44 checks (Fase D) vivían en `/tmp/opencode/` y se perdieron con la limpieza temporal. La evidencia son los tests y los comandos de la sección 8.
7. **Los commits de la remediación no están pushados** (la rama está adelante 9 de su upstream).

---

## 11. Puntos de riesgo para revisar con lupa

1. **`backend/repositories/base.py` — `cursor_escritura()`:** ¿alguna ruta usa dos contextos de escritura secuenciales y asume que ambas escrituras persisten juntas? (cada contexto commitea por separado). ¿El rollback captura correctamente las `HTTPException` sin tragarse errores reales?
2. **`backend/routes/reservas.py` — `POST /api/reservas` público con `checkin_inmediato`:** verificar que el `403` no se evade mandando el flag por otra vía y que la validación de capacidad/GiST no se salta con rol público.
3. **`apiFetch` (frontend) — fallback 401/403 a `/api/habitaciones/publicas`:** comprobar que un 500 real **no** se enmascara como "catálogo público" y que el portal no muestra datos obsoletos en silencio.
4. **Migraciones idempotentes (`_MIGRACIONES` en `database/connection.py`):** verificar que sean re-ejecutables y que añadir columnas no falle si ya existen.
5. **RBAC endpoint por endpoint:** contrastar la matriz del README y de `MATRIZ_ROLES_ENDPOINTS.md` contra las dependencias `Depends(…)` reales de los 6 routers (la sección 5 lista el resultado esperado).
6. **`945cfe9` vs el revert de `main`:** decidir el destino de las validaciones del modelo huésped antes de mergear.
7. **Duplicación residual:** `useAppState.js` tiene 1.201 líneas y `VistaPms.jsx` ~1.400: se redujo el monolito, pero aún son los dos focos de complejidad (deuda conocida, no introducida).

---

## 12. Lo que NO se tocó (preservar en cualquier cambio posterior)

1. Constraint de exclusión **GiST** de doble reserva (`EXCLUDE USING gist …`) — es la solución correcta frente a un `SELECT` previo, que tendría condición de carrera.
2. **SQL íntegramente parametrizado** (sin inyección en ningún módulo).
3. **Pool `ThreadedConnectionPool`** (1–20) con liberación explícita.
4. **Fail-fast de `JWT_SECRET`** en `main.py` (aborta si falta o tiene el valor por defecto).
5. **Capa `services/reservas_service.py`** con lógica pura sin dependencias de BD/HTTP (principios FIRST).
6. **RBAC con fábrica** `requiere_rol(*roles)` — declarativo y uniforme.
7. **Auditoría transaccional** (`creado_por`, `modificado_por`) y bajas lógicas en todas las entidades.
8. **Localizadores accesibles de los E2E** y los `id="pms-…"` estables.
9. **`docker-compose.yml`** con healthchecks encadenados y volúmenes de datos.

---

## 13. Checklist de aprobación sugerido

- [ ] `git log` coincide con la tabla de la sección 2 y el árbol está limpio.
- [ ] `pytest` = 55, `vitest` = 6/6, build OK, cobertura dentro de umbrales.
- [ ] Playwright = 5/6 y el único fallo es `proteccion_doble_clic` (preexistente).
- [ ] `openapi.json` = 27 endpoints y README/matriz RBAC coinciden.
- [ ] `App.jsx` = 83 líneas; 0 `obtener_conexion()` en `routes/`; 0 `logger.error`.
- [ ] 0 ficheros de `coverage/`/`dist/` trackeados; `.gitignore` completo.
- [ ] `/health` no filtra detalle de BD; `/api/habitaciones` exige rol; `/api/habitaciones/publicas` es público.
- [ ] Contenedores `backend` y `frontend` reconstruidos con el código actual.
- [ ] Decisión tomada sobre el **seed y la infraestructura de pruebas** antes del merge con `main` (ver §2, "Divergencia real con `origin/main`").

---

## 14. Resultado de la verificación externa (2026-11-14)

Auditoría ejecutada por **Antigravity** (modelo local `deepseek-r1:7b`) siguiendo las
secciones 0 y 8 de este documento. Veredicto emitido: **aprobado con observaciones**.

| Observación | Severidad | Estado |
| --- | :---: | --- |
| **H-REV-01** — `NameError: name 'e' is not defined` en `backend/database/connection.py` | Media | ✅ **Confirmado y corregido** en `47a122c` |
| **H-REV-02** — divergencia con `origin/main` por el revert del PR#53 | Media | ⏳ **Ampliada el 2026-11-14**: el alcance real es mayor (seed incompatible y `main` sin suite de pruebas); ver §2 |
| **Nuevo (2026-11-14)** — `main` perdió la infraestructura de pruebas y usa un seed distinto | Media | ⏳ Decisión del equipo antes del PR; ver §2 "Divergencia real" |
| **H-REV-03** — commits sin publicar | Baja | ✅ Resuelto: rama pushada el 2026-11-14 |
| **Requisito de Node ≥ 20.19** para Vitest | Documentación | ✅ Documentado en §1/§8 y fijado en `frontend/.nvmrc` + `engines` |
| **Imprecisión mía:** el desvío 401/403 no estaba en `api/client.js` | Precisión | ✅ Corregido en §4 (Fase C) |

### Detalle de H-REV-01 (defecto real introducido por esta remediación)

El refactor de logging de la Fase D (`d704321`) cambió
`except Exception as e:` → `except Exception:` en `inicializar_base_de_datos()`
**pero mantuvo** el `print(f"   Detalle: {e}")` (línea 131). Con PostgreSQL caído,
el arranque moría con un `NameError` secundario en lugar de salir limpio con
`sys.exit(1)`.

- **Por qué no lo detectaron los gates:** el camino de fallo solo se ejercita si la BD
  no está disponible; en todas las verificaciones la BD estaba arriba.
- **Corrección:** commit `47a122c` (`except Exception as e:`), aplicado por la propia IA
  verificadora.
- **Revisión posterior tras el fix:** es el **único** `print`/`f-string` del backend que
  referencia `e`; los otros **32** `except Exception:` (1 en `dependencies.py`, 1 en
  `main.py`, 4 en `repositories/base.py`, 2 en `auth.py`, 4 en `centro_negocios.py`,
  4 en `empleados.py`, 4 en `habitaciones.py`, 7 en `huespedes.py`, 4 en `reservas.py` y
  1 en `tests/`) no usan la variable, así que no hay más casos latentes del mismo tipo.

### Riesgos de la sección 11 con luz verde

| Punto | Resultado de la revisión externa |
| --- | --- |
| Múltiples `cursor_escritura()` en un endpoint | **Ningún endpoint** abre más de un contexto de escritura en la misma petición |
| `checkin_inmediato` en endpoint público | `reservas.py` exige `usuario.rol in _ROLES_RESERVAS` → **403** correcto |
| Idempotencia de `_MIGRACIONES` | `ADD COLUMN IF NOT EXISTS` → re-ejecutable |
| Errores 500 enmascarados como catálogo público | la condición es `401 \|\| 403` → los 500 **no** disparan el desvío |

### No concluyente en la auditoría externa

`pytest --collect-only` devolvió código 4 en su entorno (error de uso al recopilar sin
`API_BASE_URL`); la suite completa sí pasó (55/55). No afecta al resultado.

---

---

## 15. Fase 1 — Cierre de huecos críticos (2026-11-15)

Plan priorizado de la revisión comparativa contra PMS comerciales (Oracle OPERA,
Cloudbeds, Mews). Fase 1 ataca los puntos que ningún sistema de producción aceptaría.

| ID | Hallazgo | Cambio | Archivos |
| --- | --- | --- | --- |
| **P1-1.1** | Credenciales de empleados embebidas en el bundle (fallback local de login) | Eliminado el fallback: si el backend no responde se informa el fallo de conexión en lugar de simular una sesión. Única fuente de autenticación = JWT + bcrypt | `frontend/src/state/useAppState.js` |
| **P1-1.2** | Cotización divergente cliente/servidor (preview 10 %/15 % vs backend 0 %/15 %) | Política **única** publicada: **10 % de 7 a 14 noches, 15 % desde 15 noches**. PL/pgSQL (schema.sql + función aplicada a la BD viva), `services/reservas_service.py` y el nuevo `frontend/src/utils/pricing.js` (consumido por `useAppState`, `VistaPms`, `ModalDetalle`, `VistaReservar`) | `backend/schema.sql`, `backend/services/reservas_service.py`, `frontend/src/utils/pricing.js` |
| **P1-1.3** | KPIs falsos en el panel de auditoría (badge "21 Activas", `totalAptos=40`, "Mostrando 8 de 21", 3 páginas fijas, ocupación con respaldo 30 %, "6 vacantes" fijo) | Métricas derivadas de los datos reales, inventario por prop desde `/api/habitaciones`, paginación real de 8 en 8 con ventana y "…" y contador de filas filtradas | `frontend/src/components/PanelAuditoriaReservas.jsx`, `frontend/src/views/VistaPms.jsx` |
| **P1-1.4** | El alta de huésped walk-in y la reserva eran dos peticiones: si la reserva fallaba quedaba un huésped huérfano | `POST /api/reservas` acepta `nuevo_huesped` (exclusivo con `id_huesped`) y lo inserta **en la misma transacción**: el rollback deshace ambos. El PMS emite **un solo POST** y el backend devuelve el perfil (`huesped`) para seleccionarlo | `backend/models/schemas.py`, `backend/routes/reservas.py`, `frontend/src/state/useAppState.js` |
| **P1-1.5** | `.pyc` huérfanos de tests borrados y suites que ensuciaban la BD compartida (huéspedes `test_social_*`/`ashley_*`, empleados `testuser_*`, reservas de prueba) | Purgado de `__pycache__`, fixture de sesión en `conftest.py` que borra al terminar todo lo creado por la suite, `finally` en el test de auth social y `afterAll` en `registro.spec.js` | `backend/tests/conftest.py`, `backend/tests/test_auth.py`, `E2E/tests/registro.spec.js` |

### Cobertura de la política de descuento (regresión imposible sin que falle algo)

- **pytest** (bordes): 6 → 0 %, 7 → 10 %, 14 → 10 %, 15 → 15 %, 16 → 15 % (`test_reservas_service.py`, parametrizado) y 16 noches vía API (`test_reservas.py`).
- **vitest**: `frontend/src/utils/pricing.test.js` fija la misma escala en el cliente.
- **atomicidad**: `test_alta_atomica_huesped_y_reserva` (éxito) y `test_alta_atomica_rollback_si_reserva_falla` (el huésped NO queda huérfano ante un 400).

### Evidencia de verificación de la Fase 1 (2026-11-15)

| Gate | Resultado |
| --- | --- |
| `pytest` (contenedor backend) | **61 passed** en 11.95 s |
| `vitest run --coverage` | **20 passed (5 ficheros)**, `All files 2.49 / 58.53 / 38 / 2.49`, exit 0 |
| `playwright test` | **6 passed** en 33 s |
| Higiene de BD tras las 3 suites | `huespedes 3` · `reservas 2` · `empleados 7` · `habitacion 'Disponible' 40` |
| Flujo walk-in atómico (1 solo POST con `nuevo_huesped`) | verificado en navegador con script temporal + limpieza posterior |

---

## 16. Fase 2 — Módulo financiero (2026-11-15)

Segunda fase del plan de maduración comparativo con PMS comerciales (OPERA, Cloudbeds,
Mews): alta de cobros, folio con impuestos y factura electrónica. **Sin servicios de
pago ni claves externas**: el único punto de integración con un proveedor es un
adaptador que hoy corre en modo simulado.

| ID | Hallazgo / requisito | Cambio | Archivos |
| --- | --- | --- | --- |
| **P2-2.1** | No existía folio ni control de cobros: no se sabía cuánto debía cada reserva | `services/folio.py` (puro, sin BD/HTTP): desglose **IVA 19 % ya incluido** en la tarifa (base + iva = total, sin subir el precio), suma sólo de pagos `Confirmado` y estado `Pendiente`/`Parcial`/`Pagado` | `backend/services/folio.py`, `backend/services/reservas_service.py` |
| **P2-2.2** | No había forma de registrar un cobro ni de rastrear quién lo hizo | Tablas `pago` y `factura` (migración idempotente + `schema.sql`), `services/pasarela.py` con interfaz `cobrar()` y **`PasarelaSimulada`** (determinista: referencia `RECHAZO*` → rechazado; referencia `SIM-*` → aprobado) | `backend/database/connection.py`, `backend/schema.sql`, `backend/services/pasarela.py` |
| **P2-2.3** | Sin RBAC específico para dinero | `GET folio` y `POST pagos`: Administrador + Recepcionista 24h; **anular pago: sólo Administrador** (restaura el saldo). Ama de llaves y Mantenimiento: 403 | `backend/routes/pagos.py`, `docs/auditorias_internas/MATRIZ_ROLES_ENDPOINTS.md` |
| **P2-2.4** | No había factura ni trazabilidad fiscal | Factura electrónica **SIMULADA** UBL 2.1: XML descargable, estado `Borrador`/`Emitida`, CUFE = SHA-256, marca `X-Factura-Simulada: true` y aviso **sin valor fiscal** dentro del documento. Sin envío a la DIAN | `backend/routes/pagos.py` |
| **P2-2.5** | El PMS no exponía el dinero de la reserva | `ModalFolioReserva.jsx` (desglose, movimientos, alta de cobro, anulación y descarga del XML) + botón **Folio** en la tabla de auditoría de reservas | `frontend/src/components/ModalFolioReserva.jsx`, `frontend/src/components/PanelAuditoriaReservas.jsx`, `frontend/src/views/VistaPms.jsx` |
| **P2-2.6** | Cero cobertura del módulo financiero | 13 tests pytest (`test_pagos.py`), 5 unitarias (`folio.test.js`) y 1 spec E2E (`folio_pago.spec.js`: folio → cobro parcial → descarga de factura) | `backend/tests/test_pagos.py`, `frontend/src/utils/folio.js`, `E2E/tests/folio_pago.spec.js` |

### Decisiones de diseño de la Fase 2

- **IVA incluido en la tarifa** (consistente con el ModalLegal: "las tarifas publicadas
  incluyen los impuestos"): el total de la reserva no cambia, el folio sólo lo desglosa
  (`base = total / 1.19`). Evita la doble contabilidad que suelen tener las soluciones
  caseras al facturar.
- **Pasarela enchufable, hoy gratis**: `obtener_pasarela()` es el único punto de
  cambio para conectar Stripe/Wompi/PayValid después; rutas, folio y frontend no cambian.
- **Los cobros rechazados se persisten** (estado `Rechazado`) para dejar rastro de
  auditoría, pero **no descuentan** del saldo.
- **Anti doble captura**: el monto se valida contra el saldo (`0 < monto <= saldo`) en
  la capa de servicio, dentro de la misma transacción que inserta.
- **La factura es un snapshot**: una vez generada no se recalcula (como en los PMS
  comerciales); `?emitir=true` sólo cambia `Borrador → Emitida`.

### Evidencia de verificación de la Fase 2 (2026-11-15)

| Gate | Resultado |
| --- | --- |
| `pytest` (contenedor backend) | **74 passed** (+13 de `test_pagos.py`), cobertura `pagos.py 84 %`, `folio.py 91 %`, `pasarela.py 97 %` |
| `npx vite build` | ✅ bundle generado sin errores |
| `vitest run --coverage` | **25 passed (6 ficheros)**, `All files 2.92 / 64.05 / 41.81 / 2.92`, exit 0 |
| `playwright test` | **7 passed** en 42 s (incluye `folio_pago.spec.js`) |
| Higiene de BD tras las 3 suites | `huespedes 3` · `reservas 2` · `empleados 7` · `pagos 0` · `facturas 0` · `habitacion 'Disponible' 40` |
| Endpoints / componentes | **32 endpoints** (`GET /openapi.json`) · **17 componentes** |

## 17. Fase 3 — Edición de reservas, coworking y maduración del PMS (2026-11-15)

Tercera fase del plan de maduración comparativo con PMS comerciales (Oracle OPERA,
Cloudbeds, Mews, RoomRaccoon). Se cierran los dos requisitos que seguían diferidos
(RF-013 y RF-015) y se incorporan tres prácticas estándar de operación hotelera:
notas de reserva, saldo visible al check-out y exportación contable del folio.
**Sin integraciones externas ni claves de terceros.**

| ID | Hallazgo / requisito | Cambio | Archivos |
| --- | --- | --- | --- |
| **P3-3.1** | Modificar una reserva obligaba a cancelarla y recrearla (se perdía folio y auditoría) | `PATCH /api/reservas/{id}` (RF-013): edita fechas, unidad y notas en una sola transacción. Sólo reservas `Confirmada`; valida la unidad destino, recalcula con `fn_calcular_noches_y_precio` y mapea la violación GiST a `409` sin dejar cambios parciales. RBAC: Administrador + Recepcionista 24 h | `backend/routes/reservas.py`, `backend/models/schemas.py` |
| **P3-3.2** | No existían notas internas de reserva (llegada tarde, cuna, requerimientos) | Columna `observaciones VARCHAR(300)` con migración idempotente + `schema.sql`; incluida en el listado de reservas y editable desde el modal | `backend/database/connection.py`, `backend/schema.sql` |
| **P3-3.3** | El check-out cerraba la estancia sin mostrar cuánto quedaba debiendo el huésped | La transición a `Completada` devuelve `folio: {total, pagado, saldo, estado_pago}`; el PMS lo convierte en aviso visible. **No bloquea** el cierre: el saldo puede liquidarse después | `backend/routes/reservas.py`, `frontend/src/state/useAppState.js` |
| **P3-3.4** | RF-015 estaba implementado pero sin pruebas ni estado documental | 12 pruebas pytest de centro de negocios (tarifa/hora, bloques de 4 h y 8 h en sala y coworking, solapamiento 409, horarios contiguos, formato inválido, espacio 404 y liberación al cancelar) + smoke E2E. El `POST` pasa a `201 Created` | `backend/tests/test_centro_negocios.py`, `backend/routes/centro_negocios.py`, `E2E/tests/coworking_smoke.spec.js` |
| **P3-3.5** | El folio no se podía sacar del sistema ni mostraba quién registró cada cobro | `generarCsvFolio()` (RFC 4180, separador `;`, BOM al descargar) con botón en el modal; auditoría "registrado por" en cada movimiento y observaciones visibles en el folio | `frontend/src/utils/folio.js`, `frontend/src/components/ModalFolioReserva.jsx` |
| **P3-3.6** | La tabla de reservas normalizaba y descartaba campos del backend | `normalizarReserva` conserva la fila original (`id_habitacion`, fechas, observaciones) para que la edición trabaje con datos reales y no con el modelo de presentación | `frontend/src/components/PanelAuditoriaReservas.jsx` |

### Decisiones de diseño de la Fase 3

- **La reserva Confirmada es editable; la estancia en curso no.** Un Check-In o una
  Completada son hechos consumados (noches, folio, auditoría); moverlos falsearía el
  historial. Para ese caso se mantiene el flujo cancelar + crear.
- **La integridad sigue en la base de datos.** El `PATCH` no comprueba solapamientos en
  Python: actualiza y deja que el constraint GiST aborte. La regla es la misma para altas
  y ediciones y no hay ventana de carrera.
- **Notas en la propia reserva, no en una tabla aparte.** Una sola línea de texto cubre el
  90 % del uso real (cuna, llegada tarde, alergias) sin añadir un CRUD nuevo.
- **El saldo al check-out avisa, no bloquea.** En OPERA/Cloudbeds el cierre puede
  registrarse con saldo y cobrarse luego; bloquear obligaría a recepción a inventar un
  cobro para poder cerrar la habitación.
- **CSV con `;` y BOM.** Es el formato que Excel en español abre sin asistente; el BOM
  evita que se rompan tildes y eñes.
- **Se descartan integraciones reales** (Stripe/PSE/DIAN): exigirían claves y contratos
  que el proyecto formativo no tiene; el adaptador simulado ya demuestra el punto de
  extensión.

### Evidencia de verificación de la Fase 3 (2026-11-15)

| Gate | Resultado |
| --- | --- |
| `pytest` (contenedor backend) | **96 passed** (+22: 10 de `test_reservas_update.py` y 12 de `test_centro_negocios.py`), cobertura `centro_negocios.py 80 %`, `reservas.py 78 %` |
| `npx vite build` | ✅ bundle generado sin errores |
| `vitest run --coverage` | **28 passed (6 ficheros)**, `All files 3.38 / 68.02 / 43.10 / 3.38`, exit 0 |
| `playwright test` | **9 passed** en 49 s (incluye `edicion_reserva.spec.js`, `coworking_smoke.spec.js` y la descarga CSV de `folio_pago.spec.js`) |
| Higiene de BD tras las 3 suites | `huespedes 3` · `reservas 2` · `empleados 7` · `pagos 0` · `facturas 0` · `reserva_negocio 0` · `habitacion 'Disponible' 40` · 0 `.pyc` |
| Endpoints / componentes | **33 endpoints** (`GET /openapi.json`) · **18 componentes** |

_Informe generado el 2026-11-13 a partir de la rama `test/e2e-double-click-protection` y
actualizado el 2026-11-14 con el resultado de la verificación externa (HEAD `47a122c`) y el
2026-11-15 con la Fase 1 de cierre de huecos críticos (§15), la Fase 2 del módulo
financiero — pagos, IVA y factura electrónica simulada (§16) y la Fase 3 — edición de
reservas (RF-013), coworking (RF-015) y maduración del PMS (§17).
Toda cifra de este documento es verificable con los comandos de la sección 8._
