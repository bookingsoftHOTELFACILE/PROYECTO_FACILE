# 🔐 Parte 3: Backend — Autenticación y Seguridad
> main.py, dependencies.py y auth.py explicados en detalle.

---

## `main.py` — El punto de entrada de FastAPI

Este es el **primer archivo que lee Python al arrancar el servidor**. Es como el "menú" que organiza todo.

```python
app = FastAPI(
    title="BookingSoft API - FastAPI",
    description="...",
    version="1.0.0"
)
```

Esto crea la aplicación FastAPI. También genera automáticamente la documentación interactiva en `http://localhost:4000/docs` (Swagger UI). El profesor puede entrar a esa URL y ver todos los endpoints documentados.

### CORS — Permitir peticiones del frontend

```python
cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
app.add_middleware(CORSMiddleware, allow_origins=cors_origins, ...)
```

**¿Qué es CORS?**
Los navegadores tienen una regla de seguridad: solo permiten que una página web haga peticiones HTTP al mismo dominio del que proviene. Si el frontend está en `localhost:3000` y el backend en `localhost:4000`, el navegador bloquearía la petición por ser dominios distintos.

CORS (Cross-Origin Resource Sharing) es el mecanismo que le dice al navegador: "está bien, acepto peticiones de `localhost:3000`". Sin esto, el frontend no podría comunicarse con el backend desde el navegador.

### Evento de startup

```python
@app.on_event("startup")
def startup_event():
    connection.inicializar_base_de_datos()
```

Cuando FastAPI arranca, antes de aceptar cualquier petición, ejecuta `inicializar_base_de_datos()`. Esta función carga el `schema.sql` y crea las tablas si no existen. Así el sistema es autoconfigurado.

### Registro de routers

```python
app.include_router(auth.router)
app.include_router(empleados.router)
app.include_router(habitaciones.router)
app.include_router(reservas.router)
app.include_router(huespedes.router)
```

Cada módulo de rutas se registra aquí. Un "router" es una colección de endpoints relacionados. Esto mantiene el código organizado — `auth.py` solo tiene endpoints de autenticación, `reservas.py` solo reservas, etc.

### Health check endpoint

```python
@app.get("/health")
def health_check():
    try:
        conn = connection.obtener_conexion()
        conn.close()
        return {"status": "OK", "modo": "Físico (PostgreSQL)"}
    except:
        raise HTTPException(503, "Fallo de conexión con PostgreSQL")
```

Este endpoint sirve para 2 cosas:
1. Docker lo usa para el healthcheck del contenedor del backend.
2. El frontend lo llama al cargar para saber si el backend está disponible.

Si la BD no está conectada, devuelve 503 (Service Unavailable) en lugar de 200 OK.

---

## `dependencies.py` — El sistema de autenticación reutilizable

Este archivo es la **infraestructura de seguridad** del backend. Todo endpoint que necesite autenticación usa las funciones de aquí.

### ¿Qué es una "dependencia" en FastAPI?

En FastAPI, una dependencia es una función que se ejecuta automáticamente antes del handler del endpoint. Se declara con `Depends(...)`. Si la dependencia lanza un error (como un 401), el endpoint nunca se ejecuta.

### `UsuarioActual` — El objeto del usuario en sesión

```python
@dataclass
class UsuarioActual:
    id_empleado: int
    rol: str
```

Cuando el JWT es válido, se extrae el `id_empleado` y el `rol` del payload y se guardan en este objeto. Los endpoints que necesitan saber quién está logueado reciben este objeto.

### `autenticar()` — Verificar que el token es válido

```python
def autenticar(credenciales = Depends(_bearer_scheme)) -> UsuarioActual:
    # 1. ¿Hay token en el header Authorization?
    if credenciales is None:
        raise HTTPException(401, "No autenticado")

    # 2. ¿El token tiene firma válida?
    try:
        payload = jwt.decode(credenciales.credentials, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "El token ha expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Token inválido")

    # 3. ¿El payload tiene los campos esperados?
    sub = payload.get("sub")   # id del empleado
    rol = payload.get("rol")   # rol del empleado
    if not sub or not rol:
        raise HTTPException(401, "Token con estructura inesperada")

    return UsuarioActual(id_empleado=int(sub), rol=rol)
```

**Flujo completo:**
1. El cliente manda `Authorization: Bearer eyJhbGci...` en el header.
2. `HTTPBearer` extrae automáticamente el token.
3. `jwt.decode()` verifica que la firma sea correcta con `JWT_SECRET`.
4. Si el token fue manipulado o expiró, lanza excepción → 401 Unauthorized.
5. Si es válido, extrae `sub` (id del usuario) y `rol` del payload.
6. Devuelve `UsuarioActual` con esos datos.

### `requiere_rol()` — Verificar que el usuario tiene el rol correcto

