# RF-015 — Reserva de Sala de Juntas / Coworking

<!--
  ¿Qué? Requisito funcional que define la gestión de reservas de espacios adicionales del hotel.
  ¿Para qué? Permitir a cualquier persona reservar la sala de juntas o el coworking por horas.
  ¿Impacto? Sin este requisito, los espacios no pueden gestionarse, generando conflictos de uso y pérdida de ingresos.
-->

---

## Identificación

| Campo            | Valor                                      |
| ---------------- | ------------------------------------------ |
| **ID**           | RF-015                                     |
| **Nombre**       | Reserva de Sala de Juntas / Coworking      |
| **Módulo**       | Módulo de Reservas                         |
| **Prioridad**    | Baja |
| **Estado**       | Fase 2 - fuera del alcance comprometido |
| **Fecha**        | 2026-08-22 |

---

## Descripción

El sistema deberá permitir que cualquier persona, esté hospedada en el apartamento Facile o no, reserve la sala de juntas o el espacio de coworking por horas. La reserva debe verificar la disponibilidad del espacio para el horario solicitado y bloquear el espacio de inmediato al confirmar la reserva, evitando conflictos de horario.

---

## Entradas

| Campo                   | Tipo         | Obligatorio | Validaciones                                               |
| ----------------------- | ------------ | ----------- | ---------------------------------------------------------- |
| Nombre del solicitante  | Texto        | Sí          | No vacío                                                   |
| Espacio solicitado      | Texto / Enum | Sí          | Valor válido: Sala de Juntas o Coworking                   |
| Fecha de la reserva     | Fecha        | Sí          | Formato válido, no anterior a la fecha actual              |
| Hora de inicio          | Hora         | Sí          | Formato válido                                             |
| Hora de fin             | Hora         | Sí          | Posterior a la hora de inicio                              |
| Propósito / descripción | Texto        | No          | Descripción del uso del espacio                            |

---

## Proceso

1. El recepcionista o administrador recibe la solicitud de reserva del espacio.
2. El sistema verifica la disponibilidad del espacio solicitado para la fecha y el rango horario indicado.
3. Si el espacio está disponible, el sistema registra la reserva con los datos del solicitante y el horario.
4. El sistema bloquea el espacio para el horario reservado.
5. Si corresponde, el sistema registra el cargo por el uso del espacio.
6. El sistema confirma la reserva exitosa con un número de identificación.

---

## Salidas

| Escenario                           | Resultado                                                               |
| ----------------------------------- | ----------------------------------------------------------------------- |
| Reserva creada exitosamente         | Reserva registrada, espacio bloqueado y número de reserva generado      |
| Espacio no disponible en el horario | El sistema informa que el espacio ya está reservado para ese horario    |
| Datos incompletos                   | El sistema solicita completar los campos obligatorios                   |
| Horario inválido                    | El sistema rechaza la solicitud e informa el error en el horario        |

---

## Endpoints asociados

Ninguno (Fase 2)

---

## Reglas de negocio

- RN-015.1: Cualquier persona puede reservar la sala de juntas o el coworking, independientemente de si está hospedada en el hotel.
- RN-015.2: La reserva del espacio se gestiona por horas, no por noches como las unidades habitacionales.
- RN-015.3: Al crear una reserva, el espacio debe bloquearse de inmediato para el horario solicitado, evitando reservas simultáneas en el mismo horario.
- RN-015.4: La hora de fin debe ser posterior a la hora de inicio el mismo día.

---

## HUs relacionadas

- HU-013 — Sala de Juntas / Coworking
