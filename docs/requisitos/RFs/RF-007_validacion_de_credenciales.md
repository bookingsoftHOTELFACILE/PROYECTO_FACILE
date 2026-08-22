# RF-007 — Validación de Credenciales

<!--
  ¿Qué? Requisito funcional que define la validación de correo y contraseña durante el acceso al sistema.
  ¿Para qué? Garantizar que solo usuarios legítimos con credenciales correctas puedan ingresar a BookingSoft.
  ¿Impacto? Sin validación de credenciales, cualquier persona podría acceder al sistema sin restricción.
-->

---

## Identificación

| Campo            | Valor                        |
| ---------------- | ---------------------------- |
| **ID**           | RF-007                       |
| **Nombre**       | Validación de Credenciales   |
| **Módulo**       | Módulo de Usuarios           |
| **Prioridad**    | Alta |
| **Estado**       | Implementado y probado |
| **Fecha**        | 2026-08-22 |

---

## Descripción

El sistema deberá validar las credenciales de acceso (correo electrónico y contraseña) proporcionadas por el usuario antes de permitir el ingreso a BookingSoft. La validación debe verificar la existencia del usuario, la coincidencia de la contraseña con el valor almacenado de forma cifrada, y el estado activo de la cuenta. Este requisito es parte integral del proceso de inicio de sesión (RF-004).

---

## Entradas

| Campo              | Tipo          | Obligatorio | Validaciones                       |
| ------------------ | ------------- | ----------- | ---------------------------------- |
| Correo electrónico | Texto / Email | Sí          | Formato de correo válido, no vacío |
| Contraseña         | Texto         | Sí          | No vacío                           |

---

## Proceso

1. El sistema recibe el correo electrónico y la contraseña proporcionados por el usuario.
2. El sistema verifica que el correo electrónico tenga un formato válido.
3. El sistema busca en el registro de usuarios el correo proporcionado.
4. Si el correo no existe, el sistema rechaza el acceso.
5. Si el correo existe, el sistema compara la contraseña ingresada con el valor cifrado almacenado.
6. Si la contraseña no coincide, el sistema rechaza el acceso.
7. Si la contraseña coincide, el sistema verifica que el estado del usuario sea activo.
8. Si el estado es inactivo, el sistema rechaza el acceso.
9. Si todas las validaciones son exitosas, el sistema autoriza el proceso de acceso.

---

## Salidas

| Escenario                        | Resultado                                                        |
| -------------------------------- | ---------------------------------------------------------------- |
| Credenciales válidas y activo    | Acceso autorizado para continuar con el inicio de sesión         |
| Correo no registrado             | Acceso rechazado con mensaje genérico de error en credenciales   |
| Contraseña incorrecta            | Acceso rechazado con mensaje genérico de error en credenciales   |
| Usuario inactivo                 | Acceso rechazado con mensaje indicando que la cuenta está inactiva |

---

## Endpoints asociados

`POST /api/auth/login`

---

## Reglas de negocio

- RN-007.1: El mensaje de error ante credenciales inválidas no debe revelar cuál de los dos campos (correo o contraseña) es incorrecto.
- RN-007.2: La validación de la contraseña debe compararse contra el valor cifrado almacenado en el sistema, nunca contra texto plano.
- RN-007.3: Un usuario con estado inactivo no puede ser autenticado, incluso si sus credenciales son correctas.

---

## HUs relacionadas

- HU-002 — Inicio de Sesión
