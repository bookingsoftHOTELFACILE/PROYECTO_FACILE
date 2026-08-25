# RNF-009 — Concurrencia e Integridad

<!--
  ¿Qué? Requisito no funcional que define la obligación de evitar condiciones de carrera en el bloqueo de unidades.
  ¿Para qué? Garantizar la integridad de la disponibilidad cuando múltiples solicitudes concurrentes intentan reservar la misma unidad.
  ¿Impacto? Sin control de concurrencia, dos reservas podrían asignar la misma unidad al mismo tiempo, generando conflictos operativos.
-->

---

## Identificación

| Campo             | Valor                          |
| ----------------- | ------------------------------ |
| **ID**            | RNF09                          |
| **Referencia**    | RNF-009                        |
| **Nombre**        | Concurrencia e Integridad      |
| **Categoría**     | Concurrencia e Integridad      |
| **Prioridad**    | Alta |
| **Estado**       | Implementado y probado |
| **Fecha**        | 2026-08-22 |

---

## Descripción

El sistema de BookingSoft deberá garantizar que las operaciones de reserva y bloqueo de unidades se ejecuten de forma segura ante solicitudes concurrentes. El sistema debe evitar condiciones de carrera que puedan resultar en que una misma unidad quede asignada a dos reservas simultáneas para el mismo período, preservando en todo momento la integridad de la disponibilidad del sistema.

---

## Justificación

En un sistema hotelero, es posible que múltiples usuarios (recepcionistas, operadores) intenten reservar la misma unidad casi al mismo tiempo. Sin un mecanismo de control de concurrencia, ambas operaciones podrían validar la disponibilidad de forma independiente y proceder a crear reservas duplicadas, generando un conflicto operativo grave para el hotel.

---

## Criterios de cumplimiento

- Una misma unidad no puede quedar asignada a dos reservas diferentes para el mismo período de tiempo, independientemente de la simultaneidad de las solicitudes.
- El sistema garantiza que la verificación de disponibilidad y el bloqueo de la unidad se realizan como una operación atómica o con los mecanismos de control necesarios para evitar conflictos.
- Ante solicitudes simultáneas sobre la misma unidad, solo una de ellas puede completarse exitosamente; las demás deben recibir una respuesta indicando que la unidad ya no está disponible.

---

## Restricciones / Consideraciones

- El mecanismo técnico específico para el control de concurrencia (transacciones, bloqueos a nivel de base de datos, u otros) será definido durante el diseño técnico del sistema.
- Este requisito es especialmente crítico para las operaciones de RF-011 (Creación de Reserva) y RF-012 (Consulta de Disponibilidad).

---

## Verificación

- Realizar pruebas de concurrencia enviando solicitudes simultáneas de reserva para la misma unidad y el mismo período.
- Verificar que solo una solicitud resulta exitosa y las demás reciben una respuesta apropiada de no disponibilidad.
- Verificar que el estado de la base de datos sea consistente después de las pruebas concurrentes.

---

## RF relacionados

- RF-011 — Creación de Reserva
- RF-012 — Consulta de Disponibilidad
- RF-013 — Modificación de Reserva
- RF-014 — Cancelación de Reserva

---

## HUs relacionadas

- HU-005 — Check-in y Check-out
- HU-009 — Registro de Unidades
