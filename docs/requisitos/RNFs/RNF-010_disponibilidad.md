# RNF-010 — Disponibilidad

<!--
  ¿Qué? Requisito no funcional que define la disponibilidad continua del sistema BookingSoft.
  ¿Para qué? Garantizar que el sistema esté accesible en todo momento dado que la operación hotelera no tiene interrupciones.
  ¿Impacto? Una caída del sistema puede impedir operaciones críticas como check-ins nocturnos o registros de emergencia.
-->

---

## Identificación

| Campo             | Valor              |
| ----------------- | ------------------ |
| **ID**            | RNF10              |
| **Referencia**    | RNF-010            |
| **Nombre**        | Disponibilidad     |
| **Categoría**     | Disponibilidad     |
| **Prioridad**    | Alta |
| **Estado**       | Implementado y probado |
| **Fecha**        | 2026-08-22 |

---

## Descripción

El sistema de BookingSoft deberá estar disponible de forma continua, 24 horas al día y 7 días a la semana. La operación de un hotel no se detiene en horarios nocturnos, fines de semana ni días festivos, por lo que el sistema debe poder ser utilizado en cualquier momento por el personal autorizado.

---

## Justificación

Los apartamentos Facile operan de forma continua. Situaciones como check-ins tardíos, check-outs anticipados, incidencias nocturnas o gestión de emergencias requieren que el sistema esté disponible fuera del horario laboral habitual. La no disponibilidad del sistema en esos momentos impediría la operación normal del hotel.

---

## Criterios de cumplimiento

- El sistema de BookingSoft puede ser accedido y utilizado por el personal autorizado en cualquier momento del día.
- El sistema opera sin restricciones de horario, incluyendo noches, fines de semana y días festivos.
- Las funcionalidades críticas del sistema (inicio de sesión, check-in, check-out, registro de incidencias) están disponibles durante toda la jornada operativa del hotel.

---

## Restricciones / Consideraciones

- Las métricas específicas de disponibilidad (porcentaje de uptime, tiempo máximo de caída permitido, etc.) no han sido definidas en los requisitos actuales del proyecto y deberán establecerse en una etapa posterior si el proyecto así lo requiere.
- La arquitectura e infraestructura de despliegue necesaria para sostener la disponibilidad definida serán determinadas durante el diseño técnico del sistema.
- En caso de mantenimientos programados, el sistema debe informar al personal con antelación (véase HU-014).

---

## Verificación

- Verificar que el sistema puede ser accedido correctamente fuera del horario laboral habitual.
- Verificar que no existen restricciones de horario configuradas en el sistema que impidan su uso continuo.

---

## RF relacionados

- Todos los RF del sistema, ya que la disponibilidad afecta la operación global de BookingSoft.

---

## HUs relacionadas

- HU-014 — Disponibilidad 24/7
