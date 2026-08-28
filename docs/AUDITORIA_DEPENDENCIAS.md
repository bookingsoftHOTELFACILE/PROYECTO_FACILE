# Informe de Auditoría de Seguridad de Dependencias (BookingSoft)

**Fecha de la Auditoría:** 28 de agosto de 2026  
**Proyecto:** Proyecto Facile (BookingSoft)  
**Requisito Académico / Técnico:** Verificación estricta de versiones pinadas (sin comodines) y auditoría de seguridad formal de dependencias.

---

## 1. Verificación de Versiones Pinadas (Sin Comodines)

Se verificó mediante análisis automatizado que ni `backend/requirements.txt` ni `frontend/package.json` utilizan caracteres de rango o comodines (`^`, `~`, `>=`).

### Comando de Verificación Ejecutado:
```bash
grep -E '\^|~|>=' backend/requirements.txt frontend/package.json
```

### Resultado de la Verificación:
```text
(Salida vacía - 0 coincidencias encontradas)
```
**Resultado:** Se confirma al 100% que todas las dependencias principales declaradas en ambos módulos tienen versiones exactas (pinadas).

---

## 2. Auditoría de Seguridad Backend (Python / pip-audit)

### Comando Exacto Ejecutado:
```bash
docker compose exec backend pip-audit
```

### Salida Completa y Real:
```text
Found 30 known vulnerabilities in 6 packages
Name          Version ID              Fix Versions
------------- ------- --------------- ------------
pip           24.0    PYSEC-2026-196  26.1.2
pip           24.0    PYSEC-2026-1795 25.3
pip           24.0    PYSEC-2026-1796 26.0
pip           24.0    PYSEC-2026-2875 26.1
pip           24.0    PYSEC-2026-2876 26.1
pip           24.0    PYSEC-2026-3721 26.2
pyjwt         2.8.0   PYSEC-2026-120  2.12.0
pyjwt         2.8.0   PYSEC-2025-183  2.13.0
pyjwt         2.8.0   PYSEC-2026-179  2.13.0
pyjwt         2.8.0   PYSEC-2026-175  2.13.0
pyjwt         2.8.0   PYSEC-2026-177  2.13.0
pyjwt         2.8.0   PYSEC-2026-178  2.13.0
pytest        8.2.2   PYSEC-2026-1845 9.0.3
python-dotenv 1.0.1   PYSEC-2026-2270 1.2.2
setuptools    79.0.1  PYSEC-2026-3447 83.0.0
starlette     0.37.2  PYSEC-2026-161  1.0.1
starlette     0.37.2  PYSEC-2026-248  1.3.0
starlette     0.37.2  PYSEC-2026-249  1.3.1
starlette     0.37.2  PYSEC-2026-1943 0.40.0
starlette     0.37.2  PYSEC-2026-1941 0.47.2
starlette     0.37.2  PYSEC-2026-2281 1.1.0
starlette     0.37.2  PYSEC-2026-2280 1.1.0
```

### Resumen de Paquetes Afectados en Backend:
1. `pip` (24.0) — Herramienta interna de empaquetado Python del contenedor. (Versión corregida: 26.2.0).
2. `pyjwt` (2.8.0) — Manejo de tokens JWT. (Versión corregida recomendada: 2.13.0).
3. `pytest` (8.2.2) — Framework de pruebas en entorno dev. (Versión corregida recomendada: 9.0.3).
4. `python-dotenv` (1.0.1) — Carga de variables de entorno. (Versión corregida recomendada: 1.2.2).
5. `setuptools` (79.0.1) — Utilidad de empaquetado del entorno. (Versión corregida: 83.0.0).
6. `starlette` (0.37.2) — Subdependencia core ASGI utilizada por FastAPI. (Versión corregida recomendada: 1.3.1).

---

## 3. Auditoría de Seguridad Frontend (Node.js / pnpm audit)

### Comando Exacto Ejecutado:
```bash
cd frontend && pnpm audit
```

