# Reporte de Ejecución de Pruebas y Registro de Defectos

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Equipo:** Maicol Mayor, José Chico, David López, Sebastián Parada y Ashly Echeverri

---

## 1. Resumen de Ejecución Actual

Al ejecutar las suites automatizadas del proyecto sobre `develop`:
- **Backend (Pytest):** 98 pruebas distribuidas en 11 archivos (`backend/tests/`), ejecutadas con PostgreSQL real (`98 passed`).
- **Frontend (Vitest):** 28 pruebas unitarias en 6 archivos (`frontend/src/`).
- **E2E (Playwright):** 9 pruebas de punta a punta (`E2E/tests/*.spec.js`).
- **Persistencia física:** Verificada con `./test_persistence.sh` apagando y prendiendo el contenedor backend sin perder reservas.

---

## 2. Clasificación de Severidad y Estados Usados

- **Severidades:**
  - **Alta:** Fallas de seguridad, pérdida de datos o bloqueo de funciones principales (ej. no poder reservar o saltarse permisos).
  - **Media:** Errores en reglas secundarias, desorden en código o mensajes poco claros.
  - **Baja:** Detalles visuales, documentación desactualizada o ajustes menores.
- **Estados:** `Abierto` ➔ `En corrección` ➔ `Resuelto y Verificado`.

---

## 3. Defectos Reales Encontrados y Corregidos Durante el Proyecto

| ID | Módulo | Descripción del Defecto | Severidad | Responsable | Qué se corrigió | Estado |
|---|---|---|:---:|---|---|:---:|
| **BUG-01** | Seguridad Reservas | `DELETE /api/reservas/{id}` usaba `autenticar_opcional`, permitiendo cancelar reservas sin token ni rol. | **Alta** | Equipo / Fase C | Se exigió token válido y rol autorizado (`Administrador` o `Recepcionista 24h`) + test en `test_seguridad_acceso.py`. | ✅ Resuelto |
| **BUG-02** | Seguridad Habitaciones | `GET /api/habitaciones` exponía `detalle_mantenimiento` sin autenticación. | **Alta** | Equipo / Fase C | Se protegió el endpoint interno por roles y se creó `/api/habitaciones/publicas` para visitantes. | ✅ Resuelto |
| **BUG-03** | Descuentos y Precios | El frontend y el backend aplicaban porcentajes distintos en algunos cálculos de noches (7–14 vs 15+ noches). | **Alta** | Maicol / José | Se unificó la regla (10% de 7–14 noches y 15% desde 15) en `schema.sql`, `reservas_service.py` y `utils/pricing.js`. | ✅ Resuelto |
| **BUG-04** | Fechas y Zona Horaria | Al seleccionar rangos como del 9 al 20 de noviembre, la conversión UTC en navegador restaba un día. | **Media** | José / David | Se crearon funciones sin desfase horario en `frontend/src/utils/dateUtils.js` con sus tests unitarios. | ✅ Resuelto |
| **BUG-05** | Check-Out / Limpieza | Faltaba la máquina de estados completa Check-In ➔ Completada y pasar la habitación a `'En limpieza'`. | **Alta** | Equipo / Fase B | Se implementó `PATCH /api/reservas/{id}/estado` con marcas `checkin_at` / `checkout_at` y transición a `'En limpieza'`. | ✅ Resuelto |
| **BUG-06** | Arquitectura Frontend | `App.jsx` concentraba 6.665 líneas y 25 `fetch` sueltos difíciles de mantener. | **Media** | José / David | Se dividió en `views/`, `components/`, `context/`, `state/useAppState.js` y `api/client.js`. | ✅ Resuelto |
| **BUG-07** | Credenciales en Cliente | `useAppState.js` tenía un fallback de login en memoria con contraseñas escritas en el frontend. | **Alta** | José | Se eliminó el fallback del cliente para autenticar únicamente contra JWT + `bcrypt` en PostgreSQL. | ✅ Resuelto |
| **BUG-08** | Umbrales Vitest | `frontend/vite.config.js` tenía los umbrales de cobertura en `0`, por lo que borrar tests no rompía el build. | **Baja** | Equipo / Fase E | Se fijaron umbrales mínimos reales en `vite.config.js`. | ✅ Resuelto |
| **BUG-09** | Deuda en Frontend | `useAppState.js` y `VistaPms.jsx` aún concentran más de 1.400 líneas cada uno y `proteccion_doble_clic.spec.js` tiene un fallo conocido. | **Media** | Equipo | Documentado para dividir en hooks/subcomponentes más pequeños en Fase 2. | 🔄 Abierto |