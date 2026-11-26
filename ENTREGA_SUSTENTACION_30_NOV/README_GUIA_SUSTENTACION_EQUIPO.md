# 🎓 Guía Maestra de Sustentación — Apartahotel Facile (BookingSoft PMS)

**Fecha de Sustentación:** 30 de Noviembre de 2026  
**Programa:** Análisis y Desarrollo de Software (ADSO) — SENA | Ficha 3228970  
**Equipo de Trabajo:**
- **David López** (Scrum Master & Full-Stack Lead)
- **José Miguel Chico** (Diseñador UI/UX & Frontend Lead)
- **Maicol Mayor** (Backend Lead & QA Lead)
- **Sebastián Parada** (Base de Datos Inicial, DevOps & Seguridad)
- **Ashly Echeverri** (Product Owner & Requisitos Lead)

---

## 📂 Organización de la Carpeta: Mapeo Directo a los 14 Criterios del Instructor

Esta carpeta contiene la documentación completa y detallada que respalda cada uno de los 14 puntos exigidos en la rúbrica oficial de evaluación:

| # | Criterio de la Rúbrica | Archivo de Respaldo en esta Carpeta |
|:---:|---|---|
| **1** | **Conclusión de la documentación general** *(Diagramas, Modelos, MER, MR, UML, Casos de uso, Diagramas de clases)* | [01_DOCUMENTACION_GENERAL_DIAGRAMAS_MER_UML.md](01_DOCUMENTACION_GENERAL_DIAGRAMAS_MER_UML.md) |
| **2** | **Informes de manejo de Scrum** *(Backlog, Sprints, HUs puntuadas, tareas asignadas, Planning Poker)* | [02_SCRUM_PRODUCT_BACKLOG_SPRINTS_Y_PLANNING_POKER.md](02_SCRUM_PRODUCT_BACKLOG_SPRINTS_Y_PLANNING_POKER.md) |
| **3** | **Inicialización del Backend sin errores ni secciones pendientes** *(Mensajes de error, estados, variables)* | [03_INICIALIZACION_BACKEND_ERRORES_Y_ESTADOS.md](03_INICIALIZACION_BACKEND_ERRORES_Y_ESTADOS.md) |
| **4** | **Buen manejo de variables de entorno y despliegue apropiado** *(Back, Front)* | [04_DESPLIEGUE_DOCKER_Y_VARIABLES_DE_ENTORNO.md](04_DESPLIEGUE_DOCKER_Y_VARIABLES_DE_ENTORNO.md) |
| **5** | **Diagrama de arquitectura que evidencie formaciones previas** | [05_DIAGRAMA_DE_ARQUITECTURA_DEL_SISTEMA.md](05_DIAGRAMA_DE_ARQUITECTURA_DEL_SISTEMA.md) |
| **6** | **Bonificación — IoT:** prototipo funcional, datos al sistema y protocolo explicado | [06_BONIFICACION_IOT_CERRADURAS_DIGITALES_YALE.md](06_BONIFICACION_IOT_CERRADURAS_DIGITALES_YALE.md) |
| **7** | **Plan de pruebas** *(Alcance, niveles, ambiente de prueba separado de desarrollo)* | [07_PLAN_DE_PRUEBAS_SOFTWARE.md](07_PLAN_DE_PRUEBAS_SOFTWARE.md) |
| **8** | **Informe de pruebas unitarias automatizadas** *(Al menos 20 casos distintos)* | [08_INFORME_PRUEBAS_UNITARIAS_AUTOMATIZADAS.md](08_INFORME_PRUEBAS_UNITARIAS_AUTOMATIZADAS.md) |
| **9** | **Reporte de ejecución + defectos registrados en sistema con severidad y estado** | [09_REPORTE_EJECUCION_Y_DEFECTOS.md](09_REPORTE_EJECUCION_Y_DEFECTOS.md) |
| **10** | **Front-end** *(Pantallas, enrutamiento, navegación, colores, UX, UI)* | [10_FRONTEND_VISTAS_RUTAS_UX_UI_Y_PMS.md](10_FRONTEND_VISTAS_RUTAS_UX_UI_Y_PMS.md) |
| **11** | **README actualizado con sección de pruebas; API del 4.º backend documentada** | [11_README_Y_CATALOGO_API_4TO_BACKEND.md](11_README_Y_CATALOGO_API_4TO_BACKEND.md) |
| **12** | **Manejo apropiado del repositorio con ramas y commits** | [12_MANEJO_REPOSITORIO_GIT_FLOW_RAMAS_Y_COMMITS.md](12_MANEJO_REPOSITORIO_GIT_FLOW_RAMAS_Y_COMMITS.md) |
| **13** | **Feedback de equipo, trabajo dividido y asignación de tareas** | [13_FEEDBACK_EQUIPO_Y_MATRIZ_ROTACION.md](13_FEEDBACK_EQUIPO_Y_MATRIZ_ROTACION.md) |
| **14** | **Reflexión comparativa de los 4 backends del programa; deuda técnica documentada** | [14_REFLEXION_COMPARATIVA_4_BACKENDS_Y_DEUDA_TECNICA.md](14_REFLEXION_COMPARATIVA_4_BACKENDS_Y_DEUDA_TECNICA.md) |