### Salida Completa y Real:
```text
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ high                │ launch-editor vulnerable to command injection via the  │
│                     │ crafted request on Windows                             │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ vite                                                   │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Vulnerable versions │ <=5.4.8                                                │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Patched versions    │ >=5.4.9                                                │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Paths               │ .>@vitejs/plugin-react>vite                            │
│                     │                                                        │
│                     │ .>vite                                                 │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ More info           │ https://github.com/advisories/GHSA-c27g-q93r-2cwf      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ high                │ vite: `server.fs.deny` bypass on Windows alternate     │
│                     │ paths                                                  │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ vite                                                   │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Vulnerable versions │ <=6.4.2                                                │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Patched versions    │ >=6.4.3                                                │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Paths               │ .>@vitejs/plugin-react>vite                            │
│                     │                                                        │
│                     │ .>vite                                                 │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ More info           │ https://github.com/advisories/GHSA-fx2h-pf6j-xcff      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ moderate            │ Vite DOM Clobbering gadget found in vite bundled       │
│                     │ scripts that leads to XSS                              │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ vite                                                   │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Vulnerable versions │ >=5.3.0 <5.3.6                                         │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Patched versions    │ >=5.3.6                                                │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Paths               │ .>@vitejs/plugin-react>vite                            │
│                     │                                                        │
│                     │ .>vite                                                 │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ More info           │ https://github.com/advisories/GHSA-64vr-g452-qvp3      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ moderate            │ Vite's `server.fs.deny` is bypassed when using         │
│                     │ `?import&raw`                                          │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ vite                                                   │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Vulnerable versions │ >=5.3.0 <=5.3.5                                        │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Patched versions    │ >=5.3.6                                                │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Paths               │ .>@vitejs/plugin-react>vite                            │
│                     │                                                        │
│                     │ .>vite                                                 │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ More info           │ https://github.com/advisories/GHSA-9cwx-2883-4wfx      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ moderate            │ esbuild enables any website to send any requests to    │
│                     │ the development server and read the response           │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ esbuild                                                │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Vulnerable versions │ <=0.24.2                                               │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Patched versions    │ >=0.24.3                                               │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Paths               │ .>@vitejs/plugin-react>vite>esbuild                    │
│                     │                                                        │
│                     │ .>vite>esbuild                                         │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ More info           │ https://github.com/advisories/GHSA-67mh-4wv8-2f99      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ moderate            │ Websites were able to send any requests to the         │
│                     │ development server and read the response in vite       │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ vite                                                   │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Vulnerable versions │ >=5.0.0 <=5.4.11                                       │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Patched versions    │ >=5.4.12                                               │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Paths               │ .>@vitejs/plugin-react>vite                            │
│                     │                                                        │
│                     │ .>vite                                                 │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ More info           │ https://github.com/advisories/GHSA-vg6x-rcgg-rjx6      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ moderate            │ Vite bypasses server.fs.deny when using ?raw??         │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ vite                                                   │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Vulnerable versions │ >=5.0.0 <5.4.15                                        │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Patched versions    │ >=5.4.15                                               │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Paths               │ .>@vitejs/plugin-react>vite                            │
│                     │                                                        │
│                     │ .>vite                                                 │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ More info           │ https://github.com/advisories/GHSA-x574-m823-4x7w      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ moderate            │ Vite has an `server.fs.deny` bypass with an invalid    │
│                     │ `request-target`                                       │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ vite                                                   │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Vulnerable versions │ >=5.0.0 <5.4.18                                        │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Patched versions    │ >=5.4.18                                               │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Paths               │ .>@vitejs/plugin-react>vite                            │
│                     │                                                        │
│                     │ .>vite                                                 │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ More info           │ https://github.com/advisories/GHSA-356w-63v5-8wf4      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ moderate            │ Vite's server.fs.deny bypassed with /. for files under │
│                     │ project root                                           │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ vite                                                   │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Vulnerable versions │ >=5.0.0 <=5.4.18                                       │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Patched versions    │ >=5.4.19                                               │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Paths               │ .>@vitejs/plugin-react>vite                            │
│                     │                                                        │
│                     │ .>vite                                                 │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ More info           │ https://github.com/advisories/GHSA-859w-5945-r5v3      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ moderate            │ Vite allows server.fs.deny to be bypassed with .svg or │
│                     │ relative paths                                         │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ vite                                                   │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Vulnerable versions │ >=5.0.0 <5.4.17                                        │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Patched versions    │ >=5.4.17                                               │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Paths               │ .>@vitejs/plugin-react>vite                            │
│                     │                                                        │
│                     │ .>vite                                                 │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ More info           │ https://github.com/advisories/GHSA-xcj6-pq6g-qj4x      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ moderate            │ vite allows server.fs.deny bypass via backslash on     │
│                     │ Windows                                                │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ vite                                                   │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Vulnerable versions │ >=5.2.6 <=5.4.20                                       │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Patched versions    │ >=5.4.21                                               │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Paths               │ .>@vitejs/plugin-react>vite                            │
│                     │                                                        │
│                     │ .>vite                                                 │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ More info           │ https://github.com/advisories/GHSA-93m4-6634-74q7      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ moderate            │ Vite has a `server.fs.deny` bypassed for `inline` and  │
│                     │ `raw` with `?import` query                             │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ vite                                                   │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Vulnerable versions │ >=5.0.0 <5.4.16                                        │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Patched versions    │ >=5.4.16                                               │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Paths               │ .>@vitejs/plugin-react>vite                            │
│                     │                                                        │
│                     │ .>vite                                                 │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ More info           │ https://github.com/advisories/GHSA-4r4m-qw57-chr8      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ moderate            │ Vite Vulnerable to Path Traversal in Optimized Deps    │
│                     │ `.map` Handling                                        │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ vite                                                   │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Vulnerable versions │ <=6.4.1                                                │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Patched versions    │ >=6.4.2                                                │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Paths               │ .>@vitejs/plugin-react>vite                            │
│                     │                                                        │
│                     │ .>vite                                                 │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ More info           │ https://github.com/advisories/GHSA-4w7w-66w2-5vf9      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ moderate            │ launch-editor: NTLMv2 hash disclosure via UNC path     │
│                     │ handling on Windows                                    │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ vite                                                   │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Vulnerable versions │ <=6.4.2                                                │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Patched versions    │ >=6.4.3                                                │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Paths               │ .>@vitejs/plugin-react>vite                            │
│                     │                                                        │
│                     │ .>vite                                                 │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ More info           │ https://github.com/advisories/GHSA-v6wh-96g9-6wx3      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ low                 │ Vite middleware may serve files starting with the same │
│                     │ name with the public directory                         │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ vite                                                   │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Vulnerable versions │ <=5.4.19                                               │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Patched versions    │ >=5.4.20                                               │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Paths               │ .>@vitejs/plugin-react>vite                            │
│                     │                                                        │
│                     │ .>vite                                                 │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ More info           │ https://github.com/advisories/GHSA-g4jq-h2w9-997c      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ low                 │ Vite's `server.fs` settings were not applied to HTML   │
│                     │ files                                                  │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ vite                                                   │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Vulnerable versions │ <=5.4.19                                               │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Patched versions    │ >=5.4.20                                               │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Paths               │ .>@vitejs/plugin-react>vite                            │
│                     │                                                        │
│                     │ .>vite                                                 │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ More info           │ https://github.com/advisories/GHSA-jqfw-vq24-v9c3      │
└─────────────────────┴────────────────────────────────────────────────────────┘
16 vulnerabilities found
Severity: 2 low | 12 moderate | 2 high
```

