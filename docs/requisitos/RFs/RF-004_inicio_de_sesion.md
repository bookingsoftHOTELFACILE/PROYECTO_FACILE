# RF-004 — Inicio de Sesión

<!--
  ¿Qué? Requisito funcional que define el proceso de autenticación de usuarios en BookingSoft.
  ¿Para qué? Formalizar la necesidad de que el personal acceda de forma segura al sistema.
  ¿Impacto? Sin este requisito, ningún usuario puede acceder a las funcionalidades del sistema.
-->

---

## Identificación

| Campo            | Valor               |
| ---------------- | ------------------- |
| **ID**           | RF-004              |
| **Nombre**       | Inicio de Sesión    |
| **Módulo**       | Módulo de Usuarios  |
| **Prioridad**    | Alta |
| **Estado**       | Implementado y probado |
| **Fecha**        | 2026-08-22 |

---

## Descripción

El sistema deberá permitir que los usuarios registrados en BookingSoft inicien sesión mediante su correo electrónico y contraseña. Antes de conceder acceso, el sistema debe validar las credenciales y verificar que el usuario se encuentre en estado activo. Una vez autenticado, el sistema debe redirigir al usuario al panel correspondiente a su rol.

---

## Entradas

| Campo              | Tipo          | Obligatorio | Validaciones                       |
| ------------------ | ------------- | ----------- | ---------------------------------- |
| Correo electrónico | Texto / Email | Sí          | Formato de correo válido, no vacío |
| Contraseña         | Texto         | Sí          | No vacío                           |

---

## Proceso

1. El usuario accede a la pantalla de inicio de sesión de BookingSoft.
2. El usuario ingresa su correo electrónico y contraseña.
3. El sistema recibe las credenciales proporcionadas.
4. El sistema valida el formato de los datos recibidos.
5. El sistema verifica que exista un usuario con el correo proporcionado.
6. El sistema compara la contraseña con el valor cifrado almacenado.
7. El sistema verifica que el usuario tenga estado activo.
8. Si todas las validaciones son exitosas, el sistema permite el acceso y redirige al usuario al panel correspondiente a su rol.
9. Si alguna validación falla, el sistema rechaza el acceso e informa al usuario.

---

## Salidas

| Escenario                   | Resultado                                                         |
| --------------------------- | ----------------------------------------------------------------- |
| Credenciales válidas        | Acceso permitido y redirección al panel según el rol del usuario  |
| Credenciales inválidas      | Acceso rechazado, mensaje de error sin revelar el campo incorrecto |
| Usuario inactivo            | Acceso rechazado, el sistema informa que la cuenta está inactiva  |
| Campos incompletos          | El sistema solicita completar los campos obligatorios             |

---

## Endpoints asociados

`POST /api/auth/login`

---

## Reglas de negocio

- RN-004.1: Las credenciales deben validarse antes de conceder acceso al sistema (véase RF-007).
- RN-004.2: Los usuarios con estado inactivo no pueden iniciar sesión, aún si sus credenciales son correctas.
- RN-004.3: El mensaje de error ante credenciales inválidas no debe revelar si el problema es el correo o la contraseña.
- RN-004.4: El acceso concedido debe corresponder únicamente a las funcionalidades autorizadas para el rol del usuario (véase RF-009).

---

## HUs relacionadas

- HU-002 — Inicio de Sesión
