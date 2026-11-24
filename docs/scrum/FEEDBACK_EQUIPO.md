# 👥 Feedback de Equipo, Roles y Asignación de Tareas

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Programa:** Análisis y Desarrollo de Software (ADSO) — SENA  
**Ficha:** Trimestre 6  
**Fecha de Evaluación:** Noviembre 2026  

---

## 1. Estructura del Equipo y Matriz RACI

Para garantizar un flujo de trabajo ordenado y evitar solapamientos o cuellos de botella, el equipo adoptó la matriz **RACI** (Responsible, Accountable, Consulted, Informed):

| Integrante | Rol en el Proyecto | Especialidad Principal | Responsabilidades Clave |
|---|---|---|---|
| **David López** | Scrum Master & Desarrollador Full-Stack | Gestión Ágil, React, Python | - Facilitación de ceremonias ágiles (Daily, Planning, Retrospectivas).<br>- Remoción de impedimentos del equipo.<br>- Desarrollo de vistas en React y apoyo en endpoints del Backend. |
| **José Miguel Chico** | Diseñador UI/UX & Frontend Lead | React 18, Vite, CSS Design System, UI/UX | - Diseño visual completo, paleta de colores corporativa y maquetación de paneles.<br>- Organización de galerías fotográficas de apartamentos y áreas comunes.<br>- Optimización de la experiencia de usuario (UX) en recepción y vistas públicas.<br>- Integración de APIs REST con `fetch` nativo (`api/client.js`) y soporte colaborativo en backend. |
| **Maicol Mayor** | Backend Lead & QA | Python, FastAPI, PostgreSQL, Pytest | - Arquitectura principal de la API REST y transacciones ACID.<br>- Diseño del Plan de Pruebas formal.<br>- Automatización de 118 casos de prueba unitarios en backend.<br>- Reporte y seguimiento de defectos de software. |
| **Sebastián Parada** | Base de Datos Inicial, DevOps & Seguridad | PostgreSQL, Docker Compose, JWT, Git | - Modelado relacional inicial y creación de tablas/esquemas DDL en PostgreSQL.<br>- Contenedorización de microservicios con Docker Compose.<br>- Manejo de variables de entorno y seguridad JWT/RBAC.<br>- Gestión de ramas en Git (`main`, `develop`, `feature/*`). |
| **Ashly Echeverri** | Product Owner & Requisitos Lead | Requisitos de Software, Trazabilidad, SCRUM | - Definición y redacción de las 15 Historias de Usuario.<br>- Criterios de aceptación (Gherkin / Given-When-Then).<br>- Matriz de trazabilidad de requisitos (RFs y RNFs).<br>- Validación y aprobación de entregables en Sprint Reviews. |

---

## 2. Acuerdos de Trabajo del Equipo (Team Working Agreements)

1. **Gestión de Ramas (Git Flow Simplificado):**
   - La rama `main` contiene únicamente código estable y probado apto para producción.
   - La rama `develop` es la rama de integración continua del equipo.
   - Cada tarea nueva se desarrolla en una rama `feature/HU-XXX-descripcion` o `test/modulo-XXX`.
   - Ningún código entra a `develop` sin pasar los tests automatizados.
2. **Comunicación Diaria:**
   - Sincronización diaria rápida (15 minutos) para responder: ¿Qué hice ayer? ¿Qué haré hoy? ¿Tengo algún bloqueo?
3. **Manejo de Errores y Bloqueos:**
   - Si un integrante se encuentra bloqueado por más de 1 hora en un problema técnico, solicita apoyo directo al líder técnico correspondiente.

---

## 3. Matriz de Evaluación Cruzada y Feedback 360°

Durante el cierre de los Sprints, el equipo realizó una evaluación de desempeño colaborativo con el objetivo de promover la mejora continua:

### 🌟 Fortalezas Identificadas del Equipo
- **Liderazgo Visual y Experiencia de Usuario (UX/UI):** José Miguel Chico asumió el liderazgo del diseño visual, logrando una estética moderna y profesional: unificó la paleta cromática corporativa (`#d91a2a` carmesí, `#0f172a` slate nocturno, `#10b981` esmeralda), organizó las galerías de fotos de las 38 unidades y optimizó la disposición de los paneles del PMS para una operación ágil en recepción.
- **Sinergia Full-Stack y Trabajo en Equipo:** La coordinación de David López como Scrum Master facilitó que tanto David como José apoyaran en endpoints del Backend, mientras Maicol Mayor blindó la lógica de negocio y las 118 pruebas automatizadas.
- **Base de Datos Sólida desde el Día 1:** El diseño relacional inicial y los contenedores de Docker estructurados por Sebastián Parada evitaron problemas de consistencia en PostgreSQL.
- **Alineación con el Negocio:** Ashly Echeverri, en su rol de Product Owner, mantuvo los requisitos y las 15 Historias de Usuario perfectamente alineadas con las necesidades reales de un apartahotel.

### 💡 Oportunidades de Mejora Superadas
- En el inicio del proyecto, las discrepancias en los formatos de fecha (`DD/MM/YYYY` vs `YYYY-MM-DD`) generaron fallas en el motor de reservas. Se resolvió estandarizando el formato **ISO-8601 (`YYYY-MM-DD`)** tanto en base de datos como en componentes de React.
- La gestión de estilos CSS se encontraba dispersa en hojas sueltas. Se organizó un Design System propio en CSS (`frontend/src/index.css`) con variables corporativas estándar (`#d91a2a` carmesí, `#0f172a` slate nocturno, `#10b981` esmeralda para disponibilidad).

---

## 4. Registro de Horas y Esfuerzo Dedicado

| Fase / Sprint | Horas Planificadas | Horas Reales Invertidas | Desviación | Justificación |
|---|:---:|:---:|:---:|---|
| **Sprint 1** | 120 h | 114 h | -5% | Buena velocidad en el setup inicial con FastAPI y Docker. |
| **Sprint 2** | 120 h | 128 h | +6.6% | El algoritmo de solapamiento de fechas requirió pruebas exhaustivas. |
| **Sprint 3** | 130 h | 136 h | +4.6% | Refactorización de componentes visuales y automatización de 96 tests iniciales (ampliados luego a 118). |
| **Total Proyecto** | **370 h** | **378 h** | **+2.1%** | **Excelente precisión en la estimación global del proyecto.** |
