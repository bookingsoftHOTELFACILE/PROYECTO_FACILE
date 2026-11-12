# Restricciones del Proyecto — BookingSoft

---

<!--
  ¿Qué? Documento que define las restricciones técnicas, organizacionales, de seguridad y de negocio del proyecto.
  ¿Para qué? Establecer los límites y condiciones no negociables bajo las cuales se desarrolla el sistema BookingSoft.
  ¿Impacto? Violar una restricción compromete la seguridad, la integridad operacional de las reservas o la coherencia del proyecto.
-->

---

## 1. Restricciones Tecnológicas

### RT-001 — Backend obligatorio con Python y FastAPI
El servidor backend de BookingSoft debe desarrollarse exclusivamente utilizando el lenguaje **Python** y el framework web **FastAPI**. Queda prohibido el uso de otros lenguajes (Node.js, Java, PHP, C#) o frameworks alternativos (Django, Flask).
- **Relacionada con:** RNF-003.

### RT-002 — Frontend obligatorio con React y JavaScript
La interfaz de usuario del cliente web debe construirse exclusivamente utilizando la biblioteca **React** y el lenguaje **JavaScript**. Queda prohibido el uso de otros frameworks web (Angular, Vue.js, Svelte).
- **Relacionada con:** RNF-004.

### RT-003 — Base de datos relacional PostgreSQL
El almacenamiento de datos persistente debe realizarse obligatoriamente sobre el sistema gestor de base de datos relacional **PostgreSQL**. No se permite el uso de bases de datos alternativas (MySQL, SQLite en producción, MongoDB) como motor principal del sistema.
- **Relacionada con:** RNF-002.

### RT-004 — Formato de respuesta de la API en JSON
Todas las respuestas intercambiadas desde la API de BookingSoft deben entregarse estrictamente en formato **JSON** (`Content-Type: application/json`), tanto para escenarios de éxito como para mensajes de error.
- **Relacionada con:** RNF-001.

### RT-005 — Documentación interactiva de la API con Swagger
La API del servidor debe exponer su documentación técnica de manera automatizada mediante **Swagger (OpenAPI)**, aprovechando las capacidades nativas de FastAPI.
- **Relacionada con:** RNF-006.

### RT-006 — Contenedorización obligatoria con Docker
La aplicación debe empaquetarse y ejecutarse mediante contenedores **Docker** para garantizar la consistencia técnica y la reproducibilidad del entorno de desarrollo y ejecución.
- **Relacionada con:** RNF-007.

---

## 2. Restricciones de Herramientas y Entorno

### RH-001 — Entorno de desarrollo oficial
El desarrollo del proyecto debe realizarse utilizando **Visual Studio Code** como editor de código fuente oficial y **Antigravity** como asistente de inteligencia artificial para el desarrollo.
- **Relacionada con:** RNF-011.

### RH-002 — Arquitectura cliente-servidor desacoplada
El sistema debe mantener una separación estricta entre la capa de servidor (backend FastAPI) y la capa de cliente (frontend React), comunicándose únicamente a través de peticiones HTTP en formato JSON.
- **Relacionada con:** RNF-001, RNF-003, RNF-004.

---

## 3. Restricciones de Idioma y Nomenclatura

### RI-001 — Código fuente e identificadores en inglés
Todos los elementos del código fuente deben escribirse en idioma inglés, incluyendo:
- Nombres de variables, funciones, clases, métodos y constantes.
- Endpoints y rutas de la API (ejemplo: `/api/v1/auth`).
- Nombres de tablas y columnas en la base de datos (ejemplo: `full_name`, `is_active`).
- Archivos y carpetas de código fuente.
- **Relacionada con:** RF-001, RF-004, RNF-001.

### RI-002 — Documentación y especificación funcional en español
Toda la documentación técnica y funcional del proyecto debe redactarse en idioma español, incluyendo:
- Especificaciones de Historias de Usuario (HUs), Requisitos Funcionales (RFs) y Requisitos No Funcionales (RNFs).
- Comentarios explicativos en el código fuente.
- Manuales y guías del proyecto.
- **Relacionada con:** RO-001.

---

## 4. Restricciones Organizacionales y Metodológicas

### RO-001 — Marco de proyecto educativo SENA
El desarrollo de BookingSoft se enmarca en un contexto de formación académica SENA. Cada artefacto producido debe mantener un enfoque pedagógico, transparente y documentado adecuadamente.
- **Relacionada con:** RNF-011.

### RO-002 — Trazabilidad documental obligatoria
Todo desarrollo técnico debe estar respaldado por la matriz de trazabilidad documental, vinculando directamente las funciones del sistema con sus correspondientes Historias de Usuario, Requisitos Funcionales y Requisitos No Funcionales.
- **Relacionada con:** HU-001 a HU-015, RF-001 a RF-015, RNF-001 a RNF-011.

---

## 5. Restricciones de Seguridad

### RS-001 — Almacenamiento seguro de contraseñas con bcrypt
Las contraseñas de los usuarios deben ser procesadas y almacenadas exclusivamente mediante el algoritmo de hashing **bcrypt**. Queda estrictamente prohibido guardar, transmitir o registrar en logs contraseñas en texto plano.
- **Relacionada con:** HU-001, HU-002, RF-001, RF-007, RF-008, RNF-005.

### RS-002 — Gestión de credenciales sensibles mediante variables de entorno
Toda información sensible (cadenas de conexión a la base de datos, claves secretas y parámetros de configuración del entorno) debe gestionarse mediante variables de entorno no versionadas en el repositorio Git.
- **Relacionada con:** RNF-008.

### RS-003 — Control de acceso basado en roles (RBAC)
El acceso a los módulos y endpoints del sistema debe estar restringido de acuerdo con el rol del usuario autenticado (Administrador, Recepcionista 24h, Ama de llaves, Personal de mantenimiento y Huésped). El sistema debe bloquear cualquier intento de acceso a funciones no autorizadas.
- **Relacionada con:** HU-002, HU-003, HU-004, RF-006, RF-009.

### RS-004 — Bloqueo de inicio de sesión para usuarios inactivos
El sistema debe denegar el acceso a cualquier usuario cuyo estado registrado sea "inactivo", impidiendo el inicio de sesión incluso si las credenciales ingresadas son correctas.
- **Relacionada con:** HU-002, HU-004, RF-004, RF-007, RF-010.

### RS-005 — Mensajes de error genéricos en la autenticación
Los mensajes de error generados ante un intento fallido de inicio de sesión deben ser genéricos y no deben revelar si el fallo fue ocasionado por el correo electrónico o por la contraseña.
- **Relacionada con:** HU-002, RF-004, RF-007, RNF-001.

---

## 6. Restricciones de Integridad del Negocio

### RIB-001 — Prevención de sobre-reserva y condiciones de carrera
El sistema debe garantizar la atomicidad en la validación y bloqueo de unidades habitacionales. Se debe impedir que solicitudes concurrentes bloqueen o reserven la misma unidad para el mismo rango de fechas.
- **Relacionada con:** HU-005, RF-011, RF-012, RNF-009.

### RIB-002 — Coherencia cronológica de fechas de reserva
El sistema debe validar que la fecha de salida (check-out) sea estrictamente posterior a la fecha de entrada (check-in). No se permite la creación ni modificación de reservas que violen esta regla temporal.
- **Relacionada con:** HU-005, RF-011, RF-013.

### RIB-003 — Restricción por capacidad máxima de la unidad
El número de personas asociadas a una reserva no puede superar la capacidad máxima de ocupantes autorizada para la unidad habitacional seleccionada.
- **Relacionada con:** HU-005, HU-009, RF-011.

### RIB-004 — Gestión horaria de espacios complementarios
La reserva de la Sala de Juntas y del espacio de Coworking se restringe a bloques por horas y no por noches, estando disponible tanto para huéspedes del apartahotel como para usuarios externos.
- **Relacionada con:** HU-013, RF-015.

---

## 7. Restricciones de Disponibilidad y Operación

### RDO-001 — Disponibilidad continua del servicio
El sistema de BookingSoft debe mantenerse operativo de forma continua (24 horas al día, 7 días a la semana) para dar soporte a la gestión hotelera sin interrupción.
- **Relacionada con:** HU-014, RNF-010.
