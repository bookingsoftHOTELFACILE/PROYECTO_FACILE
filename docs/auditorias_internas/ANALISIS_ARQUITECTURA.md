# Auditoría de Arquitectura y Calidad de Código — BookingSoft

<!--
  ¿Qué? Diagnóstico técnico completo del estado actual del código fuente (backend,
        frontend, base de datos, pruebas) con métricas objetivas.
  ¿Para qué? Tener una línea base medible de la calidad del proyecto, priorizar
             la deuda técnica y evidenciar en sustentación que el estado del código
             fue auditado, no improvisado.
  ¿Impacto? Permite atacar los problemas por orden de severidad en lugar de
            refactorizar a ciegas, y evita que la deuda crezca en Fase 2.
-->

**Fecha de auditoría:** 09 de noviembre de 2026  
**Alcance:** `backend/`, `frontend/`, `E2E/`, `docs/`, `.github/workflows/`  
**Metodología:** revisión estática de la totalidad del código fuente, métricas de línea, revisión de queries SQL, contraste contra la matriz RBAC y las historias de usuario.

---

## 1. Resumen Ejecutivo

| Capa | Veredicto | Nota |
| --- | :---: | :---: |
| Backend (FastAPI) | ✅ Ordenado, no es espagueti | 7.5 / 10 |
| Base de datos (PostgreSQL) | ✅ Muy buen diseño | 8.5 / 10 |
| Documentación de requisitos | ✅ Sobre la media | 8 / 10 (desactualizada en detalles) |
| Frontend (React) | ❌ Espagueti por concentración | 3 / 10 |
| Cobertura de requisitos (HU) | ⚠️ Hueco funcional relevante | HU-005 incompleto |

**Conclusión en una frase:** el backend y la base de datos están construidos con criterio profesional; el frontend es un monolito de 6.665 líneas que concentra el 95 % de la interfaz en un solo archivo y es el único componente que debe considerarse deuda técnica severa.

---

## 2. Métricas Objetivas

### 2.1 Tamaño por archivo (líneas de código)

| Archivo | Líneas | Participación |
| --- | ---: | ---: |
| `frontend/src/App.jsx` | **6.665** | 55,7 % de todo el código |
| `frontend/src/index.css` | 2.156 | 18,0 % |
| `backend/routes/huespedes.py` | 425 | 3,5 % |
| `backend/routes/empleados.py` | 333 | 2,8 % |
| `backend/routes/reservas.py` | 250 | 2,1 % |
| `backend/routes/habitaciones.py` | 240 | 2,0 % |
| `backend/routes/centro_negocios.py` | 235 | 2,0 % |
| `backend/routes/auth.py` | 222 | 1,9 % |
| Resto de backend (módulos + tests) | 1.590 | 13,3 % |
| **Total** | **≈ 11.900** | 100 % |

### 2.2 Métricas del frontend

| Métrica | Valor | Evaluación |
| --- | ---: | :--- |
| Archivos de componentes en `src/` | 1 (`App.jsx`) | 🔴 |
| Componentes auxiliares definidos | 4 (todos dentro de `App.jsx`) | 🔴 |
| Líneas del componente `App()` | 5.830 (líneas 835 → 6665) | 🔴 |
| `useState` en un solo componente | **69** | 🔴 |
| `useEffect` | 6 | 🟡 |
| Llamadas `fetch` inline | **25** (sin capa de servicios) | 🔴 |
| Estilos inline `style={{…}}` | **549** (además de 2.156 líneas de CSS) | 🔴 |
| Comparaciones de pestaña por string | 16 (`activeTab`) + 19 (`pmsSubTab`) | 🟡 |
| Bloques de render más grandes | PMS 1.964 líneas · Catálogo 698 · Reservar 439 | 🔴 |
| Router (`react-router`) | ausente (navegación por estado string) | 🟡 |
| Cobertura de líneas de `App.jsx` | **0,0 %** (0 / 6.635) | 🔴 |
| Estado del reporte de cobertura | Obsoleto (menciona `LoginForm.jsx`, ya inexistente) | 🟡 |

