# 🎤 Guía Detallada para la Sustentación — BookingSoft
> Léela despacio. Cada sección tiene: qué es, cómo lo hicimos, y cómo explicarlo en la expo.

---

## 1. 📌 Trazabilidad con GitHub Projects

### ¿Qué significa "trazabilidad"?
Trazabilidad significa que puedes rastrear cada decisión del proyecto: saber **qué se hizo, cuándo se hizo, quién lo hizo y por qué.** En desarrollo de software, si alguien pregunta "¿ya implementaron el login?", con trazabilidad puedes señalar exactamente el issue, la rama, el commit y la prueba que lo respaldan.

### ¿Cómo funciona GitHub Projects?
GitHub Projects es como un tablero físico de post-its en una pared, pero digital. Cada "post-it" es un **issue** (tarea) del repositorio. El tablero tiene columnas que representan el estado de esa tarea:

```
[Backlog] → [En Proceso] → [Pruebas] → [Hecho]
```

- **Backlog:** tareas planeadas pero no iniciadas aún
- **En Proceso:** alguien está trabajando en eso ahora mismo
- **Pruebas:** el código está listo pero se está verificando que funcione
- **Hecho:** terminado, mergeado, funcionando en producción

### ¿Cómo lo hicimos en BookingSoft?
Creamos el tablero **"BookingSoft - Sprints"** en:  
👉 https://github.com/users/bookingsoftHOTELFACILE/projects/1

Cada Requisito Funcional (RF) es un issue. Por ejemplo:
- Issue #1: `RF-001: Registro de usuario` → **Hecho** ✅
- Issue #14: `RF-014: Cancelación de reserva` → **Backlog** (Fase 2)

**Estado actual del tablero:**
| Columna | Cantidad |
|:---|:---:|
| Backlog | 3 (RF-013, RF-014, RF-015 — Fase 2) |
| En Proceso | 0 |
| Pruebas | 0 |
| **Hecho** | **12** (RF-001 al RF-012) |

### 🎙️ Cómo explicarlo en la expo:
> *"El tablero de GitHub Projects es nuestro sistema de seguimiento. Cada requisito funcional es un issue. A medida que avanzábamos en los sprints, íbamos moviendo los issues de Backlog a Hecho. Hoy tenemos 12 de 15 requisitos completados y visibles en el tablero. Los 3 restantes son para la Fase 2 del proyecto."*

---

## 2. 📄 Documentación en Markdown

### ¿Qué es Markdown?
Markdown es un lenguaje de formato de texto muy simple. En vez de usar Word o un editor gráfico, escribes texto plano con símbolos especiales y GitHub lo muestra bonito automáticamente. Por ejemplo:
- `# Título` → se ve como un título grande
- `**negrita**` → se ve en **negrita**
- `| columna |` → se ve como una tabla

Es el estándar de la industria para documentar proyectos en GitHub porque es liviano, vive junto al código, y cualquier desarrollador puede editarlo sin programas especiales.

### ¿Qué documentamos y por qué?

#### 📁 Historias de Usuario (HUs) — `docs/requisitos/HUs/`
Son 15 archivos, uno por cada HU (HU-001 a HU-015).  
**¿Qué es una HU?** Es un requisito escrito desde la perspectiva del usuario. Formato:  
> *"Como [tipo de usuario], quiero [hacer algo], para [obtener un beneficio]."*

Ejemplo de HU-001:
> *"Como nuevo empleado del apartahotel, quiero poder registrarme con mis datos personales para tener acceso al sistema."*

Las HUs capturan el **POR QUÉ** de cada funcionalidad — el valor de negocio.

#### 📁 Requisitos Funcionales (RFs) — `docs/requisitos/RFs/`
Son 15 archivos (RF-001 a RF-015). Cada RF es la **especificación técnica** de lo que debe hacer el sistema. Mientras la HU dice "quiero poder registrarme", el RF dice exactamente:
- ¿Qué campos se necesitan? (usuario, contraseña, nombre, rol...)
- ¿Qué validaciones aplican? (contraseña mínimo 8 caracteres, rol válido...)
- ¿Qué responde el sistema si falla o si tiene éxito?

