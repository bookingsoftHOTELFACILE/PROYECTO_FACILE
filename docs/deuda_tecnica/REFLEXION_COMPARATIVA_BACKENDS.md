# 🧭 Punto 14: Reflexión del Desarrollo, Comparativa de Backends y Deuda Técnica

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Programa:** Análisis y Desarrollo de Software (ADSO) — SENA  
**Trimestre Actual:** Trimestre 6  
**Equipo:** David López, José Miguel Chico, Maicol Mayor, Sebastián Parada, Ashly Echeverri  

---

## 1. Nuestra Experiencia con los Backends a lo Largo de los Trimestres

A lo largo de la formación en el SENA hemos aprendido a trabajar con diferentes tecnologías para el backend según lo que nos fueron enseñando en cada trimestre:

1. **Trimestre 3 — Java con Spring Boot:**  
   Fue nuestro primer acercamiento a un backend empresarial robusto. Aprendimos a trabajar con Java, Programación Orientada a Objetos y la estructura por capas (Controllers, Services, Repositories). Al principio fue bastante pesado y retador por la cantidad de archivos, anotaciones y configuraciones que exige Java, pero nos ayudó a entender la importancia del orden y el tipado fuerte.

2. **Trimestre 5 (El trimestre pasado) — Node.js con Express:**  
   Trabajar con JavaScript en el backend nos pareció mucho más ágil y directo que Java. Con Express pudimos crear rutas y recibir peticiones HTTP de forma rápida y sencilla, sin tantas carpetas ni tanta configuración previa.

3. **Trimestre 5 (El trimestre pasado) — MongoDB:**  
   Aquí conocimos las bases de datos no relacionales (NoSQL). Fue una experiencia interesante porque no teníamos que definir tablas fijas ni columnas estrictas; simplemente guardábamos la información en formato JSON/documentos. Nos sirvió para entender cuándo conviene una base de datos flexible y cuándo se necesita una relacional fija.

4. **Trimestre 6 (Este proyecto final) — Python con FastAPI:**  
   Para BookingSoft utilizamos FastAPI junto con PostgreSQL. La experiencia fue muy positiva: la sintaxis de Python es muy clara y fácil de leer, la validación de datos con Pydantic evita que lleguen datos dañados a la base de datos, y lo que más nos gustó fue que genera la documentación interactiva de Swagger solita (`/docs`), lo que nos facilitó conectar las pantallas con el servidor.

---

## 2. Cuadro Comparativo de lo que Aprendimos

| Tecnología | Trimestre | Lo Bueno (Ventajas) | Lo Difícil o Retador |
|---|:---:|---|---|
| **Spring Boot (Java)** | Trimestre 3 | Es súper ordenado, seguro y muy usado en grandes empresas. | Muy estricto, requiere muchas líneas de código para cosas sencillas y consume más memoria en el computador. |
| **Express (Node.js)** | Trimestre 5 | Muy rápido de programar, flexible y usa el mismo JavaScript del frontend. | Al ser tan libre, si uno no se organiza bien el código puede quedar desordenado fácilmente. |
| **MongoDB (NoSQL)** | Trimestre 5 | Muy fácil para guardar datos variados sin preocuparse por esquemas rígidos. | Difícil para relacionar tablas complejas o garantizar que no haya datos duplicados o inconsistentes. |
| **FastAPI (Python)** | Trimestre 6 | Súper rápido, código limpio, valida errores automáticamente y genera Swagger solo. | Tuvimos que adaptarnos a la programación asíncrona (`async/await`) y al manejo estricto de fechas en reservas. |

---

## 3. ¿Por qué Elegimos FastAPI para este Proyecto Hotelero?

Para el Apartahotel Facile necesitábamos un sistema muy confiable, porque en un hotel **no puede haber errores con el dinero ni con las habitaciones**:

