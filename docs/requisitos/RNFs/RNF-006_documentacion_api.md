# RNF-006 — Documentación de la API

<!--
  ¿Qué? Requisito no funcional que define la obligación de documentar la API de BookingSoft.
  ¿Para qué? Garantizar que los endpoints sean comprensibles y utilizables por el equipo de desarrollo y pruebas.
  ¿Impacto? Sin documentación, los desarrolladores del frontend y los evaluadores no pueden interactuar con la API de forma eficiente.
-->

---

## Identificación

| Campo             | Valor                        |
| ----------------- | ---------------------------- |
| **ID**            | RNF06                        |
| **Referencia**    | RNF-006                      |
| **Nombre**        | Documentación de la API      |
| **Categoría**     | Documentación Técnica        |
| **Prioridad**    | Alta |
| **Estado**       | Implementado y probado |
| **Fecha**        | 2026-08-22 |

---

## Descripción

La documentación de la API de BookingSoft deberá generarse utilizando Swagger (OpenAPI), incluido de forma nativa en FastAPI. Esta documentación debe estar disponible durante el desarrollo y permitir a los desarrolladores y evaluadores explorar y probar los endpoints del sistema sin necesidad de herramientas externas adicionales.

---

## Justificación

FastAPI genera automáticamente la interfaz Swagger (OpenAPI) a partir de la definición de los endpoints y los modelos de datos. Esto garantiza que la documentación siempre esté actualizada y sea coherente con la implementación real de la API, reduciendo el esfuerzo manual de documentación y los errores de sincronización.

---

## Criterios de cumplimiento

- La API de BookingSoft expone una interfaz Swagger accesible desde el navegador.
- La documentación Swagger muestra todos los endpoints activos de la API con sus parámetros, tipos de datos y esquemas de respuesta.
- La documentación es generada de forma automática por FastAPI a partir de la definición del código.

---

## Restricciones / Consideraciones

- La URL exacta de acceso a la documentación Swagger quedará definida durante el diseño técnico del sistema.
- Este requisito aplica al entorno de desarrollo. La decisión de exponer o restringir Swagger en producción deberá definirse en una etapa posterior del proyecto.

---

## Verificación

- Acceder a la ruta de documentación de la API (por definir) y verificar que la interfaz Swagger se carga correctamente.
- Verificar que los endpoints documentados corresponden a los RF implementados.

---

## RF relacionados

- Todos los RF que expongan endpoints de la API (RF-001 al RF-015).