#### 📁 Requisitos No Funcionales (RNFs) — `docs/requisitos/RNFs/`
Son 11 archivos (RNF-001 a RNF-011). Los RNFs describen **CÓMO debe comportarse el sistema**, no qué debe hacer. Ejemplos:
- `RNF-003`: El servidor debe ser Python con FastAPI (tecnología)
- `RNF-005`: Las contraseñas deben almacenarse con bcrypt (seguridad)
- `RNF-007`: El sistema debe correr en contenedores Docker (infraestructura)
- `RNF-009`: El sistema debe manejar reservas concurrentes sin doble booking (rendimiento)

#### 📄 Restricciones — `docs/requisitos/restricciones.md`
Son las limitaciones del proyecto: qué tecnologías están permitidas, qué NO se puede hacer, etc.

#### 📊 Matriz de Trazabilidad — `docs/requisitos/MATRIZ_TRAZABILIDAD.md`
Es la tabla más importante para el profesor. Cruza todos los artefactos:

```
RF → HU que lo origina → RNF que aplica → Endpoint → Prueba automatizada
```

Por ejemplo:
| RF | HU | Endpoint | Prueba |
|:---|:---|:---|:---|
| RF-001 | HU-001 | POST /api/auth/registro | test_registro_exitoso |
| RF-004 | HU-002 | POST /api/auth/login | test_login_valido |

Esto demuestra que **nada fue hecho por capricho** — todo tiene un origen documentado.

### 🎙️ Cómo explicarlo en la expo:
> *"Toda nuestra documentación vive en el repositorio en la carpeta `docs/`, escrita en Markdown para que GitHub la renderice automáticamente. Tenemos 15 Historias de Usuario que capturan el valor de negocio, 15 Requisitos Funcionales con las especificaciones técnicas, 11 Requisitos No Funcionales con las reglas de calidad del sistema, y la Matriz de Trazabilidad que conecta todo. Si el profesor abre cualquier RF, puede ver exactamente qué HU lo originó y qué prueba lo valida."*

---

## 3. 💻 80% de Código Funcional

### Los 13 endpoints activos — explicados uno por uno:

| Endpoint | ¿Qué hace? |
|:---|:---|
| `POST /api/auth/registro` | Crea un nuevo empleado. Hashea la contraseña con bcrypt antes de guardarla. |
| `POST /api/auth/login` | Verifica usuario y contraseña. Si es correcto, emite un token JWT. |
| `POST /api/auth/logout` | Cierre de sesión (requiere token válido). |
| `GET /api/empleados` | Lista todos los empleados. Acepta filtros: `?estado=Activo` o `?rol=Recepcionista 24h`. |
| `GET /api/empleados/{id}` | Devuelve los datos de un empleado específico por su ID. |
| `PATCH /api/empleados/{id}/rol` | Cambia el rol de un empleado. Regla: nunca se puede asignar "Administrador" desde aquí (RN-006.2). |
| `PATCH /api/empleados/{id}/estado` | Activa o desactiva un empleado. No puede desactivarse el último Administrador activo. |
| `GET /api/habitaciones` | Lista todas las habitaciones del apartahotel. |
| `GET /api/habitaciones/disponibilidad` | Recibe fechas de entrada y salida y devuelve qué habitaciones están libres. |
| `GET /api/huespedes` | Lista los huéspedes registrados. |
| `GET /api/reservas` | Lista todas las reservas existentes. |
| `POST /api/reservas` | Crea una reserva. Valida doble booking a nivel de base de datos. |
| `GET /health` | Endpoint de salud: confirma que el servidor está vivo. |

