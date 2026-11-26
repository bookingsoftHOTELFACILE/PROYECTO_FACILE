# 👥 Criterio 13: Feedback de Equipo, Matriz RACI, Trabajo Dividido y Matriz de Rotación

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Programa:** Análisis y Desarrollo de Software (ADSO) — SENA  
**Fecha:** Noviembre 2026  
**Criterio Oficial:** Feedback de equipo, trabajo dividido y asignacion de tareas.

---

## 1. Estructura Organizacional del Equipo y Matriz RACI

Para garantizar un flujo de trabajo balanceado y una división clara de responsabilidades, el equipo adoptó la matriz **RACI**:

| Integrante | Rol Oficial | Especialidad Principal | Responsabilidades Clave |
|---|---|---|---|
| **David López** | Scrum Master & Full-Stack Lead | Gestión Ágil, React, Python | - Facilitación de ceremonias ágiles (Planning, Daily, Retrospectivas).<br>- Remoción de impedimentos técnicos.<br>- Desarrollo de vistas en React y apoyo en endpoints de API. |
| **José Miguel Chico** | Diseñador UI/UX & Frontend Lead | React 18, Vite, CSS Design System, UI/UX | - Diseño visual completo de la interfaz, paleta de colores corporativa y maquetación de paneles.<br>- Organización de galerías fotográficas de apartamentos y áreas comunes.<br>- Optimización de la experiencia de usuario (UX) en recepción y vistas públicas.<br>- Integración de APIs REST con `api/client.js` y soporte en lógica de backend. |
| **Maicol Mayor** | Backend Lead & QA | Python, FastAPI, PostgreSQL, Pytest | - Arquitectura principal de la API REST y transacciones ACID.<br>- Diseño del Plan de Pruebas formal.<br>- Automatización de 133 casos de prueba unitarios en backend.<br>- Reporte y seguimiento de defectos de software. |
| **Sebastián Parada** | Base de Datos Inicial, DevOps & Seguridad | PostgreSQL, Docker Compose, JWT, Git | - Modelado relacional inicial y creación de esquemas DDL en PostgreSQL.<br>- Contenedorización de microservicios con Docker Compose.<br>- Manejo de variables de entorno y seguridad JWT/RBAC.<br>- Gestión de ramas en Git (`main`, `develop`, `feature/*`). |
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

## 3. Matriz de Rotación de Capas (Semanas 1 a 8)

Conforme a las exigencias pedagógicas del bootcamp, cada integrante rotó semanalmente entre las cuatro capas de la arquitectura (**Front**, **API**, **BD**, **E2E**) asegurando que todos dominaran el stack completo:

| Integrante (usuario GitHub) | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 (CI Completo) | S9 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **@Davidlopez2204** (David López) | E2E ([#47](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/47)) | API ([#54](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/54)) | Front ([#60](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/60)) | BD ([#61](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/61)) | E2E ([#62](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/62)) | Front ([#74](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/74)) | Docs ([#70](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/70)) | CI / Docs ([#72](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/72)) | Sustentación |
| **@jocmiguelchicoc** (José Chico) | E2E ([#47](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/47)) | Front ([#50](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/50)) | Front ([#55](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/55)) | API ([#56](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/56)) | BD ([#57](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/57)) | E2E ([#58](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/58)) | E2E ([#59](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/59)) | CI / Backend *(Pendiente PR)* | Sustentación |
| **@maicolmayor23-code** (Maicol Mayor) | E2E ([#47](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/47)) | API ([#52](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/52)) | Front ([#64](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/64)) | E2E ([#65](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/65)) | Front ([#66](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/66)) | API ([#71](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/71)) | E2E ([#73](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/73)) | CI / Integration *(Pendiente PR)* | Sustentación |
| **@xiomaraecheverry** (Ashly Echeverri) | E2E ([#48](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/48)) | BD ([#53](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/53)) | Front ([#63](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/63)) | Front ([#67](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/67)) | API ([#68](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/68)) | BD ([#69](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/69)) | Docs | CI / Frontend *(Pendiente PR)* | Sustentación |
| **@sebasparada** (Sebastián Parada) | E2E ([#47](https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE/pull/47)) | E2E / BD | API | BD | E2E | Front | API | CI / DevOps | Sustentación |

---

## 4. Evolución de Cobertura Semanal

| Semana | Cobertura Frontend (%) | Cobertura Backend (%) | Umbral Configurado en CI |
|---|:---:|:---:|:---:|
| **S1 (Línea Base)** | 0% | 43% | 43% Backend / 0% Frontend |
| **S2** | 100% (`pricing.js`) | 48% | 48% Backend / 10% Frontend |
| **S3** | 100% (`LoginForm.jsx`) | 55% | 55% Backend / 20% Frontend |
| **S4** | 35% | 63% | 63% Backend / 30% Frontend |
| **S5** | 45% | 71% | 71% Backend / 40% Frontend |
| **S6** | 58% | 76% | 76% Backend / 50% Frontend |
| **S7** | 72% | 78% | 78% Backend / 60% Frontend |
| **S8 (CI Completo)** | **100% líneas / 87.6% ramas** | **83.68% (133 tests)** | **>= 80% Backend / >= 80% Frontend** |

---

## 5. Retrospectiva de Sprints y Acciones de Mejora

### Lo que Funcionó Bien:
- La rotación de capas permitió que ningún miembro fuera "dueño único" de un módulo, facilitando el apoyo mutuo cuando alguien tenía un bloqueo.
- El uso de Docker Compose eliminó el clásico problema de "en mi máquina sí funciona".

### Retos Superados:
- La transición de backend síncrono a programación asíncrona en FastAPI y el manejo de tipos de fecha en PostgreSQL.
- La estandarización de localizadores accesibles en Playwright y Testing Library en lugar de selectores frágiles por clase CSS.
