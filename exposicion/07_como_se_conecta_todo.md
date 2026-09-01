# 🔗 Parte 7: Cómo se Conecta Todo con Todo
> Por qué se ponen los `import` donde se ponen, qué le da cada archivo a otro, y cómo fluye una petición de punta a punta.

---

## La idea central: cada archivo es una pieza de LEGO

Ningún archivo del proyecto funciona solo. Cada uno "importa" (trae) piezas de otros archivos y "exporta" (ofrece) sus propias piezas. El sistema funciona porque todas las piezas están conectadas en el orden correcto.

---

## PARTE A: Las conexiones del BACKEND (Python)

### El mapa de dependencias del backend

```
schema.sql
    ↓ (se ejecuta al arrancar)
database/connection.py
    ↓ (provee obtener_conexion())
    ├── routes/auth.py
    ├── routes/empleados.py
    ├── routes/habitaciones.py
    ├── routes/reservas.py
    └── routes/huespedes.py

models/schemas.py
    ↓ (provee las clases de validación)
    ├── routes/auth.py         (usa EmpleadoRegistro, LoginRequest, TokenResponse)
    └── routes/reservas.py     (usa ReservaCreate)

dependencies.py
    ↓ (provee autenticar() y requiere_rol())
    ├── routes/auth.py
    ├── routes/empleados.py
    ├── routes/habitaciones.py
    ├── routes/reservas.py
    └── routes/huespedes.py

routes/*.py
    ↓ (proveen sus routers)
main.py  ← ensambla todo
```

---

### `database/connection.py` → todos los routers

**¿Por qué todos los routers importan de `database/connection`?**

```python
# En routes/auth.py
from database import connection

# Luego dentro de cada función:
conn = connection.obtener_conexion()
cur  = conn.cursor()
cur.execute("SELECT ...")
```

`connection.py` tiene UNA responsabilidad: saber cómo conectarse a PostgreSQL. Guarda la información de la BD (host, puerto, usuario, contraseña) en un solo lugar. Si mañana cambia el host de la BD, solo se cambia en `connection.py`, no en los 5 routers.

**¿Qué pasa si no hubiera este archivo centralizado?**
Cada router tendría su propia conexión con sus propios datos de configuración. Si cambia la contraseña de la BD, habría que cambiarla en 5 lugares diferentes. Eso se llama "código duplicado" y es un problema real de mantenimiento.

---

### `models/schemas.py` → `routes/auth.py` y `routes/reservas.py`

```python
# En routes/auth.py:
from models.schemas import EmpleadoRegistro, LoginRequest, TokenResponse

@router.post("/registro")
def registrar_empleado(datos: EmpleadoRegistro):  # ← FastAPI usa el schema para validar
    ...
```

**¿Por qué importar desde `models/schemas.py` y no definir las clases directamente en `auth.py`?**

Porque los schemas son "contratos de datos" que pueden usarse en varios lugares. Si `EmpleadoRegistro` se definiera en `auth.py` y otro router la necesitara, tendría que importar desde `auth.py` (mezcla de responsabilidades) o duplicarla (código repetido).

Al tenerlos en `models/schemas.py`, cualquier router puede importar solo lo que necesita sin depender de otro router.

**¿Cómo funciona la validación automática?**

```python
@router.post("/registro")
def registrar_empleado(datos: EmpleadoRegistro):
    # FastAPI ve que el parámetro es de tipo EmpleadoRegistro (un BaseModel de Pydantic)
    # ANTES de llamar a esta función, FastAPI:
    # 1. Lee el JSON del request
    # 2. Intenta construir un objeto EmpleadoRegistro con ese JSON
    # 3. Si falla (falta un campo, tipo incorrecto, email inválido) → 422 automático
    # 4. Si funciona → llama a registrar_empleado(datos=EmpleadoRegistro(...))
    ...
```

El `datos` que llega a la función ya está validado y tiene los tipos correctos (`datos.correo` es `EmailStr`, `datos.rol` es uno de los 5 valores permitidos, etc.)

---

### `dependencies.py` → todos los routers

```python
# En dependencies.py se DEFINEN las funciones:
def autenticar(...) -> UsuarioActual: ...
def requiere_rol(*roles) -> Callable: ...

# En routes/empleados.py se IMPORTAN y se USAN:
from dependencies import UsuarioActual, autenticar, requiere_rol

@router.get("", dependencies=[Depends(requiere_rol("Administrador", "Recepcionista 24h"))])
def listar_empleados():
    ...
```

