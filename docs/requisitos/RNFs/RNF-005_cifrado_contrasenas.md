# RNF-005 — Cifrado de Contraseñas

<!--
  ¿Qué? Requisito no funcional que define el mecanismo de almacenamiento seguro de contraseñas.
  ¿Para qué? Garantizar que las credenciales de los usuarios del sistema nunca queden expuestas.
  ¿Impacto? Sin cifrado adecuado, una filtración de datos comprometería las credenciales de todo el personal.
-->

---

## Identificación

| Campo             | Valor                      |
| ----------------- | -------------------------- |
| **ID**            | RNF05                      |
| **Referencia**    | RNF-005                    |
| **Nombre**        | Cifrado de Contraseñas     |
| **Categoría**     | Seguridad de Datos         |
| **Prioridad**    | Alta |
| **Estado**       | Implementado y probado |
| **Fecha**        | 2026-08-22 |

---

## Descripción

Las contraseñas de los usuarios de BookingSoft deberán almacenarse cifradas utilizando el algoritmo bcrypt. En ningún momento las contraseñas deben almacenarse, transmitirse ni exponerse en texto plano dentro del sistema, incluyendo las respuestas de la API y los registros del servidor.

---

## Justificación

bcrypt es un algoritmo de hashing diseñado específicamente para el almacenamiento seguro de contraseñas. Su uso protege las credenciales del personal ante posibles filtraciones de datos, ya que el valor almacenado no puede revertirse a la contraseña original de forma directa.

---

## Criterios de cumplimiento

- Las contraseñas de los usuarios almacenadas en la base de datos no están en texto plano.
- Las contraseñas almacenadas corresponden a valores generados por el algoritmo bcrypt.
- Las respuestas de la API no incluyen contraseñas, ni en texto plano ni en su forma cifrada.

---

## Restricciones / Consideraciones

- Este requisito complementa directamente el RF-008 (Cifrado de Contraseñas) y el RF-007 (Validación de Credenciales).
- La verificación de credenciales en el inicio de sesión debe comparar la contraseña ingresada contra el valor bcrypt almacenado, no contra texto plano.

---

## Verificación

- Inspeccionar los registros de usuarios en la base de datos y verificar que el campo de contraseña no contenga texto plano.
- Verificar que el valor almacenado corresponde a un hash bcrypt (reconocible por su prefijo característico).
- Verificar que ninguna respuesta de la API retorne el campo de contraseña.

---

## RF relacionados

- RF-001 — Registro de Usuario
- RF-007 — Validación de Credenciales
- RF-008 — Cifrado de Contraseñas

---

## HUs relacionadas

- HU-001 — Registrar Usuario del Sistema
- HU-002 — Inicio de Sesión
