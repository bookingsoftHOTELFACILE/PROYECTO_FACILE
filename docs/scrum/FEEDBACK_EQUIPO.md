# Feedback de Equipo, Roles y Cómo nos Organizamos

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Equipo:** David López, José Miguel Chico, Maicol Mayor, Sebastián Parada y Ashly Echeverri

---

## 1. Cómo nos dividimos el trabajo

Aunque todos ayudamos en varias partes para sacar adelante el proyecto, cada uno asumió un frente principal para no pisarnos el trabajo:

| Integrante | Rol en el equipo | Qué asumió principalmente |
|---|---|---|
| **David López** | Scrum Master y Desarrollador Full-Stack | Coordinar las tareas del equipo, destrabar problemas entre frontend y backend, desarrollar vistas/componentes en React, pruebas unitarias/RTL/E2E y revisar documentos de entrega. |
| **José Miguel Chico** | Frontend Lead y Diseño UI/UX | Diseño visual completo del portal y del PMS (colores corporativos, galerías de apartamentos, paneles), refactorización de `App.jsx`, flujo de pagos/folios e integración con la API mediante `fetch` (`apiFetch`). |
| **Maicol Mayor** | Backend Lead y QA | Lógica de negocio en `services/` (reservas, descuentos, folio), endpoints en FastAPI, prevención de doble reserva y gran parte de la suite de pruebas en Pytest. |
| **Sebastián Parada** | Base de Datos Inicial, Docker y Seguridad | Tablas iniciales en `schema.sql`, configuración de `docker-compose.yml`, seguridad con JWT y `bcrypt`, roles RBAC y manejo de variables de entorno. |
| **Ashly Echeverri** | Product Owner y Documentación | Redacción de las 15 Historias de Usuario, requisitos funcionales y no funcionales (RF/RNF), matriz de trazabilidad y pruebas de validación. |

---

## 2. Acuerdos de trabajo que nos pusimos

1. **Trabajar por ramas y Pull Requests:** Cada mejora o prueba se hace en su propia rama (`feature/*`, `test/*`, `docs/*`) antes de pasar a `develop` y de ahí a `main`.
2. **Rotación semanal en pruebas:** Cada semana rotamos de capa (Front, API, BD y E2E) revisándonos el código entre compañeros de distinta capa para aprender de todo el proyecto.
3. **Pedir ayuda a tiempo:** Cuando alguien se quedaba atascado con Docker, Git o un error en PostgreSQL, lo revisábamos juntos en lugar de perder el día entero solos.

---

## 3. Retroalimentación sincera del equipo (Lo bueno y lo que costó)

### Lo que más destacamos de trabajar juntos
- **Complemento entre diseño y lógica:** José Miguel le dio una presentación visual muy limpia y moderna al portal y al panel del hotel (paleta carmesí `#d91a2a`, slate `#0f172a` y verde para disponibles), mientras Maicol y Sebastián mantuvieron firme la base de datos y las validaciones del servidor.
- **Apoyo para destrabar el proyecto:** David ayudó a mantener conectado al grupo, probar las pantallas y revisar las entregas semanales, mientras Ashly mantuvo claros los requisitos para no perdernos del objetivo de Apartahotel Facile.
- **Calidad real con pruebas:** Pasar de probar todo "a ojo" a tener pruebas automáticas en Pytest, Vitest y Playwright nos ayudó a detectar errores reales (como endpoints sin permisos o el desfase de fechas UTC) antes de mostrar el sistema.

### Lo que más trabajo nos dio y cómo lo fuimos corrigiendo
- **Al inicio hubo desorden en estilos y archivos grandes:** Todo el frontend estaba metido en un solo `App.jsx` gigante y costaba encontrar dónde cambiar algo sin dañar otra pantalla. Lo corregimos dividiendo el proyecto en `views/`, `components/`, `state/` y un `index.css` ordenado con variables.
- **Sincronizar cambios en Git:** Hubo momentos donde nos adelantábamos trabajando en ramas sin actualizar `develop` o dejábamos PRs pendientes por revisar. Aprendimos a hacer `git pull origin develop` antes de empezar y a revisar los PRs del compañero para no acumular conflictos.
