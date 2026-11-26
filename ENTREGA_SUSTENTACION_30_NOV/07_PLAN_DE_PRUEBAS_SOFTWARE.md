# 🧪 Plan Maestro de Pruebas de Software (Master Test Plan)

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Versión del Documento:** 1.0  
**Fecha de Elaboración:** Noviembre 2026  
**Líder de QA / Pruebas:** Maicol Mayor  
**Equipo Evaluador:** Comité Técnico ADSO — SENA  
**Estándar de Referencia:** IEEE 829 / ISO/IEC/IEEE 29119  

---

## 1. Introducción y Propósito

El propósito de este documento es definir la estrategia, alcance, niveles, ambientes y criterios de aceptación para las pruebas de software del sistema **BookingSoft PMS (Apartahotel Facile)**. El objetivo primordial es asegurar la confiabilidad del motor de reservas, la consistencia de los cálculos financieros (depósitos, tarifas COP, IVA, retenciones) y la integridad de la base de datos PostgreSQL, evitando sobreventas (*overbooking*) y vulnerabilidades de control de acceso.

---

## 2. Alcance de las Pruebas

### 2.1 Módulos Dentro del Alcance (In-Scope)
- **Autenticación y Seguridad (Auth / RBAC):** Registro, login JWT, expiración de tokens, control de acceso por roles (Administrador, Recepción, Ama de llaves, Mantenimiento).
- **Catálogo de Habitaciones y Unidades:** Disponibilidad en vivo, filtrado por tipología (Dúplex, Dobles, Familiares, Estándar).
- **Motor de Reservas y Transacciones:** Validación de fechas, solapamiento de calendarios, estados de reserva (`Confirmada`, `Check-In`, `Completada`, `Cancelada`).
- **Liquidación Financiera y Folio Contable:** Cargos por noche, depósito de garantía, consumos adicionales, abonos y cierre contable.
- **Centro de Negocios y Coworking:** Reservas por bloques horarios y prevención de colisión de salas.
- **Auditoría y Gestión de Huéspedes:** CRUD de huéspedes, validación de documentos de identidad y reglas DIAN/SIRE.

### 2.2 Módulos Fuera del Alcance (Out-of-Scope)
- Conexión física a hardware de cerraduras electrónicas por bus Zigbee/Z-Wave (se prueba a nivel de emulación lógica de API y generación de llaves digitales).
- Conciliación bancaria en tiempo real con redes ACH (se prueba con pasarela simulada de pagos).

---

## 3. Niveles de Prueba y Estrategia

| Nivel de Prueba | Alcance y Objetivo | Herramientas Utilizadas | Cobertura |
|---|---|---|:---:|
| **Nivel 3: Pruebas E2E / Sistema** | Flujo completo de navegación, formularios y localizadores accesibles de punta a punta. | Playwright (Node.js) | 9 Specs E2E |
| **Nivel 2: Pruebas de Integración** | Transaccionalidad ACID en PostgreSQL, prevención de concurrencia y contratos HTTP. | Pytest + FastAPI TestClient | 118 Casos Backend |
| **Nivel 1: Pruebas Unitarias** | Funciones de dominio, cálculo de tarifas COP, utilidades de fecha y modelos Pydantic. | Pytest (Backend) y Vitest (Frontend) | 146 Casos Totales |

### 3.1 Nivel 1: Pruebas Unitarias
- **Herramientas:** Pytest (Python 3.11) y Vitest (React 18).
- **Foco:** Validación de funciones puras, cálculo de descuentos por estadía (`utils/pricing.js` / `services/reservas_service.py`), parseo de fechas ISO (`dateUtils.js`) y schemas Pydantic.

### 3.2 Nivel 2: Pruebas de Integración
- **Herramientas:** FastAPI TestClient con base de datos de pruebas aislada.
- **Foco:** Transaccionalidad ACID en PostgreSQL, prevención de concurrencia y validación de endpoints HTTP (códigos 200, 201, 400, 401, 404, 409, 422).

### 3.3 Nivel 3: Pruebas End-to-End (E2E) y de Sistema
- **Herramientas:** Playwright.
- **Foco:** Flujos completos de usuario: login de recepcionista → selección de habitación → registro Walk-In → emisión de recibo → check-in.

---

## 4. Separación de Ambientes de Prueba y Desarrollo

Para dar estricto cumplimiento a las buenas prácticas de ingeniería de software, el proyecto mantiene los ambientes completamente segregados:

| Característica | Ambiente de Desarrollo (Dev) | Ambiente de Pruebas (Testing / QA) | Ambiente de Producción (Staging/Prod) |
|---|---|---|---|
| **Host / Contenedor** | Local Docker Compose | Contenedor de pruebas CI/CD | Servidor cloud / VPS Nginx |
| **Base de Datos** | PostgreSQL `bookingsoft` (puerto host 5433) | PostgreSQL Test DB (`bookingsoft_test` en CI `postgres:16` / Docker) | PostgreSQL con réplica y backup |
| **Datos de Prueba** | Semillas de desarrollo (Seeders) | Fixtures volátiles (se recrean en cada test) | Datos reales de huéspedes y reservas |
| **Logs & Depuración** | Nivel `DEBUG` con recarga en vivo (Hot-reload) | Nivel `INFO` con captura de aserciones | Nivel `WARNING` / `ERROR` auditado |
| **Variables de Entorno** | `.env` local | `.env.test` parametrizado | Docker Secrets / Gestor de variables |

---

## 5. Criterios de Entrada, Suspensión y Salida (Entry & Exit Criteria)

### 5.1 Criterios de Entrada
- Código compilable sin errores sintácticos en Python y JavaScript.
- Contenedores Docker de backend y base de datos en estado `healthy`.

### 5.2 Criterios de Suspensión
- Falla de conexión a la base de datos de pruebas.
- Errores críticos que impidan el inicio de sesión del sistema.

### 5.3 Criterios de Salida (Aprobación)
- **100% de las pruebas unitarias automatizadas ejecutadas exitosamente (0 fallos).**
- Cobertura de pruebas unitarias superior al 80% en los módulos de lógica financiera y de reservas.
- Cero defectos de severidad **Crítica (P1)** o **Alta (P2)** sin resolver.
- Matriz de trazabilidad validada contra los Requisitos Funcionales (RFs).

---

## 6. Recursos, Roles y Herramientas

- **Responsable de Ejecución:** Maicol Mayor (QA Lead & Backend Lead).
- **Revisores de Código y Parches:** Maicol Mayor (Backend) y José Miguel Chico (Frontend).
- **Frameworks:** `pytest 8.2.2`, `pytest-cov 7.1.0`, `vitest ^2.1.9`, `@playwright/test ^1.63.0`.