1. **Evitar sobreventas (Double-Booking):** Necesitábamos que la base de datos (PostgreSQL) bloqueara de inmediato si dos personas intentaban reservar la misma suite en las mismas fechas. FastAPI se conectó perfecto con PostgreSQL para lograr esta protección.
2. **Conexión fácil con el Frontend:** Como David y José Miguel estaban armando las pantallas en React, la documentación de Swagger que genera FastAPI les permitía ver exactamente qué datos pedía cada endpoint sin tener que adivinar.
3. **Rapidez:** El sistema responde casi al instante, lo cual es ideal para el recepcionista cuando está atendiendo a un huésped en el lobby.

---

## 4. Deuda Técnica (Cosas que Dejamos para una Próxima Versión)

En el desarrollo de software es normal que por tiempo queden funciones pendientes o simuladas para poder entregar el sistema estable. A esto se le llama **deuda técnica**, y en nuestro proyecto la tenemos identificada de forma transparente:

| Qué quedó pendiente | ¿Qué tan importante es? | ¿Por qué quedó así y cómo se solucionaría? |
|---|:---:|---|
| **Pasarela de pago real (Wompi / PSE)** | Alta | Actualmente el cobro se liquida y se calcula con impuestos en el sistema, pero el cobro bancario es simulado. En una fase 2 se conectaría la API oficial de Wompi o PSE para recibir dinero real de tarjetas. |
| **Cerraduras físicas Yale en las puertas** | Media | El sistema ya genera el código PIN de 6 dígitos para el huésped y crea la llave digital en la pantalla, pero en el laboratorio no teníamos las cerraduras físicas para conectarlas por Wi-Fi. Queda listo para instalar el hardware. |
| **Facturación electrónica con la DIAN** | Media | El sistema genera el archivo XML de factura electrónica bajo el estándar legal UBL 2.1, pero no tenemos el certificado digital pagado ante la DIAN para timbrarla de verdad. |
| **Pruebas automáticas visuales de React** | Baja | Tenemos 118 pruebas automáticas del servidor funcionando, pero en el frontend probamos las operaciones clave y nos faltaron pruebas visuales en los modales pequeños. |
| **Crear nuevas habitaciones desde la web** | Baja | Las 38 habitaciones del hotel ya están cargadas en la base de datos. Como el edificio tiene un número fijo de apartamentos, no fue urgente hacer un botón de "demoler o construir habitaciones". |

---

## 5. Reflexión y Feedback de Cómo Trabajamos como Equipo

### 🌟 Lo que funcionó muy bien:
- **Nos repartimos el trabajo según las fortalezas de cada uno:** 
  - **José Miguel** se enfocó en que el sistema fuera agradable y fácil de usar (acomodó las fotos, los colores corporativos, los calendarios compactos y las tarjetas para que el recepcionista no se sintiera saturado).
  - **David** ayudó como Scrum Master organizando las tareas y también metió mano en código tanto de frontend como de backend.
  - **Maicol** lideró la lógica del servidor en FastAPI y se aseguró de crear las pruebas para que nada fallara.
  - **Sebastián** arrancó desde el principio con la estructura de la base de datos en PostgreSQL y dejó montado Docker para que a todos nos corriera igual.
  - **Ashly** estuvo pendiente de los requisitos del hotel para que hiciéramos lo que un apartahotel de verdad necesita.
- **La comunicación diaria:** Hablar constantemente evitó que unos hicieran cosas que chocaran con el trabajo de los otros.

### 💡 Lo que aprendimos y haríamos diferente si volviéramos a empezar:
- **No dejar archivos tan largos:** Al inicio algunos componentes de React tenían demasiado código antes de que decidiéramos dividirlos en partes más pequeñas. Aprendimos que es mejor separar los archivos desde la primera semana.
- **La importancia de planear antes de programar:** El tiempo que invertimos al principio pensando bien las tablas de la base de datos y los requisitos nos ahorró dolores de cabeza al final.

---

## 6. Conclusión

Haber pasado por Java Spring Boot en 3.º trimestre, por Node.js y MongoDB en el 5.º, y ahora por Python FastAPI en el 6.º, nos dio una visión completa de cómo se construye software en el mundo real. 

Hoy entendemos que no hay una tecnología "mejor que otra", sino que cada una sirve para un propósito distinto. Logramos entregar un proyecto funcional, ordenado y que resuelve una necesidad real para el Apartahotel Facile.
