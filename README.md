# BookingSoft — Sistema de Gestión Hotelera

Sistema web de gestión integral para el Apartahotel Facile. Proyecto formativo desarrollado en el marco del programa SENA — Análisis y Desarrollo de Software.

---

## Descripción

BookingSoft centraliza las operaciones del Apartahotel Facile: registro de huéspedes, gestión de reservas, check-in/check-out, control de inventarios, mantenimiento de unidades, facturación y generación de reportes. El sistema opera 24/7 con control de acceso basado en roles (RBAC).

### Roles del sistema

- Administrador
- Recepcionista
- Ama de Llaves
- Mantenimiento
- Conserje

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Python + FastAPI |
| Frontend | React + JavaScript |
| Base de datos | PostgreSQL |
| Contenedorización | Docker + Docker Compose |
| Cifrado | bcrypt |
| Documentación API | Swagger (OpenAPI) |
| Entorno de desarrollo | Visual Studio Code + Antigravity |

---

## Arquitectura

Cliente-servidor desacoplado. Frontend y backend se comunican exclusivamente mediante HTTP/JSON.

```
Frontend (React) <──── HTTP/JSON ────> Backend (FastAPI) <──── SQL ────> PostgreSQL
```

Todo contenedorizado con Docker Compose.

---

## Módulos

| Módulo | Descripción | Prioridad |
|---|---|---|
| Gestión de Usuarios | Registro, autenticación, roles, estados | Alta |
| Reservas y Ocupación | Check-in/out, disponibilidad, prevención de sobre-reserva | Alta |
| Unidades Habitacionales | Registro de apartamentos, estados, capacidad | Alta |
| Tarifas | Tarifas por tipo de unidad y temporada | Media |
| Servicios y Consumos | Catálogo de servicios adicionales | Media |
| Gestión Financiera | Facturación, pagos, cierres de caja | Media |
| Inventario y Alertas | Control de stock, alertas de nivel mínimo | Media |
| Mantenimiento | Solicitudes, estados, historial por unidad | Media |
| Sala de Juntas / Coworking | Reserva por horas, disponible para externos | Baja |
| Notificaciones | Alertas internas del sistema | Baja |
| Reportes | Dashboard, estadísticas, ocupación histórica | Baja |

---

## Estructura del repositorio

```
PROYECTO_FACILE/
├── README.md
├── Dockerfile
├── docker-compose.yml
├── .gitignore
├── .env.example
├── docs/
│   └── requisitos/
│       ├── HUs/              # 15 Historias de Usuario
│       ├── RFs/              # 15 Requisitos Funcionales
│       ├── RNFs/             # 11 Requisitos No Funcionales
│       └── restricciones.md
├── backend/
│   └── app/
│       ├── routers/
│       ├── models/
│       ├── schemas/
│       ├── services/
│       └── main.py
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── App.jsx
└── tests/
```

---

## Primeros pasos

```bash
# 1. Clonar
git clone https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE.git
cd PROYECTO_FACILE

# 2. Cambiar a develop
git checkout develop

# 3. Variables de entorno
cp .env.example .env

# 4. Levantar con Docker
docker-compose up --build -d

# 5. Verificar
curl http://localhost:8000/api/v1/health
```

---

## Estrategia de ramas

| Rama | Propósito | Origen | Destino |
|---|---|---|---|
| `main` | Producción estable | — | — |
| `develop` | Integración | `main` | `main` |
| `feature/*` | Nueva funcionalidad | `develop` | `develop` |
| `docs/*` | Documentación | `develop` | `develop` |
| `hotfix/*` | Corrección urgente | `main` | `main` + `develop` |

Nomenclatura:
```
feature/modulo-descripcion      → feature/auth-registro-usuario
docs/tipo-documento             → docs/requisitos-hus
hotfix/descripcion-corta        → hotfix/fix-login-validation
```

---

## Convenciones

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agregar endpoint de registro de usuario
fix: corregir validación de fechas en reservas
docs: actualizar HU-005
test: agregar pruebas para servicio de reservas
refactor: reorganizar rutas del backend
```

### Idiomas

| Elemento | Idioma |
|---|---|
| Código fuente, variables, endpoints, DB | Inglés |
| Documentación, HUs, RFs, RNFs, comentarios | Español |

### Seguridad

- Contraseñas cifradas con bcrypt
- Credenciales en variables de entorno (no versionadas)
- Control de acceso basado en roles (RBAC)
- Mensajes de error genéricos en autenticación

---

## Equipo

| Integrante |
|---|
| José Chico |
| Maicol Mayor |
| Ashly Echeverri |
| Sebastián Parada |
| David López |

Programa: Análisis y Desarrollo de Software — SENA, 2026.

---

## Documentación

| Tipo | Cantidad | Ruta |
|---|---|---|
| Historias de Usuario | 15 | `docs/requisitos/HUs/` |
| Requisitos Funcionales | 15 | `docs/requisitos/RFs/` |
| Requisitos No Funcionales | 11 | `docs/requisitos/RNFs/` |
| Restricciones | 1 | `docs/requisitos/restricciones.md` |

---

## Licencia

ISC
