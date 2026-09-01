# 👥 Parte 4: Backend — Empleados, Habitaciones y Schemas
> empleados.py, habitaciones.py y models/schemas.py explicados en detalle.

---

## `models/schemas.py` — La validación de datos con Pydantic

Pydantic es la biblioteca que FastAPI usa para **validar automáticamente los datos que llegan en los requests**. Antes de que el código del endpoint se ejecute, Pydantic ya verificó que el JSON tiene los campos correctos y el tipo correcto.

### `EmpleadoRegistro` — Schema para el registro

```python
class EmpleadoRegistro(BaseModel):
    tipo_documento:   Optional[TIPOS_DOCUMENTO] = 'Cédula de ciudadanía'
    numero_documento: str
    nombre:           str
    correo:           EmailStr       # ← Pydantic valida que sea un email válido
    usuario:          str
    contrasena:       str
    rol:              Optional[ROLES_VALIDOS] = 'Recepcionista 24h'
```

**¿Qué pasa si alguien manda `"correo": "esto no es un email"`?**
Pydantic lo rechaza automáticamente con un **422 Unprocessable Entity** antes de que el código Python del endpoint siquiera arranque. El error incluye exactamente qué campo falló y por qué.

**`Literal['Administrador', 'Recepcionista 24h', ...]`**: Pydantic rechaza cualquier rol que no esté en esa lista. Si alguien manda `"rol": "Jefe"`, recibe 422 automáticamente.

### `ReservaCreate` — Schema para crear reservas

```python
class ReservaCreate(BaseModel):
    id_huesped:     int
    id_habitacion:  int
    fecha_entrada:  str
    fecha_salida:   str
    numero_personas: int = Field(..., ge=1)   # ge=1 significa "mayor o igual a 1"
```

`Field(..., ge=1)` le dice a Pydantic: el campo es obligatorio (`...`) y debe ser ≥ 1. Si alguien manda `"numero_personas": 0` o `-1`, Pydantic lo rechaza con 422.

---

## `routes/empleados.py` — Gestión del personal

### GET `/api/empleados` — Listar con filtros (RF-002)

```python
@router.get("", dependencies=[Depends(requiere_rol(*_ROLES_GESTION))])
def listar_empleados(estado: Optional[str] = None, rol: Optional[str] = None):
```

Los parámetros `estado` y `rol` son **query params opcionales**. El usuario puede llamar:
- `GET /api/empleados` → todos
- `GET /api/empleados?estado=Activo` → solo activos
- `GET /api/empleados?rol=Recepcionista%2024h` → solo recepcionistas
- `GET /api/empleados?estado=Activo&rol=Administrador` → activos Y administradores

**¿Cómo funciona la query dinámica?**
```python
query = "SELECT ... FROM empleado WHERE 1=1"
params = []

if estado:
    query += " AND estado = %s"
    params.append(estado)

if rol:
    query += " AND rol = %s"
    params.append(rol)

cur.execute(query, params)
```

`WHERE 1=1` es un truco clásico: es siempre verdadero, así el primer filtro siempre puede empezar con `AND` sin necesidad de saber si es el primero o no. Se construye el SQL dinámicamente según qué filtros llegaron.

**¿Por qué `%s` en lugar de concatenar strings?**
```python
# MAL ❌ — vulnerable a SQL Injection
query = f"WHERE estado = '{estado}'"

# BIEN ✅ — parámetros separados, psycopg2 los sanitiza
query = "WHERE estado = %s"
cur.execute(query, (estado,))
```

Si el usuario manda `estado = "' OR 1=1 --"`, la concatenación de strings permitiría un ataque de inyección SQL. Con `%s` y parámetros separados, psycopg2 escapa los valores automáticamente.

**La contraseña nunca aparece en la respuesta:**
```python
SELECT id_empleado, nombre, usuario, rol, estado, tipo_documento, numero_documento, correo
FROM empleado
-- ↑ NO incluye "contrasena" en el SELECT
```

### PATCH `/api/empleados/{id}/rol` — Cambiar rol (RF-006)

**RN-006.2 — El rol 'Administrador' no se puede asignar:**
```python
_ROLES_ASIGNABLES = ("Recepcionista 24h", "Ama de llaves", "Personal de mantenimiento", "Conserje")

if nuevo_rol == "Administrador":
    raise HTTPException(400, "No se puede asignar el rol 'Administrador' desde este endpoint")
```

¿Por qué? Porque el Administrador es el rol de mayor privilegio. Si cualquier recepcionista pudiera asignarlo, podría escalar sus propios privilegios. El único administrador inicial viene del seed de la BD.

