# RNF-004 — Tecnología del Cliente

<!--
  ¿Qué? Requisito no funcional que define las tecnologías del frontend de BookingSoft.
  ¿Para qué? Establecer React y JavaScript como el stack del cliente web.
  ¿Impacto? Define el entorno de desarrollo de la interfaz de usuario del sistema.
-->

---

## Identificación

| Campo             | Valor                        |
| ----------------- | ---------------------------- |
| **ID**            | RNF04                        |
| **Referencia**    | RNF-004                      |
| **Nombre**        | Tecnología del Cliente       |
| **Categoría**     | Tecnología del Cliente       |
| **Prioridad**    | Alta |
| **Estado**       | Implementado y probado |
| **Fecha**        | 2026-08-22 |

---

## Descripción

El frontend de BookingSoft deberá ser desarrollado utilizando React como biblioteca de interfaz de usuario y JavaScript como lenguaje de programación. La interfaz visual del sistema, incluyendo los módulos de usuarios, reservas y demás funcionalidades, deberá construirse sobre esta tecnología.

---

## Justificación

React es una biblioteca ampliamente adoptada para el desarrollo de interfaces de usuario interactivas y reactivas. Su combinación con JavaScript permite construir aplicaciones web modernas que consuman eficientemente la API de BookingSoft, manteniendo coherencia con la arquitectura cliente-servidor definida para el proyecto.

---

## Criterios de cumplimiento

- El código fuente del frontend está desarrollado en JavaScript utilizando React.
- La interfaz de usuario de BookingSoft es servida como una aplicación React.
- Las interacciones del usuario con el sistema se procesan a través de la aplicación React.

---

## Restricciones / Consideraciones

- Este requisito establece React con JavaScript como tecnología base del cliente. Cualquier variación (como TypeScript) deberá estar respaldada por un requisito formal adicional.
- No se deben utilizar otros frameworks o bibliotecas como tecnología principal del cliente (Angular, Vue.js, etc.).

---

## Verificación

- Verificar que el código fuente del frontend esté escrito en JavaScript con React.
- Verificar que la aplicación cliente se comunique correctamente con la API de BookingSoft.

---

## RF relacionados

- Todos los RF que impliquen interacción desde la interfaz de usuario (RF-001 al RF-015).