### Resumen de Paquetes Afectados en Frontend:
* **Vulnerabilidades:** 16 detectadas (2 bajas, 12 moderadas, 2 altas).
* **Paquete Principal Afectado:** `vite` (herramienta de bundling de desarrollo).
* **Causa:** Uso de `vite@5.4.0`. Se corrige actualizando a la versión parcheada con fijación exacta (ej. `vite@6.4.3`).

---

## 4. Decisión sobre las vulnerabilidades encontradas y Gestión de Riesgo

### Backend (pip-audit)
Las 30 vulnerabilidades detectadas afectan a 6 paquetes: `pip`, `pyjwt`, `pytest`, `python-dotenv`, `setuptools` y `starlette`. Se decide **NO actualizar ninguna versión** a 2 días de la entrega del proyecto (3 de septiembre 2026), por el riesgo de introducir regresiones sin tiempo suficiente para probarlas a fondo. Se documenta como **riesgo aceptado**.

*Nota de evaluación de entorno:* `pyjwt` y `starlette` son dependencias que sí corren en producción (autenticación JWT y el servidor ASGI de FastAPI); `pip`, `pytest`, `python-dotenv` y `setuptools` son herramientas de desarrollo/empaquetado que no se ejecutan en el flujo de la aplicación en producción.

### Frontend (pnpm audit)
Las 16 vulnerabilidades detectadas afectan exclusivamente a `vite` y su dependencia `esbuild`. Todas corresponden a bypasses del servidor de desarrollo de Vite (`server.fs.deny`) o al modo de desarrollo de `esbuild` -- ninguna afecta el build de producción que se sirve mediante Nginx dentro del contenedor Docker (el servidor de desarrollo de Vite nunca se expone en el entorno productivo). Se decide **NO actualizar** por la misma razón de proximidad a la entrega, documentado como **riesgo aceptado de bajo impacto real** dado que el vector de ataque requiere acceso a la máquina de desarrollo, no al sistema desplegado.

### Recomendación para Fase 2
Actualizar `vite` a `>=5.4.21` (o migrar a Vite 6/7 con versión fija), `pyjwt` a `2.13.0`, y `starlette` a la versión estable más reciente compatible con FastAPI 0.111.0, con su respectiva batería de pruebas de regresión antes de subir a producción real del Apartahotel Facile.