**Salvaguarda — El sistema nunca se queda sin quien lo administre:**
```python
if rol_actual in _ROLES_GESTION and nuevo_rol not in _ROLES_GESTION:
    # Este cambio quitaría un rol de gestión. ¿Queda alguno más?
    cur.execute("SELECT COUNT(*) FROM empleado WHERE rol IN ('Administrador', 'Recepcionista 24h') AND estado = 'Activo'")
    total_gestion = cur.fetchone()[0]
    if total_gestion <= 1:
        raise HTTPException(409, "No puede modificar: es el único usuario con permisos de gestión activo")
```

Si solo queda un administrador activo y alguien intenta cambiarle el rol, el sistema lo bloquea. Así el apartahotel siempre tiene al menos un usuario capaz de gestionar el sistema.

### PATCH `/api/empleados/{id}/estado` — Activar/Desactivar (RF-010)

La misma salvaguarda aplica: si es el único usuario con rol de gestión activo, no se puede desactivar.

```python
if nuevo_estado == "Inactivo" and estado_actual == "Activo" and rol_emp in _ROLES_GESTION:
    # Verificar si quedaría algún otro gestor activo
    ...
```

---

## `routes/habitaciones.py` — Catálogo y disponibilidad

### GET `/api/habitaciones` — Catálogo general

Todos los roles pueden ver el catálogo de habitaciones. No tiene filtros porque es simplemente el listado completo.

### GET `/api/habitaciones/disponibilidad` — RF-012

Este es uno de los endpoints más complejos. Recibe dos fechas y devuelve qué habitaciones están libres en ese período.

**Validaciones antes de consultar la BD:**
```python
# 1. Verificar formato AAAA-MM-DD
try:
    entrada_dt = datetime.strptime(fecha_entrada, "%Y-%m-%d").date()
    salida_dt  = datetime.strptime(fecha_salida,  "%Y-%m-%d").date()
except ValueError:
    raise HTTPException(400, "Formato inválido. Debe ser AAAA-MM-DD")

# 2. Verificar coherencia
if salida_dt <= entrada_dt:
    raise HTTPException(400, "La fecha de salida debe ser posterior a la entrada")
```

**La consulta SQL de disponibilidad:**
```sql
SELECT
    h.id_habitacion, h.numero, h.tipo, h.capacidad, h.precio_noche,
    CASE
        WHEN h.estado = 'Mantenimiento' THEN 'Mantenimiento'
        WHEN EXISTS (
            SELECT 1 FROM reserva_habitacion r
            WHERE r.id_habitacion = h.id_habitacion
              AND r.estado IN ('Confirmada', 'Check-In')
              AND r.fecha_entrada < :fecha_salida    -- solapamiento
              AND r.fecha_salida  > :fecha_entrada   -- de fechas
        ) THEN 'Ocupada'
        ELSE 'Disponible'
    END AS estado_rango
FROM habitacion h
```

**¿Cómo funciona el solapamiento de fechas?**
Dos rangos `[A, B)` y `[C, D)` se solapan si `A < D` Y `B > C`.
- Reserva existente: entrada=3sep, salida=7sep
- Consulta: entrada=5sep, salida=10sep
- ¿Se solapan? → `3sep < 10sep` ✓ Y `7sep > 5sep` ✓ → **Ocupada**

El `CASE WHEN` en el SQL evalúa primero Mantenimiento (sin importar reservas), luego Ocupada (si hay reservas que solapan), sino Disponible.

**¿Por qué incluir 'Check-In' además de 'Confirmada'?**
Una habitación con estado 'Check-In' ya tiene gente adentro. Aunque el flujo de check-in no está implementado aún (Fase 2), el constraint ya acepta ese estado. Así cuando se implemente, la disponibilidad ya lo maneja correctamente.

**Respuesta del endpoint:**
```json
[
  {
    "id_habitacion": 1,
    "numero": "101A",
    "tipo": "Habitaciones",
    "capacidad": 2,
    "precio_noche": 243000.0,
    "estado_base": "Disponible",
    "estado_rango": "Ocupada",     ← ocupada en ESE rango de fechas
    "disponible": false
  },
  {
    "id_habitacion": 3,
    "numero": "201D",
    ...
    "estado_rango": "Disponible",  ← libre en ese rango
    "disponible": true
  }
]
```

La diferencia entre `estado_base` y `estado_rango` es importante:
- `estado_base`: el estado actual de la habitación en la BD ('Disponible', 'Mantenimiento', etc.)
- `estado_rango`: si está libre O ocupada para las fechas específicas consultadas
