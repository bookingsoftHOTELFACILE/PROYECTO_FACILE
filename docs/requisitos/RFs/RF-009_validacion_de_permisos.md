# RF-009 — Validación de Permisos

<!--
  ¿Qué? Requisito funcional que define el control de acceso a los módulos del sistema según el rol asignado.
  ¿Para qué? Garantizar que cada usuario acceda únicamente a las funcionalidades correspondientes a su rol.
  ¿Impacto? Sin control de permisos, cualquier usuario podría acceder a funciones administrativas o de otros roles.
-->

---

## Identificación

| Campo            | Valor                      |
| ---------------- | -------------------------- |
| **ID**           | RF-009                     |
| **Nombre**       | Validación de Permisos     |
| **Módulo**       | Módulo de Usuarios         |
| **Prioridad**    | Alta |
| **Estado**       | Implementado y probado |
| **Fecha**        | 2026-08-22 |

---

## Descripción

El sistema deberá controlar el acceso a los módulos y funcionalidades de BookingSoft de acuerdo con el rol asignado a cada usuario autenticado. Cada rol debe tener un conjunto de módulos autorizados claramente definido, y el sistema debe impedir el acceso a cualquier módulo que no corresponda al rol del usuario en sesión.

---

## Entradas

| Campo              | Tipo        | Obligatorio | Validaciones                              |
| ------------------ | ----------- | ----------- | ----------------------------------------- |
| Sesión del usuario | Implícita   | Sí          | El usuario debe estar autenticado         |
| Módulo solicitado  | Referencia  | Sí          | Identificador del módulo al que se intenta acceder |

---

## Proceso

1. El usuario autenticado intenta acceder a un módulo o funcionalidad del sistema.
2. El sistema identifica el rol del usuario en sesión.
3. El sistema verifica si el módulo solicitado está dentro del conjunto de módulos autorizados para ese rol.
4. Si el módulo está autorizado, el sistema concede el acceso y muestra el contenido correspondiente.
5. Si el módulo no está autorizado, el sistema bloquea el acceso y muestra un mensaje indicando falta de permisos.

---

## Salidas

| Escenario                               | Resultado                                                               |
| --------------------------------------- | ----------------------------------------------------------------------- |
| Acceso a módulo autorizado              | El sistema concede el acceso y muestra el módulo al usuario             |
| Acceso a módulo no autorizado           | El sistema bloquea el acceso e informa que el usuario no tiene permisos |
| Usuario no autenticado                  | El sistema redirige al usuario a la pantalla de inicio de sesión        |

---

## Endpoints asociados

Varios (`Depends(requiere_rol)`)

---

## Reglas de negocio

- RN-009.1: Cada rol debe tener definido explícitamente el conjunto de módulos y funcionalidades a los que tiene acceso.
- RN-009.2: El sistema no debe mostrar en la interfaz los módulos a los que el usuario no tiene acceso, además de bloquear el acceso directo.
- RN-009.3: El control de permisos debe aplicarse en toda solicitud al sistema, no únicamente en la interfaz visual.

---

## HUs relacionadas

- HU-002 — Inicio de Sesión
- HU-003 — Consulta de Usuarios del Sistema
- HU-004 — Consulta de Usuario Específico