### Tecnologías y por qué se eligieron:
- **FastAPI:** Framework Python moderno. Genera documentación Swagger automáticamente en `/docs`. Asíncrono y rápido.
- **PostgreSQL:** Soporta `EXCLUDE constraints` con rangos de fechas — clave para prevenir el doble booking.
- **bcrypt:** Algoritmo de hash para contraseñas. Incluye "salt" aleatorio por usuario, por lo que dos usuarios con la misma contraseña tienen hashes distintos.
- **JWT (JSON Web Token):** Token firmado que el servidor emite al hacer login. El cliente lo manda en cada request para identificarse sin consultar la BD en cada llamada.
- **Docker:** El sistema funciona igual en cualquier computador, sin importar el SO o versiones instaladas.

### La lógica más importante — doble booking:
```sql
-- En schema.sql:
EXCLUDE USING gist (
  id_habitacion WITH =,
  tsrange(fecha_inicio, fecha_fin, '[)') WITH &&
)
```
Esto significa: *"Si alguien intenta insertar una reserva cuyo rango de fechas se solapa con una existente para la misma habitación, PostgreSQL la rechaza."* No importa si dos usuarios reservan al mismo tiempo — la BD lo bloquea.

### Las 15 pruebas automatizadas:
```
test_registro_exitoso                  ← registrar usuario nuevo funciona
test_registro_usuario_duplicado        ← no permite duplicados
test_login_valido                      ← login con credenciales correctas
test_login_credenciales_incorrectas    ← falla con clave incorrecta
test_login_usuario_inactivo            ← usuarios inactivos no pueden entrar
test_control_acceso_sin_token          ← sin token, el sistema rechaza la petición
test_control_acceso_rol_sin_permiso    ← Ama de llaves no puede acceder a admin
test_control_acceso_firma_manipulada   ← token alterado es rechazado
test_rf002_consulta_listado_empleados  ← lista empleados con filtros
test_rf003_consulta_empleado_especifico ← consulta por ID
test_recepcionista_gestion_rol_y_estado ← permisos de Recepcionista
test_rf012_consulta_disponibilidad      ← habitaciones disponibles
test_reserva_descuento                  ← descuento por 7+ noches
test_reserva_supera_capacidad           ← no permite más personas que la capacidad
test_reserva_concurrencia_double_booking ← 10 requests simultáneos → solo 1 pasa
```

### 🎙️ Cómo explicarlo en la expo:
> *"Tenemos 13 endpoints funcionando que cubren los RF del 1 al 12. La lógica más importante es la prevención del doble booking: usamos un EXCLUDE constraint de PostgreSQL que garantiza a nivel de base de datos que nunca dos reservas puedan ocupar la misma habitación en el mismo rango de fechas. Tenemos 15 pruebas de integración automatizadas que corren contra la base de datos real y todas pasan."*

---

## 4. 📝 Commits Convencionales

### ¿Qué es un commit?
Cuando terminas un cambio y lo guardas en Git, eso es un commit. Sin un estándar, los mensajes quedan así: "arreglo", "cambios", "final de verdad". Con commits convencionales, el historial queda ordenado y entendible para cualquier desarrollador.

### El estándar:
```
<tipo>(<scope>): <descripción breve>
```

### Los tipos y ejemplos reales del proyecto:

| Tipo | Significado | Ejemplo real |
|:---|:---|:---|
| `feat` | Nueva funcionalidad | `feat(RF-002,RF-003,RF-012): consultas de empleados y disponibilidad` |
| `fix` | Corrección de un bug | `fix(RNF-009): manejar deadlock (40P01) como colisión de concurrencia` |
| `docs` | Solo documentación | `docs: auditoría de dependencias (pip-audit + pnpm audit)` |
| `test` | Añadir/corregir pruebas | `test(AT-31): suite de pruebas de integración` |
| `refactor` | Reestructurar sin cambiar funcionalidad | `refactor(backend): eliminar modo simulación DEMO_MODE` |

### ¿Por qué importa?
1. **Historia limpia:** En 6 meses puedes entender qué se hizo viendo el log.
2. **Revisión de código:** El revisor sabe qué esperar antes de abrir el código.
3. **Evaluación académica:** El profesor ve que el equipo trabajó de forma profesional.

