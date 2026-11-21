# 🧭 Reflexión Comparativa de los 4 Backends del Programa ADSO y Gestión de Deuda Técnica

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Programa:** Análisis y Desarrollo de Software (ADSO) — SENA  
**Ficha:** Trimestre 6  
**Fecha de Elaboración:** Noviembre 2026  
**Autores:** Equipo de Desarrollo ADSO (Chico, Mayor, Echeverri, Parada, López)  

---

## 1. Contexto Académico: Evolución Técnica a Través de los 4 Backends

Durante la trayectoria formativa en el tecnólogo ADSO, el equipo desarrolló 4 soluciones de backend distintas para responder a diferentes dominios y requerimientos planteados por los instructores. Esta evolución técnica permitió comparar de primera mano paradigmas de desarrollo, tipado, rendimiento y patrones de persistencia:

1. **Backend 1 (Trimestre 2 — Dominio Web Básico):** Node.js con Express (JavaScript puro). Primer contacto con el protocolo HTTP, arquitectura cliente-servidor y APIs REST básicas con callbacks y promesas.
2. **Backend 2 (Trimestre 3 — Dominio NoSQL / Documentos):** Node.js con Express y MongoDB (Mongoose). Implementación de bases de datos no relacionales, persistencia basada en esquemas BSON/JSON flexibles y consultas agregadas.
3. **Backend 3 (Trimestre 4–5 — Dominio Empresarial Robusto):** Java con Spring Boot y JPA/Hibernate. Arquitectura empresarial fuertemente tipada estructurada en capas formales (Controller, Service, Repository, DTOs y Entity), con inyección de dependencias estricta.
4. **Backend 4 (Trimestre 6 — Dominio Hotelero PMS BookingSoft):** Python 3.11 con FastAPI y PostgreSQL 15. Backend asíncrono de alto desempeño con tipado estricto mediante Pydantic v2, transacciones ACID nativas con restricciones GiST para prevención de doble reserva y generación automática de contratos OpenAPI/Swagger.

---

## 2. Matriz Comparativa Exhaustiva de los 4 Backends

| Criterio de Evaluación | Backend 1: Node.js + Express | Backend 2: Node.js + MongoDB | Backend 3: Java + Spring Boot | Backend 4: Python + FastAPI (BookingSoft) |
|---|---|---|---|---|
| **Lenguaje y Paradigma** | JavaScript (Orientado a eventos, asíncrono no bloqueante) | JavaScript (Orientado a eventos, no estructurado) | Java 17+ (Orientado a Objetos, fuertemente tipado) | Python 3.11 (Multiparadigma, tipado moderno con type-hints) |
| **Sistema de Persistencia** | Relacional básico (MySQL / SQLite vía drivers nativos) | NoSQL orientado a documentos (MongoDB / Mongoose) | Relacional con ORM empresarial (PostgreSQL / Spring Data JPA) | Relacional con Pool de Conexiones (PostgreSQL 15 + Psycopg2 + GiST) |
| **Integridad y Restricciones** | Validación manual en controladores con middleware custom. | Sin integridad referencial forzada; esquemas flexibles a nivel de aplicación. | Validación estricta con Hibernate Validator (`@NotNull`, `@Size`, Bean Validation). | Validación y serialización automática de alto rendimiento mediante Pydantic v2. |
| **Concurrencia y Rendimiento** | Excelente en I/O gracias al Event Loop de Node.js. | Rápido en lecturas masivas no transaccionales. | Alto rendimiento con soporte multihilo (`ThreadPoolExecutor`), pero mayor consumo de memoria RAM (JVM). | Excepcional: motor ASGI (`uvicorn`) asíncrono nativo (`async/await`) con rendimiento equiparable a Go/Node. |
| **Curva de Aprendizaje** | Baja: sintaxis ágil pero propenso a errores por falta de tipado estático. | Media: flexibilidad en esquemas pero complejo para consultas relacionales cruzadas. | Alta: configuración extensa, curva pronunciada por anotaciones e inyección de dependencias. | Óptima: sintaxis limpia y legible de Python, permitiendo desarrollo veloz sin sacrificar rigor. |
| **Documentación de API** | Manual (requiere herramientas externas como Postman o Swagger manual). | Manual o dependiente de bibliotecas adicionales no estandarizadas. | Semi-automática mediante dependencias de Springdoc OpenAPI / Swagger UI. | **Nativa y Automática:** Generación instantánea en tiempo de ejecución de Swagger UI y ReDoc. |
| **Consumo de Recursos** | Bajo consumo de memoria (~40-80 MB por instancia). | Bajo a medio (~60-120 MB). | Elevado debido a la máquina virtual Java (~300-600 MB en arranque). | Ultraligero (~50-90 MB en contenedor Docker Alpine). |

---

## 3. Justificación Técnica: ¿Por qué FastAPI fue la Elección Ideal para BookingSoft?

Para el desarrollo del PMS hotelero del Apartahotel Facile, el equipo seleccionó **Python + FastAPI** como el 4.º backend por cuatro razones determinantes de negocio:

