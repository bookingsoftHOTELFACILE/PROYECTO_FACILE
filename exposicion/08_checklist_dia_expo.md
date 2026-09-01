# ✅ Checklist del Día de la Expo — Paso a Paso
> Sigue esta secuencia en orden. Cada punto tiene el comando exacto y qué respuesta esperar.

---

## ⚠️ ANTES DE EMPEZAR

Abre una terminal en la carpeta del proyecto:
```bash
cd "/media/hackboy/SENA1/00 SENA/TODO LO DEL PROYECTO BOOKINGSOFT/PROYECTO_FACILE"
```
Todos los comandos de esta guía se ejecutan desde esa carpeta.

---

## PUNTO 1 — Verificar que los contenedores están corriendo

### Comando:
```bash
docker compose ps
```

### ¿Qué esperar? (respuesta BUENA ✅)
```
NAME                   STATUS          PORTS
bookingsoft-db         Up (healthy)    0.0.0.0:5432->5432/tcp
bookingsoft-backend    Up (healthy)    0.0.0.0:4000->4000/tcp
bookingsoft-frontend   Up              0.0.0.0:3000->80/tcp
```

### Palabras clave a verificar:
- `bookingsoft-db` → debe decir **(healthy)**
- `bookingsoft-backend` → debe decir **(healthy)**
- `bookingsoft-frontend` → debe decir **Up**

---

### ❌ Si algún contenedor NO está corriendo:

**Opción A — Levantarlos sin reconstruir (más rápido):**
```bash
docker compose up -d
```
Espera 15 segundos y vuelve a correr `docker compose ps`.

**Opción B — Reconstruir desde cero (si algo está roto):**
```bash
docker compose down -v
docker compose up --build -d
```
Esto borra todo y reconstruye. Tarda ~2 minutos. Espera a que diga `Up (healthy)`.

**Opción C — Ver qué salió mal:**
```bash
docker compose logs backend
docker compose logs db
```

---

## PUNTO 2 — Verificar el health check del backend

### Comando:
```bash
curl http://localhost:4000/health
```

### ¿Qué esperar? (respuesta BUENA ✅)
```json
{"status":"OK","message":"Servidor de BookingSoft (FastAPI) funcionando correctamente.","modo":"Físico (PostgreSQL)"}
```

### Palabras clave a verificar:
- `"status":"OK"` — el backend está vivo
- `"modo":"Físico (PostgreSQL)"` — está conectado a la BD real, no en modo simulación

---

### ❌ Si falla (no responde o da error):
```bash
# Ver los logs del backend para entender qué pasó:
docker compose logs backend --tail=30
```
Busca en los logs si hay un error de conexión a la BD o un error de Python.

---

## PUNTO 3 — Verificar que el frontend abre en el navegador

### Opción A — Desde terminal (solo verifica el HTTP code):
```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000
```

### ¿Qué esperar?
```
HTTP 200
```
`200` significa que Nginx está sirviendo la página correctamente.

### Opción B — Desde el navegador (más visual):
1. Abre el navegador (Chrome, Firefox, etc.)
2. Escribe en la barra de direcciones: `http://localhost:3000`
3. Presiona Enter

### ¿Qué esperar? (respuesta BUENA ✅)
- Se carga la interfaz de BookingSoft con el header "🏨 BookingSoft"
- En la esquina superior aparece el badge verde: **"Backend FastAPI conectado"** con el ícono de WiFi
- Se ven las tablas de huéspedes y reservas con datos

### ¿Qué significa el badge?
- 🟢 **"Backend FastAPI conectado"** → el frontend detectó el backend, todo funciona con la BD real
- 🟡 **"Modo Simulación (sin backend)"** → el frontend no encontró el backend, usa datos en memoria

---

### ❌ Si el badge dice "Modo Simulación" aunque los contenedores están corriendo:
```bash
# Verifica que el backend responde correctamente:
curl http://localhost:4000/health

# Verifica que Nginx puede llegar al backend:
docker compose logs frontend
```

---

## PUNTO 4 — Verificar las 3 cuentas seed (login manual)

