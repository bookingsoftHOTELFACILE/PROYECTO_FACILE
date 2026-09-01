# 📅 Parte 5: Backend — Reservas
> reservas.py explicado en detalle: creación, doble booking y manejo de errores.

---

## `routes/reservas.py` — El módulo más complejo del backend

Las reservas son el núcleo del negocio. Este módulo maneja la creación de reservas con todas sus validaciones: fechas, capacidad, disponibilidad y el problema crítico del doble booking bajo carga concurrente.

---

## GET `/api/reservas` — Listar reservas

```python
@router.get("", dependencies=[Depends(requiere_rol(*_ROLES_RESERVAS))])
def obtener_reservas():
```

Un JOIN entre 3 tablas para devolver la información completa de cada reserva:

```sql
SELECT r.id_reserva, r.id_huesped, h.nombre as huesped_nombre, h.documento,
       r.id_habitacion, hab.numero, hab.tipo,
       r.fecha_entrada, r.fecha_salida, r.estado
FROM reserva_habitacion r
JOIN huesped h ON r.id_huesped = h.id_huesped
JOIN habitacion hab ON r.id_habitacion = hab.id_habitacion
ORDER BY r.fecha_entrada DESC
```

**¿Por qué JOINs y no queries separadas?**
Con JOINs, la BD hace el cruce de tablas internamente en una sola operación. Si hiciéramos 3 queries separadas (primero las reservas, luego los huéspedes, luego las habitaciones), haríamos muchos más viajes a la BD y el código sería más complejo.

---

## POST `/api/reservas` — Crear reserva (RF-011)

Este endpoint tiene el flujo más elaborado del backend. Se ejecuta en este orden:

### Paso 1: Validar formato y coherencia de fechas

```python
try:
    entrada_dt = datetime.strptime(reserva.fecha_entrada, "%Y-%m-%d").date()
    salida_dt  = datetime.strptime(reserva.fecha_salida,  "%Y-%m-%d").date()
except ValueError:
    raise HTTPException(400, "Formato inválido. Debe ser AAAA-MM-DD")
```

Si alguien manda `"fecha_entrada": "15-09-2026"` (formato incorrecto), `strptime` lanza `ValueError` y se devuelve un 400 descriptivo.

### Paso 2: Obtener datos de la habitación

```python
cursor.execute(
    "SELECT precio_noche, numero, estado, capacidad FROM habitacion WHERE id_habitacion = %s",
    (reserva.id_habitacion,)
)
hab_row = cursor.fetchone()
if not hab_row:
    raise HTTPException(404, "La habitación especificada no existe")
```

Si el `id_habitacion` no existe en la BD, devuelve 404 antes de intentar insertar.

### Paso 3: Verificar que no está en Mantenimiento

```python
if estado_hab == "Mantenimiento":
    raise HTTPException(400, f"La habitación {numero_hab} está en Mantenimiento")
```

Aunque el trigger de la BD también lo verifica, es mejor hacerlo antes en Python para devolver un mensaje más claro y no desperdiciar el viaje de red.

### Paso 4: Verificar capacidad (RN-011.4)

```python
if reserva.numero_personas > capacidad_hab:
    raise HTTPException(400, f"Capacidad excedida: máximo {capacidad_hab} persona(s)")
```

Si alguien intenta reservar la habitación 101A (capacidad 2) para 5 personas, recibe 400 antes de llegar a la BD.

### Paso 5: Calcular precio con la función PL/pgSQL

```python
cursor.execute(
    "SELECT noches, subtotal, descuento_aplicado, total FROM fn_calcular_noches_y_precio(%s, %s, %s)",
    (reserva.fecha_entrada, reserva.fecha_salida, precio_noche)
)
noches, subtotal, descuento, total = cursor.fetchone()
```

Esta es la llamada a la función PostgreSQL explicada en el archivo 02. El cálculo lo hace la BD, no Python.

### Paso 6: Insertar la reserva

```python
insertar_query = """
    INSERT INTO reserva_habitacion (id_huesped, id_habitacion, fecha_entrada, fecha_salida, estado)
    VALUES (%s, %s, %s, %s, 'Confirmada')
    RETURNING id_reserva, ...
"""
cursor.execute(insertar_query, (...))
```

Aquí ocurre algo crítico: **el INSERT activa el EXCLUDE constraint**. Si ya existe una reserva que se solapa en fechas para la misma habitación, PostgreSQL lanza un error `23P01 (exclusion_violation)`.

---

## El manejo de errores de PostgreSQL — El bloque `except psycopg2.Error`

Este bloque es uno de los más importantes del proyecto. Captura errores específicos de la BD y los traduce a respuestas HTTP entendibles:

