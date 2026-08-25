# RF-012 — Consulta de Disponibilidad

<!--
  ¿Qué? Requisito funcional que define la consulta en tiempo real de la disponibilidad de unidades.
  ¿Para qué? Permitir al recepcionista conocer qué unidades están libres antes de crear una reserva o check-in.
  ¿Impacto? Sin este requisito no es posible asignar unidades correctamente ni evitar conflictos de reserva.
-->

---

## Identificación

| Campo            | Valor                        |
| ---------------- | ---------------------------- |
| **ID**           | RF-012                       |
| **Nombre**       | Consulta de Disponibilidad   |
| **Módulo**       | Módulo de Reservas           |
| **Prioridad**    | Alta |
| **Estado**       | Pendiente |
| **Fecha**        | 2026-08-22 |

---

## Descripción

El sistema deberá mostrar en tiempo real qué unidades habitacionales se encuentran disponibles para un rango de fechas determinado. La consulta debe permitir al recepcionista o administrador identificar las unidades libres, ocupadas o en mantenimiento para una fecha o período específico, facilitando la gestión de reservas y check-ins.

---

## Entradas

| Campo             | Tipo  | Obligatorio | Validaciones                                    |
| ----------------- | ----- | ----------- | ----------------------------------------------- |
| Fecha de inicio   | Fecha | Sí          | Formato válido, no anterior a la fecha actual   |
| Fecha de fin      | Fecha | No          | Formato válido, posterior a la fecha de inicio  |

---

## Proceso

1. El recepcionista o administrador accede al módulo de disponibilidad o al proceso de creación de reserva.
2. El sistema recibe el rango de fechas proporcionado.
3. El sistema consulta el estado actual de todas las unidades registradas.
4. El sistema determina, para cada unidad, si está disponible, ocupada o en mantenimiento durante el período indicado.
5. El sistema retorna el listado de unidades con su estado de disponibilidad para el rango consultado.

---

## Salidas

| Escenario                        | Resultado                                                                  |
| -------------------------------- | -------------------------------------------------------------------------- |
| Consulta exitosa con resultados  | Listado de unidades con su estado de disponibilidad para el período indicado |
| No hay unidades disponibles      | El sistema informa que no hay unidades disponibles en el período consultado |
| Rango de fechas inválido         | El sistema informa el error en las fechas proporcionadas                   |

---

## Endpoints asociados

Ninguno

---

## Reglas de negocio

- RN-012.1: Una unidad se considera disponible únicamente si no tiene reservas activas ni está en estado de mantenimiento para el período consultado.
- RN-012.2: La disponibilidad debe reflejarse en tiempo real, considerando todas las reservas y estadías activas existentes en el sistema.

---

## HUs relacionadas

- HU-005 — Check-in y Check-out
- HU-009 — Registro de Unidades