---

## 🚀 Guía Rápida para el Día de la Sustentación

### 1. ¿Cómo levantar el proyecto en vivo si el jurado lo pide?
En una sola terminal:
```bash
# Levantar todos los servicios en Docker
docker compose up -d --build

# Verificar que todos estén saludables (healthy)
docker compose ps
```
- **Frontend / PMS:** `http://localhost:3001` (acceso administrativo con `bookingsoft_admin` / `Admin2026!`).
- **Backend Swagger Docs:** `http://localhost:4001/docs`.
- **Healthcheck:** `http://localhost:4001/health`.
- **PgAdmin:** `http://localhost:5050`.

### 2. ¿Cómo correr las pruebas en vivo?
- **Backend (133 tests con 83.68% de cobertura):**
  ```bash
  cd backend
  pipenv run pytest --cov=routes --cov=services --cov=dependencies --cov-fail-under=80 -rs
  ```
- **Frontend (35 tests con 100% de cobertura en líneas):**
  ```bash
  cd frontend
  npm test
  ```

### 3. Banco de Preguntas Clave del Evaluador (Vocero Aleatorio)
1. **¿Por qué FastAPI para el backend en lugar de quedarnos con Express o Spring Boot?**
   - *Respuesta:* Por su velocidad asíncrona nativa, la validación estricta de esquemas con Pydantic (que evita datos corruptos en la BD), y la autogeneración de Swagger (`/docs`), que ahorró semanas de integración con el frontend.
2. **¿Por qué separamos el pipeline de CI en 4 jobs paralelos?**
   - *Respuesta:* Para dar retroalimentación rápida (*fail fast*). Si el frontend tiene un fallo de estilo o cobertura, sabemos en menos de 2 minutos qué falló sin esperar a que corran las 133 pruebas de backend o las pruebas E2E.
3. **¿Cómo garantizan que no haya sobreventas (*overbooking*)?**
   - *Respuesta:* A nivel de base de datos con PostgreSQL mediante transacciones ACID (`SELECT FOR UPDATE`), comprobación de solapamiento de rangos de fechas (`daterange`) y rollback inmediato si se detecta colisión.
4. **¿Cómo funciona el prototipo IoT de cerraduras?**
   - *Respuesta:* Cuando una reserva entra a Check-In, el sistema genera un PIN temporal de 6 dígitos que solo es válido durante las fechas de la estancia. Este código se transmite mediante protocolo seguro MQTT (puerto 8883) hacia el concentrador de cerraduras Yale.
