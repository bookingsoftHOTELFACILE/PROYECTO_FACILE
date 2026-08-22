# RNF-003 — Tecnología del Servidor

<!--
  ¿Qué? Requisito no funcional que define las tecnologías del backend de BookingSoft.
  ¿Para qué? Establecer Python y FastAPI como el stack tecnológico del servidor.
  ¿Impacto? Define el entorno de desarrollo y las capacidades del backend del sistema.
-->

---

## Identificación

| Campo             | Valor                        |
| ----------------- | ---------------------------- |
| **ID**            | RNF03                        |
| **Referencia**    | RNF-003                      |
| **Nombre**        | Tecnología del Servidor      |
| **Categoría**     | Tecnología del Servidor      |
| **Prioridad**    | Alta |
| **Estado**       | Implementado y probado |
| **Fecha**        | 2026-08-22 |

---

## Descripción

El backend de BookingSoft deberá ser desarrollado utilizando Python como lenguaje de programación y FastAPI como framework web. FastAPI es el responsable de exponer los endpoints de la API, manejar las solicitudes y orquestar la lógica de negocio del sistema.

---

## Justificación

FastAPI es un framework moderno de alto rendimiento para construir APIs con Python. Su adopción garantiza un desarrollo ágil, tipado estático opcional, validación automática de datos y generación integrada de documentación (OpenAPI/Swagger), lo cual es coherente con los demás requisitos no funcionales de BookingSoft (RNF01, RNF06).

---

## Criterios de cumplimiento

- El backend de BookingSoft está implementado en Python.
- El framework utilizado para exponer la API es FastAPI.
- Los endpoints del sistema son accesibles a través de la aplicación FastAPI.

---

## Restricciones / Consideraciones

- No se deben utilizar otros lenguajes o frameworks de backend como tecnología principal (Node.js, Django, Flask, etc.).
- La gestión de dependencias del proyecto Python debe realizarse de forma estructurada (mediante archivo de requisitos o sistema de gestión de paquetes).

---

## Verificación

- Verificar que el código fuente del backend esté escrito en Python.
- Verificar que el servidor se levante mediante FastAPI.
- Verificar que los endpoints de la API respondan correctamente a través de la aplicación FastAPI.

---

## RF relacionados

- Todos los RF que impliquen operaciones de API (RF-001 al RF-015).
