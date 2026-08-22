# RF-011 — Creación de Reserva

<!--
  ¿Qué? Requisito funcional que define el proceso de creación de una reserva en BookingSoft.
  ¿Para qué? Permitir al recepcionista gestionar el proceso de reserva de unidades habitacionales.
  ¿Impacto? Sin este requisito no es posible gestionar la asignación anticipada de unidades a huéspedes.
-->

---

## Identificación

| Campo            | Valor                  |
| ---------------- | ---------------------- |
| **ID**           | RF-011                 |
| **Nombre**       | Creación de Reserva    |
| **Módulo**       | Módulo de Reservas     |
| **Prioridad**    | Alta |
| **Estado**       | Implementado y probado |
| **Fecha**        | 2026-08-22 |

---

## Descripción

El sistema deberá permitir al recepcionista o administrador crear una reserva para un huésped, bloqueando la unidad seleccionada de inmediato una vez confirmada la reserva. La reserva debe asociarse a un huésped, indicar las fechas de entrada y salida, y cambiar el estado de la unidad a no disponible para el período reservado.

---

## Entradas

| Campo                | Tipo         | Obligatorio | Validaciones                                           |
| -------------------- | ------------ | ----------- | ------------------------------------------------------ |
| Datos del huésped    | Texto        | Sí          | Nombre, documento y datos de contacto del huésped      |
| Unidad seleccionada  | Referencia   | Sí          | La unidad debe existir y estar disponible en el período |
| Fecha de check-in    | Fecha        | Sí          | Formato válido, no anterior a la fecha actual          |
| Fecha de check-out   | Fecha        | Sí          | Formato válido, posterior a la fecha de check-in       |
| Número de personas   | Entero       | Sí          | Mayor a cero, no superar la capacidad de la unidad     |

---

## Proceso

1. El recepcionista accede al módulo de reservas.
2. El recepcionista ingresa los datos del huésped y las fechas de la estadía.
3. El sistema verifica la disponibilidad de la unidad solicitada para el rango de fechas indicado (véase RF-012).
4. Si la unidad está disponible, el sistema crea el registro de la reserva.
5. El sistema bloquea la unidad para el período reservado, cambiando su estado a no disponible.
6. El sistema confirma la creación exitosa de la reserva con un número de identificación.

---

## Salidas

| Escenario                         | Resultado                                                          |
| --------------------------------- | ------------------------------------------------------------------ |
| Reserva creada exitosamente       | Reserva registrada, unidad bloqueada y número de reserva generado  |
| Unidad no disponible              | El sistema informa que la unidad no está disponible en las fechas indicadas |
| Fechas inválidas                  | El sistema rechaza la solicitud e informa el error en las fechas   |
| Datos incompletos                 | El sistema solicita completar los campos obligatorios              |

---

## Endpoints asociados

`POST /api/reservas`

---

## Reglas de negocio

- RN-011.1: Una reserva solo puede crearse sobre una unidad disponible en el período solicitado.
- RN-011.2: Al crear una reserva, la unidad debe ser bloqueada de inmediato para que no sea asignada a otra reserva durante ese período.
- RN-011.3: La fecha de check-out debe ser posterior a la fecha de check-in.
- RN-011.4: El número de personas no puede superar la capacidad máxima de la unidad reservada.

---

## HUs relacionadas

- HU-005 — Check-in y Check-out
