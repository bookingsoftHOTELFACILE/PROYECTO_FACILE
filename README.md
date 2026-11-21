<!--
  ¿Qué? Documentación maestra y completa del proyecto BookingSoft (Apartahotel Facile).
  ¿Para qué? Proveer visión 360°, contexto arquitectural, técnico, de base de datos,
             seguridad y requerimientos para evaluación académica y contextualización en Gemini AI.
  ¿Impacto? Documento central de verdad del sistema. Garantiza la comprensión integral
             del estado del proyecto, su alcance actual y la base para futuras extensiones.
-->

# 🏨 BookingSoft — Sistema Integral de Gestión Hotelera (PMS)

> **Proyecto Formativo** — SENA | Centro de Formación en Tecnologías de la Información  
> **Programa:** Análisis y Desarrollo de Software (ADSO) | Convocatoria 2026  
> **Organización Destino:** Apartahotel Facile (Ibagué, Colombia)  
> **Licencia:** ISC | **Estado:** Fase 3 Consolidada y Probada en Docker (edición de reservas RF-013, salas/coworking RF-015 y maduración del PMS: notas, CSV del folio y saldo al check-out)

---

## 📑 Tabla de Contenidos

1. [🌟 Resumen Ejecutivo y Propósito del Proyecto](#-resumen-ejecutivo-y-propósito-del-proyecto)
2. [🏗️ Arquitectura del Sistema y Stack Tecnológico](#️-arquitectura-del-sistema-y-stack-tecnológico)
3. [📁 Estructura del Repositorio](#-estructura-del-repositorio)
4. [🚀 Despliegue y Arranque Rápido con Docker](#-despliegue-y-arranque-rápido-con-docker)
5. [⚙️ Variables de Entorno y Configuración](#️-variables-de-entorno-y-configuración)
6. [🗄️ Modelo de Base de Datos y Lógica Relacional](#️-modelo-de-base-de-datos-y-lógica-relacional)
7. [🛡️ Seguridad, Autenticación y Matriz RBAC](#️-seguridad-autenticación-y-matriz-rbac)
8. [🔌 Catálogo Completo de Endpoints REST (API)](#-catálogo-completo-de-endpoints-rest-api)
9. [💼 Reglas de Negocio y Lógica Hotelera](#-reglas-de-negocio-y-lógica-hotelera)
10. [💻 Frontend: Experiencia de Huésped y PMS Operativo](#-frontend-experiencia-de-huésped-y-pms-operativo)
11. [👥 Cuentas Semilla y Credenciales de Prueba](#-cuentas-semilla-y-credenciales-de-prueba)
12. [🧪 Pruebas Automatizadas y Verificación de Persistencia](#-pruebas-automatizadas-y-verificación-de-persistencia)
13. [📊 Matriz de Requisitos (RF, RNF, HU y Estado de Alcance)](#-matriz-de-requisitos-rf-rnf-hu-y-estado-de-alcance)
14. [🤖 Contexto Maestro para Inyección en Modelos LLM (Gemini AI)](#-contexto-maestro-para-inyección-en-modelos-llm-gemini-ai)
15. [👥 Equipo de Desarrollo](#-equipo-de-desarrollo)

---

## 🌟 Resumen Ejecutivo y Propósito del Proyecto

**BookingSoft** es una solución informática integral tipo **PMS (Property Management System)** y motor de reservas web desarrollada a la medida para el **Apartahotel Facile**.

El establecimiento combina la modalidad de apartahotel de estancias cortas y prolongadas con servicios corporativos de **Centro de Negocios (Salas de Juntas y Coworking)**.

### Objetivos Clave Alcanzados:

- **Prevención Matemática de Doble Reserva (Double-Booking):** Implementación a nivel de motor de base de datos con restricciones de exclusión `GiST` en rangos temporales continuos, eliminando cualquier condición de carrera concurrente.
- **Control de Acceso Basado en Roles (RBAC):** Separación estricta de responsabilidades entre Administrador, Recepcionistas, Ama de Llaves y Mantenimiento.
- **Gestión Dual de Negocio:** Coexistencia de reservas nocturnas de habitaciones y reservas por bloques de horas para salas de reuniones y coworking.
- **Alta Disponibilidad y Persistencia:** Infraestructura contenerizada orquestada mediante Docker Compose con comprobaciones de salud encadenadas (`healthchecks`).
- **Arquitectura Limpia y Auditable:** Trazabilidad obligatoria (`creado_por`, `modificado_por`) y política de bajas lógicas (soft delete) en todas las entidades transaccionales.

---

## 🏗️ Arquitectura del Sistema y Stack Tecnológico

El proyecto implementa una arquitectura desacoplada cliente-servidor distribuida en 4 contenedores independientes:

```mermaid
graph TD
    Client[Navegador Web / Cliente] -->|HTTP / :3001| NginxFront[Contenedor Frontend - Nginx + React 18]
    NginxFront -->|Proxy Reverso /api| FastAPIBkd[Contenedor Backend - FastAPI / Python 3.11 :4000]
    Client -->|HTTP Directo / :4001| FastAPIBkd
    FastAPIBkd -->|TCP / :5432| PostgresDB[(Contenedor PostgreSQL 15 + GiST :5432)]
    AdminDB[Administrador DBA] -->|HTTP / :5050| PgAdmin[Contenedor pgAdmin 4]
    PgAdmin -->|TCP| PostgresDB
```

### Componentes Tecnológicos:

| Capa                    | Componente        | Versión / Tecnologías             | Detalle Técnico                                                           |
| :---------------------- | :---------------- | :-------------------------------- | :------------------------------------------------------------------------ |
| **Backend**             | Python / FastAPI  | Python 3.11, FastAPI, Pydantic v2 | API REST asíncrona modular, lifespan events, fail-fast de seguridad.      |
| **Seguridad Backend**   | PyJWT & bcrypt    | PyJWT >= 2.13, bcrypt (cost 12)   | Tokens stateless Bearer, expiración de 8h, hashing seguro.                |
| **Base de Datos**       | PostgreSQL Alpine | PostgreSQL 15-Alpine              | Extensión `btree_gist`, tipos de rango `daterange`, triggers PL/pgSQL.    |
| **Pool de Conexiones**  | Psycopg2          | `ThreadedConnectionPool` (1 a 20) | Reutilización eficiente de conexiones a nivel de hilo.                    |
| **Frontend**            | React SPA         | React 18, Vite 5.4, JS ES2022     | Interfaz responsiva con componentes nativos, CSS tokens y `lucide-react`. |
| **Web Server Frontend** | Nginx Alpine      | Nginx 1.25+                       | Servidor de estáticos y proxy reverso hacia el backend.                   |
| **Administración DB**   | pgAdmin 4         | dpage/pgadmin4                    | Consola visual web para administración y auditoría de la base de datos.   |
| **Contenedores**        | Docker Compose    | Compose v2.20+                    | Orquestación con volúmenes persistentes y dependencias con healthcheck.   |
| **Testing**             | Pytest            | pytest 8.x + HTTPX TestClient     | 96 pruebas de integración sobre PostgreSQL real sin mocks.                |

---

## 📁 Estructura del Repositorio

```text
bookingsoft/
├── .env.example                     # Plantilla estandarizada de variables de entorno
├── .github/                         # CI (pytest + pip-audit + pnpm audit) y plantilla de PR
├── docker-compose.yml               # Orquestación de 4 servicios: db, backend, frontend, pgadmin
├── README.md                        # Documentación maestra integral (este documento)
├── test_persistence.sh              # Script Bash para prueba de fuego de persistencia
├── docs/                            # Documentación de ingeniería y requisitos
│   ├── matriz-rotacion.md           # Matriz de rotación de credenciales
│   ├── scrum/                       # Metodología ágil: Backlog, Sprints 1–3, Poker y Feedback
│   ├── pruebas/                     # QA: Plan de pruebas, Informe de 124 tests y Bug Tracker
│   ├── arquitectura/                # Diagramas UML, Clases, MER, MR y Propuesta IoT Yale
│   ├── deuda_tecnica/               # Reflexión comparativa de 4 backends y deuda técnica
│   ├── auditorias_internas/
│   │   ├── ANALISIS_ARQUITECTURA.md # Auditoría de arquitectura + plan de remediación (Fases 0–E)
│   │   ├── MATRIZ_ROLES_ENDPOINTS.md# Matriz exhaustiva RBAC por endpoint y método
│   │   ├── AUDITORIA_DEPENDENCIAS.md# Reporte de seguridad pip-audit y pnpm audit
│   │   ├── ROTACION_SECRETOS.md     # Procedimiento de rotación de credenciales
│   │   └── DESVIACION_NOMENCLATURA.md # Justificación del estándar de código en español
│   └── requisitos/                  # Especificación detallada SENA
│       ├── MATRIZ_TRAZABILIDAD.md   # Trazabilidad RF vs HU vs Endpoint vs Tests
│       ├── restricciones.md         # Restricciones técnicas, de seguridad y metodológicas
│       ├── RFs/                     # Requisitos Funcionales individuales (RF-001 al RF-015)
│       ├── RNFs/                    # Requisitos No Funcionales (RNF-001 al RNF-011)
│       └── HUs/                     # Historias de Usuario (HU-001 al HU-015)
├── backend/                         # Código fuente del Servidor REST FastAPI
│   ├── Dockerfile                   # Imagen base python:3.11-slim
│   ├── Pipfile / Pipfile.lock       # Dependencias declaradas (Pipenv)
│   ├── main.py                      # Instancia FastAPI, CORS, lifespan y Fail-Fast JWT
│   ├── dependencies.py              # Guardas de seguridad: autenticar, requiere_rol
│   ├── schema.sql                   # Esquema DDL + Funciones + Triggers + Seed Data
│   ├── database/
│   │   └── connection.py            # Pool de conexiones PostgreSQL + migraciones idempotentes
│   ├── models/
│   │   └── schemas.py               # Contratos Pydantic v2 (Input validation)
│   ├── repositories/                # Capa de acceso a datos (hallazgos M-05 / M-06)
│   │   └── base.py                  # cursor_lectura / cursor_escritura con RealDictCursor
│   ├── services/
│   │   ├── reservas_service.py      # Lógica de negocio pura (FIRST): sin BD ni HTTP
│   │   ├── folio.py                 # Fase 2: desglose de IVA 19% y saldo del folio
│   │   └── pasarela.py              # Fase 2: adaptador de pasarela (simulada hoy)
│   ├── routes/                      # Controladores modulares por dominio
│   │   ├── auth.py                  # Login, registro, logout y validación de tokens
│   │   ├── empleados.py             # CRUD y gestión de estados de empleados
│   │   ├── huespedes.py             # Router PMS (/api/huespedes) + cuentas (/api/user)
│   │   ├── habitaciones.py          # Catálogo, disponibilidad y cambio de estado
│   │   ├── reservas.py              # Creación atómica, edición (RF-013), check-in/out y cancelación
│   │   ├── pagos.py                 # Fase 2: folio, cobros y factura electrónica simulada
│   │   └── centro_negocios.py       # Salas de juntas y coworking por horas
│   └── tests/                       # Suite de integración sobre PostgreSQL real (96 pruebas)
│       ├── conftest.py              # Fixtures de Pytest (cliente HTTP, tokens seed)
│       ├── test_auth.py             # Login, registro, RBAC y firma JWT
│       ├── test_consultas.py        # Listados, filtros y estados
│       ├── test_reservas.py         # GiST double-booking y descuentos
│       ├── test_reservas_service.py # Unidad de la capa services/ (parametrizadas)
│       ├── test_checkin_checkout.py # HU-005: máquina de estados Check-In/Completada
│       ├── test_seguridad_acceso.py # H-01 / H-02: RBAC de reservas e inventario
│       ├── test_model_huesped.py    # Modelo de dominio de huésped
│       ├── test_pagos.py            # Fase 2: folio, cobros, RBAC y factura simulada
│       ├── test_centro_negocios.py  # Fase 3: salas/coworking, tarifas y solapamientos
│       └── test_reservas_update.py  # Fase 3: edición de reserva (RF-013) y saldo al check-out
├── E2E/                             # Pruebas extremo a extremo con Playwright
│   ├── playwright.config.js         # Web server autoarrancable (Vite en :3000)
│   └── tests/                       # 9 specs: login, registro, habitaciones, cancelación,
│                                    # check-in/out, doble clic, folio/pagos, edición y coworking
└── frontend/                        # Cliente Web SPA en React
    ├── Dockerfile                   # Multi-stage build (Node build -> Nginx Alpine)
    ├── nginx.conf                   # Configuración de Nginx y proxy pass
    ├── vite.config.js               # Proxy /api y /health hacia :4001 + umbrales de cobertura
    ├── package.json                 # Dependencias Node (React 18, Vite 5, Lucide)
    └── src/
        ├── main.jsx                 # Punto de entrada de React en el DOM
        ├── index.css                # Sistema de diseño con CSS tokens y estilos modernos
        ├── App.jsx                  # Ensamblador ligero (86 líneas): providers + vistas
        ├── api/client.js            # Cliente HTTP unificado `apiFetch` + manejo de errores
        ├── context/AppContext.jsx   # Proveedor del estado global
        ├── state/useAppState.js     # Hook con el estado y los flujos del PMS
        ├── data/catalogo.js         # Catálogo inicial de unidades
        ├── views/                   # 9 vistas (Portal, Reservar, PMS, Perfil, ...)
        ├── components/              # 18 componentes modulares PMS y Portal
        └── *.test.js                # 28 pruebas unitarias (Vitest en 6 archivos)
```

---

## 🚀 Despliegue y Arranque Rápido con Docker

El sistema se encuentra empaquetado para levantar en cualquier máquina con Docker sin requerir instalación previa de Python ni Node.js.

### 1. Clonación y preparación de entorno

```bash
git clone https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE.git
cd PROYECTO_FACILE
git checkout develop
```

### 2. Configurar el archivo de entorno

```bash
cp .env.example .env
```

> ⚠️ **Importante:** Configure un secreto seguro en `JWT_SECRET` (mínimo 32 caracteres) y defina contraseñas válidas. Si `JWT_SECRET` contiene `CHANGE_ME`, el backend abortará por diseño (Fail-Fast).

### 3. Construcción y levantamiento de los servicios

```bash
docker compose up --build -d
```

### 4. Puertos y Servicios Disponibles en Host

| Servicio                                | URL / Puerto                                                 | Credenciales por Defecto                   |
| :-------------------------------------- | :----------------------------------------------------------- | :----------------------------------------- |
| **Frontend Web (Huéspedes + PMS)**      | [http://localhost:3001](http://localhost:3001)               | N/A                                        |
| **Backend REST API (Salud)**            | [http://localhost:4001/health](http://localhost:4001/health) | N/A                                        |
| **Documentación Interactiva (Swagger)** | [http://localhost:4001/docs](http://localhost:4001/docs)     | N/A                                        |
| **Documentación ReDoc**                 | [http://localhost:4001/redoc](http://localhost:4001/redoc)   | N/A                                        |
| **PostgreSQL (Acceso directo)**         | `localhost:5433`                                             | Usuario: `adso_user` (Ver `.env`)          |
| **pgAdmin 4 (Administración Web DB)**   | [http://localhost:5050](http://localhost:5050)               | Email: `admin@admin.com` \| Clave: `admin` |

### 5. Reinicio Limpio de Base de Datos (Opcional)

Para vaciar la base de datos y recrear el esquema con el sembrado inicial:

```bash
docker compose down -v
RESET_DB=true docker compose up --build -d
```

---

## ⚙️ Variables de Entorno y Configuración

El archivo `.env` en la raíz controla la parametrización de toda la plataforma:

```ini
# Contenedor PostgreSQL
POSTGRES_USER=adso_user
POSTGRES_PASSWORD=adso_password_segura_2026
POSTGRES_DB=bookingsoft

# Parámetros de conexión para Backend (Docker interno)
DB_HOST=db
DB_PORT=5432
DB_USER=adso_user
DB_PASSWORD=adso_password_segura_2026
DB_NAME=bookingsoft

# Parámetros de Servidor Backend
PORT=4000
JWT_SECRET=super_secreto_jwt_bookingsoft_seguro_2026_facile

# Configuración de inicialización
RESET_DB=false

# Configuración CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001
```

---

## 🗄️ Modelo de Base de Datos y Lógica Relacional

El motor de persistencia es PostgreSQL 15 con el dialecto DDL estructurado en `backend/schema.sql`.

### Entidades Principales

```mermaid
erDiagram
    EMPLEADO {
        int id_empleado PK
        string nombre
        string usuario UK
        string contrasena
        string rol
        string tipo_documento
        string numero_documento UK
        string correo UK
        string estado
    }
    HUESPED {
        int id_huesped PK
        string nombre
        string documento UK
        string telefono
        string correo
        string empresa
        string lealtad
        string estado
        string creado_por
        string modificado_por
    }
    HABITACION {
        int id_habitacion PK
        string numero UK
        string tipo
        int capacidad
        decimal precio_noche
        string estado
        text detalle_mantenimiento
        string creado_por
        string modificado_por
    }
    RESERVA_HABITACION {
        int id_reserva PK
        int id_huesped FK
        int id_habitacion FK
        date fecha_entrada
        date fecha_salida
        string estado
        string creado_por
        string modificado_por
    }
    ESPACIO_NEGOCIO {
        int id_espacio PK
        string nombre UK
        string tipo
        int capacidad
        decimal precio_hora
        string estado
        string creado_por
        string modificado_por
    }
    RESERVA_NEGOCIO {
        int id_reserva_negocio PK
        int id_espacio FK
        string tipo_cliente
        int id_huesped FK
        string nombre_cliente
        date fecha
        time hora_inicio
        time hora_fin
        int duracion_horas
        decimal precio_total
        string estado
        string creado_por
        string modificado_por
    }

    HUESPED ||--o{ RESERVA_HABITACION : realiza
    HABITACION ||--o{ RESERVA_HABITACION : asignada_en
    ESPACIO_NEGOCIO ||--o{ RESERVA_NEGOCIO : reservado_en
    HUESPED ||--o{ RESERVA_NEGOCIO : vincula_opcional
```

### Características Técnicas del Esquema:

1. **Exclusión GiST para Doble Reserva (RF-011):**

   ```sql
   CREATE EXTENSION IF NOT EXISTS btree_gist;

   CONSTRAINT exclude_overlapping_reservations EXCLUDE USING gist (
       id_habitacion WITH =,
       daterange(fecha_entrada, fecha_salida) WITH &&
   ) WHERE (estado IN ('Confirmada', 'Check-In'));
   ```

   _Efecto:_ Impide a nivel de bloques en disco que dos transacciones concurrentes aparten la misma habitación en fechas solapadas. Si ocurre, la base de datos lanza un error `23P01 (exclusion_violation)` que la API transforma en HTTP `409 Conflict`.

2. **Trigger de Bloqueo por Mantenimiento:**
   La función `fn_validar_double_booking()` dispara una excepción si se intenta reservar una habitación marcada como `'Mantenimiento'`.

3. **Cálculo de Estadía y Descuento por Larga Estancia:**
   La función PL/pgSQL `fn_calcular_noches_y_precio()` calcula el importe total y aplica la política de larga estadía publicada: **10% desde 7 hasta 14 noches** y **15% desde 15 noches en adelante**. Esa misma regla vive en `services/reservas_service.py` y en `frontend/src/utils/pricing.js` (única fuente del preview).

4. **Auditoría Transaccional:**
   Todas las tablas maestras incorporan `creado_por` y `modificado_por`, registrando la firma del usuario y rol que originó el cambio.

---

## 🛡️ Seguridad, Autenticación y Matriz RBAC

BookingSoft aplica el principio de mínimo privilegio mediante dependencias inyectables de FastAPI:

- **Fail-Fast de Arranque:** Si `JWT_SECRET` no está establecido, el servidor aborta antes de abrir el socket de red.
- **Cifrado Robusto:** Contraseñas hasheadas con `bcrypt` (12 rondas de salting).
- **Protección contra Fuerza Bruta / Enumeración:** Respuestas homogéneas en fallos de autenticación (_"Credenciales incorrectas"_).
- **Inhabilitación Efectiva:** Un usuario con `estado = 'Inactivo'` tiene denegado el login aun cuando su contraseña coincida.

### Matriz de Acceso por Roles (RBAC)

| Endpoint                             |  Método  | Acción Funcional                  | Público | Admin | Recepción 24h | Ama de Llaves | Mantenimiento |
| :----------------------------------- | :------: | :-------------------------------- | :-----: | :---: | :-----------: | :-----------: | :-----------: |
| `/api/auth/login`                    |  `POST`  | Iniciar sesión y obtener JWT      |   ✅    |  ✅   |      ✅       |      ✅       |      ✅       |
| `/api/auth/logout`                   |  `POST`  | Cerrar sesión (stateless)         |   ❌    |  ✅   |      ✅       |      ✅       |      ✅       |
| `/api/auth/registro`                 |  `POST`  | Registrar nuevo empleado          |   ❌    |  ✅   |      ❌       |      ❌       |      ❌       |
| `/api/empleados`                     |  `GET`   | Listar nómina de empleados        |   ❌    |  ✅   |      ✅       |      ❌       |      ❌       |
| `/api/empleados/{id}`                |  `GET`   | Consultar empleado por ID         |   ❌    |  ✅   |      ✅       |      ❌       |      ❌       |
| `/api/empleados/{id}/rol`            | `PATCH`  | Reasignar rol a empleado          |   ❌    |  ✅   |      ✅       |      ❌       |      ❌       |
| `/api/empleados/{id}/estado`         | `PATCH`  | Activar/Desactivar empleado       |   ❌    |  ✅   |      ✅       |      ❌       |      ❌       |
| `/api/huespedes`                     |  `GET`   | Consultar directorio de huéspedes |   ❌    |  ✅   |      ✅       |      ❌       |      ❌       |
| `/api/huespedes/{id}/estado`         | `PATCH`  | Modificar estado de huésped       |   ❌    |  ✅   |      ✅       |      ❌       |      ❌       |
| `/api/huespedes/{id}`                | `DELETE` | Baja lógica de huésped            |   ❌    |  ✅   |      ❌       |      ❌       |      ❌       |
| `/api/user/registro`                 |  `POST`  | Registro de huésped (portal/PMS)  |   ✅    |  ✅   |      ✅       |      ✅       |      ✅       |
| `/api/user/login`                    |  `POST`  | Login de huésped (documento/correo)|  ✅    |  ✅   |      ✅       |      ✅       |      ✅       |
| `/api/user/recuperar-password`       |  `POST`  | Solicitud de recuperación de clave|   ✅    |  ✅   |      ✅       |      ✅       |      ✅       |
| `/api/user/restablecer-password`     |  `POST`  | Restablecimiento de clave         |   ✅    |  ✅   |      ✅       |      ✅       |      ✅       |
| `/api/habitaciones`                  |  `GET`   | Inventario completo de unidades   |   ❌    |  ✅   |      ✅       |      ✅       |      ✅       |
| `/api/habitaciones/publicas`         |  `GET`   | Catálogo público de habitaciones  |   ✅    |  ✅   |      ✅       |      ✅       |      ✅       |
| `/api/habitaciones/disponibilidad`   |  `GET`   | Disponibilidad por rango (RF-012) |   ❌    |  ✅   |      ✅       |      ❌       |      ❌       |
| `/api/habitaciones/{id}/estado`      | `PATCH`  | Cambiar estado de habitación      |   ❌    |  ✅   |      ✅       |      ✅       |      ✅       |
| `/api/reservas`                      |  `GET`   | Listar reservas activas           |   ❌    |  ✅   |      ✅       |      ❌       |      ❌       |
| `/api/reservas`                      |  `POST`  | Crear reserva atómica (GiST) \*   |   ✅    |  ✅   |      ✅       |      ✅       |      ✅       |
| `/api/reservas/{id}/estado`          | `PATCH`  | Check-in / check-out de reserva   |   ❌    |  ✅   |      ✅       |      ❌       |      ❌       |
| `/api/reservas/{id}`                 | `DELETE` | Cancelar reserva (baja lógica)    |   ❌    |  ✅   |      ✅       |      ❌       |      ❌       |
| `/api/centro-negocios/espacios`      |  `GET`   | Listar salas y coworking          |   ✅    |  ✅   |      ✅       |      ✅       |      ✅       |
| `/api/centro-negocios/reservas`      |  `GET`   | Listar reservas de negocio        |   ✅    |  ✅   |      ✅       |      ✅       |      ✅       |
| `/api/centro-negocios/reservas`      |  `POST`  | Reservar sala/coworking           |   ✅    |  ✅   |      ✅       |      ✅       |      ✅       |
| `/api/centro-negocios/reservas/{id}` | `DELETE` | Cancelar reserva de negocio       |   ✅    |  ✅   |      ✅       |      ✅       |      ✅       |
| `/health`                            |  `GET`   | Diagnóstico de salud API y DB     |   ✅    |  ✅   |      ✅       |      ✅       |      ✅       |

\* `POST /api/reservas` es público (autenticación opcional), pero el flag `checkin_inmediato`
(HU-005) devuelve **403** a quien no tenga rol operativo.

---

## 🔌 Catálogo Completo de Endpoints REST (API del 4.º Backend — FastAPI)

La API representa el **4.º Backend del Programa de Formación ADSO (Trimestre 6)**, desarrollado con **Python 3.11 y FastAPI**. Expone **33 endpoints REST** con serialización estricta mediante modelos Pydantic v2, documentación interactiva autogenerada y validaciones transaccionales ACID en PostgreSQL.

- **Swagger UI Interactivo:** [http://localhost:4001/docs](http://localhost:4001/docs)
- **ReDoc (Documentación OpenAPI formal):** [http://localhost:4001/redoc](http://localhost:4001/redoc)
- **OpenAPI Schema JSON:** [http://localhost:4001/openapi.json](http://localhost:4001/openapi.json)

### 1. Módulo de Autenticación (`/api/auth`)

- `POST /api/auth/login`: Recibe `{usuario, contrasena}` y retorna `{access_token, token_type: "bearer"}`.
- `POST /api/auth/registro`: Exclusivo de Administrador. Crea nuevos usuarios con validación de documentos y correos únicos.
- `POST /api/auth/logout`: Cierre de sesión stateless (el cliente descarta el token).

### 2. Módulo de Empleados (`/api/empleados`)

- `GET /api/empleados`: Retorna la lista de empleados sin exponer el hash de contraseña.
- `GET /api/empleados/{id}`: Detalle de un empleado específico.
- `PATCH /api/empleados/{id}/rol`: Permite actualizar el rol operativo.
- `PATCH /api/empleados/{id}/estado`: Alterna estado entre `'Activo'` e `'Inactivo'`.

### 3. Módulo de Huéspedes (`/api/huespedes` y `/api/user`)

- `GET /api/huespedes`: Directorio con nivel de lealtad (`Silver`, `Gold`, `Platinum`). Requiere rol operativo.
- `PATCH /api/huespedes/{id}/estado`: Habilita o inhabilita huéspedes (Administrador / Recepción).
- `DELETE /api/huespedes/{id}`: Baja lógica (`estado = 'Inactivo'`), exclusivo de Administrador.
- `POST /api/user/registro`: Registro de huésped con documento de identidad y contacto (sin sesión).
- `POST /api/user/login`: Login de huésped por documento o correo. Devuelve `{message, usuario}` **sin token**: el portal no usa JWT.
- `POST /api/user/recuperar-password`: Solicitud de recuperación de credenciales (mascara el correo en la respuesta).
- `POST /api/user/restablecer-password`: Restablecimiento de contraseña (mínimo 4 caracteres).
- `POST /api/user/auth-social`: Autenticación federada de Google para registro e inicio de sesión ágil.

### 4. Módulo de Habitaciones (`/api/habitaciones`)

- `GET /api/habitaciones`: Inventario físico con estado actual (`Disponible`, `Ocupada`, `En limpieza`, `Mantenimiento`). **Requiere rol operativo**: expone el detalle de mantenimiento y quién lo modificó.
- `GET /api/habitaciones/publicas`: Catálogo mínimo **sin sesión** para el portal público (`numero`, `tipo`, `capacidad`, `precio_noche`, `estado`). No expone datos internos de operación.
- `GET /api/habitaciones/disponibilidad`: Consulta por rango `fecha_entrada`/`fecha_salida` (RF-012) con estados `Disponible` / `Ocupada` / `Mantenimiento` calculados por solapamiento de fechas. Requiere Administrador o Recepción.
- `PATCH /api/habitaciones/{id}/estado`: Cambio de estado operativo (usado por Ama de Llaves para liberar habitaciones y por Mantenimiento para registrar averías).

> **Limitación conocida:** el alta, la edición de metadatos y la baja de unidades no
> están expuestas como endpoint: el catálogo se siembra desde `schema.sql`. Queda
> registrado como hallazgo `B-07` en
> [`docs/auditorias_internas/ANALISIS_ARQUITECTURA.md`](docs/auditorias_internas/ANALISIS_ARQUITECTURA.md).

### 5. Módulo de Reservas de Habitaciones (`/api/reservas`)

- `GET /api/reservas`: Retorna reservas activas con datos del huésped y habitación asociada.
- `POST /api/reservas`: Generación de reserva con validación de capacidad y bloqueo atómico GiST.
- `PATCH /api/reservas/{id}`: **Edición de una reserva `Confirmada`** (fechas, unidad y observaciones internas) sin cancelarla. Recalcula la cotización y el constraint GiST rechaza solapamientos con `409` (RF-013, Fase 3).
- `PATCH /api/reservas/{id}/estado`: Transición de estado (`Confirmada` → `Check-In` → `Completada`). El check-out devuelve el resumen del folio (`total`, `pagado`, `saldo`) para avisar de un saldo pendiente (Fase 3).
- `DELETE /api/reservas/{id}`: Cancelación de reserva con baja lógica (`estado = 'Cancelada'`), liberando automáticamente el rango GiST para futuras reservas.

**Fase 2 — Módulo financiero (mismo prefijo `/api/reservas`):**

- `GET /api/reservas/{id}/folio`: Folio de la reserva con desglose del IVA 19 % **incluido en la tarifa** (base + IVA = total), movimientos de pago, saldo y estado (`Pendiente` / `Parcial` / `Pagado`).
- `POST /api/reservas/{id}/pagos`: Cobro a través del adaptador de pasarela (hoy `PasarelaSimulada`, gratis y sin claves externas). Un cobro rechazado se persiste como intento para auditoría. Roles: Administrador y Recepcionista 24 h.
- `POST /api/reservas/{id}/pagos/{pago}/anular`: Anula un cobro confirmado y restaura el saldo. **Sólo Administrador.**
- `GET /api/reservas/{id}/factura.xml`: Factura electrónica **simulada** en UBL 2.1 (estado `Borrador`, CUFE = SHA-256, descarga como `FACT-XXXXXXXX.xml`). Sin envío real a la DIAN.

### 6. Módulo de Centro de Negocios (`/api/centro-negocios`)

- `GET /api/centro-negocios/espacios`: Listado de salas de juntas y puestos de coworking con tarifa por hora.
- `GET /api/centro-negocios/reservas`: Consulta de agenda activa de salas y puestos.
- `POST /api/centro-negocios/reservas`: Creación de reserva con validación horaria de no solapamiento y cálculo automático de paquetes por horas (descuentos a partir de 4 y 8 horas).
- `DELETE /api/centro-negocios/reservas/{id}`: Cancelación con baja lógica.

### 7. Diagnóstico de Infraestructura

- `GET /health`: Monitoreo del estado de conexión activa hacia PostgreSQL.

---

## 💼 Reglas de Negocio y Lógica Hotelera

1. **Catálogo Oficial de Alojamientos:**
   - 38 unidades habitacionales operativas:
     - **14 Dúplex:** Capacidad de 3 personas, tarifa base $250.000 COP/noche.
     - **11 Dobles:** Capacidad de 4 personas, tarifa base $350.000 COP/noche.
     - **2 Familiares:** Capacidad de 6 personas, tarifa base $450.000 COP/noche.
     - **11 Habitaciones Estándar:** Capacidad de 2 personas, tarifa base $180.000 COP/noche.
2. **Validación de Capacidad:**
   El número de personas indicado en una reserva no puede superar la capacidad máxima de la unidad habitacional (Regla de Negocio RN-011.4).
3. **Descuento de Larga Estancia:**
   Reservas mayores a 15 noches reciben una bonificación automática del 15% sobre el total liquidado.
4. **Ciclo de Estados de Habitación:**
   `Disponible` ➔ `Ocupada` (Check-In) ➔ `En limpieza` (Check-Out) ➔ `Disponible` (Ama de Llaves). Las habitaciones con daños transicionan a `Mantenimiento` bloqueando nuevas reservas.
5. **Políticas de Centro de Negocios:**
   - Horarios entre 07:00 y 20:00.
   - Paquetes especiales para Salas de Juntas: 4 horas ($250.000 COP) y 8 horas ($450.000 COP).
   - Paquetes para Coworking Flex: 4 horas ($70.000 COP) y día completo ($100.000 COP).

---

## 💻 Frontend: Experiencia de Huésped y PMS Operativo

El frontend es una **Single Page Application (SPA)** reactiva construida en React 18, estructurada en dos grandes experiencias de usuario:

### 1. Portal Público de Huéspedes

- **Pestaña Inicio:** Hero promocional, propuesta de valor de Apartahotel Facile y accesos directos.
- **Pestaña Apartamentos:** Catálogo interactivo de las 38 unidades con filtros por tipología, comodidades, capacidad y galería fotográfica.
- **Pestaña Centro de Negocios:** Presentación de salas de juntas y espacios coworking con cotizador en tiempo real por horas.
- **Pestaña Servicios:** Detalle de amenidades (estacionamiento, recepción 24h, wifi de alta velocidad, cocinas equipadas, lavandería).
- **Pestaña Galería:** Visor fotográfico organizado por categorías.
- **Pestaña Reservar:** Motor de reserva en línea paso a paso con cálculo de tarifas y validación de disponibilidad.

### 2. Suite PMS (Property Management System) Interna

Acceso mediante botón superior con validación JWT, organizado en sub-pestañas operativas según el rol autenticado:

- 👑 **Personal & Roles (Solo Administrador):** Registro de nuevos empleados, visualización de nómina y conmutación de estados y roles.
- 🛎️ **Recepción (Walk-in):** Registro express de huéspedes y generación inmediata de reservas de mostrador.
- 📋 **Huéspedes:** Listado maestro de clientes con categorización de fidelidad y gestión de estado.
- 📅 **Reservas:** Gestión del calendario de reservas de habitaciones, cambio de estados operativos y cancelación.
- 🧹 **Planta (Ama de Llaves & Mantenimiento):** Tablero visual tipo semáforo con el estado de cada habitación, permitiendo a las camareras liberar habitaciones tras el aseo y al personal técnico registrar detalles de averías.
- 💼 **Coworking:** Calendario y control de reservas de espacios de trabajo y salas ejecutivas.
- 📊 **Todos:** Vista global unificada para gerencia y auditoría general.

### 3. Arquitectura del Código Frontend (Fase A)

`App.jsx` es un ensamblador de **83 líneas** que monta el `AppContext` y renderiza la
vista activa; toda la lógica vive en `state/useAppState.js`, el acceso HTTP se centraliza
en `api/client.js` (cliente `apiFetch` con manejo uniforme de errores 401/403) y la UI se
reparte en `views/` (9 vistas) y `components/` (11 componentes). El portal público y el
PMS comparten el mismo estado; el token JWT solo se guarda para personal autenticado.

---

## 👥 Cuentas Semilla y Credenciales de Prueba

El archivo `schema.sql` aprovisiona credenciales cifradas con bcrypt para validación funcional de cada perfil RBAC:

| Usuario         | Contraseña           | Rol en el Sistema             | Vista / Sub-pestaña por Defecto        |
| :-------------- | :------------------- | :---------------------------- | :------------------------------------- |
| `admin`         | `Admin2026!`         | **Administrador**             | 👑 Personal & Roles (Acceso total)     |
| `recepcion`     | `Recep2026!`         | **Recepcionista 24h**         | 🛎️ Recepción y reservas walk-in        |
| `amallaves`     | `Amallaves2026!`     | **Ama de llaves**             | 🧹 Planta (Solo aseo y disponibilidad) |
| `mantenimiento` | `Mantenimiento2026!` | **Personal de mantenimiento** | 🔧 Planta (Bitácora de mantenimiento)  |

> ⚠️ **Aviso de Entorno Educativo:** Estas contraseñas son de uso público para revisión docente del SENA y pruebas de integración locales. En un despliegue de producción deben cambiarse mediante el script de rotación de secretos.

---

## 🧪 Pruebas Automatizadas y Verificación de Persistencia

> 📚 **Documentación Formal de Calidad y Pruebas (IEEE 829 / ADSO):**
> - 📄 **Plan de Pruebas Maestro:** [`docs/pruebas/PLAN_PRUEBAS.md`](docs/pruebas/PLAN_PRUEBAS.md) *(Alcance, niveles, ambientes y criterios)*
> - 📄 **Informe de Pruebas Unitarias:** [`docs/pruebas/INFORME_PRUEBAS_UNITARIAS.md`](docs/pruebas/INFORME_PRUEBAS_UNITARIAS.md) *(124 casos automatizados: 96 Pytest + 28 Vitest)*
> - 📄 **Reporte de Ejecución y Bug Tracker:** [`docs/pruebas/REPORTE_EJECUCION_Y_DEFECTOS.md`](docs/pruebas/REPORTE_EJECUCION_Y_DEFECTOS.md) *(Seguimiento y 100% remediación)*
> - 📄 **Gestión de Metodología Ágil (SCRUM):** [`docs/scrum/PRODUCT_BACKLOG.md`](docs/scrum/PRODUCT_BACKLOG.md) y [`docs/scrum/FEEDBACK_EQUIPO.md`](docs/scrum/FEEDBACK_EQUIPO.md)

### Suite de Integración con Pytest (Backend FastAPI)

El sistema cuenta con **96 pruebas automatizadas de integración** que se ejecutan directamente sobre una instancia real de PostgreSQL (sin simulación ni base de datos en memoria):

```bash
# Ejecutar la suite completa dentro del contenedor backend
docker compose exec backend pytest -v
```

#### Cobertura de las Pruebas (96 en 10 archivos):

| Archivo | Pruebas | Qué valida |
| :------ | :-----: | :--------- |
| `test_auth.py` | 9 | Login, registro con hash bcrypt, rechazo de duplicados e inactivos, denegaciones 401/403, firma JWT manipulada y autenticación social Google. |
| `test_consultas.py` | 4 | Listado y detalle de empleados, permisos de Recepción y disponibilidad de habitaciones (RF-012). |
| `test_reservas.py` | 5 | Política de descuento por larga estadía (10 % de 7–14 noches y 15 % desde 15), aforo sobre capacidad, constraint GiST de doble reserva y alta atómica de huésped + reserva (éxito y rollback). |
| `test_reservas_service.py` | 22 | Unidad de `services/reservas_service.py` (sin BD ni HTTP): validación de fechas, disponibilidad de la unidad, cálculo de costo de estadía con bordes de descuento (6/7/14/15/16 noches) y errores de dominio. |
| `test_checkin_checkout.py` | 7 | HU-005: máquina de estados `Pendiente → Confirmada → Check-in → Completada → En limpieza` y rechazos de transición inválida. |
| `test_seguridad_acceso.py` | 6 | H-01 / H-02: RBAC de `DELETE /api/reservas/{id}` y protección del inventario de habitaciones (401/403 + endpoint público). |
| `test_model_huesped.py` | 8 | Modelo de dominio de huésped: campos obligatorios, formato de correo rechazado y validación de mayoría de edad (límite exacto de 18 años). |
| `test_pagos.py` | 13 | Fase 2: desglose de IVA 19% incluido, cobros totales/parciales, anti doble captura, pasarela simulada (aprobado/rechazado), anulación con RBAC y factura electrónica simulada UBL 2.1. |
| `test_centro_negocios.py` | 12 | Fase 3 (RF-015): catálogo de espacios, tarifa por horas, paquetes de 4 h y día completo (sala/coworking), solapamientos 409, horarios contiguos, validación de hora y liberación al cancelar. |
| `test_reservas_update.py` | 10 | Fase 3 (RF-013): edición de fechas/unidad/notas, recálculo de cotización, colisión GiST 409 sin cambios parciales, inmutabilidad en Check-In, bloqueo de mantenimiento, RBAC y saldo devuelto por el check-out. |

### Pruebas Unitarias del Frontend (Vitest)

Veintiocho pruebas unitarias organizadas en 6 suites sobre utilidades del SPA (catálogo HU-009, fechas, `apiFetch`, política de descuentos, folio financiero, exportación CSV y smoke):

```bash
cd frontend && npx vitest run
```

La cobertura se mide con `npx vitest run --coverage` y `frontend/vite.config.js` fija
umbrales mínimos documentados (base medida: 3.38 % líneas, 68.02 % ramas, 43.10 %
funciones) para que una regresión que borre las pruebas existentes rompa el build.

### Pruebas E2E con Playwright

Nueve specs que arrancan Vite en `:3000` y ejercitan el flujo completo por localizadores
accesibles (`getByRole`, `getByLabel`, `id="pms-..."`):

```bash
cd E2E && npx playwright test
```

| Spec | Flujo |
| :--- | :---- |
| `login.spec.js` | Acceso al PMS con credenciales seed. |
| `registro.spec.js` | Alta de empleado por Administrador. |
| `habitaciones.spec.js` | Inventario y cambio de estado de unidades. |
| `cancelacion.spec.js` | Cancelación de reserva con confirmación. |
| `checkin_checkout.spec.js` | HU-005: check-in inmediato y check-out desde la fila de reservas. |
| `proteccion_doble_clic.spec.js` | Doble clic en el botón de reserva (**fallo preexistente conocido**, no regresión de la remediación). |
| `folio_pago.spec.js` | Fase 2: folio con desglose de IVA, cobro parcial por la pasarela simulada, descarga de la factura XML simulada y exportación CSV. |
| `edicion_reserva.spec.js` | Fase 3 (RF-013): edición de fechas y observaciones de una reserva confirmada desde el PMS, con verificación en PostgreSQL. |
| `coworking_smoke.spec.js` | Fase 3 (RF-015): montaje del módulo de Salas & Coworking con los espacios reales del backend. |

### Auditoría interna de arquitectura

El estado completo de la remediación (Fases A–E: descomposición del SPA, HU-005,
seguridad, capa de repositorios e higiene de documentación) se encuentra en
[`docs/auditorias_internas/ANALISIS_ARQUITECTURA.md`](docs/auditorias_internas/ANALISIS_ARQUITECTURA.md),
junto con la matriz RBAC por endpoint
[`docs/auditorias_internas/MATRIZ_ROLES_ENDPOINTS.md`](docs/auditorias_internas/MATRIZ_ROLES_ENDPOINTS.md).

### Prueba de Persistencia Física ante Reinicio de Contenedores

El proyecto incluye un script de validación real de persistencia en disco:

```bash
chmod +x test_persistence.sh
./test_persistence.sh
```

El script genera una reserva, apaga de forma abrupta el contenedor de backend (`docker compose stop backend`), vuelve a encenderlo (`docker compose start backend`) y verifica que los registros persistan intactos en el volumen de PostgreSQL.

---

## 📊 Matriz de Requisitos (RF, RNF, HU y Estado de Alcance)

| Código     | Requisito                         | HU     | RNF     |  Estado Actual  | Justificación / Mecanismo                         |
| :--------- | :-------------------------------- | :----- | :------ | :-------------: | :------------------------------------------------ |
| **RF-001** | Registro de Empleados             | HU-001 | RNF-001 |   ✅ Probado    | `POST /api/auth/registro` (Admin)                 |
| **RF-002** | Consulta de Empleados             | HU-003 | RNF-009 |   ✅ Probado    | `GET /api/empleados`                              |
| **RF-003** | Consulta de Empleado Específico   | HU-004 | RNF-009 |   ✅ Probado    | `GET /api/empleados/{id}`                         |
| **RF-004** | Inicio de Sesión                  | HU-002 | RNF-001 |   ✅ Probado    | `POST /api/auth/login` (JWT)                      |
| **RF-005** | Cierre de Sesión                  | HU-002 | RNF-001 |   ✅ Probado    | Purga de Bearer token en cliente                  |
| **RF-006** | Modificación de Rol               | HU-004 | RNF-009 |   ✅ Probado    | `PATCH /api/empleados/{id}/rol`                   |
| **RF-007** | Validación de Credenciales        | HU-002 | RNF-001 |   ✅ Probado    | Verificación segura contra timing attacks         |
| **RF-008** | Cifrado de Contraseñas            | HU-001 | RNF-005 |   ✅ Probado    | `bcrypt` cost factor 12                           |
| **RF-009** | Control de Acceso (RBAC)          | HU-002 | RNF-009 |   ✅ Probado    | Guardas `requiere_rol()`                          |
| **RF-010** | Gestión de Estado Activo/Inactivo | HU-004 | RNF-010 |   ✅ Probado    | Bajas lógicas y validación en login               |
| **RF-011** | Creación de Reserva Atómica       | HU-005 | RNF-009 |   ✅ Probado    | Constraint PostgreSQL `EXCLUDE USING gist`        |
| **RF-012** | Consulta de Disponibilidad        | HU-005 | RNF-011 |   ✅ Probado    | `GET /api/habitaciones/disponibilidad` por rango  |
| **RF-013** | Modificación de Reserva           | HU-005 | RNF-009 |   ✅ Probado    | `PATCH /api/reservas/{id}` + validación GiST      |
| **RF-014** | Cancelación de Reserva            | HU-005 | RNF-010 |   ✅ Probado    | `DELETE /api/reservas/{id}` (Baja lógica)         |
| **RF-015** | Coworking y Salas de Juntas       | HU-013 | RNF-009 |   ✅ Probado    | `routes/centro_negocios.py` + 12 pruebas pytest   |

### Funcionalidades Diferidas por Dependencias Externas:

- **HU-005 (Check-In / Check-Out Automatizado):** el flujo operativo manual desde el PMS
  (check-in inmediato, check-out y máquina de estados) está **implementado y probado**;
  se difiere únicamente la integración con cerraduras inteligentes RFID/Bluetooth y la
  entrega física de llaves.
- **HU-010 (Gestión Financiera Avanzada):** Facturación electrónica con la DIAN y pasarela de pago online (Wompi/PayU).
- **HU-012 (Notificaciones Automáticas):** Envío masivo de confirmaciones por SMS y WhatsApp Business API.

---

## 🤖 Contexto Maestro para Inyección en Modelos LLM (Gemini AI)

Si vas a abrir un nuevo chat o sesión con **Gemini**, puedes copiar y pegar el siguiente bloque resumen como tu mensaje inicial para transferirle de inmediato todo el contexto del proyecto:

```markdown
### CONTEXTO DEL PROYECTO PARA GEMINI:

- Nombre: BookingSoft (PMS y Motor de Reservas para Apartahotel Facile, Ibagué).
- Stack: FastAPI (Python 3.11), PostgreSQL 15 con btree_gist, React 18 (Vite 5.4, JS ES2022), Docker Compose, Nginx.
- Puertos en Docker: Frontend (3001), Backend (4001, interno 4000), DB (5433, interno 5432), pgAdmin (5050).
- Seguridad: JWT Bearer (8h), bcrypt cost 12, guardas RBAC ('Administrador', 'Recepcionista 24h', 'Ama de llaves', 'Personal de mantenimiento'), Fail-Fast si JWT_SECRET no existe.
- Regla Clave: Prevención de doble reserva a nivel DB mediante constraint GiST en reserva_habitacion (daterange &&), triggers de mantenimiento y cálculo automático de descuentos (10% de 7 a 14 noches y 15% desde 15 noches, regla única en PL/pgSQL + Python + frontend). Módulo financiero (Fase 2): folio con IVA 19% ya incluido en la tarifa, cobros vía adaptador de pasarela (hoy simulado, sin claves externas) y factura electrónica SIMULADA UBL 2.1 en borrador (sin envío a la DIAN).
- Tablas Principales: empleado, huesped, habitacion (38 unidades oficiales), espacio_negocio, reserva_negocio (coworking por horas), reserva_habitacion. Todas con baja lógica y auditoría (creado_por, modificado_por).
- Frontend: Single Page Application con doble modo: Portal de Huéspedes público (Inicio, Apartamentos, Centro de Negocios, Servicios, Galería, Reservar) y Suite PMS para empleados (sub-pestañas: Personal, Recepción Walk-in, Huéspedes, Reservas, Planta, Coworking, Todos).
- Tests: 96 tests en pytest con PostgreSQL real (sin mocks), 28 tests unitarios en Vitest y 9 specs E2E en Playwright (100% pasando), más `test_persistence.sh` para comprobar supervivencia ante caída de contenedores.
- Estado: Fases 1–3 completas y probadas. Fase 3 (Plan de Maduración): RF-013 edición de reservas con `PATCH` atómico y constraint GiST, RF-015 salas/coworking con 12 pruebas, notas de reserva, exportación CSV del folio y aviso de saldo pendiente al check-out. Sin integraciones externas de pago.
```

---

## 👥 Equipo de Desarrollo

Proyecto desarrollado como parte de la formación profesional integral en **Análisis y Desarrollo de Software (ADSO)** — SENA, 2026:

| Integrante           | Rol / Especialidad                                                |
| :------------------- | :---------------------------------------------------------------- |
| **David López**      | Scrum Master & Desarrollador Full-Stack                           |
| **José Chico**       | Diseñador UI/UX & Desarrollador Frontend Lead (Diseño y Paneles)  |
| **Maicol Mayor**     | Desarrollo Backend Lead, Lógica de Negocio & Pruebas (Pytest)     |
| **Sebastián Parada** | Modelado Inicial de Base de Datos, Seguridad, RBAC & Docker       |
| **Ashly Echeverri**  | Product Owner, Documentación de Requisitos & Trazabilidad         |

---

_BookingSoft © 2026 — Apartahotel Facile. Todos los derechos reservados._
