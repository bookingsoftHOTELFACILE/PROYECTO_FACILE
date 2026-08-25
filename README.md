# BookingSoft — Sistema de Gestión Hotelera

Sistema web de gestión integral para el Apartahotel Facile. Proyecto formativo desarrollado en el marco del programa SENA — Análisis y Desarrollo de Software.

---

## 🚀 Descripción y Stack Tecnológico

BookingSoft centraliza las operaciones del Apartahotel Facile: registro de usuarios, control de acceso basado en roles (RBAC), gestión de estado de habitaciones y sistema de reservas atómicas.

El proyecto está diseñado bajo una arquitectura cliente-servidor desacoplada y se ejecuta íntegramente sobre contenedores Docker.

**Stack Real:**
- **Backend:** Python 3.11 + FastAPI (REST API, validaciones Pydantic, enrutamiento modular).
- **Frontend:** React + JavaScript (Vite, enrutamiento, consumo de API por proxy).
- **Base de Datos:** PostgreSQL 15 (Reglas de integridad, Constraints, Procedimientos Almacenados).
- **Infraestructura:** Docker + Docker Compose.
- **Testing Automatizado:** pytest + httpx.

---

## ⚙️ Instrucciones de Arranque (Guía Rápida)

Para levantar el entorno completo desde cero de manera limpia, ejecuta los siguientes comandos en la raíz del repositorio:

```bash
# 1. Clonar el repositorio
git clone https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE.git
cd PROYECTO_FACILE

# 2. Cambiar a la rama de integración
git checkout develop

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Destruir volúmenes anteriores (opcional, para una instalación limpia) y levantar contenedores
docker compose down -v
docker compose up --build -d

# 5. Verificar que el backend levantó correctamente (Health Check)
curl http://localhost:4000/health
```
Una vez levantado, puedes acceder a:
- **Frontend (Interfaz Gráfica):** `http://localhost:3000`
- **Backend (Documentación Swagger):** `http://localhost:4000/docs`

---

## 👥 Cuentas de Prueba (Seed Data)

El sistema inicializa automáticamente la base de datos con tres cuentas de prueba para facilitar la validación inmediata del control de acceso y las reservas:

| Usuario | Contraseña | Rol |
|---|---|---|
| `sandra_admin` | `Admin2026!` | Administrador |
| `carlos_recep` | `Recep2026!` | Recepcionista 24h |
| `marta_limpieza` | `marta123` | Ama de llaves |

---

## 🧪 Pruebas Automatizadas (QA)

El backend cuenta con una suite completa de pruebas de integración que validan escenarios críticos como autenticación, rechazo de roles no autorizados y bloqueos atómicos contra sobre-reservas (Double Booking) a nivel de la base de datos.

Para correr la suite de pruebas automatizadas:
```bash
docker compose exec backend pytest -v
```

---

## 📂 Estructura Real del Proyecto

```text
PROYECTO_FACILE/
├── .env.example
├── docker-compose.yml
├── LICENSE
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── main.py
│   ├── requirements.txt
│   ├── schema.sql           # Script de inicialización de PostgreSQL (Seed & Constraints)
│   ├── database/            # Conexión a DB (psycopg2)
│   ├── models/              # Esquemas Pydantic
│   ├── routes/              # Endpoints (auth.py, empleados.py, habitaciones.py, etc.)
│   └── tests/               # Suite de pruebas automatizadas (pytest)
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js       # Proxy configurado al puerto 4000
│   └── src/                 # Componentes React
└── docs/
    └── requisitos/          # RFs, RNFs, HUs y Matriz de Trazabilidad
```

---

## 🛡️ Roles del Sistema

BookingSoft implementa un estricto Control de Acceso Basado en Roles (RBAC):
- **Administrador:** Acceso total (puede modificar roles, estados y gestionar reservas).
- **Recepcionista 24h / Conserje:** Acceso operativo (creación y visualización de reservas).
- **Ama de Llaves / Mantenimiento:** Acceso restringido (solo actualización de estados de habitaciones).

---

## 📊 Estado del Proyecto (Trazabilidad)

Para conocer el estado exacto y detallado de cada Requisito Funcional (RF) frente a su respectivo endpoint y prueba, consulta nuestra **[Matriz de Trazabilidad](docs/requisitos/MATRIZ_TRAZABILIDAD.md)**.

**Resumen de Avance (Sprint 0, 1, 2 y 3):**
- **Implementado y Probado (Core):** Autenticación JWT, registro cifrado (bcrypt), autorización por roles, estado de empleados, reservas y prevención de concurrencia atómica (Exclusión GiST).
- **Pendientes:** Endpoints específicos de consulta individual y listado de empleados (RF-002, RF-003), y consulta de disponibilidad de habitaciones como endpoint independiente (RF-012) -- pendientes de cierre.
- **Fase 2 (Fuera del alcance estabilizado):** Módulos avanzados como cancelación o modificación de reservas y alquiler de espacios Coworking.

---

## 🛠️ Convenciones y Flujo de Trabajo

### Commits (Conventional Commits)
```text
feat: agregar endpoint de registro de usuario
fix: corregir validación de concurrencia en reservas
docs: actualizar Matriz de Trazabilidad
test: agregar pruebas para servicio de reservas
refactor: reorganizar rutas del backend
```

### Estrategia de Ramas
- `main`: Producción estable.
- `develop`: Integración.
- `feature/*`: Desarrollo de nuevas características.
- `docs/*`: Documentación del proyecto.

---

## 👥 Equipo BookingSoft

| Integrante |
|---|
| José Chico |
| Maicol Mayor |
| Ashly Echeverri |
| Sebastián Parada |
| David López |

Programa: Análisis y Desarrollo de Software — SENA, 2026.
Licencia: ISC