### 🎙️ Cómo explicarlo en la expo:
> *"Usamos el estándar de Commits Convencionales. Cada mensaje empieza con el tipo: `feat` si es una nueva función, `fix` si es una corrección, `docs` si es documentación. Si el profesor abre el historial de git, puede entender qué se hizo en cada momento del proyecto."*

---

## 5. 🌿 Flujo de Ramas Git

### ¿Qué es una rama?
Imagina que el código es un documento Word compartido. Si todos editan el mismo documento al mismo tiempo, hay conflictos. Las ramas de Git son **copias de trabajo independientes**: cada uno trabaja en su copia, y cuando termina, se fusiona con el principal de forma controlada.

### Nuestras ramas y su propósito:

```
main          ← Solo producción. Nunca se desarrolla aquí directamente.
│
└── develop   ← Integración. Todo pasa por aquí antes de ir a main.
    ├── feature/auth-jwt               ← Sprint 1: autenticación JWT
    ├── feature/docker-setup           ← Contenerización Docker
    ├── feature/reservas-postgres      ← Sprint 2: reservas con PostgreSQL
    ├── feature/pruebas-y-cierre       ← Sprint 3: pruebas + documentación
    └── feature/consultas-pendientes   ← Sprint 3: RF-002, RF-003, RF-012
```

### Reglas del flujo:
1. **`main`** = producción. Solo llega código 100% funcional y probado.
2. **`develop`** = integración continua. Aquí llegan los merges de features.
3. **`feature/<nombre>`** = desarrollo aislado de un requisito o sprint.
4. Nunca se hace `push` directo a `main`. Se mergea desde `develop`.

### El flujo completo:
```
1. Crear rama:   git checkout -b feature/nueva-funcionalidad
2. Desarrollar y hacer commits convencionales
3. Mergear a develop: git merge feature/nueva-funcionalidad
4. Verificar en develop: docker compose exec backend pytest -v
5. Al cerrar sprint: git checkout main && git merge develop
6. Publicar: git push origin main
```

### 🎙️ Cómo explicarlo en la expo:
> *"`main` es producción — nunca se toca directamente. Todo el desarrollo ocurre en ramas `feature/` que se crean desde `develop`. Cuando una funcionalidad está terminada y probada, se mergea a `develop`. Al cerrar cada sprint, `develop` se mergea a `main`. Esto garantiza que `main` siempre esté funcional y estable."*

---

## 6. 📦 Versiones Pinadas + Auditoría de Seguridad

### ¿Qué es una versión pinada?

**Con comodín (MAL ❌):**
```json
"react": "^18.3.1"
```
El `^` significa "cualquier versión desde 18.3.1 en adelante". Si mañana sale `react@18.9.0`, al instalar en otra máquina se instala esa versión nueva — que podría romper tu código.

**Pinada (BIEN ✅):**
```json
"react": "18.3.1"
```
Sin `^` ni `~`. Siempre se instala **exactamente** esa versión. En cualquier máquina, en cualquier momento, el resultado es idéntico. Esto se llama **builds reproducibles**.

### Nuestras dependencias — todas pinadas:

**Backend (`requirements.txt`):**
```
fastapi==0.111.0
uvicorn==0.30.1
psycopg2-binary==2.9.9
pydantic==2.7.4
python-dotenv==1.0.1
bcrypt==4.1.3
pyjwt==2.8.0
pytest==8.2.2
httpx==0.27.0
```

**Frontend (`package.json`):**
```json
"react": "18.3.1"
"react-dom": "18.3.1"
"lucide-react": "0.395.0"
"@vitejs/plugin-react": "4.3.1"
"vite": "5.3.1"
```

**Verificación ejecutada:**
```bash
grep -E '\^|~|>=' backend/requirements.txt frontend/package.json
# → Salida vacía: ningún comodín encontrado ✅
```

