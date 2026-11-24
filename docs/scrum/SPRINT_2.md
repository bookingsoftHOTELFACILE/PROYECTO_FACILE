# 🏨 Informe de Sprint 2: Catálogo Habitacional, Motor de Reservas y Check-In

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Duración del Sprint:** 2 semanas  
**Objetivo del Sprint (Sprint Goal):**  
> *"Construir el núcleo operativo hotelero: catálogo de apartamentos por tipologías (Dúplex, Dobles, Suites), motor de tarifas y liquidación con prevención de overbooking, y flujo de check-in / check-out presencial."*

---

## 1. Planificación del Sprint (Sprint Planning)

- **Capacidad del Equipo:** 120 horas de desarrollo.
- **Compromiso en Story Points:** 29 Story Points.
- **Historias de Usuario comprometidas:**
  1. **HU-006:** Tarifas por tipo de unidad y temporadas (5 SP)
  2. **HU-009:** Catálogo y registro de unidades habitacionales (8 SP)
  3. **HU-005:** Motor de reservas presenciales Walk-In, Check-In y Check-Out (13 SP)
  4. **HU-014:** Disponibilidad en vivo 24/7 y validación de overbooking (3 SP)

---

## 2. Desglose de Tareas Técnicas Asignadas

| ID Tarea | Descripción Técnica | Responsable | Estimado (h) | Estado Final |
|---|---|---|:---:|:---:|
| **T-2.1** | Esquema PostgreSQL `habitacion` (`schema.sql`) y endpoints en FastAPI (`routes/habitaciones.py`) con tipos, capacidad y precio base | Maicol Mayor | 6h | ✅ Completado |
| **T-2.2** | Algoritmo de validación de fechas contra solapamientos de reservas | Maicol Mayor | 10h | ✅ Completado |
| **T-2.3** | Endpoints de consulta y cambio de estados de habitaciones (`Disponible`, `Ocupada`, `En limpieza`, `Mantenimiento`) | Maicol Mayor | 8h | ✅ Completado |
| **T-2.4** | Endpoint transaccional de creación de reservas presenciales Walk-In | Maicol Mayor / José Chico / David López | 12h | ✅ Completado |
| **T-2.5** | Catálogo público con tarjetas de apartamentos y modal de detalle | José Miguel Chico | 14h | ✅ Completado |
| **T-2.6** | Formulario Walk-In en PMS con selector de fechas interactivo y cálculo COP | José Miguel Chico | 14h | ✅ Completado |
| **T-2.7** | Pruebas de integración sobre fechas ocupadas y validaciones (Pytest) | Maicol Mayor | 10h | ✅ Completado |
| **T-2.8** | Configuración de CORS y proxy Nginx para evitar bloqueos del navegador | Sebastián Parada | 6h | ✅ Completado |
| **T-2.9** | Actualización de matrices de requisitos y pruebas | Ashly Echeverri | 6h | ✅ Completado |

---

## 3. Seguimiento Diario (Daily Scrums Highlights)

- **Día 4:** Maicol alertó que una reserva de salida en fecha `2026-11-15` no debía bloquear una nueva reserva cuya entrada comience el mismo día `2026-11-15` (principio de checkout 11:00 am / checkin 3:00 pm). Se ajustó la consulta SQL de solapamiento.
- **Día 7:** José Miguel diseñó el componente de selección de huéspedes y cotización automática en vivo con desglose de depósito en garantía y tarifas estándar.
- **Día 11:** David López (Scrum Master) coordinó la solución a un fallo en reservas sin huésped asignado: Maicol añadió validación Pydantic que retorna `422 Unprocessable Entity` con mensaje claro.

---

## 4. Revisión del Sprint (Sprint Review)

- **Demostración:**
  - Creación de reserva desde el portal público y desde el panel de recepción PMS.
  - Validación en vivo que impide seleccionar fechas ya ocupadas.
  - Cambio inmediato de estado de la habitación a "Ocupada" al marcar Check-In.
- **Métricas:** 29 SP completados al 100%.

---

## 5. Retrospectiva del Sprint (Sprint Retrospective)

| Qué funcionó bien | Qué no funcionó bien | Compromisos de mejora |
|---|---|---|
| La lógica de negocio quedó blindada en el backend con tests automatizados. | El componente del formulario de reservas en frontend creció demasiado en líneas de código. | Modularizar vistas grandes en subcomponentes (`HuespedesPicker.jsx`, `ModalDetalle.jsx`). |
| Excelente integración de estados entre el catálogo y el PMS. | Algunos commits se hicieron directo a `develop` sin PR formal. | Exigir aprobación de al menos 1 compañero antes de mergear a `develop`. |
