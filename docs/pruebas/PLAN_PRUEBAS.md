# Plan de Pruebas — BookingSoft (Apartahotel Facile)

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Equipo:** David López, José Chico, Maicol Mayor, Sebastián Parada y Ashly Echeverri

---

## 1. Propósito y Alcance
Validar que las reglas de negocio del hotel funcionen sin errores: evitar reservas cruzadas en una misma habitación (*double-booking*), controlar quién puede entrar a cada pantalla según su rol (RBAC), calcular bien los precios/descuentos y asegurar que la interfaz muestre alertas claras al usuario.

### Qué probamos:
- Autenticación, roles y permisos (Administrador, Recepcionista 24h, Ama de llaves, Mantenimiento).
- Creación, edición, check-in, check-out y cancelación de reservas.
- Cálculo de tarifas, descuentos por estadía larga (10% de 7–14 noches y 15% desde 15) e IVA en folios.
- Salas de juntas y coworking por horas.
- Flujos completos desde el navegador (login, registro, reservas, pagos).

### Qué queda fuera de alcance (simulado o para Fase 2):
- Pagos reales con bancos (Wompi/PSE) y envío real a la DIAN (se prueban con `services/pasarela.py` en modo simulado).
- Hardware físico de cerraduras inteligentes (no se cuenta con las cerraduras físicas en el ambiente de prueba).

---

## 2. Niveles de Prueba (Pirámide de Pruebas)

| Nivel | Qué prueba | Herramienta | Ubicación |
|---|---|---|---|
| **1. Pruebas Unitarias** | Funciones puras y validaciones sin BD ni servidor (fechas, precios, modelo huésped, folio). | **Pytest** (Backend) y **Vitest** (Frontend) | `backend/tests/test_reservas_service.py`, `test_model_huesped.py`, `frontend/src/*.test.js` |
| **2. Pruebas de Integración** | Endpoints reales de FastAPI conectados contra PostgreSQL real (RBAC, transacciones, GiST). | **Pytest** + FastAPI `TestClient` | `backend/tests/test_auth.py`, `test_reservas.py`, `test_pagos.py`, `test_checkin_checkout.py`, etc. |
| **3. Pruebas End-to-End (E2E)** | Recorridos completos de un usuario haciendo clic y llenando formularios en el navegador. | **Playwright** (Chromium) | `E2E/tests/*.spec.js` |

---

## 3. Ambientes Separados (Desarrollo vs. Pruebas)

| Elemento | Ambiente de Desarrollo (Local) | Ambiente de Pruebas (CI — GitHub Actions) |
|---|---|---|
| **Base de Datos** | Contenedor `bookingsoft-db` (`bookingsoft`, puerto host `5433`) | Servicio Postgres independiente (`bookingsoft_test`, puerto `5432`) |
| **Datos** | Seed inicial (`schema.sql`) y datos de pruebas manuales (`RESET_DB=false`) | Base limpia desde cero en cada ejecución (`RESET_DB=true`) |
| **Ejecución** | Manual con `docker compose up -d --build` | Automática en cada `push` y `pull_request` (`.github/workflows/ci.yml`) |

---

## 4. Criterios para Aprobar las Pruebas
1. Todos los tests unitarios, de integración y E2E deben pasar en verde en local y en CI.
2. Ningún archivo de test puede depender de otro ni dejar datos sucios que rompan la segunda ejecución.
3. Los cambios entran por Pull Request con revisión de otro compañero del equipo.