```python
except psycopg2.Error as db_err:
    conn.rollback()   # ← deshacer la transacción fallida
    pgcode = getattr(db_err, 'pgcode', '')

    # Error 23P01: exclusion_violation — el EXCLUDE constraint detectó solapamiento
    # Error 40P01: deadlock_detected — dos transacciones simultáneas se bloquearon
    if pgcode in ('23P01', '40P01'):
        raise HTTPException(400, "Double Booking Detectado: ...")

    # Error 23514: check_violation — la fecha de salida <= fecha de entrada
    if pgcode == '23514':
        raise HTTPException(400, "La fecha de salida debe ser posterior a la entrada")

    # Error P0001: excepción de PL/pgSQL (trigger de mantenimiento)
    if pgcode == 'P0001':
        raise HTTPException(400, cleaned_message)
```

### ¿Qué es un `pgcode`?

PostgreSQL tiene códigos de error estándar de 5 caracteres. Capturar el `pgcode` es más robusto que parsear el mensaje de texto (que puede cambiar entre versiones de PostgreSQL).

| pgcode | Nombre | Cuándo ocurre |
|:---|:---|:---|
| `23P01` | exclusion_violation | EXCLUDE constraint detectó solapamiento de fechas |
| `40P01` | deadlock_detected | Dos transacciones simultáneas se bloquearon mutuamente |
| `23514` | check_violation | `chk_fechas` rechazó porque salida <= entrada |
| `P0001` | raise_exception | El trigger `trg_validar_double_booking` lanzó excepción (mantenimiento) |

### ¿Qué es un deadlock? — Explicado con analogía

Imagina dos cajeros en un banco:
- Cajero A tiene $100 y quiere pasarlos a B.
- Cajero B tiene $200 y quiere pasarlos a A.
- A espera que B termine → B espera que A termine → **nadie avanza**.

En el contexto de reservas:
- Proceso 1 intenta reservar Habitación 101, espera el lock.
- Proceso 2 también intenta reservar Habitación 101, también espera el lock.
- Ambos se quedan esperando al otro indefinidamente.

PostgreSQL detecta este ciclo y **mata una de las dos transacciones** (lanza error 40P01). El código captura esto y devuelve al usuario "Hubo una colisión de concurrencia. Intenta de nuevo." — que es un mensaje honesto y accionable.

### ¿Por qué `conn.rollback()`?

Cuando ocurre un error en una transacción PostgreSQL, la conexión queda en estado "abortado" y rechaza cualquier comando hasta que se haga `rollback()`. Si no se hace rollback, la conexión queda inutilizable.

### El bloque `finally` — Siempre cerrar la conexión

```python
finally:
    if cursor:
        try:
            cursor.close()
        except:
            pass
    if conn:
        try:
            conn.close()
        except:
            pass
```

El `finally` se ejecuta **siempre**, sin importar si hubo excepción o no. Esto garantiza que las conexiones a PostgreSQL siempre se liberan al pool de conexiones disponibles. Si no se cerraran, eventualmente la BD se quedaría sin conexiones disponibles (connection leak).

---

## La prueba de concurrencia — `test_reserva_concurrencia_double_booking`

```python
import asyncio, httpx

async def crear_reserva():
    async with httpx.AsyncClient() as client:
        return await client.post("/api/reservas", json={
            "id_huesped": 1,
            "id_habitacion": 1,
            "fecha_entrada": "2027-01-01",
            "fecha_salida": "2027-01-05",
            "numero_personas": 1
        }, headers={"Authorization": f"Bearer {token}"})

# Lanzar 10 requests simultáneos
resultados = await asyncio.gather(*[crear_reserva() for _ in range(10)])

exitosos = [r for r in resultados if r.status_code == 201]
fallidos  = [r for r in resultados if r.status_code == 400]

assert len(exitosos) == 1   # exactamente 1 reserva creada
assert len(fallidos) == 9   # las otras 9 rechazadas correctamente
```

Esta prueba simula 10 usuarios intentando reservar la misma habitación al mismo tiempo. El EXCLUDE constraint garantiza que solo 1 tiene éxito. Los otros 9 reciben 400 con el mensaje de doble booking.

**¿Por qué esta prueba es tan importante?**
En producción real, un apartahotel puede recibir múltiples solicitudes simultáneas por la misma habitación (por ejemplo, durante una oferta especial). Sin el EXCLUDE constraint y el manejo correcto del `40P01`, podrían crearse reservas duplicadas y el sistema sería inestable.

---

## Respuesta exitosa de una reserva

```json
{
  "message": "Reserva creada y bloqueada exitosamente.",
  "reserva": {
    "id_reserva": 5,
    "huesped_nombre": "John Doe",
    "habitacion_numero": "101A",
    "fecha_entrada": "2026-10-01",
    "fecha_salida": "2026-10-05",
    "estado": "Confirmada"
  },
  "cotizacion": {
    "noches": 4,
    "subtotal": 972000.0,
    "descuento": 0.0,
    "total": 972000.0
  }
}
```

El `cotizacion` proviene directamente de `fn_calcular_noches_y_precio()` en PostgreSQL.
