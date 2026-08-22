# RF-005 — Cierre de Sesión

<!--
  ¿Qué? Requisito funcional que define el proceso de finalización de la sesión activa de un usuario.
  ¿Para qué? Formalizar la necesidad de que los usuarios puedan salir de forma segura del sistema.
  ¿Impacto? Sin este requisito, las sesiones quedarían abiertas indefinidamente, representando un riesgo de seguridad.
-->

---

## Identificación

| Campo            | Valor               |
| ---------------- | ------------------- |
| **ID**           | RF-005              |
| **Nombre**       | Cierre de Sesión    |
| **Módulo**       | Módulo de Usuarios  |
| **Prioridad**    | Alta |
| **Estado**       | Implementado sin prueba automatizada |
| **Fecha**        | 2026-08-22 |

---

## Descripción

El sistema deberá permitir que cualquier usuario autenticado en BookingSoft finalice su sesión activa de forma explícita. Al cerrar sesión, el sistema debe invalidar el acceso actual del usuario y redirigirlo a la pantalla de inicio de sesión, garantizando que no pueda seguir accediendo a las funcionalidades sin volver a autenticarse.

---

## Entradas

| Campo | Tipo | Obligatorio | Validaciones |
| ----- | ---- | ----------- | ------------ |
| No aplica — la acción se ejecuta sobre la sesión activa del usuario autenticado. | — | — | — |

---

## Proceso

1. El usuario autenticado selecciona la opción de cerrar sesión.
2. El sistema recibe la solicitud de cierre de sesión.
3. El sistema finaliza e invalida la sesión activa del usuario.
4. El sistema redirige al usuario a la pantalla de inicio de sesión.

---

## Salidas

| Escenario            | Resultado                                                         |
| -------------------- | ----------------------------------------------------------------- |
| Cierre exitoso       | Sesión finalizada y redirección a la pantalla de inicio de sesión |

---

## Endpoints asociados

`POST /api/auth/logout`

---

## Reglas de negocio

- RN-005.1: Al cerrar sesión, la sesión del usuario debe quedar completamente invalidada en el sistema.
- RN-005.2: Después del cierre de sesión, el usuario no puede acceder a funcionalidades protegidas sin volver a autenticarse.

---

## HUs relacionadas

- HU-002 — Inicio de Sesión
