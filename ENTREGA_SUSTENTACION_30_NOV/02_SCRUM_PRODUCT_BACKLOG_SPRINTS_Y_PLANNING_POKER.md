# 🏃‍♂️ Criterio 2: Informes de Manejo de SCRUM como Pilar de la Metodología Ágil

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Programa:** Análisis y Desarrollo de Software (ADSO) — SENA  
**Fecha de Sustentación:** 30 de Noviembre de 2026  
**Equipo:** David López (Scrum Master), Ashly Echeverri (Product Owner), José Miguel Chico (Frontend Lead & UX), Maicol Mayor (Backend Lead & QA), Sebastián Parada (DB & DevOps)  

---

## 📑 Índice del Informe Scrum
1. [Product Backlog Consolidado y 15 Historias de Usuario Puntuadas](#1-product-backlog-consolidado)
2. [Sesión de Planning Poker Ágil con Serie de Fibonacci](#2-sesión-de-planning-poker-ágil)
3. [Sprint 1: Cimientos de Autenticación, Roles y Catálogo Base](#3-sprint-1)
4. [Sprint 2: Motor Transaccional de Reservas Walk-In y Overbooking](#4-sprint-2)
5. [Sprint 3: Módulos PMS, Folios Contables, Coworking y Limpieza](#5-sprint-3)

---

## 1. Product Backlog Consolidado
# 📋 Product Backlog — Apartahotel Facile (BookingSoft PMS)

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Metodología:** SCRUM / Metodologías Ágiles de Desarrollo de Software  
**Escala de Estimación:** Serie de Fibonacci (1, 2, 3, 5, 8, 13, 21 Story Points)  
**Equipo de Desarrollo ADSO (Equipo Multidisciplinario y Colaborativo):**
- **Product Owner (Requisitos, HUs y Trazabilidad):** Ashly Echeverri
- **Scrum Master & Desarrollador Full-Stack:** David López
- **Diseñador UI/UX & Desarrollador Frontend Lead:** José Miguel Chico
- **Desarrollador Backend Lead, Lógica & QA:** Maicol Mayor
- **Desarrollador Base de Datos Inicial, Seguridad & Docker:** Sebastián Parada

---

## 1. Visión General del Backlog

El **Product Backlog** consolida las 15 Historias de Usuario (HUs) del sistema PMS hotelero, priorizadas por valor para el negocio hotelero (MoSCoW: *Must have, Should have, Could have, Won't have*) y estimadas mediante la técnica de **Planning Poker** con el equipo de desarrollo.

Total de puntos estimados: **93 Story Points (SP)** distribuidos en 3 Sprints de desarrollo de 2 semanas cada uno.

---

## 2. Matriz Consolidada de Historias de Usuario Puntuadas

| Código | Título de la Historia de Usuario | Prioridad MoSCoW | Story Points | Sprint Asignado | Responsable Principal | Estado |
|---|---|---|:---:|:---:|---|:---:|
| **HU-001** | Registro de nuevos usuarios y colaboradores con asignación de rol | MUST | **3 SP** | Sprint 1 | José Chico / Ashly E. | ✅ Terminado |
| **HU-002** | Inicio de sesión seguro con JWT y control de acceso RBAC | MUST | **5 SP** | Sprint 1 | Sebastián Parada | ✅ Terminado |
| **HU-003** | Consulta y listado administrativo de usuarios y colaboradores | SHOULD | **2 SP** | Sprint 1 | Maicol Mayor | ✅ Terminado |
| **HU-004** | Consulta detallada y edición de perfil de colaborador | SHOULD | **3 SP** | Sprint 1 | David López | ✅ Terminado |
| **HU-006** | Configuración de tarifas dinámicas por tipo de unidad y temporadas | MUST | **5 SP** | Sprint 2 | Maicol Mayor | ✅ Terminado |
| **HU-009** | Catálogo y registro de unidades habitacionales (Dúplex, Suites) | MUST | **8 SP** | Sprint 2 | David López / José Chico | ✅ Terminado |
| **HU-005** | Motor de reservas presenciales Walk-In, Check-In y Check-Out | MUST | **13 SP** | Sprint 2 | José Chico / David López | ✅ Terminado |
| **HU-014** | Disponibilidad en vivo 24/7 y validación de overbooking | MUST | **3 SP** | Sprint 2 | Maicol Mayor | ✅ Terminado |
| **HU-007** | Registro de consumos extras, minibar y servicios adicionales al folio | SHOULD | **8 SP** | Sprint 3 | Maicol Mayor | ✅ Terminado |
| **HU-008** | Módulo operativo de limpieza, ama de llaves y mantenimiento | SHOULD | **5 SP** | Sprint 3 | Sebastián Parada | ✅ Terminado |
| **HU-010** | Gestión financiera, liquidación de depósitos y folios contables | MUST | **13 SP** | Sprint 3 | José Chico | ✅ Terminado |
| **HU-011** | Control de inventario operativo y alertas de reposición | COULD | **5 SP** | Sprint 3 | Ashly Echeverri | ✅ Terminado |
| **HU-012** | Notificaciones automáticas de confirmación y claves digitales | COULD | **8 SP** | Sprint 3 | Sebastián Parada | ✅ Terminado |
| **HU-013** | Módulo de reservas de salas de juntas y espacios de Coworking | SHOULD | **8 SP** | Sprint 3 | David López | ✅ Terminado |
| **HU-015** | Dashboard gerencial, métricas de ocupación y reportes PMS | SHOULD | **7 SP** | Sprint 3 | David López / José Chico | ✅ Terminado |

**Totales por Sprint:**
- **Sprint 1 (Fundamentos, Autenticación y Modelado):** 13 Story Points
- **Sprint 2 (Inventario Habitacional, Reservas y Check-In/Out):** 29 Story Points
- **Sprint 3 (Folio Contable, Coworking, Mantenimiento y Cierre):** 51 Story Points (con 2 desarrolladores dedicados en paralelo)

---

## 3. Criterios de Aceptación Globales (Definition of Done - DoD)

Para que una Historia de Usuario se considere formalmente **Done (Terminada)**, debe cumplir:
1. **Código fuente limpio:** Cumplir lineamientos de PEP 8 (Python) y ESLint/Prettier (React).
2. **Pruebas automatizadas:** El backend debe pasar sus tests unitarios en Pytest con aserciones sobre estados HTTP y lógica de negocio.
3. **Persistencia verificada:** Operaciones CRUD ejecutadas contra PostgreSQL sin errores de integridad referencial.
4. **Seguridad RBAC:** Endpoints protegidos según la matriz de roles (Administrador, Recepcionista, Ama de llaves, Mantenimiento).
5. **Interfaz responsiva:** Pantallas funcionales en desktop y móvil sin scroll horizontal indeseado y con diseño cohesivo.
6. **Revisión por pares (Code Review):** Aprobación mediante Pull Request en la rama `develop` antes de integración.


---

## 2. Sesión de Planning Poker Ágil
# 🃏 Informe de Planning Poker — Estimación Ágil de Historias de Usuario

**Proyecto:** BookingSoft PMS (Apartahotel Facile)  
**Fecha de Sesión:** Inicio de Ciclo de Desarrollo (Semana 1)  
**Facilitador (Scrum Master):** David López  
**Product Owner:** Ashly Echeverri  
**Participantes:** David López, José Miguel Chico, Maicol Mayor, Sebastián Parada, Ashly Echeverri  
**Técnica:** Planning Poker Ágil con cartas de la Secuencia de Fibonacci: **[1, 2, 3, 5, 8, 13, 21]**

---

## 1. Definición del Valor de Referencia (Baseline Story)

Para calibrar la escala del equipo, se eligió una historia base de complejidad mínima y conocida:
- **Historia Base (1 punto):** Modificar un mensaje informativo de pie de página en la vista web.
- **Historia de 2 puntos:** `HU-003: Consulta y listado de usuarios` (lectura paginada en BD con filtro simple).
- **Historia de referencia de 13 puntos (Épica / Gran Esfuerzo):** `HU-005: Check-In / Check-Out y asignación de unidades` (involucra bloqueo transaccional en PostgreSQL, prevención de overbooking, cambios de estado en tiempo real y UI interactiva de selección de habitación).

---

## 2. Registro de Rondas de Votación y Discusión Técnica

A continuación se detalla la bitácora de votación en donde se registraron las divergencias y el consenso final:

### HU-001: Registro de Nuevos Colaboradores y Usuarios
- **Votos Ronda 1:**
  - José Chico: 3 SP
  - Maicol Mayor: 3 SP
  - Sebastián Parada: 5 SP (argumentó necesidad de validar hash de contraseña con Bcrypt y formato de correo regex)
  - David López: 2 SP (consideraba que el formulario React era directo)
- **Discusión:** Sebastián explicó que la validación estricta de contraseñas y unicidad de documento de identidad en PostgreSQL aumentaba la complejidad del backend.
- **Consenso Ronda 2:** **3 SP** (Se acordó usar esquemas de validación nativos de Pydantic).

---

### HU-002: Autenticación JWT y Control de Roles (RBAC)
- **Votos Ronda 1:**
  - José Chico: 5 SP
  - Maicol Mayor: 5 SP
  - Sebastián Parada: 8 SP
  - David López: 3 SP
- **Discusión:** La persistencia del token en `localStorage`, el manejo de errores HTTP en el cliente `fetch` (`api/client.js`) y el cierre de sesión si el token expira requerían un flujo ordenado.
- **Consenso Ronda 2:** **5 SP**

---

### HU-005: Motor de Reservas Walk-In, Check-In y Check-Out
- **Votos Ronda 1:**
  - José Chico: 13 SP
  - Maicol Mayor: 13 SP
  - Sebastián Parada: 21 SP (propuso dividir en dos historias por la complejidad de cerraduras y pagos)
  - David López: 13 SP
- **Discusión:** La historia comprende validación de solapamiento de fechas `[fecha_entrada, fecha_salida]`, cambio de estado de habitación a "Ocupada", generación de token de acceso y cálculo de cotización en vivo con impuestos. Es la historia núcleo del negocio.
- **Consenso Ronda 2:** **13 SP** (Se mantuvo en 13 SP manteniendo la lógica de cerraduras en modo desacoplado).

---

### HU-008: Módulo Operativo de Aseo y Mantenimiento
- **Votos Ronda 1:**
  - José Chico: 5 SP
  - Maicol Mayor: 5 SP
  - Sebastián Parada: 5 SP
  - David López: 8 SP (consideraba muchas tarjetas kanban)
- **Consenso Ronda 2:** **5 SP** (Reutilización de componentes modales ya existentes).

---

### HU-010: Gestión Financiera, Depósitos y Folio Contable
- **Votos Ronda 1:**
  - José Chico: 13 SP
  - Maicol Mayor: 8 SP
  - Sebastián Parada: 13 SP
  - David López: 13 SP
- **Discusión:** El balance contable exige consistencia estricta: cargos por noches + consumos de minibar + penalidades - depósitos en garantía = saldo neto. No puede haber discrepancias numéricas en moneda COP.
- **Consenso Ronda 2:** **13 SP**

---

### HU-013: Módulo de Coworking y Salas de Juntas
- **Votos Ronda 1:**
  - José Chico: 8 SP
  - Maicol Mayor: 5 SP
  - Sebastián Parada: 8 SP
  - David López: 8 SP
- **Consenso Ronda 2:** **8 SP** (Franjas horarias por horas en lugar de días completos).

---

## 3. Resumen Consolidado de Velocidad Estimada del Equipo

- **Capacidad estimada del equipo:** 30 - 35 Story Points por Sprint (para 5 integrantes).
- **Velocidad real alcanzada:**
  - **Sprint 1:** 13 SP completados (Sprint de calibración inicial de Docker, DB y Auth).
  - **Sprint 2:** 29 SP completados (Foco en el núcleo de reservas y catálogo).
  - **Sprint 3:** 51 SP completados (Esfuerzo intensificado de cierre y múltiples módulos funcionales).
- **Conclusión de la técnica:** El Planning Poker permitió nivelar la comprensión entre frontend y backend, evitando subestimar la complejidad de las validaciones de base de datos y la gestión de estados asíncronos en React.


---

## 3. Sprint 1
# 🚀 Informe de Sprint 1: Fundamentos, Seguridad y Base de Datos

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Duración del Sprint:** 2 semanas  
**Objetivo del Sprint (Sprint Goal):**  
> *"Establecer la infraestructura base con Docker Compose, diseñar el modelo de datos en PostgreSQL, e implementar la autenticación segura con JWT y control de roles RBAC en FastAPI y React."*

---

## 1. Planificación del Sprint (Sprint Planning)

- **Capacidad del Equipo:** 5 desarrolladores x 6 horas diarias = 60 horas/semana (120 horas total).
- **Compromiso en Story Points:** 13 Story Points.
- **Historias de Usuario comprometidas:**
  1. **HU-001:** Registro de usuarios y colaboradores (3 SP)
  2. **HU-002:** Inicio de sesión con JWT y RBAC (5 SP)
  3. **HU-003:** Consulta y listado de colaboradores (2 SP)
  4. **HU-004:** Detalle y edición de perfiles (3 SP)

---

## 2. Desglose de Tareas Técnicas Asignadas

| ID Tarea | Descripción Técnica | Responsable | Estimado (h) | Estado Final |
|---|---|---|:---:|:---:|
| **T-1.1** | Creación de `docker-compose.yml` con servicios backend, frontend y db | Sebastián Parada | 6h | ✅ Completado |
| **T-1.2** | Modelado inicial de base de datos en PostgreSQL y esquema DDL de tablas | Sebastián Parada | 8h | ✅ Completado |
| **T-1.3** | Endpoints `/api/auth/login` y `/api/auth/register` con hash bcrypt | Maicol Mayor / David López | 10h | ✅ Completado |
| **T-1.4** | Middleware de verificación de Token JWT y validación de roles | Sebastián Parada | 8h | ✅ Completado |
| **T-1.5** | Suite de pruebas unitarias para autenticación (Pytest) | Maicol Mayor | 10h | ✅ Completado |
| **T-1.6** | Formulario de Login en React con estados de error y almacenamiento seguro | José Miguel Chico | 8h | ✅ Completado |
| **T-1.7** | Vista de gestión de colaboradores y asignación de roles en PMS | José Miguel Chico | 10h | ✅ Completado |
| **T-1.8** | Documentación de requisitos y matriz de trazabilidad en Markdown | Ashly Echeverri | 6h | ✅ Completado |

---

## 3. Seguimiento Diario (Daily Scrums Highlights)

- **Día 3:** Sebastián identificó problemas de conexión entre contenedores Docker por resolución de nombres de host (`db` vs `localhost`). Se solucionó apuntando `DB_HOST=db` dentro de la red interna creada automáticamente por Docker Compose.
- **Día 6:** Maicol detectó que el endpoint de login devolvía código 200 con credenciales inválidas si el usuario no existía. Se corrigió inmediatamente a `401 Unauthorized`.
- **Día 9:** José Miguel integró la respuesta del token JWT con el estado global de React (`useAppState.js` / `AppContext.jsx`) manteniendo la sesión activa al recargar la página. Facilitado por David López (Scrum Master).

---

## 4. Revisión del Sprint (Sprint Review)

- **Demostración al Product Owner:**
  - Login funcional con roles predeterminados (`admin`, `recepcion`, `amallaves`, `mantenimiento`).
  - Creación de nuevos usuarios restringida a administradores.
  - Generación de OpenAPI interactivo en `http://localhost:4001/docs`.
- **Resultado:** 100% de las historias aceptadas por la Product Owner Ashly Echeverri.

---

## 5. Retrospectiva del Sprint (Sprint Retrospective)

| Qué funcionó bien (Keep doing) | Qué no funcionó bien (Stop doing) | Compromisos de mejora (Start doing) |
|---|---|---|
| Buena comunicación entre backend y frontend en la definición de schemas JSON. | Tardanza en acordar los nombres de los atributos de la base de datos (camelCase vs snake_case). | Adoptar una convención estricta: `snake_case` para backend/DB y `camelCase` para props React. |
| Cobertura de pruebas unitarias desde el día 1 en el backend. | Dejar la configuración de variables de entorno para el último día. | Centralizar las variables en `.env.example` versionado en el repositorio. |


---

## 4. Sprint 2
# 🏨 Informe de Sprint 2: Catálogo Habitacional, Motor de Reservas y Check-In

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Duración del Sprint:** 2 semanas  
**Objetivo del Sprint (Sprint Goal):**  
> *"Construir el núcleo operativo hotelero: catálogo de apartamentos por tipologías (Dúplex, Dobles, Suites), motor de tarifas y liquidación con prevención de overbooking, y flujo de check-in / check-out presencial."*

---

## 1. Planificación del Sprint (Sprint Planning)

- **Capacidad del Equipo:** 120 horas de desarrollo.
- **Compromiso en Story Points:** 29 Story Points.
- **Historias de Usuario comprometidas:**
  1. **HU-006:** Tarifas por tipo de unidad y temporadas (5 SP)
  2. **HU-009:** Catálogo y registro de unidades habitacionales (8 SP)
  3. **HU-005:** Motor de reservas presenciales Walk-In, Check-In y Check-Out (13 SP)
  4. **HU-014:** Disponibilidad en vivo 24/7 y validación de overbooking (3 SP)

---

## 2. Desglose de Tareas Técnicas Asignadas

| ID Tarea | Descripción Técnica | Responsable | Estimado (h) | Estado Final |
|---|---|---|:---:|:---:|
| **T-2.1** | Esquema PostgreSQL `habitacion` (`schema.sql`) y endpoints en FastAPI (`routes/habitaciones.py`) con tipos, capacidad y precio base | Maicol Mayor | 6h | ✅ Completado |
| **T-2.2** | Algoritmo de validación de fechas contra solapamientos de reservas | Maicol Mayor | 10h | ✅ Completado |
| **T-2.3** | Endpoints de consulta y cambio de estados de habitaciones (`Disponible`, `Ocupada`, `En limpieza`, `Mantenimiento`) | Maicol Mayor | 8h | ✅ Completado |
| **T-2.4** | Endpoint transaccional de creación de reservas presenciales Walk-In | Maicol Mayor / José Chico / David López | 12h | ✅ Completado |
| **T-2.5** | Catálogo público con tarjetas de apartamentos y modal de detalle | José Miguel Chico | 14h | ✅ Completado |
| **T-2.6** | Formulario Walk-In en PMS con selector de fechas interactivo y cálculo COP | José Miguel Chico | 14h | ✅ Completado |
| **T-2.7** | Pruebas de integración sobre fechas ocupadas y validaciones (Pytest) | Maicol Mayor | 10h | ✅ Completado |
| **T-2.8** | Configuración de CORS y proxy Nginx para evitar bloqueos del navegador | Sebastián Parada | 6h | ✅ Completado |
| **T-2.9** | Actualización de matrices de requisitos y pruebas | Ashly Echeverri | 6h | ✅ Completado |

---

## 3. Seguimiento Diario (Daily Scrums Highlights)

- **Día 4:** Maicol alertó que una reserva de salida en fecha `2026-11-15` no debía bloquear una nueva reserva cuya entrada comience el mismo día `2026-11-15` (principio de checkout 11:00 am / checkin 3:00 pm). Se ajustó la consulta SQL de solapamiento.
- **Día 7:** José Miguel diseñó el componente de selección de huéspedes y cotización automática en vivo con desglose de depósito en garantía y tarifas estándar.
- **Día 11:** David López (Scrum Master) coordinó la solución a un fallo en reservas sin huésped asignado: Maicol añadió validación Pydantic que retorna `422 Unprocessable Entity` con mensaje claro.

---

## 4. Revisión del Sprint (Sprint Review)

- **Demostración:**
  - Creación de reserva desde el portal público y desde el panel de recepción PMS.
  - Validación en vivo que impide seleccionar fechas ya ocupadas.
  - Cambio inmediato de estado de la habitación a "Ocupada" al marcar Check-In.
- **Métricas:** 29 SP completados al 100%.

---

## 5. Retrospectiva del Sprint (Sprint Retrospective)

| Qué funcionó bien | Qué no funcionó bien | Compromisos de mejora |
|---|---|---|
| La lógica de negocio quedó blindada en el backend con tests automatizados. | El componente del formulario de reservas en frontend creció demasiado en líneas de código. | Modularizar vistas grandes en subcomponentes (`HuespedesPicker.jsx`, `ModalDetalle.jsx`). |
| Excelente integración de estados entre el catálogo y el PMS. | Algunos commits se hicieron directo a `develop` sin PR formal. | Exigir aprobación de al menos 1 compañero antes de mergear a `develop`. |


---

## 5. Sprint 3
# 📊 Informe de Sprint 3: Folio Contable, Coworking, Mantenimiento y Calidad

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Duración del Sprint:** 2 semanas  
**Objetivo del Sprint (Sprint Goal):**  
> *"Completar los módulos auxiliares de operación hotelera: folio contable y liquidación financiera, módulo de aseo y mantenimiento, reservas de coworking, y consolidar la suite de pruebas unitarias automatizadas."*

---

## 1. Planificación del Sprint (Sprint Planning)

- **Capacidad del Equipo:** 130 horas.
- **Compromiso en Story Points:** 51 Story Points (alta concentración de módulos satélite y consolidación QA).
- **Historias de Usuario comprometidas:**
  1. **HU-007:** Registro de consumos extras y servicios (8 SP)
  2. **HU-008:** Módulo de mantenimiento y ama de llaves (5 SP)
  3. **HU-010:** Gestión financiera y folio contable (13 SP)
  4. **HU-011:** Inventario operativo de suministros (5 SP)
  5. **HU-012:** Notificaciones y llaves digitales Yale (8 SP)
  6. **HU-013:** Espacios de coworking y salas de juntas (8 SP)
  7. **HU-015:** Reportes de ocupación y dashboard gerencial (7 SP)

---

## 2. Desglose de Tareas Técnicas Asignadas

| ID Tarea | Descripción Técnica | Responsable | Estimado (h) | Estado Final |
|---|---|---|:---:|:---:|
| **T-3.1** | Servicio `folio.py` y tablas `pago` / `factura` para liquidación contable | Maicol Mayor / David López | 10h | ✅ Completado |
| **T-3.2** | Módulo de asignación de cuartos a Amas de Llaves y control de aseo | Sebastián Parada | 8h | ✅ Completado |
| **T-3.3** | Módulo de reportes de daños y órdenes de mantenimiento | Sebastián Parada | 8h | ✅ Completado |
| **T-3.4** | Sistema de reserva por horas de Salas de Coworking | José Miguel Chico | 12h | ✅ Completado |
| **T-3.5** | Generación de llaves móviles virtuales y confirmación | Maicol Mayor | 8h | ✅ Completado |
| **T-3.6** | Refactorización de componentes React y reducción de deuda técnica | José Miguel Chico | 14h | ✅ Completado |
| **T-3.7** | Automatización de 96 casos de prueba unitarios e integración en Pytest | Maicol Mayor | 16h | ✅ Completado |
| **T-3.8** | Pruebas de componentes en Vitest (28 tests) | Maicol Mayor / José Chico | 10h | ✅ Completado |
| **T-3.9** | Auditoría interna de seguridad y rotación de credenciales | Sebastián Parada | 6h | ✅ Completado |
| **T-3.10** | Consolidación de documentación final de entrega | Ashly Echeverri | 10h | ✅ Completado |

---

## 3. Seguimiento Diario (Daily Scrums Highlights)

- **Día 3:** José Miguel y Maicol conectaron el `ModalFolioReserva.jsx` para permitir facturar cargos adicionales y liquidar el depósito de garantía de forma dinámica.
- **Día 7:** Maicol llevó la suite de pruebas de 45 a 96 casos en backend, cubriendo todos los casos borde (inyección de fechas inválidas, usuarios duplicados, cálculos de impuestos negativos). David López monitoreó el burndown chart del Sprint.
- **Día 10:** Sebastián completó la auditoría de dependencias y verificó que ningún secreto quede expuesto en el código versionado de Git.

---

## 4. Revisión del Sprint (Sprint Review)

- **Demostración Final:**
  - Sistema 100% integrado: reserva Walk-In → emisión de folio → cargos extra → asignación a limpieza → Check-Out con liquidación.
  - Ejecución en vivo de la suite de pruebas: **96 pruebas en Pytest pasando (100%)** y **28 pruebas en Vitest pasando (100%)**.
- **Aceptación:** Producto aprobado para sustentación final ante el comité evaluador del SENA.

---

## 5. Retrospectiva del Sprint (Sprint Retrospective)

| Qué funcionó bien | Qué no funcionó bien | Compromisos a futuro |
|---|---|---|
| La cohesión del equipo permitió cerrar los 51 SP gracias al trabajo en paralelo de frontend y backend. | La integración de hardware real (IoT) no se pudo completar por falta de equipos físicos en el laboratorio. | Plantear la integración con cerraduras Yale físicas como primera fase de evolución comercial. |
| El backend de FastAPI demostró una velocidad de respuesta sobresaliente (<30ms por petición). | El empaquetado de producción de Vite requirió ajustes de optimización de chunks. | Mantener configuración de Vite con code-splitting para despliegues en la nube. |

