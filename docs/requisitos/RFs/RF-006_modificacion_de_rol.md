# RF-006 — Modificación de Rol

<!--
  ¿Qué? Requisito funcional que define la capacidad del administrador para cambiar el rol de un usuario.
  ¿Para qué? Permitir adaptar los permisos de acceso del personal según sus funciones reales en el hotel.
  ¿Impacto? Sin este requisito, el administrador no podría ajustar los permisos cuando cambien las responsabilidades del personal.
-->

---

## Identificación

| Campo            | Valor                  |
| ---------------- | ---------------------- |
| **ID**           | RF-006                 |
| **Nombre**       | Modificación de Rol    |
| **Módulo**       | Módulo de Usuarios     |
| **Prioridad**    | Alta |
| **Estado**       | Implementado sin prueba automatizada |
| **Fecha**        | 2026-08-22 |

---

## Descripción

El sistema deberá permitir al administrador cambiar el rol asignado a un usuario registrado en BookingSoft. Los roles disponibles son: Recepcionista, Ama de Llaves, Mantenimiento y Conserje. El cambio de rol debe aplicar los nuevos permisos de acceso al usuario en su siguiente sesión activa.

---

## Entradas

| Campo               | Tipo         | Obligatorio | Validaciones                                                  |
| ------------------- | ------------ | ----------- | ------------------------------------------------------------- |
| Identificador de usuario | Texto   | Sí          | El usuario debe existir en el sistema                         |
| Nuevo rol           | Texto / Enum | Sí          | Valor válido: Recepcionista, Ama de Llaves, Mantenimiento, Conserje |

---

## Proceso

1. El administrador selecciona el usuario al que desea cambiar el rol.
2. El sistema muestra la información actual del usuario, incluyendo su rol vigente.
3. El administrador selecciona el nuevo rol del listado disponible.
4. El administrador confirma el cambio.
5. El sistema valida que el nuevo rol sea un valor permitido.
6. El sistema actualiza el rol del usuario en el registro.
7. El sistema confirma que el cambio fue aplicado exitosamente.

---

## Salidas

| Escenario                  | Resultado                                                             |
| -------------------------- | --------------------------------------------------------------------- |
| Cambio de rol exitoso      | El rol del usuario es actualizado y el sistema confirma el cambio     |
| Rol no válido              | El sistema rechaza el cambio e informa que el rol seleccionado no existe |
| Usuario no encontrado      | El sistema informa que el usuario no existe                           |

---

## Endpoints asociados

`PATCH /api/empleados/{id}/rol`

---

## Reglas de negocio

- RN-006.1: Solo el administrador puede modificar el rol de un usuario.
- RN-006.2: Los roles disponibles son exclusivamente: Recepcionista, Ama de Llaves, Mantenimiento y Conserje. El sistema no debe permitir asignar un rol fuera de este conjunto.
- RN-006.3: Los nuevos permisos asociados al rol modificado se aplicarán en la siguiente sesión del usuario afectado.

---

## HUs relacionadas

- HU-004 — Consulta de Usuario Específico
