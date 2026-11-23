# Informe de Sprint 2 — Catálogo de Apartamentos, Reservas y Check-In / Check-Out

**Objetivo del Sprint:** Mostrar los 38 apartamentos en el portal, calcular precios con descuentos por noches y permitir hacer reservas con Check-In y Check-Out sin que se crucen fechas.

---

## 1. Qué planeamos y quién hizo qué

- **Meta en puntos:** 29 puntos (`HU-005`, `HU-006`, `HU-009`, `HU-014`).

| Tarea | Qué se hizo | Responsable | Estado |
|---|---|---|:---:|
| **T-2.1** | Tabla SQL `habitacion` en PostgreSQL (`psycopg2`) con los 38 alojamientos | Maicol Mayor | Listo |
| **T-2.2** | Restricción `EXCLUDE USING gist` y función para validar fechas solapadas | Maicol Mayor | Listo |
| **T-2.3** | Endpoints de habitaciones (`/api/habitaciones`, disponibilidad y cambio de estado) | Maicol Mayor | Listo |
| **T-2.4** | Endpoint `POST /api/reservas` y transacción atómica de huésped + reserva | Maicol Mayor / José Chico / David López | Listo |
| **T-2.5** | Portal público con catálogo de apartamentos, filtros por tipo y modal de detalle | José Miguel Chico | Listo |
| **T-2.6** | Módulo de Recepción (Walk-in) en el PMS con calendario y cálculo en vivo | José Miguel Chico | Listo |
| **T-2.7** | Pruebas en Pytest para doble reserva, capacidad máxima y descuentos | Maicol Mayor | Listo |
| **T-2.8** | Proxy en Vite/Nginx para que `/api` redirija al backend sin errores de CORS | Sebastián Parada | Listo |
| **T-2.9** | Actualizar matriz de trazabilidad y pruebas | Ashly Echeverri | Listo |

---

## 2. Problemas que salieron en el camino y cómo los resolvimos

1. **Día de salida vs. día de entrada:** Al principio, si una reserva terminaba el 10 de noviembre, el sistema no dejaba entrar a otro huésped ese mismo 10 de noviembre. Ajustamos las consultas SQL y de fechas entendiendo cómo funciona un hotel (check-out a las 11:00 a.m. y check-in a las 3:00 p.m.).
2. **Desfase de un día por zona horaria UTC:** JavaScript al hacer `new Date('2026-11-09')` restaba horas en Colombia y mostraba el día anterior en algunos calendarios. Lo arreglamos creando funciones propias en `frontend/src/utils/dateUtils.js`.
3. **Diferencia entre el precio mostrado y el cobrado:** El backend daba 15% desde la noche 16 y el frontend mostraba otro porcentaje en un modal. Lo unificamos en los dos lados: **10% entre 7 y 14 noches** y **15% desde 15 noches**.

---

## 3. Cierre y qué mejoramos para el Sprint 3

- **Qué nos funcionó bien:** Proteger la doble reserva directamente en PostgreSQL con `btree_gist` nos evitó problemas cuando dos clics llegaban casi al mismo tiempo.
- **Qué nos falló:** El archivo `App.jsx` creció muchísimo (más de 6.600 líneas) y se volvió muy enredado buscar errores allí, además de que al principio algunos cambios se subieron sin pasar por Pull Request.
- **Compromiso:** Partir `App.jsx` en vistas y componentes pequeños, y trabajar siempre con ramas y revisión por Pull Request.