### Cuenta 1: sandra_admin (Administrador)
```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"sandra_admin","contrasena":"Admin2026!"}'
```

### ¿Qué esperar? ✅
```json
{"access_token":"eyJhbGci...","token_type":"bearer"}
```
Si ves un `access_token` largo, el login funcionó.

---

### Cuenta 2: carlos_recep (Recepcionista 24h)
```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"carlos_recep","contrasena":"Recep2026!"}'
```

### ¿Qué esperar? ✅
```json
{"access_token":"eyJhbGci...","token_type":"bearer"}
```

---

### Cuenta 3: marta_limpieza (Ama de llaves)
```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"marta_limpieza","contrasena":"marta123"}'
```

### ¿Qué esperar? ✅
```json
{"access_token":"eyJhbGci...","token_type":"bearer"}
```

---

### ❌ Si alguna cuenta devuelve error:
```json
{"detail":"Credenciales incorrectas."}
```
Significa que el seed no se cargó. Solución:
```bash
# Reiniciar desde cero para que se ejecute el schema.sql otra vez:
docker compose down -v
docker compose up -d
# Esperar 30 segundos y volver a intentar el login
```

---

## PUNTO 5 — Correr las 15 pruebas automatizadas

### Comando:
```bash
docker compose exec backend pytest -v
```

### ¿Qué esperar? (respuesta BUENA ✅)
```
tests/test_auth.py::test_registro_exitoso PASSED
tests/test_auth.py::test_registro_usuario_duplicado PASSED
tests/test_auth.py::test_login_valido PASSED
tests/test_auth.py::test_login_credenciales_incorrectas PASSED
tests/test_auth.py::test_login_usuario_inactivo PASSED
tests/test_auth.py::test_control_acceso_sin_token PASSED
tests/test_auth.py::test_control_acceso_rol_sin_permiso PASSED
tests/test_auth.py::test_control_acceso_firma_manipulada PASSED
tests/test_consultas.py::test_rf002_consulta_listado_empleados PASSED
tests/test_consultas.py::test_rf003_consulta_empleado_especifico PASSED
tests/test_consultas.py::test_recepcionista_gestion_rol_y_estado PASSED
tests/test_consultas.py::test_rf012_consulta_disponibilidad PASSED
tests/test_reservas.py::test_reserva_descuento PASSED
tests/test_reservas.py::test_reserva_supera_capacidad PASSED
tests/test_reservas.py::test_reserva_concurrencia_double_booking PASSED

======================== 15 passed, 3 warnings in X.XXs ========================
```

### ¿Qué verificar?
- Al final dice `15 passed` — ninguna puede fallar
- Los warnings son normales (son avisos de FastAPI sobre funciones deprecadas, no errores)

---

### ❌ Si alguna prueba falla (dice FAILED):
```bash
# Ver el detalle del error:
docker compose exec backend pytest -v --tb=short
```
El error te dirá exactamente qué línea del test falló y por qué.

---

## PUNTO 6 — Verificar la documentación Swagger del backend

### En el navegador:
1. Escribe: `http://localhost:4000/docs`
2. Presiona Enter

### ¿Qué esperar? ✅
Se abre la interfaz Swagger UI con todos los endpoints listados:
- `/api/auth/registro`
- `/api/auth/login`
- `/api/auth/logout`
- `/api/empleados`
- `/api/empleados/{id_empleado}`
- `/api/empleados/{id_empleado}/rol`
- `/api/empleados/{id_empleado}/estado`
- `/api/habitaciones`
- `/api/habitaciones/disponibilidad`
- `/api/reservas`
- `/health`

Esta documentación la genera FastAPI automáticamente. Es muy útil para mostrarle al profesor todos los endpoints documentados.

---

## PUNTO 7 — Verificar el tablero de GitHub Projects

### En el navegador:
1. Escribe: `https://github.com/users/bookingsoftHOTELFACILE/projects/1`
2. Presiona Enter

