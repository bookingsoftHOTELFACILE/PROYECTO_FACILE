# RF-008 — Cifrado de Contraseñas

<!--
  ¿Qué? Requisito funcional que define el almacenamiento seguro de contraseñas mediante cifrado.
  ¿Para qué? Garantizar que las contraseñas de los usuarios nunca queden expuestas en texto plano.
  ¿Impacto? Sin cifrado, una filtración de la base de datos comprometería las credenciales de todo el personal.
-->

---

## Identificación

| Campo            | Valor                      |
| ---------------- | -------------------------- |
| **ID**           | RF-008                     |
| **Nombre**       | Cifrado de Contraseñas     |
| **Módulo**       | Módulo de Usuarios         |
| **Prioridad**    | Alta |
| **Estado**       | Implementado y probado |
| **Fecha**        | 2026-08-22 |

---

## Descripción

El sistema deberá almacenar todas las contraseñas de los usuarios de BookingSoft de forma cifrada mediante bcrypt, garantizando que en ningún momento se guarden ni transmitan en texto plano. Este requisito aplica tanto en el registro de nuevos usuarios como en la modificación de contraseñas existentes.

---

## Entradas

| Campo       | Tipo  | Obligatorio | Validaciones                                      |
| ----------- | ----- | ----------- | ------------------------------------------------- |
| Contraseña  | Texto | Sí          | No vacío, debe cumplir criterios mínimos de seguridad |

---

## Proceso

1. El sistema recibe la contraseña proporcionada por el usuario (en registro o modificación).
2. El sistema aplica el algoritmo de cifrado bcrypt a la contraseña en texto plano.
3. El sistema almacena únicamente el valor cifrado resultante en el registro del usuario.
4. La contraseña en texto plano no es almacenada en ningún componente del sistema.

---

## Salidas

| Escenario                     | Resultado                                                        |
| ----------------------------- | ---------------------------------------------------------------- |
| Contraseña recibida y válida  | Contraseña cifrada y almacenada correctamente en el sistema      |
| Contraseña inválida           | El sistema rechaza el valor e informa sobre los criterios requeridos |

---

## Endpoints asociados

`POST /api/auth/registro`<br>`POST /api/auth/login`

---

## Reglas de negocio

- RN-008.1: Las contraseñas no deben almacenarse en texto plano en ningún componente del sistema.
- RN-008.2: Las contraseñas deben almacenarse utilizando el algoritmo bcrypt.
- RN-008.3: La contraseña nunca debe ser retornada ni expuesta en ninguna respuesta del sistema, ya sea en texto plano o en su forma cifrada.

---

## HUs relacionadas

- HU-001 — Registrar Usuario del Sistema
- HU-002 — Inicio de Sesión