**¿Por qué `dependencies.py` está separado y no dentro de `auth.py`?**

Porque `auth.py` maneja los endpoints de autenticación (registro, login, logout). Las funciones `autenticar()` y `requiere_rol()` NO son endpoints — son **utilidades de seguridad** que usan TODOS los demás endpoints. Si estuvieran en `auth.py`, los otros routers importarían de `auth.py`, creando una dependencia cruzada confusa:

```
# Mal diseño ❌
routes/empleados.py  →  importa de  →  routes/auth.py
routes/reservas.py   →  importa de  →  routes/auth.py
# auth.py se convierte en "dios" de seguridad Y de endpoints de auth

# Buen diseño ✅
routes/empleados.py  →  importa de  →  dependencies.py
routes/reservas.py   →  importa de  →  dependencies.py
routes/auth.py       →  importa de  →  dependencies.py
# dependencies.py tiene UNA responsabilidad: seguridad reutilizable
```

---

### `routes/*.py` → `main.py`

```python
# En main.py:
from routes import huespedes, habitaciones, reservas, auth, empleados

app.include_router(auth.router)
app.include_router(empleados.router)
app.include_router(habitaciones.router)
app.include_router(reservas.router)
app.include_router(huespedes.router)
```

**¿Qué es un `router` y por qué se "incluye" en `app`?**

Dentro de cada archivo de rutas hay esto:
```python
# En routes/auth.py:
router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/registro")   # → el URL completo es /api/auth/registro
def registrar_empleado(): ...

@router.post("/login")      # → el URL completo es /api/auth/login
def login(): ...
```

`router` es un contenedor de endpoints con un prefijo de URL. `main.py` los ensambla todos en la aplicación principal. Es como armar un libro: cada capítulo (router) se escribe separado y luego el índice (main.py) los une.

**¿Por qué `prefix="/api/auth"`?**
Para agrupar todos los endpoints de autenticación bajo `/api/auth/`. Sin prefijo, `login` sería `/login` y `registro` sería `/registro`. Con prefijo, es claro que ambos pertenecen al módulo de autenticación.

---

## PARTE B: El flujo de UNA petición de punta a punta

### Ejemplo: el usuario hace login desde el frontend

```
PASO 1: El usuario escribe usuario y contraseña y hace clic en "Login"

PASO 2: React ejecuta:
  fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ usuario: 'sandra_admin', contrasena: 'Admin2026!' })
  })

PASO 3: La petición va al servidor → Nginx la recibe en el puerto 3000
  ├── La URL empieza con /api/ → Nginx la redirige a http://backend:4000/api/auth/login
  └── No necesita archivos estáticos → no sirve HTML

PASO 4: Uvicorn (el servidor de Python) recibe la petición en el puerto 4000
  └── FastAPI busca qué función maneja POST /api/auth/login
      → Encuentra @router.post("/login") en routes/auth.py
      → Antes de llamar a la función: Pydantic valida el JSON con LoginRequest
      → JSON válido → llama a la función login(credenciales=LoginRequest(...))

PASO 5: Dentro de login() en routes/auth.py:
  conn = connection.obtener_conexion()    ← pide conexión a PostgreSQL
  cur.execute("SELECT ... FROM empleado WHERE usuario = %s", ('sandra_admin',))
  fila = cur.fetchone()                   ← busca el empleado en la BD
  
  bcrypt.checkpw('Admin2026!'.encode(), hash_guardado.encode())  ← verifica contraseña
  
  token = _crear_token(id_empleado=1, rol='Administrador')      ← genera JWT
  return TokenResponse(access_token=token)                       ← responde

PASO 6: FastAPI serializa el resultado a JSON:
  {"access_token": "eyJhbGci...", "token_type": "bearer"}

PASO 7: Uvicorn envía la respuesta HTTP 200 → Nginx → navegador → React

PASO 8: React guarda el token en el estado y lo usa en siguientes peticiones:
  fetch('/api/empleados', {
    headers: { 'Authorization': 'Bearer eyJhbGci...' }
  })
```

---

### Ejemplo: obtener lista de empleados (con autenticación)

