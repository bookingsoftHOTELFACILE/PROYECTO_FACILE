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
