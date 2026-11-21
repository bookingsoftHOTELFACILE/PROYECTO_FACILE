# 🐞 Reporte de Ejecución de Pruebas y Sistema de Seguimiento de Defectos (Bug Tracker)

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Versión Evaluada:** Release v1.0.0 (Trimestre 6 ADSO)  
**Fecha de Reporte:** Noviembre 2026  
**Responsable de QA:** Maicol Mayor  
**Revisores de Correcciones:** Maicol Mayor (Backend) y José Miguel Chico (Frontend / UX)  

---

## 1. Resumen de Ejecución de Pruebas

Durante el ciclo de estabilización del software se ejecutaron las suites de pruebas automatizadas y sesiones de pruebas manuales exploratorias sobre las ramas `develop` y ramas de características (`feature/*`).

- **Total de Pruebas Ejecutadas:** 146 casos automatizados + 15 casos exploratorios manuales.
- **Tasa de Aprobación Final:** **100%**.
- **Defectos Totales Detectados durante el Ciclo:** 8 defectos.
- **Defectos Resueltos y Verificados:** 8 defectos (100% de efectividad de remediación).
- **Defectos Abiertos / Bloqueantes:** 0.

---

## 2. Clasificación de Severidad y Estados del Bug Tracker

El equipo implementó una matriz de priorización estándar de la industria:

| Severidad | Código | Descripción del Impacto |
|---|:---:|---|
| **Crítica (Bloqueante)** | **P1** | Causa caída del sistema, pérdida de datos o bloquea completamente una función vital (ej. no se puede reservar ni loguear). |
| **Alta** | **P2** | Falla severa en la lógica del negocio sin alternativa inmediata (ej. cobro incorrecto de tarifas o sobreventa). |
| **Media** | **P3** | Funcionamiento incorrecto de una característica secundaria o mensajes de validación poco claros. |
| **Baja (Cosmética)** | **P4** | Desalineaciones visuales, errores ortográficos o mejoras de diseño responsivo. |

**Flujo de Estados de un Defecto:**
`Nuevo` ➔ `Asignado` ➔ `En Corrección` ➔ `Resuelto (Patch)` ➔ `Verificado en QA (Cerrado)`.

---

## 3. Matriz Consolidada de Defectos Registrados y Corregidos

| ID Bug | Módulo Afectado | Descripción del Defecto | Severidad | Responsable | Causa Raíz | Solución Aplicada | Estado Final |
|---|---|---|:---:|---|---|---|:---:|
| **BUG-001** | Motor de Reservas | **Permitía solapar reservas el mismo día de entrada.** Dos huéspedes podían reservar la misma suite si la hora de salida no se validaba como límite exclusivo. | **P1 - Crítica** | José Chico | La consulta SQL usaba `>=` y `<=` en lugar de intervalos semiabiertos `(entrada < fecha_fin AND salida > fecha_inicio)`. | Se refactorizó la cláusula de disponibilidad en `reservas_service.py` y se agregaron 4 tests de concurrencia. | ✅ Resuelto y Verificado |
| **BUG-002** | Autenticación JWT | **Retornaba código HTTP 200 en credenciales inválidas.** Cuando la contraseña era errónea, devolvía JSON `{ success: false }` con status 200 en vez de error HTTP. | **P2 - Alta** | Sebastián Parada | Falta de captura con `HTTPException(status_code=401)` en FastAPI. | Se estandarizó el lanzamiento de excepciones HTTP 401 con cabecera `WWW-Authenticate: Bearer`. | ✅ Resuelto y Verificado |
| **BUG-003** | Folio Financiero | **Discrepancia en descuento de 7 noches (off-by-one).** Se aplicaba el descuento a partir de la noche 8 en lugar de la noche 7 inclusive. | **P2 - Alta** | Maicol Mayor | Operador estricto `>` en vez de `>= 7` en la función de pricing. | Se corrigió la condición a `noches >= 7` en `utils/pricing.js` y `services/reservas_service.py`. | ✅ Resuelto y Verificado |
| **BUG-004** | Check-In / Walk-In | **Error 500 al registrar huésped sin segundo apellido.** La base de datos tenía la columna `segundo_apellido` con restricción `NOT NULL`. | **P2 - Alta** | José Chico | Modelo SQLAlchemy no tenía `nullable=True` para campos opcionales del huésped. | Se alteró la tabla y el schema Pydantic para admitir campos nulos opcionales. | ✅ Resuelto y Verificado |
| **BUG-005** | Coworking | **Permitía registrar reserva de sala con hora fin menor a la hora de inicio.** Ej: Iniciar 14:00 y terminar 11:00 am. | **P2 - Alta** | David López | El componente de selector de horas no validaba orden cronológico ascendente. | Validación en frontend y validador de modelo Pydantic `@field_validator('hora_fin')`. | ✅ Resuelto y Verificado |
| **BUG-006** | UI PMS Recepción | **Scroll horizontal en pantallas menores a 1366px.** La tabla de asignación de unidades generaba desbordamiento en laptops de 14 pulgadas. | **P3 - Media** | David López | Contenedor con ancho fijo `min-w-[1200px]` sin `overflow-x-auto`. | Se envolvió la grilla en un contenedor responsive con scroll táctil suave y diseño fluido. | ✅ Resuelto y Verificado |
| **BUG-007** | Ama de Llaves | **Habitaciones no cambiaban a "Limpieza" automáticamente tras el Check-Out.** Quedaban como "Disponibles" de inmediato. | **P2 - Alta** | Sebastián Parada | La función de checkout cambiaba el estado a `Disponible` omitiendo el protocolo de sanitización. | Se insertó el estado intermedio `Limpieza` obligatorio antes de volver a estar disponible. | ✅ Resuelto y Verificado |
| **BUG-008** | Formularios Web | **Icono de calendario no abría el picker nativo en navegadores Chromium.** En Chrome Linux requería clic doble. | **P4 - Baja** | David López | El evento `onClick` del icono no invocaba la API nativa `showPicker()`. | Se vinculó `inputRef.current.showPicker()` al hacer clic en cualquier área del campo. | ✅ Resuelto y Verificado |

---

## 4. Métricas de Calidad del Software

| Clasificación de Severidad | Cantidad de Defectos | Porcentaje del Total | Estado de Resolución |
|---|:---:|:---:|:---:|
| **P1 — Crítica (Bloqueante)** | 1 | 12.5% | 100% Resuelto |
| **P2 — Alta** | 5 | 62.5% | 100% Resuelto |
| **P3 — Media** | 1 | 12.5% | 100% Resuelto |
| **P4 — Baja (Cosmética)** | 1 | 12.5% | 100% Resuelto |
| **Total Defectos Reportados** | **8** | **100%** | **8 de 8 Cerrados** |

- **Tasa de Remediación Global (Resolution Rate):** 100%
- **Tiempo Promedio de Reparación (MTTR):** 3.2 horas por defecto
- **Defectos Abiertos Residuales:** 0 defectos pendientes

---

## 5. Conclusión y Dictamen de Calidad

El sistema **BookingSoft PMS** superó todas las pruebas de regresión posteriores a la aplicación de los parches. Los 8 defectos identificados fueron cerrados y validados mediante tests automatizados en Pytest y Vitest, garantizando que el producto es estable, seguro y cumple a cabalidad con los requisitos para su sustentación.
