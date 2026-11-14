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
| Credenciales seed (PMS) | `admin` / `Admin2026!` (Administrador) · `recepcion` / `Recep2026!` · `amallaves` / `Amallaves2026!` | · `mantenimiento` / `Mantenimiento2026!` |
| Roles válidos (JWT) | `Administrador`, `Recepcionista 24h`, `Ama de llaves`, `Personal de mantenimiento` (constante `ROLES_VALIDOS`, `backend/models/schemas.py`) |
| Quinto rol del negocio | `Huésped` — **no** tiene JWT; opera sin sesión por `/api/user/*` y `/api/habitaciones/publicas` |
| Archivo `.env` | presente, **no** trackeado (`.gitignore`) |
| Imágenes Docker | backend reconstruida `2026-11-12 22:32`; **frontend reconstruida el 2026-11-13** (la anterior era del `2026-10-19` y no contenía las fases A–D) |

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

### Estados de ramas (importante para el merge)

- La rama está **adelante 9** de su upstream `origin/test/e2e-double-click-protection` → **los commits de la remediación NO están pushados**.
- La rama está **adelante 13** de `origin/main` (los 9 de remediación + 4 previos: `b9d365e` E2E doble clic, `8b81755` modelo huésped, `05fcd5d`/`05bed01` pruebas de `reservas_service`).
- **Divergencia a resolver:** `origin/main` contiene `567c7db Revert "Merge pull request #53 … test/bd-model-huesped"`, es decir, **main revirtió** las validaciones del modelo huésped (`schemas.py` + `test_model_huesped.py`), mientras que **esta rama sí las conserva** (`8b81755`). Un merge a `main` reintroducirá lo que main revirtió: debe decidirse si se re-aplica o se descarta.

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
- **Resultado:** `frontend/src/App.jsx` de **6.665 → 94 líneas** (verificable con `wc -l`).
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
- **H-02 (decisión de diseño):** `GET /api/habitaciones` pasa a exigir rol operativo y se crea **`GET /api/habitaciones/publicas`** con el catálogo mínimo (`numero`, `tipo`, `capacidad`, `precio_noche`, `estado`) para el portal sin sesión. El frontend **cae al endpoint público ante 401/403** (en `apiFetch`), de modo que el portal sigue funcionando sin token.
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
GET    /api/empleados/{id}                 GET    /api/reservas
PATCH  /api/empleados/{id}/estado          POST   /api/reservas
PATCH  /api/empleados/{id}/rol             DELETE /api/reservas/{id}
GET    /api/huespedes                      PATCH  /api/reservas/{id}/estado
DELETE /api/huespedes/{id}                 GET    /api/centro-negocios/espacios
PATCH  /api/huespedes/{id}/estado          GET    /api/centro-negocios/reservas
GET    /api/habitaciones                   POST   /api/centro-negocios/reservas
GET    /api/habitaciones/disponibilidad    DELETE /api/centro-negocios/reservas/{id}
GET    /api/habitaciones/publicas          GET    /health
PATCH  /api/habitaciones/{id}/estado
TOTAL: 27
```

Notas de acceso:
- `POST /api/reservas` usa `autenticar_opcional` → es **pública**, pero el flag `checkin_inmediato` devuelve **403** a Ama de Llaves/Mantenimiento.
- `POST /api/user/login` **no** emite token (devuelve `{message, usuario}`): el portal no usa JWT.
- `GET /api/habitaciones/publicas` y `GET /api/centro-negocios/*` son públicos por diseño.

---

## 6. Inventario de pruebas

**pytest — 55 pruebas en 7 ficheros** (sobre PostgreSQL real, sin mocks):

| Fichero | Pruebas |
| --- | --- |
| `backend/tests/test_auth.py` | 8 |
| `backend/tests/test_checkin_checkout.py` | 7 |
| `backend/tests/test_consultas.py` | 4 |
| `backend/tests/test_model_huesped.py` | 8 |
| `backend/tests/test_reservas.py` | 3 |
| `backend/tests/test_reservas_service.py` | 19 |
| `backend/tests/test_seguridad_acceso.py` | 6 |

**Vitest — 6 pruebas en 2 ficheros:** `frontend/src/catalogo_hu009.test.js`, `frontend/src/smoke.test.js`.

**Playwright — 6 specs en `E2E/tests/`:** `login`, `registro`, `habitaciones`, `cancelacion`, `checkin_checkout`, `proteccion_doble_clic`.

---

## 7. Verificación ejecutada (evidencia de la remediación)

| Gate | Comando | Resultado |
| --- | --- | --- |
| Integración backend | `pytest -q` | **55 passed** (10.95 s) |
| Build frontend | `npx vite build` | ✅ bundle `index-DtsLOiUo.js` (383.84 kB) |
| Unitarias frontend | `npx vitest run` | ✅ **6/6** (2 ficheros) |
| Cobertura + umbrales | `npx vitest run --coverage` | ✅ `All files 1.25 / 50.98 / 10.71 / 1.25`, exit 0 |
| Prueba del gate de cobertura | umbral temporal `lines: 2` | ✅ exit 1 con `ERROR: Coverage … does not meet global threshold` (luego revertido) |
| E2E | `npx playwright test` | **5 passed / 1 failed** — fallo único: `proteccion_doble_clic.spec.js` (preexistente) |
| API en vivo (Fase D) | sonda de 44 checks | **44/44** (incluye un rollback verificado con un 409 que dejó la reserva intacta) |
| Contenedor backend | `docker compose build backend && up -d` | imagen `2026-11-12 22:32`, `{"status":"OK"}` en `/health` |
| Contenedor frontend | `docker compose build frontend && up -d` | **reconstruido el 2026-11-13**; `:3001` → 200 y sirve `index-DtsLOiUo.js` (idéntico a `frontend/dist`) |
| Estado git | `git status --short` | vacío (árbol limpio) en los 9 commits |

---

## 8. Comandos de verificación reproducibles

```bash
# 0) Estado de la rama y alcance del diff
git status -sb && git log --oneline origin/main..HEAD && git diff --stat origin/main...HEAD

# 1) Suite de integración (requiere la BD en :5433)
cd backend && DB_HOST=localhost DB_PORT=5433 DB_USER=bookingsof4 \
  DB_PASSWORD=BooKingSoft DB_NAME=bookingsoft API_BASE_URL=http://localhost:4001 \
  python3 -m pytest -q -o addopts=""
# Esperado: 55 passed

# 2) Build + unitarias + cobertura con umbrales
cd frontend && npx vite build && npx vitest run && npx vitest run --coverage
# Esperado: 6/6 y "All files | 1.25 | 50.98 | 10.71 | 1.25", exit 0

# 3) E2E (arranca Vite en :3000 solo)
cd E2E && npx playwright test
# Esperado: 5 passed, 1 failed (proteccion_doble_clic — preexistente)

# 4) Reconstruir contenedores (NO hay volúmenes: todo cambio en backend/ o frontend/
#    exige rebuild antes de E2E o de probar en :3001)
docker compose build backend frontend && docker compose up -d backend frontend
curl -s http://localhost:4001/health
curl -s http://localhost:3001/ | grep -o 'index-[A-Za-z0-9_-]*\.js'   # debe ser index-DtsLOiUo.js

# 5) Afirmaciones numéricas del informe
wc -l frontend/src/App.jsx                                  # 94
grep -rn 'obtener_conexion' backend/routes | wc -l          # 0
grep -rn 'logger.exception' backend --include=*.py | wc -l  # 28 (26 en routes/ + main.py + connection.py)
grep -rn 'logger.error' backend --include=*.py | wc -l      # 0
grep -rn 'fetch(' frontend/src --include=*.js --include=*.jsx | grep -v apiFetch | wc -l   # 1 (la propia apiFetch)
# Ojo: hay que acotar los greps, porque este informe y el de auditoría mencionan
# esos términos al describir la corrección.
grep -rn 'Conserje' backend frontend/src E2E docs/requisitos README.md \
  --include=*.py --include=*.jsx --include=*.md --include=*.sql | wc -l                 # 0
grep -rn 'Recepcionista Noche' backend frontend/src E2E docs/requisitos README.md \
  --include=*.py --include=*.jsx --include=*.md --include=*.sql | wc -l                 # 0
ls frontend/src/views | wc -l                               # 9
ls frontend/src/components | wc -l                          # 11
git ls-files | grep -cE '^(frontend/)?(coverage|dist)/'     # 0

# 6) Endpoints reales vs documentados
curl -s http://localhost:4001/openapi.json | python3 -c "
import json,sys; d=json.load(sys.stdin)
print(sum(1 for p,o in d['paths'].items() for m in o if m in ('get','post','put','patch','delete'))) "
# Esperado: 27  (y el README debe decir 27)

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
- [ ] `App.jsx` = 94 líneas; 0 `obtener_conexion()` en `routes/`; 0 `logger.error`.
- [ ] 0 ficheros de `coverage/`/`dist/` trackeados; `.gitignore` completo.
- [ ] `/health` no filtra detalle de BD; `/api/habitaciones` exige rol; `/api/habitaciones/publicas` es público.
- [ ] Contenedores `backend` y `frontend` reconstruidos con el código actual.
- [ ] Decisión tomada sobre el revert del PR#53 en `main` antes del merge.

---

_Informe generado el 2026-11-13 a partir de la rama `test/e2e-double-click-protection` (commits `3acd4c4`…`8aec665`). Toda cifra de este documento es verificable con los comandos de la sección 8._
