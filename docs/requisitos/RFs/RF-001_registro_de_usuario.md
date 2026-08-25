# RF-001 — Registro de Usuario

<!--
  ¿Qué? Requisito funcional que define el registro de nuevos usuarios en BookingSoft.
  ¿Para qué? Formalizar la funcionalidad de creación de cuentas para el personal del hotel.
  ¿Impacto? Sin este requisito no es posible incorporar usuarios al sistema ni gestionar accesos.
-->

---

## Identificación

| Campo            | Valor                      |
| ---------------- | -------------------------- |
| **ID**           | RF-001                     |
| **Nombre**       | Registro de Usuario        |
| **Módulo**       | Módulo de Usuarios         |
| **Prioridad**    | Alta |
| **Estado**       | Implementado y probado |
| **Fecha**        | 2026-08-22 |

---

## Descripción

El sistema deberá permitir al administrador registrar nuevos usuarios dentro de BookingSoft, incluyendo personal del hotel y huéspedes, proporcionando la información personal y de acceso requerida. Al registrar un usuario, el sistema debe validar la unicidad del documento de identidad y del correo electrónico, asignar un rol por defecto y establecer el estado inicial como activo.

---

## Entradas

| Campo                  | Tipo          | Obligatorio | Validaciones                                            |
| ---------------------- | ------------- | ----------- | ------------------------------------------------------- |
| Tipo de documento      | Texto / Enum  | Sí          | Valor dentro de los tipos definidos por el sistema      |
| Número de documento    | Texto         | Sí          | Único en el sistema, no vacío                           |
| Nombres                | Texto         | Sí          | No vacío, máximo 100 caracteres                         |
| Apellidos              | Texto         | Sí          | No vacío, máximo 100 caracteres                         |
| Fecha de nacimiento    | Fecha         | Sí          | Formato de fecha válido                                 |
| Sexo                   | Texto / Enum  | Sí          | Valor dentro de los definidos por el sistema            |
| Dirección              | Texto         | Sí          | No vacío                                                |
| Teléfono               | Texto         | Sí          | No vacío                                                |
| Correo electrónico     | Texto / Email | Sí          | Formato de correo válido, único en el sistema           |
| Contraseña             | Texto         | Sí          | No vacío, debe cumplir criterios mínimos de seguridad   |

---

## Proceso

1. El administrador accede al formulario de registro de usuarios.
2. El sistema presenta los campos requeridos para el registro.
3. El administrador completa y envía el formulario.
4. El sistema valida que todos los campos obligatorios estén presentes.
5. El sistema verifica que el número de documento no esté registrado previamente.
6. El sistema verifica que el correo electrónico no esté registrado previamente.
7. El sistema cifra la contraseña antes de almacenarla.
8. El sistema crea el registro del usuario con el rol por defecto y estado activo.
9. El sistema confirma el registro exitoso.

---

## Salidas

| Escenario                         | Resultado                                                       |
| --------------------------------- | --------------------------------------------------------------- |
| Registro exitoso                  | Usuario creado en el sistema con estado activo                  |
| Documento de identidad duplicado  | El sistema rechaza el registro e informa que el documento ya existe |
| Correo electrónico duplicado      | El sistema rechaza el registro e informa que el correo ya está en uso |
| Campos obligatorios incompletos   | El sistema solicita completar los campos faltantes              |

---

## Endpoints asociados

`POST /api/auth/registro`

---

## Reglas de negocio

- RN-001.1: El número de documento de identidad debe ser único en todo el sistema.
- RN-001.2: El correo electrónico debe ser único en todo el sistema.
- RN-001.3: La contraseña debe almacenarse cifrada y nunca en texto plano (véase RF-008).
- RN-001.4: Al registrar un usuario, el sistema debe asignarle automáticamente el rol por defecto.
- RN-001.5: Al registrar un usuario, su estado inicial debe ser "activo".

---

## HUs relacionadas

- HU-001 — Registrar Usuario del Sistema