### 2.3 Métricas del backend

| Métrica | Valor | Evaluación |
| --- | ---: | :--- |
| Capas identificadas | `routes` / `services` / `models` / `database` / `dependencies` | 🟢 |
| Queries SQL con concatenación de strings | **0** | 🟢 |
| Queries parametrizadas (`%s`) | totalidad | 🟢 |
| Accesos posicionales a filas (`f[0]`, `res_row[3]`) | 63 | 🟡 |
| Repeticiones de `obtener_conexion()` | 23 | 🟡 |
| Bloques `finally` de liberación de conexión | 36 | 🟡 |
| Respuestas `HTTP 500` genéricas | 24 | 🟡 |
| Endpoint con `logger.exception` real | casi ninguno | 🟡 |
| Inconsistencia de prefijos (`APIRouter` vs ruta completa) | `huespedes.py` usa ruta completa | 🟡 |

### 2.4 Pruebas

| Suite | Cantidad | Estado |
| --- | ---: | :--- |
| `backend/tests/` (pytest, PostgreSQL real, sin mocks) | **30** | 🟢 |
| `E2E/tests/` (Playwright, localizadores accesibles) | 5 specs / 238 líneas | 🟢 |
| `frontend/src/*.test.js` (Vitest) | 2 archivos | 🔴 no cubren `App.jsx` |
| CI (`.github/workflows/ci.yml`) | pytest + `pip-audit` sobre PostgreSQL 16 | 🟢 |

> **Desviación documental:** el `README.md` declara "15 pruebas automatizadas". La cifra real es **30**.

---

## 3. Hallazgos de Severidad Alta

### H-01 — `DELETE /api/reservas/{id}` no exige autenticación

- **Ubicación:** `backend/routes/reservas.py:211-216`
- **Problema:** usa `Depends(autenticar_opcional)`. Un cliente **sin token** puede cancelar cualquier reserva conociendo únicamente su `id_reserva`.
- **Impacto:** cualquier persona puede inhabilitar reservas de huéspedes reales.
- **Corrección:** exiger `autenticar` + `requiere_rol("Administrador", "Recepcionista 24h")`.

### H-02 — `GET /api/habitaciones` no tiene control de acceso

- **Ubicación:** `backend/routes/habitaciones.py:25`
- **Problema:** el decorador no declara ninguna dependencia de autorización; el inventario completo (números, tipos, capacidad, tarifa, estado, detalle de mantenimiento) es legible sin sesión.
- **Desviación:** la matriz RBAC del `README.md` y `MATRIZ_ROLES_ENDPOINTS.md` exige roles para este endpoint.
- **Corrección:** aplicar `requiere_rol(...)` con los roles de la matriz.

### H-03 — HU-005 (Check-In / Check-Out) no está implementada

- **Endpoint declarado pero inexistente:** la matriz RBAC documenta `PATCH /api/reservas/{id}/estado`; en `backend/routes/reservas.py` solo existen `GET`, `POST` y `DELETE`.
- **Evidencia en frontend:** la pestaña "Reservas" del PMS (línea 5320) solo ofrece el botón **"Cancelar"**. No existe acción de check-in ni de check-out.
- **Desacople:** el estado de la habitación se modifica manualmente desde "Planta", sin vínculo con la reserva que lo originó.
- **Criterios de aceptación incumplidos:** `CA-005.1` (registrar entrada y poner unidad en "ocupada"), `CA-005.4` (registrar salida, poner "disponible" y generar resumen de estadía), `CA-005.5` (cálculo de duración).
- **Impacto directo en el objetivo del proyecto:** no se puede analizar la operación real de entradas y salidas, que es la necesidad central declarada.

---

## 4. Hallazgos de Severidad Media