### La auditoría de seguridad:
Una auditoría revisa si las versiones que usas tienen **vulnerabilidades conocidas (CVEs)**. Hay bases de datos públicas que registran bugs de seguridad en paquetes.

| Módulo | Herramienta | CVEs | Paquetes afectados |
|:---|:---|:---:|:---|
| Backend | `pip-audit` | 30 | pip, pyjwt, pytest, python-dotenv, setuptools, starlette |
| Frontend | `pnpm audit` | 16 | vite, esbuild |

**¿Por qué no los corregimos?**  
Documentado en `docs/AUDITORIA_DEPENDENCIAS.md`:
- Entrega el 3 de septiembre — actualizar sin tiempo para probar es más riesgoso que el bug.
- Las vulnerabilidades del frontend (`vite`, `esbuild`) afectan **solo el servidor de desarrollo**, nunca el build de producción servido por Nginx.
- Las de producción (`pyjwt`, `starlette`) quedaron como **riesgo aceptado** con propuesta de actualización para Fase 2.

### 🎙️ Cómo explicarlo en la expo:
> *"Todas las dependencias tienen versiones exactas — sin `^` ni `~`. Garantiza que el sistema funcione igual en cualquier máquina. Corrimos `pip-audit` y `pnpm audit`, documentamos los CVEs y tomamos la decisión de no actualizar antes de la entrega para no introducir regresiones. Todo está en `docs/AUDITORIA_DEPENDENCIAS.md` con la justificación técnica."*

---

## 7. 🐳 GitHub + Docker — La Entrega

### ¿Por qué Docker?
El problema clásico: *"En mi máquina funciona."* Docker resuelve esto empaquetando la aplicación junto con todo su entorno (sistema operativo base, dependencias, configuración) en un **contenedor**. Corre igual en cualquier máquina con Docker instalado.

### Nuestra arquitectura:
```
docker-compose.yml → 3 servicios:
├── bookingsoft-db       (PostgreSQL 15) → Puerto 5432
├── bookingsoft-backend  (FastAPI + Uvicorn) → Puerto 4000
└── bookingsoft-frontend (React + Nginx) → Puerto 3000
```

### Cómo desplegarlo (demo para el profesor):
```bash
git clone https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE.git
cd PROYECTO_FACILE
cp .env.example .env
docker compose up --build -d
```

### ¿Qué hace Docker al levantar?
1. Construye la imagen del backend (instala Python + dependencias)
2. Construye la imagen del frontend (instala Node + compila React)
3. Levanta PostgreSQL y ejecuta `schema.sql` automáticamente (crea tablas + datos seed)
4. Levanta el backend cuando la BD está lista (healthcheck)
5. Levanta el frontend con Nginx

Todo automático. Sin instalar Python, Node, ni PostgreSQL en la máquina.

### Usuarios seed precargados:
| Usuario | Contraseña | Rol |
|:---|:---|:---|
| `sandra_admin` | `Admin2026!` | Administrador |
| `carlos_recep` | `Recep2026!` | Recepcionista 24h |
| `marta_limpieza` | `marta123` | Ama de llaves |

### 🎙️ Cómo explicarlo en la expo:
> *"La entrega es 100% por GitHub y Docker. El profesor puede clonar el repositorio, ejecutar `docker compose up --build -d`, y en menos de un minuto tiene el sistema completo funcionando: base de datos PostgreSQL, API FastAPI y frontend React. Los usuarios de prueba están precargados en la base de datos desde el `schema.sql`."*

---

## 8. ❓ Preguntas Difíciles — Respuestas Preparadas

### "¿Qué es un EXCLUDE constraint?"
> *"Es una restricción especial de PostgreSQL que previene filas que se solapan entre sí. En nuestro caso, si la habitación 101 ya tiene una reserva del 1 al 5 de septiembre, PostgreSQL rechaza automáticamente cualquier intento de crear otra reserva en ese mismo rango. Ocurre a nivel de base de datos — es imposible eludirlo desde el código."*