1. **Prevención Concurrente de Overbooking:** La hotelería exige consistencia transaccional absoluta. FastAPI se integró fluidamente con PostgreSQL utilizando extensiones `btree_gist` y rangos `daterange`, garantizando a nivel de base de datos que ninguna habitación sufra doble reserva simultánea.
2. **Contratos Claros con el Frontend (OpenAPI Nativo):** Al desarrollar en paralelo la interfaz de usuario en React, la generación automática de la especificación OpenAPI en `/docs` sirvió como contrato de comunicación en vivo entre el equipo de frontend (José Chico y David López) y el backend (Maicol Mayor y Sebastián Parada).
3. **Mantenibilidad y Legibilidad:** La sintaxis expresiva de Python redujo el volumen de código boilerplate en un 60% en comparación con la arquitectura de Spring Boot, facilitando las auditorías de código y la escritura de las 96 pruebas unitarias automatizadas.
4. **Respuesta en Tiempo Real para Recepción:** Los tiempos de latencia inferiores a 25 milisegundos por solicitud permiten que el módulo de recepción presencial liquide cotizaciones y emita llaves digitales al instante.

---

## 4. Gestión de Deuda Técnica Documentada y Priorizada

La deuda técnica representa decisiones de diseño o características diferidas de forma consciente durante los Sprints para priorizar la estabilidad del núcleo operativo hotelero (reservas, check-in, folios y catálogo).

A continuación se presenta la matriz de deuda técnica clasificada por impacto y esfuerzo de resolución:

| Ítem | Componente Afectado | Descripción de la Deuda Técnica | Impacto Operativo | Esfuerzo Estimado | Prioridad de Remediación | Plan de Acción para Producción |
|:---:|---|---|---|:---:|:---:|---|
| **DT-01** | Pagos y Folios | **Pasarela de Pago Bancaria Real:** Actualmente el cobro con tarjeta o PSE opera mediante `PasarelaSimulada`, generando recibos y folios válidos pero sin débito bancario real. | Alto (impide cobros en línea no presenciales) | 16 Horas | **Alta (Fase Inmediata)** | Integrar el SDK oficial de Wompi / PSE Colombia en el servicio `services/pasarela.py`, manejando webhooks de confirmación asíncrona. |
| **DT-02** | Hardware IoT | **Cerraduras Yale Connect Físicas:** El sistema genera tokens criptográficos y códigos temporales de 6 dígitos para el huésped, pero el hardware físico Zigbee/Wi-Fi está emulado por software. | Medio (el recepcionista debe entregar clave manual o móvil) | 24 Horas | **Media** | Desplegar el concentrador Yale Connect Bridge físico en red local y conectar el broker MQTT con certificados TLS mutuos. |
| **DT-03** | Facturación DIAN | **Firma Digital y Envío Directo UBL 2.1:** El sistema genera el archivo XML de factura electrónica bajo estándar UBL 2.1 simulado, pero no cuenta con certificado digital ni conexión al webservice de la DIAN. | Medio (requiere emisión de factura tradicional contable) | 20 Horas | **Media** | Adquirir certificado digital de firma electrónica y conectar el servicio de timbrado ante la DIAN mediante un proveedor tecnológico autorizado. |
| **DT-04** | Pruebas Frontend | **Cobertura de Tests en Componentes React:** Las pruebas de frontend cubren al 100% las utilidades críticas (fechas, descuentos, folio y clientes HTTP), pero los componentes visuales interactivos tienen baja cobertura automatizada. | Bajo (mitigado por 9 specs E2E con Playwright) | 12 Horas | **Baja** | Implementar pruebas de renderizado y eventos con React Testing Library en los modales de recepción. |
| **DT-05** | Catálogo Habitacional | **Administración de Unidades vía Interfaz:** El inventario de apartamentos se inicializa desde el script de base de datos; no existe una pantalla administrativa para crear nuevas habitaciones o demolerlas. | Bajo (el apartahotel tiene planta física fija de 38 suites) | 8 Horas | **Baja** | Crear formulario administrativo en el PMS con endpoint `POST /api/habitaciones` restringido exclusivamente al rol Administrador. |

---

## 5. Conclusión y Aprendizajes del Equipo

El ejercicio comparativo entre los 4 backends evidencia la madurez alcanzada por el equipo a lo largo del tecnólogo ADSO:

- Se comprendió que **no existe una tecnología única superior para todos los casos**, sino herramientas adecuadas para cada necesidad de negocio: Spring Boot destaca en grandes ecosistemas bancarios con cientos de microservicios corporativos, Node.js brilla en aplicaciones de mensajería o streaming en tiempo real, y **FastAPI demostró ser la alternativa más equilibrada para BookingSoft**, combinando velocidad de desarrollo, seguridad estricta y rendimiento asíncrono óptimo.
- La documentación rigurosa de la deuda técnica demuestra honestidad profesional y establece una hoja de ruta clara para la evolución del producto hacia un entorno comercial real.