### M-01 — Monolito frontend de 6.665 líneas
Concentra portal público, PMS, autenticación, perfiles, galería, calendarios y modales legales en un único componente de 5.830 líneas con 69 estados. Cualquier cambio funcional exige recorrer un archivo sin límites de responsabilidad.

### M-02 — Ausencia de capa de servicios en el frontend
Las 25 llamadas `fetch` construyen URL, encabezados y manejo de errores de forma independiente. Un cambio en la autenticación o en el formato de error obliga a editar ~25 lugares.

### M-03 — Duplicación detectada
- Bloque de filtrado de reservas por rango de fechas duplicado en las líneas **3723** y **5052**.
- Estilos del control de lightbox duplicados (12 bloques de 15 líneas idénticos detectados).

### M-04 — Fuente dual de datos
`CATALOGO_HABITACIONES_INICIAL` (hardcodeado) convive con los datos reales bajo el flag `backendActivo`. Si el backend no responde, la interfaz puede presentar el catálogo estático como si fuera información vigente.

### M-05 — Sin capa de repositorio en el backend
Cada endpoint repite el patrón `obtener_conexion()` → `cursor` → `try/except` → `finally: liberar_conexion()`. Afecta a los 6 módulos de rutas; un cambio en la política de conexiones obliga a editar 6 archivos y 36 bloques.

### M-06 — Acceso posicional a filas de resultado
63 expresiones del tipo `f[0]`, `res_row[3]`, `hab_row[0]`. Alterar el orden o el número de columnas de un `SELECT` produce errores en tiempo de ejecución sin aviso en la edición.

### M-07 — Manejo de errores opaco
24 respuestas `HTTP 500` con mensaje genérico y muy poca instrumentación `logger.exception`. El detalle se descarta, lo correcto para el cliente, pero tampoco queda trazabilidad para diagnóstico.

### M-08 — Inconsistencia de estilo entre módulos
`huespedes.py` declara rutas completas (`/api/huespedes`) en el decorador; los otros cinco módulos usan `APIRouter(prefix=...)`. Añade un endpoint exige recordar dos convenciones distintas.

---

## 5. Hallazgos de Severidad Baja

| ID | Hallazgo | Ubicación |
| --- | --- | --- |
| B-01 | `README.md` declara 15 pruebas; existen 30 | `README.md` § Pruebas |
| B-02 | La estructura de repositorio del `README` no menciona `services/`, `E2E/` ni `test_reservas_service.py` | `README.md` § Estructura |
| B-03 | `coverage/` y `dist/` versionados en el repositorio | `frontend/coverage`, `frontend/dist` |
| B-04 | Reporte de cobertura obsoleto referenciando `LoginForm.jsx` | `frontend/coverage/coverage-final.json` |
| B-05 | `GET /health` expone el mensaje de la excepción de la base de datos al cliente | `backend/main.py` |
| B-06 | Umbrales de cobertura en `vite.config.js` fijados a 0 | `frontend/vite.config.js` |

---

## 6. Lo que está bien hecho (preservar en cualquier refactor)

Estos elementos no deben modificarse y son la base técnica sólida del proyecto:

1. **Prevención de doble reserva a nivel de motor de base de datos** mediante `EXCLUDE USING gist (id_habitacion WITH =, daterange(...) WITH &&)` — solución correcta frente a la alternativa de `SELECT` previo, que tiene condición de carrera.
2. **SQL íntegramente parametrizado** — sin inyección SQL en ningún módulo.
3. **Pool de conexiones** `ThreadedConnectionPool` (1–20) con liberación explícita.
4. **Fail-fast de seguridad** en `main.py`: el proceso aborta si `JWT_SECRET` falta o contiene el valor por defecto.
5. **Capa `services/reservas_service.py`** con lógica pura, sin dependencias de BD ni HTTP, cubierta por pruebas unitarias parametrizadas (principios FIRST).
6. **RBAC mediante fábrica de dependencias** `requiere_rol(*roles)` — declarativo y uniforme.
7. **30 pruebas de integración sobre PostgreSQL real**, sin mocks, ejecutándose también en CI con auditoría `pip-audit`.
8. **Pruebas E2E con localizadores accesibles** (`getByRole`, `getByLabel`) e `id` estables, lo que permite refactorizar la estructura del JSX sin romper la suite.
9. **Auditoría transaccional** (`creado_por`, `modificado_por`) y bajas lógicas en todas las entidades.
10. **Docker Compose con `healthchecks`** encadenados y volúmenes persistentes.