```
PASO 1: React llama GET /api/empleados con el token JWT en el header

PASO 2: FastAPI recibe la petición → encuentra @router.get("") en routes/empleados.py

PASO 3: FastAPI ve: dependencies=[Depends(requiere_rol("Administrador", "Recepcionista 24h"))]
  → Llama a requiere_rol() ANTES de llamar a listar_empleados()
  → requiere_rol() internamente llama a autenticar()

PASO 4: autenticar() en dependencies.py:
  ├── HTTPBearer extrae el token del header Authorization: Bearer eyJhbGci...
  ├── jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
  │     → Verifica que la firma es correcta
  │     → Verifica que no expiró
  ├── Extrae sub="1" y rol="Administrador" del payload
  └── Retorna UsuarioActual(id_empleado=1, rol="Administrador")

PASO 5: requiere_rol() verifica:
  ├── usuario.rol = "Administrador"
  ├── "Administrador" IN ("Administrador", "Recepcionista 24h") → TRUE ✓
  └── Continúa → llama a listar_empleados()

PASO 6: listar_empleados() en routes/empleados.py:
  conn = connection.obtener_conexion()
  cur.execute("SELECT id_empleado, nombre, ... FROM empleado ORDER BY id_empleado")
  # NOTA: la contraseña NO está en el SELECT ← seguridad
  filas = cur.fetchall()
  return [{"id_empleado": f[0], "nombre": f[1], ...} for f in filas]

PASO 7: FastAPI serializa la lista a JSON → Nginx → React → se muestra en la tabla
```

---

## PARTE C: Las conexiones del FRONTEND (React)

### El mapa de archivos del frontend

```
index.html
    └── <script src="/src/main.jsx">
            └── main.jsx
                    └── import App from './App.jsx'
                    └── import './index.css'
                            └── App.jsx  ← toda la lógica aquí
```

### `index.html` → `main.jsx`

```html
<!-- index.html -->
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

El `index.html` es el punto de entrada real del navegador. Solo tiene un `<div id="root">` vacío y un `<script>` que carga `main.jsx`. React llena ese `<div>` con toda la UI.

### `main.jsx` → `App.jsx` e `index.css`

```jsx
// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'      // ← importa el componente principal
import './index.css'              // ← importa los estilos globales

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

`main.jsx` tiene una sola misión: "montar" la aplicación React dentro del `<div id="root">`. No tiene lógica propia, es solo el pegamento entre el HTML y React.

**¿Por qué `import './index.css'` está aquí y no en `App.jsx`?**
Se puede importar en cualquiera de los dos, pero `main.jsx` es el punto de entrada — tiene sentido que los estilos globales se carguen aquí. Si estuvieran en `App.jsx`, funcionaría igual, pero sería menos claro que son estilos de toda la app.

### `App.jsx` — los imports explicados uno por uno

```jsx
import React, { useState, useEffect } from 'react';
```
- `React`: necesario para que JSX funcione (aunque en React 17+ no es obligatorio, se mantiene por claridad)
- `useState`: hook para crear variables reactivas
- `useEffect`: hook para ejecutar código con efectos secundarios (llamadas a API, etc.)
- Se importan desde `'react'` (la librería instalada en `node_modules`)

```jsx
import { UserPlus, ShieldCheck, Mail, Phone, FileText,
         Briefcase, Users, AlertCircle, Calendar, Home,
         ListOrdered, Wifi, WifiOff } from 'lucide-react';
```
- Son íconos SVG como componentes React
- Se importan solo los que se usan (tree-shaking: Vite no incluye los que no se usan en el build final)
- Cada ícono es un componente: `<Wifi size={13}/>` → renderiza el SVG del ícono WiFi con tamaño 13px

**¿Por qué se importan así `{ UserPlus, Mail, ... }` con llaves?**
Porque `lucide-react` exporta múltiples cosas con nombre (`named exports`). Las llaves `{}` le dicen a JavaScript "trae específicamente estos nombres de ese módulo". Si `lucide-react` exportara una sola cosa como `default export`, se importaría sin llaves: `import LucideIcons from 'lucide-react'`.

---

## PARTE D: Cómo se comunican Frontend y Backend

### Durante desarrollo local (sin Docker)

```
Navegador → localhost:3000 (Vite dev server)
    ↓
    Si URL empieza con /api/ → vite.config.js hace proxy → localhost:4000 (FastAPI)
    Si URL es otra cosa → Vite sirve los archivos de React
```

**vite.config.js:**
```js
proxy: {
  '/api': { target: 'http://localhost:4000', changeOrigin: true }
}
```

El proxy de Vite actúa como intermediario. El navegador siempre habla con `localhost:3000` — nunca sabe que hay un backend en `4000`. Vite reenvía las peticiones `/api/` internamente.

