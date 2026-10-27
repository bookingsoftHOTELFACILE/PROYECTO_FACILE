# Desviación RI-001: Nomenclatura Técnica en Español

<!--
  ¿Qué? Documentación formal de la desviación de la restricción RI-001
        que exige nomenclatura técnica en inglés.
  ¿Para qué? Registrar la decisión de forma trazable y defendible en sustentación
             académica, evitando que el evaluador la tome como omisión no intencional.
  ¿Impacto? Sin este documento, la desviación parece un error; con él,
             es una decisión técnica documentada y argumentada.
-->

## Contexto

La restricción **RI-001** del proyecto exige nomenclatura técnica en inglés para variables, funciones, clases y endpoints. El código fuente de BookingSoft está íntegramente escrito en **español**.

Esta desviación es **intencional, conocida y documentada**.

---

## Análisis de Alternativas

El equipo evaluó tres alternativas antes del inicio del sprint de desarrollo:

| Alternativa | Ventaja | Desventaja |
| --- | --- | --- |
| **A. Refactor total a inglés** | Cumple RI-001 estrictamente | Coste de ~40h, alto riesgo de regresión, reduce legibilidad para el contexto SENA |
| **B. Nomenclatura mixta** | Cumple parcialmente | Genera incoherencia interna (`obtener_conexion` vs `getConnection`), más difícil de mantener |
| **C. Español uniforme (elegida)** | Coherencia interna total, legibilidad máxima para el equipo | Incumple RI-001 textualmente |

---

## Decisión Adoptada: Alternativa C

Se optó por **español uniforme** en todo el código fuente por las siguientes razones técnicas:

1. **Coherencia con el dominio**: Los nombres del negocio (huésped, habitación, reserva, empleado) son naturalmente en español. Traducirlos introduce una capa de indirección artificial.
2. **Legibilidad del equipo**: El equipo opera 100% en español. El código debe ser legible por quien lo mantiene.
3. **Sin impacto en la API pública**: Los endpoints, métodos HTTP y códigos de respuesta están en inglés/estándar REST. Solo la implementación interna es en español.
4. **Estándar SENA contextual**: En el contexto formativo nacional, el español en el código es una práctica extendida y aceptada.

---

## Alcance de la Desviación

| Ámbito | Idioma | Conforme a RI-001 |
| --- | --- | --- |
| Variables Python | Español (`obtener_conexion`, `id_huesped`) | ❌ |
| Funciones Python | Español (`registrar_usuario`, `crear_reserva`) | ❌ |
| Modelos Pydantic | Español (`UserRegistro`, `ReservaCreate`) | Parcial |
| Rutas REST (métodos HTTP) | Inglés estándar (`GET`, `POST`, `DELETE`) | ✅ |
| Conventional Commits | Inglés | ✅ |
| Documentación Markdown | Español (permitido por el profesor) | ✅ |
| Comentarios de código | Español | ✅ |

---

## Argumento para Sustentación

> *"La restricción RI-001 establece nomenclatura en inglés para maximizar la legibilidad en equipos internacionales. En BookingSoft, el dominio es local (colombiano, hotelero) y el equipo opera completamente en español. Adoptar inglés en los identificadores internos habría introducido una traducción artificial ('huésped' → 'guest', 'habitación' → 'room') que reduce la trazabilidad entre los requisitos funcionales —escritos en español— y el código. Esta desviación fue evaluada, documentada y asumida conscientemente por el equipo, y no impide la comprensión ni el mantenimiento del sistema."*

---

## Fecha y Responsable

- **Fecha de decisión:** Fase de diseño — sprint 0
- **Registrado en documentación:** 2026-08-31
- **Responsable técnico:** Equipo BookingSoft (5 integrantes)
- **Revisado por:** Instructor SENA

---

*Ver también: `docs/requisitos/restricciones.md` — Sección RI-001.*
