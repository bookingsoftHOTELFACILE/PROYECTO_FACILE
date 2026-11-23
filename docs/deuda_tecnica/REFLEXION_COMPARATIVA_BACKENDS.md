# Reflexión Comparativa de los 4 Backends y Deuda Técnica

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Programa:** Análisis y Desarrollo de Software (ADSO) — SENA  
**Autores:** David López, José Chico, Maicol Mayor, Sebastián Parada y Ashly Echeverri

---

## 1. Nuestra Experiencia con los Backends a lo Largo de los Trimestres

A lo largo de la formación en el SENA hemos aprendido a trabajar con diferentes tecnologías para el backend según lo que nos fueron enseñando en cada trimestre:

1. **Trimestre 3 — Java con Spring Boot:**  
   Fue nuestro primer acercamiento a un backend empresarial robusto. Aprendimos a trabajar con Java, Programación Orientada a Objetos y la estructura por capas (Controllers, Services, Repositories). Al principio fue bastante pesado y retador por la cantidad de archivos, anotaciones y configuraciones que exige Java, pero nos ayudó a entender la importancia del orden y el tipado fuerte.

2. **Trimestre 5 (El trimestre pasado) — Node.js con Express (SQL):**  
   Trabajar con JavaScript en el backend nos pareció mucho más ágil y directo que Java. Con Express pudimos crear rutas y recibir peticiones HTTP de forma rápida y sencilla, sin tantas carpetas ni tanta configuración previa.

3. **Trimestre 5 (El trimestre pasado) — Backend Node.js con MongoDB (NoSQL):**  
   Aquí conocimos las bases de datos no relacionales (NoSQL) conectadas desde nuestro backend. Fue una experiencia interesante porque no teníamos que definir tablas fijas ni columnas estrictas; simplemente guardábamos la información en formato JSON/documentos. Nos sirvió para entender cuándo conviene una base de datos flexible y cuándo se necesita una relacional fija.

4. **Trimestre 6 (Este proyecto final) — Python con FastAPI:**  
   Para BookingSoft utilizamos FastAPI junto con PostgreSQL. La experiencia fue muy positiva: la sintaxis de Python es muy clara y fácil de leer, la validación de datos con Pydantic evita que lleguen datos dañados a la base de datos, y lo que más nos gustó fue que genera la documentación interactiva de Swagger solita (`/docs`), lo que nos facilitó conectar las pantallas con el servidor.

---

## 2. Comparación Sencilla de los 4 Backends

| Aspecto | 1. T3: Java + Spring Boot | 2. T5: Node.js + Express | 3. T5: Node.js + MongoDB | 4. T6: Python + FastAPI (BookingSoft) |
|---|---|---|---|---|
| **Lenguaje** | Java (POO y tipado estricto) | JavaScript | JavaScript | Python 3.11 |
| **Base de datos** | Relacional (SQL / JPA) | Relacional (SQL) | No Relacional (Documentos JSON) | Relacional (PostgreSQL) |
| **Lo que más nos gustó** | Muy ordenado por capas y robusto para proyectos grandes. | Rápido de arrancar y en el mismo lenguaje que el frontend. | Flexibilidad para guardar datos sin tablas fijas. | Código muy corto y claro, valida datos con Pydantic y crea `/docs` automático. |
| **Lo que más nos costó** | Mucha configuración, anotaciones y archivos para empezar. | Validar manualmente los datos y controlar errores en rutas. | Sin relaciones estrictas es difícil controlar datos cruzados como reservas. | Manejar correctamente las conexiones y consultas SQL a mano con `psycopg2`. |

---

## 3. ¿Por qué elegimos Python + FastAPI para BookingSoft?

Para un hotel necesitamos que **no se crucen reservas**, **no se pierdan pagos** y **todo tenga reglas estrictas** (cédulas únicas, fechas válidas, roles de empleados). Escogimos **FastAPI + PostgreSQL** porque:
1. Nos dio un equilibrio entre la **rapidez de desarrollo** (más ágil que Spring Boot) y el **orden/seguridad** (validando datos con Pydantic antes de llegar a la BD).
2. Al trabajar frontend y backend al tiempo, tener **Swagger (`/docs`) automático** nos permitió probar cada endpoint al instante sin esperar manuales externos.
3. PostgreSQL nos permitió bloquear reservas repetidas directamente en la base de datos con `btree_gist`, evitando dobles reservas si dos personas reservan al mismo tiempo.

---

## 4. Deuda Técnica Documentada y Priorizada

Durante el proyecto fuimos honestos con las cosas que quedaron pendientes o que se pueden mejorar en una siguiente fase:

| Prioridad | Ítem | Qué falta o qué se puede mejorar | Por qué quedó así y cómo resolverlo |
| :---: | :--- | :--- | :--- |
| 🔴 **Alta** | **Pasarela de pagos real y Facturación DIAN** | Hoy los pagos y facturas funcionan en modo simulado (`pasarela.py`), sin descontar dinero real ni enviar XML a la DIAN. | Requiere cuentas de comercio reales, llaves bancarias y certificado digital. En producción se conectaría Wompi o PayU en el servicio de pagos. |
| 🟠 **Media** | **Archivos grandes en el Frontend** | Aunque ya dividimos `App.jsx` en vistas y componentes, `useAppState.js` y `VistaPms.jsx` siguen siendo archivos muy largos (+1.400 líneas). | Se priorizó estabilizar las pantallas antes de la entrega. Se puede dividir `useAppState` en hooks más pequeños (uno para reservas, otro para empleados, etc.). |
| 🟠 **Media** | **Cobertura de componentes React y cierre de PRs** | Faltan más pruebas sobre componentes interactivos del PMS y terminar de unir las ramas semanales pendientes en GitHub. | Se priorizaron primero las pruebas del backend y flujos E2E críticos. Se resuelve fusionando los PRs y ampliando pruebas con React Testing Library. |
| 🟡 **Baja** | **CRUD visual para crear/eliminar habitaciones** | Las 38 habitaciones del apartahotel se cargan desde `schema.sql`, no desde un formulario en pantalla. | El hotel tiene 38 unidades físicas fijas. A futuro se puede agregar el formulario solo para el rol Administrador. |
| 🟡 **Baja** | **Integración física con cerraduras IoT** | La propuesta técnica está documentada (`PROPUESTA_IOT_CERRADURAS_YALE.md`), pero no conectada a hardware físico. | Por costos de cerraduras físicas inteligentes en esta etapa académica. |

---

## 5. Conclusión del Equipo

Pasar por estos cuatro backends nos enseñó que no hay una sola herramienta "mejor para todo": **Spring Boot** es muy ordenado para sistemas empresariales enormes, **Express y MongoDB** son muy rápidos para prototipos flexibles, y **FastAPI con PostgreSQL** nos dio justo la claridad, velocidad y seguridad que necesitaba un sistema hotelero como BookingSoft.