### ¿Qué esperar? ✅
- Columna **Backlog**: 3 ítems (RF-013, RF-014, RF-015)
- Columna **En Proceso**: vacía
- Columna **Pruebas**: vacía
- Columna **Hecho**: 12 ítems (RF-001 al RF-012)

---

## PUNTO 8 — Verificar la documentación en GitHub

### En el navegador:
1. Abre: `https://github.com/bookingsoftHOTELFACILE/PROYECTO_FACILE`
2. Navega a la carpeta `docs/requisitos/`
3. Verifica que existen estas carpetas: `RFs/`, `RNFs/`, `HUs/`
4. Abre `MATRIZ_TRAZABILIDAD.md` y verifica que carga correctamente

---

## PUNTO 9 — Verificar la auditoría de dependencias

### En el navegador (GitHub):
1. Navega a: `docs/AUDITORIA_DEPENDENCIAS.md`
2. Verifica que tiene las 4 secciones:
   - Sección 1: Dependencias del Backend
   - Sección 2: Resultado pip-audit (con los 30 CVEs)
   - Sección 3: Resultado pnpm audit (con los 16 CVEs)
   - Sección 4: Decisión sobre las vulnerabilidades (riesgo aceptado)

---

## SECUENCIA RÁPIDA DE VERIFICACIÓN COMPLETA

Si tienes poco tiempo, corre estos 3 comandos seguidos:

```bash
# 1. Estado de contenedores
docker compose ps

# 2. Health del backend
curl http://localhost:4000/health

# 3. Las 15 pruebas
docker compose exec backend pytest -v
```

Si los 3 responden bien, el sistema está 100% operativo para la expo.

---

## TABLA DE REFERENCIA RÁPIDA — ¿Qué hacer si algo falla?

| Problema | Comando para diagnosticar | Solución |
|:---|:---|:---|
| Contenedor no corre | `docker compose ps` | `docker compose up -d` |
| Backend no responde | `curl localhost:4000/health` | `docker compose restart backend` |
| Frontend no abre | Abrir `localhost:3000` en navegador | `docker compose restart frontend` |
| Login falla | Intentar con curl | `docker compose down -v && docker compose up -d` |
| Pruebas fallan | `pytest -v --tb=short` | Ver el log del error específico |
| Todo roto | — | `docker compose down -v && docker compose up --build -d` |

> 💡 **El comando nuclear** (lo arregla casi todo): `docker compose down -v && docker compose up --build -d`
> Úsalo si ninguna otra solución funciona. Tarda ~2 minutos pero deja todo limpio.

---

## 🛠️ GUÍA DE EMERGENCIA: ¿Qué hacer si dice "address already in use" (Puertos 5432, 4000 o 3000 ocupados)?

Si al ejecutar `docker compose up -d` te sale un error como este:
`Error response from daemon: ports are not available: ... bind: address already in use`

Significa que **PostgreSQL local** o un proceso **docker-proxy huérfano** se quedó escuchando en alguno de los puertos (`5432`, `4000` o `3000`).

### 📋 Secuencia Paso a Paso para Solucionarlo:

#### 1. Abre tu terminal y ubícate en la carpeta del proyecto:
```bash
cd "/media/hackboy/SENA1/00 SENA/TODO LO DEL PROYECTO BOOKINGSOFT/PROYECTO_FACILE"
```

#### 2. Detén los contenedores actuales:
```bash
docker compose down -v
```

#### 3. Elimina automáticamente los procesos huérfanos que estén bloqueando los puertos:
```bash
sudo pkill -f "docker-proxy"
sudo pkill -f "postgres"
```
*(Te pedirá la contraseña de tu usuario).*

#### 4. Vuelve a levantar los contenedores:
```bash
docker compose up -d
```

#### 5. Verifica que los 3 contenedores estén activos:
```bash
docker compose ps
```

### 🎯 Resultado esperado:
```
NAME                   STATUS                    PORTS
bookingsoft-db         Up (healthy)              0.0.0.0:5432->5432/tcp
bookingsoft-backend    Up (healthy)              0.0.0.0:4000->4000/tcp
bookingsoft-frontend   Up                        0.0.0.0:3000->80/tcp
```

