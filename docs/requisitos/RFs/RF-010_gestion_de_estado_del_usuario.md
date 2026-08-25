# RF-010 — Gestión de Estado del Usuario

<!--
  ¿Qué? Requisito funcional que define el control del estado activo/inactivo de los usuarios del sistema.
  ¿Para qué? Permitir al administrador habilitar o deshabilitar el acceso de usuarios sin eliminarlos.
  ¿Impacto? Sin este requisito, la única forma de retirar acceso a un usuario sería eliminarlo, perdiendo su historial.
-->

---

## Identificación

| Campo            | Valor                           |
| ---------------- | ------------------------------- |
| **ID**           | RF-010                          |
| **Nombre**       | Gestión de Estado del Usuario   |
| **Módulo**       | Módulo de Usuarios              |
| **Prioridad**    | Alta |
| **Estado**       | Implementado sin prueba automatizada |
| **Fecha**        | 2026-08-22 |

---

## Descripción

El sistema deberá permitir al administrador gestionar el estado de los usuarios registrados en BookingSoft, habilitando o deshabilitando su acceso al sistema mediante los estados "activo" e "inactivo". El sistema debe registrar usuarios activos e inactivos y utilizar el estado del usuario como criterio para permitir o denegar el inicio de sesión.

---

## Entradas

| Campo                   | Tipo         | Obligatorio | Validaciones                                   |
| ----------------------- | ------------ | ----------- | ---------------------------------------------- |
| Identificador de usuario | Texto       | Sí          | El usuario debe existir en el sistema          |
| Nuevo estado            | Texto / Enum | Sí          | Valor válido: activo / inactivo                |

---

## Proceso

1. El administrador accede al perfil del usuario que desea modificar.
2. El sistema muestra el estado actual del usuario.
3. El administrador selecciona el nuevo estado (activo o inactivo).
4. El administrador confirma el cambio de estado.
5. El sistema actualiza el estado del usuario en el registro.
6. Si el nuevo estado es "inactivo", el sistema invalida cualquier sesión activa del usuario afectado si aplica.
7. El sistema confirma el cambio exitoso.

---

## Salidas

| Escenario                    | Resultado                                                             |
| ---------------------------- | --------------------------------------------------------------------- |
| Cambio de estado exitoso     | El estado del usuario es actualizado y el sistema confirma el cambio  |
| Usuario no encontrado        | El sistema informa que el usuario no existe                           |
| Estado no válido             | El sistema rechaza el cambio e informa los valores permitidos         |

---

## Endpoints asociados

`PATCH /api/empleados/{id}/estado`<br>`POST /api/auth/login`

---

## Reglas de negocio

- RN-010.1: Solo el administrador puede modificar el estado de un usuario.
- RN-010.2: Los estados disponibles son exclusivamente: activo e inactivo.
- RN-010.3: Un usuario con estado inactivo no puede iniciar sesión en el sistema (véase RF-004 y RF-007).
- RN-010.4: Al registrar un nuevo usuario, su estado inicial debe ser "activo" por defecto (véase RF-001).

---

## HUs relacionadas

- HU-001 — Registrar Usuario del Sistema
- HU-004 — Consulta de Usuario Específico