```python
def requiere_rol(*roles_permitidos: str):
    def _verificar(usuario: UsuarioActual = Depends(autenticar)) -> UsuarioActual:
        if usuario.rol not in roles_permitidos:
            raise HTTPException(403, f"Acceso denegado. Se requiere: {roles_permitidos}")
        return usuario
    return _verificar
```

Este es un **patrón de fábrica**: `requiere_rol("Administrador")` devuelve una nueva función dependencia que primero verifica el JWT (llamando a `autenticar`) y luego verifica el rol.

**Ejemplo de uso:**
```python
@router.get("/api/empleados", dependencies=[Depends(requiere_rol("Administrador", "Recepcionista 24h"))])
def listar_empleados():
    ...
```

Si un `Ama de llaves` intenta acceder a ese endpoint con su token válido, recibe **403 Forbidden** — autenticado pero sin autorización para esa ruta.

---

## `routes/auth.py` — Registro, Login y Logout

### POST `/api/auth/registro` — Registrar empleado

**Flujo completo de un registro exitoso:**

1. Pydantic valida el JSON del request (campos requeridos, formato de email, rol válido).
2. El código verifica manualmente que los campos no estén vacíos (Pydantic permite strings vacíos por defecto).
3. **Hashear la contraseña:**
   ```python
   hashed = bcrypt.hashpw(datos.contrasena.encode(), bcrypt.gensalt()).decode()
   ```
   - `datos.contrasena.encode()` → convierte el string a bytes
   - `bcrypt.gensalt()` → genera un salt aleatorio único para este usuario
   - `bcrypt.hashpw()` → combina la contraseña + salt y hace 4096 iteraciones de hashing
   - `.decode()` → convierte el resultado de bytes a string para guardarlo en la BD

4. Verificar duplicados (documento, correo, usuario) con SELECT antes del INSERT.
5. INSERT en la tabla `empleado` con el hash (nunca con la contraseña real).
6. Retornar 201 Created con los datos del empleado (sin incluir la contraseña).

**¿Por qué verificar duplicados antes del INSERT en lugar de dejar que la BD falle?**
Porque podemos devolver un mensaje de error descriptivo. Si dejamos que el UNIQUE constraint de la BD falle, psycopg2 lanza una excepción genérica que tenemos que parsear para saber qué campo causó el problema. Es más limpio verificar explícitamente.

### POST `/api/auth/login` — Iniciar sesión

```python
_CRED_ERROR = HTTPException(401, "Credenciales incorrectas.")
```

**Regla de seguridad crítica (CA-002.3):** El mismo mensaje de error para dos casos distintos:
- Usuario no existe → `"Credenciales incorrectas."`
- Contraseña incorrecta → `"Credenciales incorrectas."`

¿Por qué el mismo mensaje? Si el error dijera "Usuario no encontrado", un atacante sabría qué usuarios existen en el sistema. Con el mismo mensaje, no puede distinguir si el usuario existe o no.

**Verificar la contraseña:**
```python
if not bcrypt.checkpw(credenciales.contrasena.encode(), hash_guardado.encode()):
    raise _CRED_ERROR
```

`bcrypt.checkpw` hace el hash de la contraseña ingresada con el mismo salt que está en el hash guardado y compara. Si coinciden, la contraseña es correcta. Nunca se "deshashea" — bcrypt es una función de sentido único.

**Usuario inactivo (CA-002.4):** Si las credenciales son correctas pero el estado es 'Inactivo', devuelve **403 Forbidden** con un mensaje diferente: "Cuenta inactiva. Contacte al administrador." En este caso SÍ es correcto revelar el motivo porque ya se sabe que las credenciales son correctas.

**Generar el JWT:**
```python
payload = {
    "sub": str(id_empleado),   # "subject" — quién es el usuario
    "rol": rol,                  # el rol para el control de acceso
    "exp": datetime.now(utc) + timedelta(hours=8)  # expira en 8 horas
}
return jwt.encode(payload, JWT_SECRET, algorithm="HS256")
```

El token contiene el id y el rol del usuario. Expira en 8 horas (CA-002.2). Está firmado con `JWT_SECRET` — si alguien modifica el payload, la firma no coincide y el token es rechazado.

### POST `/api/auth/logout` — Cerrar sesión

```python
@router.post("/logout", dependencies=[Depends(autenticar)])
def logout():
    return {"message": "Sesión cerrada exitosamente. Descarte el token en el cliente."}
```

**Decisión de diseño importante:** El logout es **stateless** (sin estado en el servidor). El servidor no guarda una lista negra de tokens revocados. Solo confirma que el token es válido y le dice al cliente que lo descarte.

**¿Por qué no implementar una blacklist?**
Requeriría Redis o una tabla adicional en la BD para guardar tokens revocados. Ningún RF, RN o HU del proyecto lo exige. El JWT expira en 8 horas de todas formas. Para este alcance académico, el enfoque stateless es suficiente y más simple.
