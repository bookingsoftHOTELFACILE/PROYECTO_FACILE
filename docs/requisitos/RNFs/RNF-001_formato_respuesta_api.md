# RNF-001 — Formato de Respuesta de la API

<!--
  ¿Qué? Requisito no funcional que define el formato de las respuestas de la API de BookingSoft.
  ¿Para qué? Garantizar interoperabilidad y consistencia entre el backend y los clientes que consuman la API.
  ¿Impacto? Sin un formato estándar, los clientes no pueden procesar las respuestas de forma predecible.
-->

---

## Identificación

| Campo             | Valor                          |
| ----------------- | ------------------------------ |
| **ID**            | RNF01                          |
| **Referencia**    | RNF-001                        |
| **Nombre**        | Formato de Respuesta de la API |
| **Categoría**     | Interfaz e Integración         |
| **Prioridad**    | Alta |
| **Estado**       | Implementado y probado |
| **Fecha**        | 2026-08-22 |

---

## Descripción

La API de BookingSoft deberá utilizar el formato JSON (JavaScript Object Notation) para representar todas las respuestas intercambiadas entre el backend y los clientes que consuman sus servicios. Este formato debe aplicarse tanto a las respuestas exitosas como a los mensajes de error.

---

## Justificación

El formato JSON es el estándar más ampliamente adoptado para APIs web. Su uso garantiza que los clientes (frontend React, herramientas de prueba, integraciones futuras) puedan interpretar las respuestas de BookingSoft de manera consistente y predecible, independientemente del contexto de uso.

---

## Criterios de cumplimiento

- Las respuestas de la API de BookingSoft incluyen el encabezado `Content-Type: application/json`.
- El cuerpo de todas las respuestas de la API está estructurado en formato JSON válido.
- Los mensajes de error también son retornados en formato JSON.

---

## Restricciones / Consideraciones

- No se deben retornar respuestas en otros formatos (XML, texto plano, HTML) salvo que exista un requisito explícito que lo justifique.
- FastAPI retorna JSON por defecto, por lo que este requisito es coherente con la tecnología seleccionada para el backend (RNF03).

---

## Verificación

- Inspeccionar el encabezado `Content-Type` de las respuestas de la API y verificar que indique `application/json`.
- Revisar una muestra representativa de respuestas exitosas y de error, confirmando que su cuerpo es JSON válido.

---

## RF relacionados

- Todos los RF que impliquen operaciones de API (RF-001 al RF-015).