### "¿Qué es un deadlock?"
> *"Un deadlock ocurre cuando dos operaciones simultáneas se bloquean mutuamente esperando que la otra libere un recurso. Si dos usuarios intentan reservar la misma habitación al mismo tiempo, ambas transacciones chocan en el EXCLUDE constraint. PostgreSQL detecta esto y cancela una. Nosotros capturamos ese error (código `40P01`) y devolvemos un mensaje claro: 'La reserva no se pudo completar por concurrencia, inténtalo de nuevo', en vez de un error 500 genérico."*

### "¿Qué es bcrypt?"
> *"Es un algoritmo de hash para contraseñas. Nunca guardamos contraseñas en texto plano — guardamos el resultado del hash. Bcrypt incluye un 'salt' aleatorio por cada usuario, lo que significa que aunque dos personas tengan la misma contraseña, sus hashes son completamente distintos. Además tiene un factor de costo configurable que hace el hash más lento intencionalmente, dificultando ataques de fuerza bruta."*

### "¿Qué es JWT?"
> *"JSON Web Token. Cuando el usuario hace login, el servidor crea un token firmado con una clave secreta que contiene el ID del usuario y su rol. El cliente guarda ese token y lo manda en cada request en el header `Authorization: Bearer <token>`. El servidor verifica la firma — si alguien modifica el token, la firma no coincide y se rechaza. Así el servidor sabe quién eres sin necesidad de consultar la base de datos en cada petición."*

### "¿Por qué el último Administrador no se puede desactivar?"
> *"Lo prevenimos con una salvaguarda en el código. Antes de desactivar un empleado o cambiarle el rol, el sistema verifica si es el único Administrador activo. Si lo es, devuelve error 400 con el mensaje 'No se puede desactivar/cambiar el rol del único Administrador activo'. Esto evita que el sistema quede sin nadie que lo administre — un escenario que lo dejaría inoperable."*

### "¿Cuántos sprints hicieron?"
> *"Tres sprints:*
> - *Sprint 1: Autenticación y control de acceso (RF-001 a RF-010): registro, login, JWT, roles, bcrypt.*
> - *Sprint 2: Reservas con PostgreSQL real (RF-011): lógica de reservas, doble booking, EXCLUDE constraint.*
> - *Sprint 3: Consultas, pruebas y cierre (RF-002, RF-003, RF-012): listado empleados con filtros, disponibilidad habitaciones, 15 pruebas automatizadas, documentación y auditoría.*
> - *RF-013, RF-014 y RF-015 están en Backlog para la Fase 2."*

### "¿Cómo probaron la concurrencia?"
> *"Tenemos la prueba `test_reserva_concurrencia_double_booking` que lanza 10 requests simultáneos con `asyncio` para reservar la misma habitación. La prueba verifica que exactamente 1 reserva fue creada y las otras 9 recibieron error 400. Siempre pasa — la base de datos garantiza la integridad con el EXCLUDE constraint."*

---

## 📋 Checklist para el Día de la Expo

Antes de llegar, verifica:

- [ ] Contenedores corriendo: `docker compose ps`
- [ ] Health check responde: `curl http://localhost:4000/health`
- [ ] Frontend abre: abrir `http://localhost:3000` en el navegador
- [ ] Las 3 cuentas seed funcionan (prueba el login)
- [ ] 15/15 pruebas pasan: `docker compose exec backend pytest -v`
- [ ] Tablero GitHub Projects abierto en el navegador
- [ ] Repositorio GitHub abierto mostrando carpeta `docs/`
- [ ] `docs/AUDITORIA_DEPENDENCIAS.md` lista para mostrar
- [ ] `docs/requisitos/MATRIZ_TRAZABILIDAD.md` lista para mostrar

---

> 💡 **Tip final:** Si el profesor hace una pregunta y no sabes la respuesta exacta, NO inventes. Di: *"Ese punto lo implementó [nombre del compañero], pero lo que sé es que..."* y explica lo que sí entiendes. Es mejor ser honesto que arriesgarse a dar información incorrecta.
