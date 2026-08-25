# RF-013 — Modificación de Reserva

<!--
  ¿Qué? Requisito funcional que define la capacidad de modificar una reserva activa en BookingSoft.
  ¿Para qué? Permitir ajustar fechas u otros datos de una reserva cuando el huésped lo requiera.
  ¿Impacto? Sin este requisito, cualquier cambio implicaría cancelar y volver a crear la reserva completa.
-->

---

## Identificación

| Campo            | Valor                      |
| ---------------- | -------------------------- |
| **ID**           | RF-013                     |
| **Nombre**       | Modificación de Reserva    |
| **Módulo**       | Módulo de Reservas         |
| **Prioridad**    | Media |
| **Estado**       | Fase 2 - fuera del alcance comprometido |
| **Fecha**        | 2026-08-22 |

---

## Descripción

El sistema deberá permitir modificar las fechas y los datos autorizados de una reserva que se encuentre en estado activo. Los cambios deben validarse verificando que la unidad siga disponible para el nuevo período y que no se generen conflictos con otras reservas existentes.

---

## Entradas

| Campo                   | Tipo       | Obligatorio | Validaciones                                               |
| ----------------------- | ---------- | ----------- | ---------------------------------------------------------- |
| Identificador de reserva | Referencia | Sí         | La reserva debe existir y estar en estado activo           |
| Nueva fecha de check-in | Fecha      | No          | Formato válido, no anterior a la fecha actual              |
| Nueva fecha de check-out| Fecha      | No          | Formato válido, posterior a la nueva fecha de check-in     |
| Otros datos modificables| Varios     | No          | Según los campos autorizados para modificación             |

---

## Proceso

1. El recepcionista o administrador selecciona la reserva que desea modificar.
2. El sistema muestra los datos actuales de la reserva.
3. El recepcionista modifica los campos que desea actualizar.
4. El sistema valida los nuevos valores ingresados.
5. El sistema verifica que la unidad esté disponible para el nuevo período si se cambiaron las fechas.
6. Si la disponibilidad es confirmada, el sistema actualiza la reserva con los nuevos datos.
7. El sistema libera la disponibilidad del período anterior y bloquea el nuevo período si las fechas cambiaron.
8. El sistema confirma la modificación exitosa.

---

## Salidas

| Escenario                         | Resultado                                                             |
| --------------------------------- | --------------------------------------------------------------------- |
| Modificación exitosa              | La reserva es actualizada y el sistema confirma el cambio             |
| Unidad no disponible en nuevo período | El sistema informa el conflicto y mantiene la reserva original    |
| Reserva no encontrada             | El sistema informa que la reserva no existe                           |
| Fechas inválidas                  | El sistema informa el error en las fechas y no aplica el cambio       |

---

## Endpoints asociados

Ninguno (Fase 2)

---

## Reglas de negocio

- RN-013.1: Solo se pueden modificar reservas que se encuentren en estado activo.
- RN-013.2: Al modificar fechas, el sistema debe verificar que no existan conflictos de disponibilidad con el nuevo período.
- RN-013.3: Si las fechas cambian, el sistema debe actualizar el bloqueo de disponibilidad de la unidad para reflejar el nuevo período.

---

## HUs relacionadas

- HU-005 — Check-in y Check-out