---

## 7. Plan de Remediación Priorizado

| Fase | Acción | Severidad atacada | Esfuerzo |
| :---: | --- | :---: | :---: |
| **0** | Publicar este documento en `docs/auditorias_internas/` | — | Bajo |
| **A** | Descomponer `App.jsx` en `views/`, `components/`, `api/client.js` y `hooks/`; deduplicar bloques; migrar estilos inline | M-01, M-02, M-03 | Alto |
| **B** | Implementar `PATCH /api/reservas/{id}/estado` con máquina de estados, registro de fecha/hora de entrada y salida, y resumen de estadía (HU-005) | **H-03** | Alto |
| **C** | Exigir autenticación y rol en `GET /api/habitaciones` y `DELETE /api/reservas/{id}` | **H-01, H-02** | Bajo |
| **D** | Capa `repositories/`, `RealDictCursor`, prefijos unificados, `logger.exception` | M-05, M-06, M-07, M-08 | Medio |
| **E** | Actualizar `README.md`, limpiar artefactos versionados, regenerar cobertura | B-01 a B-06 | Bajo |

**Criterio de aceptación global de la remediación:**
- `pytest` (30+) y `npx playwright test` en verde tras cada fase.
- Sin regresión visual ni funcional verificada en el portal público y en el PMS.
- `App.jsx` por debajo de 600 líneas al cierre de la Fase A.
- Cobertura de líneas del frontend por encima del 0 % actual y umbrales de `vite.config.js` elevados.

---

## 8. Estado de la remediación

| Fase | Hallazgos | Estado | Verificación |
| :--- | :--- | :--- | :--- |
| **A** — Descomponer `App.jsx` | M-01, M-02, M-03 | ✅ Completada | `App.jsx` 6.665 → **94** líneas; 25 `fetch` centralizados en `apiFetch`; `vite build` + `vitest` 6/6 + E2E 4/5. |
| **B** — Check-in / Check-out | **H-03** | ✅ Completada | `PATCH /api/reservas/{id}/estado` con máquina de estados, marcas temporales y cálculo de noches; `pytest` **49/49** (7 nuevos) + spec E2E propio. |
| **C** — Seguridad | **H-01, H-02** | ✅ Completada | `DELETE /api/reservas/{id}` y `GET /api/habitaciones` exigen rol operativo; nuevo `GET /api/habitaciones/publicas` para el portal sin sesión; `pytest` **55/55** (6 nuevos) + E2E 5/6. |
| **D** — Refactor backend | M-05 a M-08 | ⏳ Pendiente | — |
| **E** — Higiene y README | B-01 a B-06 | ⏳ Pendiente | — |

**Arreglos colaterales realizados durante la remediación:**
- Contraseñas sembradas corruptas en la BD viva (`$2b$12$…1d1d1d` en cuatro usuarios): restaurados los hashes de `schema.sql`.
- `backend/tests/test_reservas.py` apuntaba a `localhost:4000`; ahora usa `API_BASE_URL` (puerto 4001).
- `GET /api/habitaciones` se usaba además como *health probe* sin sesión; la comprobación pasó a `/health`.

**Fallo E2E preexistente (no introducido por la remediación):**
`E2E/tests/proteccion_doble_clic.spec.js` — el botón de confirmación no se deshabilita a tiempo.
Verificado reproduciendo el fallo con el monolito original de 6.665 líneas, por lo que no es una regresión.

---

_BookingSoft © 2026 — Apartahotel Facile. Auditoría interna de arquitectura._
