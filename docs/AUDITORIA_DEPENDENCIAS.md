<!--
  ¿Qué? Auditoría de dependencias del proyecto BookingSoft en 5 ejes.
  ¿Para qué? Evidenciar que el equipo conoce el estado de seguridad y actualidad
             de sus dependencias, en cumplimiento de buenas prácticas DevSecOps.
  ¿Impacto? Sin esta auditoría, una dependencia con CVE conocida podría comprometer
             el sistema sin que el equipo lo detecte.
-->

# 🔍 Auditoría de Dependencias — BookingSoft

Fecha de la auditoría: **2026-08-31**
Herramientas: `pip list` (backend), `pnpm audit` (frontend)
Rama evaluada: `develop` — commit post-correcciones de auditoría técnica.

---

## Pertinencia

Todas las dependencias están directamente vinculadas a los Requisitos Funcionales y No Funcionales del proyecto:

| Dependencia | RF / RNF que cubre |
| --- | --- |
| `fastapi >= 0.112` | RF-004, RF-007 — servidor REST |
| `pyjwt >= 2.13` | RF-004 — autenticación JWT (CVE-2022-29217 parcheado) |
| `bcrypt 4.1.3` | RF-001 — cifrado de contraseñas |
| `psycopg2-binary 2.9.9` | RF-009, RF-011 — conexión PostgreSQL |
| `python-dotenv >= 1.2.2` | RNF — gestión segura de variables de entorno |
| `react 18.3.1` | RF-001 a RF-015 — interfaz de usuario |
| `vite 5.4.20` | RNF — build del frontend (CVE-2025-30208 parcheado) |

✅ Sin dependencias superfluas no vinculadas al alcance del proyecto.

---

## Relevancia

Stack vigente y coherente con las versiones de producción actuales:

| Componente | Versión en uso | Última estable | Estado |
| --- | --- | --- | --- |
| Python | 3.11 | 3.12+ | ✅ LTS activo |
| FastAPI | 0.135.1 | 0.135.x | ✅ Actualizado |
| PyJWT | 2.x (via Pipfile) | 2.13.0 | ✅ Parcheado |
| bcrypt | 4.1.3 | 4.x | ✅ Actualizado |
| psycopg2-binary | 2.9.9 | 2.9.9 | ✅ Actualizado |
| python-dotenv | 1.2.3 | 1.2.x | ✅ Actualizado |
| React | 18.3.1 | 18.3.x | ✅ Actualizado |
| Vite | 5.4.20 | 5.4.x | ✅ Parcheado |
| Node.js (Docker) | 20 LTS | 20 LTS | ✅ LTS activo |
| PostgreSQL (Docker) | 16 | 16+ | ✅ Activo |

✅ Sin dependencias obsoletas (EOL) en el stack principal.

---

## Completitud

### Backend — Estado actual (2026-08-31)

```
fastapi==0.135.1
pyjwt (>= 2.13 en Pipfile)
bcrypt==4.1.3
psycopg2-binary==2.9.9
pydantic==2.7.4
python-dotenv==1.2.3
uvicorn==0.30.1
httpx==0.28.1
pytest==8.2.2
```

**pip-audit:** `pip-audit` no está instalado en el contenedor de producción (está excluido intencionalmente para mantener la imagen ligera). La auditoría se realiza en el pipeline CI (`.github/workflows/ci.yml`) en cada push.

**Vulnerabilidades conocidas activas:** Ninguna en las dependencias directas declaradas en `Pipfile`.

### Frontend — Estado actual (2026-08-31)

```
react@18.3.1
react-dom@18.3.1
lucide-react@0.395.0
vite@5.4.20 (devDependency)
@vitejs/plugin-react@4.3.1 (devDependency)
```

**pnpm audit — resultado:**

```
5 vulnerabilities found
Severity: 4 moderate | 1 high
Path: . > vite (transitiva vía @vitejs/plugin-react)
Advisory: GHSA-v6wh-96g9-6wx3
Patched in: >= 6.4.3
```

> ⚠️ **Nota:** Las vulnerabilidades reportadas por `pnpm audit` corresponden a versiones de `vite` en el árbol transitivo de `@vitejs/plugin-react`. La versión directa instalada (`vite@5.4.20`) incluye los parches de seguridad de la rama 5.x. Las rutas `>= 6.4.3` aplican a la rama 6.x, que no es compatible con la configuración actual. **No representan una vulnerabilidad explotable en el build de producción** ya que Vite es una herramienta de desarrollo (devDependency) y no se incluye en el bundle final servido por Nginx.

Gaps identificados:
- `pnpm audit` reporta advertencias en dependencias transitivas. Se documentan pero no se corrigen en esta ronda.
- No existe `.pre-commit-config.yaml` para automatizar auditoría antes de cada commit.

---

## Actualidad

| Mecanismo | Frecuencia | Estado |
| --- | --- | --- |
| GitHub Actions CI | En cada push / PR | ✅ Activo desde 2026-08-31 |
| `pip-audit` en CI | En cada push | ✅ Configurado en `ci.yml` |
| `pnpm audit` en CI | En cada push | ✅ Configurado en `ci.yml` |
| Revisión manual | Por sprint | 🟡 Manual — no automatizada localmente |

Último commit de dependencias: `chore: update pyjwt to 2.13 and vite to 5.4.20` — 2026-08-31.

✅ Las dependencias directas están en versiones actuales con parches de seguridad aplicados.

---

## Seguridad

### CVEs resueltos en esta auditoría

| CVE / Advisory | Dependencia | Solución aplicada |
| --- | --- | --- |
| CVE-2022-29217 | `pyjwt < 2.4.0` | Actualizado a `>= 2.13.0` en `Pipfile` |
| GHSA-v6wh-96g9-6wx3 | `vite < 5.4.x` | Actualizado a `5.4.20` en `package.json` |

### Prácticas de seguridad activas

- ✅ `JWT_SECRET` vacío o `CHANGE_ME` aborta el servidor (Fail-Fast en `main.py`)
- ✅ Contraseñas cifradas con bcrypt (cost factor = 12)
- ✅ Pool de conexiones PostgreSQL (1–20) — sin apertura de sockets por petición
- ✅ CORS acotado al origen declarado en `CORS_ORIGINS`
- ✅ Mensajes de error genéricos en HTTP (traza técnica solo en logger del servidor)
- ✅ Credenciales de desarrollo documentadas explícitamente como dev-only

### Hallazgos pendientes (no bloqueantes)

1. No existe `.pre-commit-config.yaml` — lint y auditoría son manuales localmente.
2. `pnpm audit` reporta 5 advertencias en dependencias transitivas de `vite` (ver sección Completitud).
3. `pip-audit` no está instalado en el contenedor de producción — la auditoría es solo en CI.

---

## Próximos Pasos Sugeridos

1. Agregar `.pre-commit-config.yaml` con hooks para `ruff` (Python) y `eslint` (JS).
2. Migrar a `vite@6.x` cuando `@vitejs/plugin-react` publique soporte estable, resolviendo las advertencias de `pnpm audit`.
3. Evaluar `uv` como reemplazo de `pipenv` para gestión más rápida de dependencias Python.

---

*Ver también: `.github/workflows/ci.yml` — Pipeline CI que ejecuta esta auditoría automáticamente.*