### En producción (con Docker)

```
Navegador → localhost:3000 (Nginx en contenedor frontend)
    ↓
    Si URL empieza con /api/ → nginx.conf hace proxy_pass → http://backend:4000 (FastAPI en contenedor backend)
    Si URL es otra cosa → Nginx sirve los archivos estáticos del build de React
```

**nginx.conf:**
```nginx
location /api/ {
    proxy_pass http://backend:4000/api/;
}
```

Nginx hace exactamente lo mismo que Vite en desarrollo, pero en producción. El concepto es idéntico — un proxy reverso que dirige las peticiones al lugar correcto.

**`http://backend:4000`**: dentro de la red Docker, `backend` es el nombre del contenedor del backend. Docker tiene su propio DNS interno que resuelve el nombre del servicio a su IP.

---

## PARTE E: Por qué los imports están donde están — Regla de oro

### En Python:
```
Si el archivo A necesita algo del archivo B → A importa de B
El archivo con MENOS dependencias va "abajo" en la jerarquía
```

```
schema.sql          → no importa nada (es SQL puro)
connection.py       → importa solo librerías externas (psycopg2, os)
schemas.py          → importa solo librerías externas (pydantic)
dependencies.py     → importa librerías externas (jwt, fastapi) + connection.py? No → solo jwt
routes/auth.py      → importa connection + schemas + dependencies
routes/empleados.py → importa connection + dependencies
routes/habitaciones.py → importa connection + dependencies
routes/reservas.py  → importa connection + schemas + dependencies
main.py             → importa todos los routers + connection ← el más alto
```

**Regla de oro: los archivos "base" (que muchos usan) no importan de los que los usan.**
- `connection.py` NO importa de `auth.py` ni de `empleados.py`
- `dependencies.py` NO importa de `auth.py` ni de `empleados.py`
- `schemas.py` NO importa de `auth.py` ni de `empleados.py`

Si `connection.py` importara de `auth.py` y `auth.py` importara de `connection.py`, habría un **circular import** — Python no puede resolver eso y el programa no arranca.

### En JavaScript/React:
```
index.html → main.jsx → App.jsx → lucide-react, 'react'
                      ↘ index.css
```

La misma lógica aplica. `App.jsx` importa de librerías externas y de `index.css`. No hay ningún archivo local que importe de `App.jsx` (a menos que se dividiera en componentes, lo cual no se hizo aquí).

---

## PARTE F: El viaje completo de los datos (diagrama final)

```
┌─────────────────────────────────────────────────────────────┐
│                     USUARIO                                  │
│  Escribe datos → hace clic → ve resultado                   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP Request (JSON)
┌────────────────────────▼────────────────────────────────────┐
│               FRONTEND (React + Nginx)                       │
│  App.jsx: useState guarda el estado                         │
│  fetch('/api/...') → Nginx redirige al backend              │
│  Resultado JSON → setHuespedes([...]) → React re-renderiza  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP (interno Docker: backend:4000)
┌────────────────────────▼────────────────────────────────────┐
│               BACKEND (FastAPI + Python)                     │
│  main.py → encuentra el router correcto                     │
│  dependencies.py → verifica JWT y rol                       │
│  models/schemas.py → valida el JSON del request             │
│  routes/*.py → ejecuta la lógica de negocio                 │
│  database/connection.py → obtiene conexión a PostgreSQL     │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL (psycopg2: db:5432)
┌────────────────────────▼────────────────────────────────────┐
│               BASE DE DATOS (PostgreSQL)                     │
│  schema.sql define las tablas                               │
│  CHECK constraints validan los datos                        │
│  EXCLUDE constraint previene doble booking                  │
│  Triggers verifican mantenimiento                           │
│  fn_calcular_noches_y_precio() calcula el precio            │
│  Responde con los datos solicitados                         │
└─────────────────────────────────────────────────────────────┘
```

**El camino de vuelta:**
```
PostgreSQL → rows de datos
    → psycopg2 los convierte a tuplas Python
    → el router los convierte a diccionarios Python
    → FastAPI serializa a JSON
    → Uvicorn envía HTTP Response
    → Nginx lo recibe y lo reenvía al navegador
    → React recibe el JSON y actualiza el estado
    → useState dispara re-render
    → El usuario ve el resultado en pantalla
```

Todo este viaje ocurre en menos de 100ms en condiciones normales.
