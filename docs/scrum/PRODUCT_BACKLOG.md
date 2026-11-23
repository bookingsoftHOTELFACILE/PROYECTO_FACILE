# Product Backlog — BookingSoft (Apartahotel Facile)

**Equipo:** David López, José Miguel Chico, Maicol Mayor, Sebastián Parada y Ashly Echeverri  
**Metodología:** Scrum con priorización MoSCoW y estimación por Planning Poker (Fibonacci: 1, 2, 3, 5, 8, 13, 21)

---

## 1. En qué consiste este Backlog

Aquí organizamos las 15 Historias de Usuario (HUs) del sistema de gestión hotelera para Apartahotel Facile. Antes de programar, el equipo se sentó a ordenar qué era urgente para que el hotel funcionara desde el primer día (**MUST**), qué era importante pero podía esperar un poco (**SHOULD**) y qué podía quedar para después (**COULD** o Fase 2).

En total estimamos **93 puntos** repartidos en **3 Sprints**.

---

## 2. Lista de Historias de Usuario Puntuadas

| Código | Qué necesita el usuario / sistema | Prioridad | Puntos | Sprint | Responsable principal | Estado |
|---|---|---|:---:|:---:|---|:---:|
| **HU-001** | Registro de huéspedes y empleados con su rol | MUST | 3 | Sprint 1 | José Chico / Ashly E. | Terminado |
| **HU-002** | Inicio de sesión seguro con JWT y permisos por rol | MUST | 5 | Sprint 1 | Sebastián Parada | Terminado |
| **HU-003** | Ver listado de empleados y usuarios | SHOULD | 2 | Sprint 1 | Maicol Mayor | Terminado |
| **HU-004** | Consultar un usuario puntual y cambiarle rol o estado | SHOULD | 3 | Sprint 1 | David López | Terminado |
| **HU-006** | Tarifas por tipo de apartamento y descuentos por estadía larga | MUST | 5 | Sprint 2 | Maicol Mayor | Terminado |
| **HU-009** | Catálogo con las 38 unidades del apartahotel y filtros | MUST | 8 | Sprint 2 | David López / José Chico | Terminado |
| **HU-005** | Reservas en recepción (Walk-in), Check-In y Check-Out | MUST | 13 | Sprint 2 | José Chico / David López | Terminado |
| **HU-014** | Ver disponibilidad por fechas sin cruzar reservas | MUST | 3 | Sprint 2 | Maicol Mayor | Terminado |
| **HU-007** | Registrar consumos extras (minibar, lavandería) al folio | SHOULD | 8 | Sprint 3 | Maicol Mayor | Diferido a Fase 2 |
| **HU-008** | Módulo de Ama de llaves y Mantenimiento de habitaciones | SHOULD | 5 | Sprint 3 | Sebastián Parada | Terminado |
| **HU-010** | Folio financiero, pagos, abonos y borrador de factura | MUST | 13 | Sprint 3 | José Chico | Terminado (pasarela simulada) |
| **HU-011** | Inventario de insumos del hotel y alertas de stock | COULD | 5 | Sprint 3 | Ashly Echeverri | Diferido a Fase 2 |
| **HU-012** | Envío automático de mensajes (SMS/WhatsApp) y llaves físicas | COULD | 8 | Sprint 3 | Sebastián Parada | Diferido a Fase 2 |
| **HU-013** | Reservas por horas de Salas de Juntas y Coworking | SHOULD | 8 | Sprint 3 | David López | Terminado |
| **HU-015** | Panel de reportes, ocupación y auditoría en el PMS | SHOULD | 7 | Sprint 3 | David López / José Chico | Terminado |

**Puntos por Sprint:**
- **Sprint 1:** 13 puntos (base del sistema, Docker y usuarios).
- **Sprint 2:** 29 puntos (catálogo, reservas y check-in/out).
- **Sprint 3:** 51 puntos (pagos/folios, coworking, mantenimiento y pruebas).

---

## 3. Cuándo consideramos terminada una historia

Para dar por terminada una tarea en el equipo acordamos revisar lo básico:
1. Que funcione tanto en la pantalla (React) como en el servidor (FastAPI) guardando en PostgreSQL.
2. Que respete los permisos de cada rol (que un empleado sin permiso no pueda borrar reservas ni ver datos de otros).
3. Que pase las pruebas automáticas (Pytest, Vitest y Playwright) sin errores.
4. Que entre a `develop` mediante un Pull Request revisado por otro compañero.
