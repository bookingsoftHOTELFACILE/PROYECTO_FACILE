# RNF-007 — Contenedorización

<!--
  ¿Qué? Requisito no funcional que define el uso de contenedores Docker para ejecutar BookingSoft.
  ¿Para qué? Garantizar consistencia en la ejecución del sistema entre diferentes entornos.
  ¿Impacto? Sin contenedorización, la aplicación puede comportarse de forma diferente en los equipos de desarrollo, prueba y producción.
-->

---

## Identificación

| Campo             | Valor                            |
| ----------------- | -------------------------------- |
| **ID**            | RNF07                            |
| **Referencia**    | RNF-007                          |
| **Nombre**        | Contenedorización                |
| **Categoría**     | Despliegue e Infraestructura     |
| **Prioridad**    | Alta |
| **Estado**       | Implementado y probado |
| **Fecha**        | 2026-08-22 |

---

## Descripción

La aplicación de BookingSoft deberá ejecutarse en contenedores mediante Docker para garantizar consistencia entre los diferentes entornos del proyecto (desarrollo, prueba, producción). El uso de contenedores asegura que las dependencias, configuraciones y comportamiento del sistema sean reproducibles independientemente del sistema operativo o equipo donde se ejecute.

---

## Justificación

La contenedorización elimina el problema de inconsistencias entre entornos ("funciona en mi máquina"). Docker permite empaquetar la aplicación junto con todas sus dependencias en una unidad portable y reproducible, facilitando la colaboración del equipo y el despliegue del sistema.

---

## Criterios de cumplimiento

- La aplicación de BookingSoft puede ejecutarse mediante contenedores Docker.
- La configuración necesaria para construir y ejecutar los contenedores está disponible en el repositorio del proyecto.
- El sistema se comporta de manera consistente al ejecutarse en diferentes entornos mediante Docker.

---

## Restricciones / Consideraciones

- La configuración específica de los contenedores (imágenes, nombres, orquestación) será definida durante el diseño técnico e infraestructura del proyecto.
- Este requisito no especifica tecnologías de orquestación adicionales. La definición de herramientas complementarias (si aplica) se realizará en una etapa posterior.

---

## Verificación

- Verificar que la aplicación puede ser construida y ejecutada exitosamente mediante Docker.
- Verificar que el sistema funciona correctamente cuando se ejecuta desde los contenedores definidos.

---

## RF relacionados

- Todos los RF del sistema, ya que la contenedorización afecta la ejecución global de BookingSoft.
