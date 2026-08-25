# RF-003 — Consulta de Usuario Específico

<!--
  ¿Qué? Requisito funcional que define la consulta del detalle de un usuario individual.
  ¿Para qué? Permitir al administrador revisar la información completa de un usuario concreto.
  ¿Impacto? Sin este requisito no es posible administrar cuentas individuales de personal.
-->

---

## Identificación

| Campo            | Valor                          |
| ---------------- | ------------------------------ |
| **ID**           | RF-003                         |
| **Nombre**       | Consulta de Usuario Específico |
| **Módulo**       | Módulo de Usuarios             |
| **Prioridad**    | Alta |
| **Estado**       | Pendiente |
| **Fecha**        | 2026-08-22 |

---

## Descripción

El sistema deberá permitir consultar la información completa y detallada de un usuario específico registrado en BookingSoft, identificándolo por su número de documento de identidad. La consulta debe retornar todos los campos del perfil del usuario registrado en el sistema.

---

## Entradas

| Campo               | Tipo   | Obligatorio | Validaciones                   |
| ------------------- | ------ | ----------- | ------------------------------ |
| Número de documento | Texto  | Sí          | No vacío, debe existir en el sistema |

---

## Proceso

1. El administrador selecciona un usuario del listado o ingresa su número de documento.
2. El sistema busca el usuario por el identificador proporcionado.
3. Si el usuario existe, el sistema retorna toda su información de perfil.
4. Si el usuario no existe, el sistema informa que no fue encontrado.

---

## Salidas

| Escenario                 | Resultado                                                                      |
| ------------------------- | ------------------------------------------------------------------------------ |
| Usuario encontrado        | Información completa del usuario (documento, nombre, correo, rol, estado, etc.) |
| Usuario no encontrado     | El sistema informa que el usuario no existe en el sistema                      |

---

## Endpoints asociados

Ninguno

---

## Reglas de negocio

- RN-003.1: Solo el administrador puede consultar el perfil completo de cualquier usuario del sistema.
- RN-003.2: La contraseña nunca debe ser retornada ni visualizada en la consulta de perfil.

---

## HUs relacionadas

- HU-004 — Consulta de Usuario Específico
