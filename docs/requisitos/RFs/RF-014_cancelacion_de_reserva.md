# RF-014 — Cancelación de Reserva

<!--
  ¿Qué? Requisito funcional que define el proceso de cancelación de una reserva activa.
  ¿Para qué? Permitir cancelar reservas aplicando la política de penalidad definida por el hotel.
  ¿Impacto? Sin este requisito, no hay forma formal de liberar unidades de reservas que ya no se llevarán a cabo.
-->

---

## Identificación

| Campo            | Valor                      |
| ---------------- | -------------------------- |
| **ID**           | RF-014                     |
| **Nombre**       | Cancelación de Reserva     |
| **Módulo**       | Módulo de Reservas         |
| **Prioridad**    | Media |
| **Estado**       | Fase 2 - fuera del alcance comprometido |
| **Fecha**        | 2026-08-22 |

---

## Descripción

El sistema deberá permitir al recepcionista o administrador cancelar una reserva activa, aplicando la política de penalidad correspondiente si aplica según las condiciones establecidas. Al cancelar la reserva, la unidad debe quedar disponible nuevamente para el período que estaba bloqueado.

---

## Entradas

| Campo                    | Tipo       | Obligatorio | Validaciones                                          |
| ------------------------ | ---------- | ----------- | ----------------------------------------------------- |
| Identificador de reserva | Referencia | Sí          | La reserva debe existir y estar en estado activo      |
| Motivo de cancelación    | Texto      | No          | Descripción del motivo, si aplica                     |

---

## Proceso

1. El recepcionista o administrador selecciona la reserva que desea cancelar.
2. El sistema muestra los datos de la reserva y la política de penalidad aplicable.
3. El recepcionista confirma la cancelación.
4. El sistema aplica la política de penalidad correspondiente si las condiciones lo requieren.
5. El sistema cambia el estado de la reserva a "cancelada".
6. El sistema libera la disponibilidad de la unidad para el período que estaba bloqueado.
7. El sistema confirma la cancelación exitosa.

---

## Salidas

| Escenario                         | Resultado                                                                     |
| --------------------------------- | ----------------------------------------------------------------------------- |
| Cancelación exitosa               | Reserva cancelada, unidad liberada y penalidad aplicada si correspondía       |
| Reserva no encontrada             | El sistema informa que la reserva no existe                                   |
| Reserva ya cancelada              | El sistema informa que la reserva ya fue cancelada anteriormente              |

---

## Endpoints asociados

Ninguno (Fase 2)

---

## Reglas de negocio

- RN-014.1: Solo se pueden cancelar reservas que se encuentren en estado activo.
- RN-014.2: Al cancelar una reserva, la unidad debe quedar disponible de inmediato para el período que estaba bloqueado.
- RN-014.3: El sistema debe aplicar la política de penalidad correspondiente según las condiciones vigentes en el momento de la cancelación.

---

## HUs relacionadas

- HU-005 — Check-in y Check-out
