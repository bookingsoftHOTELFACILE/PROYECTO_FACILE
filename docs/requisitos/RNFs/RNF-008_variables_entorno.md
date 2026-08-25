# RNF-008 — Variables de Entorno

<!--
  ¿Qué? Requisito no funcional que define el uso de variables de entorno para la configuración sensible.
  ¿Para qué? Proteger la información de configuración crítica del sistema separándola del código fuente.
  ¿Impacto? Sin variables de entorno, las credenciales y configuraciones sensibles podrían quedar expuestas en el código.
-->

---

## Identificación

| Campo             | Valor                          |
| ----------------- | ------------------------------ |
| **ID**            | RNF08                          |
| **Referencia**    | RNF-008                        |
| **Nombre**        | Variables de Entorno           |
| **Categoría**     | Configuración y Seguridad      |
| **Prioridad**    | Alta |
| **Estado**       | Implementado y probado |
| **Fecha**        | 2026-08-22 |

---

## Descripción

La aplicación de BookingSoft deberá utilizar variables de entorno para gestionar toda la configuración sensible del sistema. Los valores que constituyan información sensible (como credenciales de acceso, cadenas de conexión, claves y parámetros de configuración críticos) no deben estar incluidos directamente en el código fuente del proyecto.

---

## Justificación

El uso de variables de entorno permite separar la configuración sensible del código fuente, evitando que dicha información quede expuesta en repositorios de control de versiones o sea accesible para personas no autorizadas. Este mecanismo también facilita la configuración diferenciada del sistema en distintos entornos (desarrollo, prueba, producción).

---

## Criterios de cumplimiento

- La configuración sensible de BookingSoft no está incluida directamente en el código fuente.
- La aplicación lee los valores de configuración sensible desde variables de entorno en tiempo de ejecución.
- Los archivos que contengan valores de variables de entorno no son versionados en el repositorio del proyecto.

---

## Restricciones / Consideraciones

- Los nombres específicos de las variables de entorno del proyecto serán definidos durante el diseño técnico.
- Se recomienda mantener una plantilla de variables de entorno en el repositorio (sin valores reales) para facilitar la configuración inicial del sistema por parte del equipo.
- Este requisito complementa al RNF07 (Contenedorización), ya que los contenedores Docker también pueden recibir variables de entorno en su configuración de ejecución.

---

## Verificación

- Verificar que el código fuente no contenga valores sensibles embebidos directamente.
- Verificar que la aplicación funciona correctamente cuando se configuran las variables de entorno necesarias.
- Verificar que el repositorio no incluya archivos con valores reales de variables de entorno sensibles.

---

## RF relacionados

- RF-004 — Inicio de Sesión
- RF-007 — Validación de Credenciales
- RF-008 — Cifrado de Contraseñas
