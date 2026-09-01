<!--
  ¿Qué? Documentación principal del proyecto BookingSoft.
  ¿Para qué? Guiar a cualquier evaluador, docente o colaborador para entender,
             configurar y ejecutar el sistema sin ambigüedad.
  ¿Impacto? Sin este README, no es posible reproducir el entorno ni evaluar
             el proyecto sin asistencia directa del equipo.
-->

> **Proyecto formativo** — SENA | Análisis y Desarrollo de Software | 2026

Sistema de gestión hotelera para el **Apartahotel Facile**. Centraliza el registro de huéspedes, el control de estado de habitaciones y las reservas atómicas (prevención de doble-booking), con autenticación JWT y control de acceso basado en roles (RBAC).

---

## 📋 Tabla de Contenidos

- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [✅ Prerrequisitos](#-prerrequisitos)
- [🚀 Arranque Rápido (Docker)](#-arranque-rápido-docker)
- [⚙️ Variables de Entorno](#️-variables-de-entorno)
- [👥 Cuentas Semilla](#-cuentas-semilla)
- [🗂️ Endpoints Disponibles](#️-endpoints-disponibles)
- [🧪 Pruebas Automatizadas](#-pruebas-automatizadas)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🛡️ Roles del Sistema (RBAC)](#️-roles-del-sistema-rbac)
- [📊 Estado del Proyecto](#-estado-del-proyecto)
- [📏 Convenciones y Flujo de Trabajo](#-convenciones-y-flujo-de-trabajo)
- [⚠️ Advertencia de Seguridad](#️-advertencia-de-seguridad)
- [👥 Equipo](#-equipo)

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| --- | --- |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, PyJWT >= 2.13, bcrypt |
| **Frontend** | React 18, Vite 5.4, JavaScript (ES2022), lucide-react |
| **Base de datos** | PostgreSQL 16 — Constraints GiST, triggers, columnas de auditoría |
| **Infraestructura** | Docker + Docker Compose (3 servicios con healthchecks encadenados) |
| **Gestión de deps** | Pipenv (Python), pnpm (Node) |
| **Testing** | pytest 8 + httpx (integración sobre PostgreSQL real) |
| **CI** | GitHub Actions — ejecuta pytest + pip-audit + pnpm audit en cada push |

---

## ✅ Prerrequisitos

| Herramienta | Versión mínima | Verificar con |
| --- | --- | --- |
| **Docker** | 24+ | `docker --version` |
| **Docker Compose** | 2.20+ | `docker compose version` |
| **Git** | 2.40+ | `git --version` |

> El entorno completo corre en Docker. No se necesita Python ni Node instalados localmente para levantar el sistema.

---

## 🚀 Arranque Rápido (Docker)

```bash
# 1. Clonar el repositorio
git clone https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE.git
cd PROYECTO_FACILE

# 2. Cambiar a la rama de integración
git checkout develop

# 3. Configurar variables de entorno
cp .env.example .env
# ⚠️ EDITAR .env antes de continuar — ver sección "Variables de Entorno"

# 4. Levantar los tres servicios (db → backend → frontend)
docker compose up --build -d

# 5. Verificar que el backend levantó correctamente
curl http://localhost:4000/health
# Respuesta esperada: {"status":"OK","mensaje":"Servidor funcionando correctamente."}
```

Una vez levantado:

| Servicio | URL |
| --- | --- |
| **Frontend (UI)** | http://localhost:3000 |
| **Backend (Swagger)** | http://localhost:4000/docs |
| **Backend (ReDoc)** | http://localhost:4000/redoc |

Para destruir los volúmenes y re-inicializar la base de datos desde cero:
```bash
docker compose down -v
RESET_DB=true docker compose up --build -d
```

---

## ⚙️ Variables de Entorno

El archivo `.env.example` en la raíz documenta todas las variables requeridas:

| Variable | Descripción | Valor por defecto (dev) |
| --- | --- | --- |
| `JWT_SECRET` | Secreto para firma de tokens JWT — **cambiar en producción** | *(sin valor — el backend no arranca si está vacío)* |
| `DB_USER` | Usuario de PostgreSQL | `adso_user` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `adso_password` |
| `DB_NAME` | Nombre de la base de datos | `bookingsoft` |
| `DB_HOST` | Host de PostgreSQL | `db` (nombre del servicio Docker) |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `CORS_ORIGINS` | Orígenes permitidos por CORS | `http://localhost:3000` |
| `RESET_DB` | Si es `true`, destruye y reinicia las tablas al arrancar | `false` |

> ⚠️ El backend implementa una guarda **Fail-Fast**: si `JWT_SECRET` está vacío o contiene el valor `CHANGE_ME`, el proceso aborta con código de salida 1 antes de aceptar peticiones.

---

## 👥 Cuentas Semilla

El `schema.sql` inicializa cuatro empleados de prueba con contraseñas cifradas (bcrypt) para la demostración de roles:

| Usuario | Contraseña | Rol / Perfil | Vista Principal |
| --- | --- | --- | --- |
| `admin` | `adminpassword123` | Administrador (Grupo BookingSoft) | 👑 Personal & Roles |
| `recepcion` | `recepcion123` | Recepcionista 24h | 🛎️ Recepción (Walk-in) |
| `amallaves` | `amallaves123` | Ama de llaves | 🧹 Tablero Aseo Pendiente |
| `mantenimiento` | `mantenimiento123` | Personal de mantenimiento | 🔧 Bitácora Daños Activos |

> ⚠️ **Estas credenciales son exclusivamente para desarrollo y validación académica.** Están publicadas en este repositorio público de forma intencional para facilitar la evaluación del proyecto por parte de los docentes. No deben usarse en entornos productivos. Ver `docs/ROTACION_SECRETOS.md` para el procedimiento de rotación.

---

## 🗂️ Endpoints Disponibles

El sistema expone **17 endpoints REST**. Los endpoints protegidos exigen cabecera `Authorization: Bearer <token>`.

### Autenticación
| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Público | Autentica empleado, retorna JWT |
| `POST` | `/api/auth/registro` | Administrador | Registra nuevo empleado |

### Huéspedes
| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/huespedes` | Autenticado | Lista todos los huéspedes |
| `POST` | `/api/user/registro` | Recepcionista / Admin | Registra nuevo huésped |
| `PATCH` | `/api/huespedes/{id}/estado` | Recepcionista / Admin | Activa o desactiva huésped (baja lógica) |
| `DELETE` | `/api/huespedes/{id}` | Administrador | Baja lógica del huésped |

### Habitaciones
| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/habitaciones` | Autenticado | Lista habitaciones |
| `POST` | `/api/habitaciones` | Administrador | Crea habitación |
| `PATCH` | `/api/habitaciones/{id}/estado` | Recepcionista / Admin | Cambia estado |
| `PUT` | `/api/habitaciones/{id}` | Administrador | Actualiza habitación |
| `DELETE` | `/api/habitaciones/{id}` | Administrador | Baja lógica de habitación |

### Reservas
| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/reservas` | Autenticado | Lista reservas activas |
| `POST` | `/api/reservas` | Recepcionista / Admin | Crea reserva (bloqueo atómico GiST) |
| `PATCH` | `/api/reservas/{id}/estado` | Recepcionista / Admin | Actualiza estado de reserva |
| `DELETE` | `/api/reservas/{id}` | Recepcionista 24h / Admin | Cancela reserva (baja lógica) |

### Empleados
| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/empleados` | Administrador | Lista empleados |
| `GET` | `/api/empleados/{id}` | Administrador | Consulta empleado por ID |

### Diagnóstico
| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `GET` | `/health` | Público | Estado del servidor y la DB |

---

## 🧪 Pruebas Automatizadas

El backend cuenta con **15 pruebas de integración** ejecutadas sobre PostgreSQL real (sin mocks):

```bash
# Correr la suite desde el contenedor activo
docker compose exec backend pytest -v

# Correr con reinicio de BD (escenario limpio)
RESET_DB=true docker compose up -d
docker compose exec backend pytest -v
```

Las pruebas cubren:
- Autenticación válida e inválida (RF-004, RF-007)
- Rechazo de acceso sin token y con rol incorrecto
- Prevención de doble-booking atómico (RF-011)
- Registro de huésped con y sin campos obligatorios

---

## 📁 Estructura del Proyecto

```text
PROYECTO_FACILE/
├── .env.example                   # Plantilla de variables de entorno
├── .github/
│   └── workflows/
│       └── ci.yml                 # Pipeline de CI — pytest + pip-audit + pnpm audit
├── docker-compose.yml             # 3 servicios: db, backend, frontend
├── README.md                      # ← Este archivo
├── docs/
│   ├── ROTACION_SECRETOS.md       # Procedimiento de rotación de credenciales
│   ├── AUDITORIA_DEPENDENCIAS.md  # Auditoría de dependencias (pip-audit / pnpm audit)
│   └── requisitos/                # RFs, RNFs, HUs, Restricciones, Matriz de Trazabilidad
├── backend/
│   ├── Dockerfile
│   ├── Pipfile                    # Dependencias Python (pipenv)
│   ├── main.py                    # Punto de entrada FastAPI (lifespan + Fail-Fast JWT)
│   ├── schema.sql                 # Esquema PostgreSQL + seed data (fuente única de verdad)
│   ├── database/
│   │   └── connection.py          # Pool de conexiones ThreadedConnectionPool (1–20)
│   ├── dependencies.py            # Guards: autenticar(), requiere_rol()
│   ├── models/                    # Esquemas Pydantic (request/response)
│   ├── routes/                    # Endpoints modulares por recurso
│   └── tests/                     # Suite pytest (15 tests de integración)
└── frontend/
    ├── Dockerfile
    ├── nginx.conf                 # Proxy reverso → backend:4000
    ├── package.json
    └── src/
        └── App.jsx                # SPA React — consume API real, sin datos simulados
```

---

## 🛡️ Roles del Sistema (RBAC)

BookingSoft implementa control de acceso basado en roles mediante la dependencia `requiere_rol()` inyectada en cada endpoint sensible:

| Rol | Permisos |
| --- | --- |
| **Administrador** | Acceso total: registrar empleados, gestionar huéspedes, habitaciones, reservas y empleados |
| **Recepcionista 24h** | Crear y cancelar reservas, registrar y cambiar estado de huéspedes |
| **Recepcionista Noche** | Crear reservas, registrar huéspedes |
| **Ama de llaves** | Solo actualización de estados de habitaciones (limpieza → disponible) |
| **Mantenimiento** | Solo actualización de estado de habitaciones en mantenimiento |

> La lógica de ciclo de estados de habitaciones (disponible → reservada → en limpieza) vive en la base de datos mediante constraints y en el backend mediante validaciones de estado. No está duplicada en el frontend.

---

## 📊 Estado del Proyecto

Consulta la **[Matriz de Trazabilidad](docs/requisitos/MATRIZ_TRAZABILIDAD.md)** para el detalle RF por RF.

| Estado | RFs |
| --- | --- |
| ✅ Implementado y probado | RF-001, RF-004, RF-005, RF-006, RF-007, RF-008, RF-009, RF-010, RF-011 |
| 🟡 Implementado, sin prueba unitaria propia | RF-013, RF-014, RF-015 |
| ⏳ Declarado fuera de alcance (Fase 2) | HU-005 (check-in/check-out), RF-002, RF-003, RF-012 |

> **Nota sobre RF-009 (permisos):** Cuatro endpoints mutadores carecían de guarda RBAC en el commit inicial. Esto fue corregido en el commit `fix/rbac-y-secretos` — ver `docs/ROTACION_SECRETOS.md` y el historial de auditoría.

---

## 📏 Convenciones y Flujo de Trabajo

### Nomenclatura
| Aspecto | Regla |
| --- | --- |
| Código fuente (variables, funciones, rutas) | **Español** — decisión del equipo documentada en `docs/requisitos/restricciones.md` (RI-001) |
| Commits | Conventional Commits en inglés (`feat:`, `fix:`, `docs:`, `test:`, `chore:`) |
| Ramas | `feature/<slug>`, `fix/<slug>`, `docs/<slug>` sobre `develop` |
| Documentación | Markdown exclusivamente — cero PDF, DOC ni formatos binarios |

> ⚠️ **Desviación de nomenclatura técnica en inglés (RI-001):** El código está íntegramente en español. Esta es una decisión deliberada documentada en `docs/DESVIACION_NOMENCLATURA.md` — el equipo evaluó las tres alternativas (refactor total, mixto, español uniforme) y optó por mantener coherencia interna. Esta decisión es defendible en sustentación.

### Commits Convencionales
```text
feat: add atomic double-booking prevention with GiST exclusion
fix: enforce RBAC on reservas and huespedes mutator endpoints
docs: update trazabilidad matrix with RF-009 status
test: add integration tests for unauthorized role rejection
chore: update pyjwt to 2.13 and vite to 5.4.20
```

### Ramas
- `main` — Producción estable (protegida)
- `develop` — Integración — **rama de trabajo activa**
- `feature/*` — Nuevas características
- `fix/*` — Correcciones
- `docs/*` — Documentación

---

## ⚠️ Advertencia de Seguridad

Este proyecto es de naturaleza **exclusivamente educativa y formativa** (SENA, 2026).

- **No apto para producción** — No ha sido auditado ni endurecido para proteger datos sensibles reales.
- **Credenciales de seed expuestas intencionalmente** — Las contraseñas de las cuentas semilla y la clave `JWT_SECRET` de desarrollo están en el historial de Git. Son de conocimiento del equipo y **no aplican a ningún entorno real**. El procedimiento de invalidación está en `docs/ROTACION_SECRETOS.md`.
- **Sin garantía de disponibilidad** — El proyecto puede contener comportamientos no documentados propios de un entorno de aprendizaje.

> Este material se provee **"tal cual"**, sin garantías explícitas ni implícitas.

---

## 👥 Equipo

| Integrante |
| --- |
| José Chico |
| Maicol Mayor |
| Ashly Echeverri |
| Sebastián Parada |
| David López |

Programa: **Análisis y Desarrollo de Software — SENA, 2026**
Licencia: **ISC**
