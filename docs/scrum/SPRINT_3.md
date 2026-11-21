# 📊 Informe de Sprint 3: Folio Contable, Coworking, Mantenimiento y Calidad

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Duración del Sprint:** 2 semanas  
**Objetivo del Sprint (Sprint Goal):**  
> *"Completar los módulos auxiliares de operación hotelera: folio contable y liquidación financiera, módulo de aseo y mantenimiento, reservas de coworking, y consolidar la suite de pruebas unitarias automatizadas."*

---

## 1. Planificación del Sprint (Sprint Planning)

- **Capacidad del Equipo:** 130 horas.
- **Compromiso en Story Points:** 51 Story Points (alta concentración de módulos satélite y consolidación QA).
- **Historias de Usuario comprometidas:**
  1. **HU-007:** Registro de consumos extras y servicios (8 SP)
  2. **HU-008:** Módulo de mantenimiento y ama de llaves (5 SP)
  3. **HU-010:** Gestión financiera y folio contable (13 SP)
  4. **HU-011:** Inventario operativo de suministros (5 SP)
  5. **HU-012:** Notificaciones y llaves digitales Yale (8 SP)
  6. **HU-013:** Espacios de coworking y salas de juntas (8 SP)
  7. **HU-015:** Reportes de ocupación y dashboard gerencial (7 SP)

---

## 2. Desglose de Tareas Técnicas Asignadas

| ID Tarea | Descripción Técnica | Responsable | Estimado (h) | Estado Final |
|---|---|---|:---:|:---:|
| **T-3.1** | Modelo `FolioContable` y cargos a la habitación (minibar, lavandería) | Maicol Mayor / David López | 10h | ✅ Completado |
| **T-3.2** | Módulo de asignación de cuartos a Amas de Llaves y control de aseo | Sebastián Parada | 8h | ✅ Completado |
| **T-3.3** | Módulo de reportes de daños y órdenes de mantenimiento | Sebastián Parada | 8h | ✅ Completado |
| **T-3.4** | Sistema de reserva por horas de Salas de Coworking | José Miguel Chico | 12h | ✅ Completado |
| **T-3.5** | Generación de llaves móviles virtuales y confirmación | Maicol Mayor | 8h | ✅ Completado |
| **T-3.6** | Refactorización de componentes React y reducción de deuda técnica | José Miguel Chico | 14h | ✅ Completado |
| **T-3.7** | Automatización de 96 casos de prueba unitarios e integración en Pytest | Maicol Mayor | 16h | ✅ Completado |
| **T-3.8** | Pruebas de componentes en Vitest (28 tests) | Maicol Mayor / José Chico | 10h | ✅ Completado |
| **T-3.9** | Auditoría interna de seguridad y rotación de credenciales | Sebastián Parada | 6h | ✅ Completado |
| **T-3.10** | Consolidación de documentación final de entrega | Ashly Echeverri | 10h | ✅ Completado |

---

## 3. Seguimiento Diario (Daily Scrums Highlights)

- **Día 3:** José Miguel y Maicol conectaron el `ModalFolioReserva.jsx` para permitir facturar cargos adicionales y liquidar el depósito de garantía de forma dinámica.
- **Día 7:** Maicol llevó la suite de pruebas de 45 a 96 casos en backend, cubriendo todos los casos borde (inyección de fechas inválidas, usuarios duplicados, cálculos de impuestos negativos). David López monitoreó el burndown chart del Sprint.
- **Día 10:** Sebastián completó la auditoría de dependencias y verificó que ningún secreto quede expuesto en el código versionado de Git.

---

## 4. Revisión del Sprint (Sprint Review)

- **Demostración Final:**
  - Sistema 100% integrado: reserva Walk-In → emisión de folio → cargos extra → asignación a limpieza → Check-Out con liquidación.
  - Ejecución en vivo de la suite de pruebas: **96 pruebas en Pytest pasando (100%)** y **28 pruebas en Vitest pasando (100%)**.
- **Aceptación:** Producto aprobado para sustentación final ante el comité evaluador del SENA.

---

## 5. Retrospectiva del Sprint (Sprint Retrospective)

| Qué funcionó bien | Qué no funcionó bien | Compromisos a futuro |
|---|---|---|
| La cohesión del equipo permitió cerrar los 51 SP gracias al trabajo en paralelo de frontend y backend. | La integración de hardware real (IoT) no se pudo completar por falta de equipos físicos en el laboratorio. | Plantear la integración con cerraduras Yale físicas como primera fase de evolución comercial. |
| El backend de FastAPI demostró una velocidad de respuesta sobresaliente (<30ms por petición). | El empaquetado de producción de Vite requirió ajustes de optimización de chunks. | Mantener configuración de Vite con code-splitting para despliegues en la nube. |
