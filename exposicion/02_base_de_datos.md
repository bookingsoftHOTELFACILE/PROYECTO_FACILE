# 🗄️ Parte 2: Base de Datos — schema.sql explicado línea a línea
> Todo lo que pasa en PostgreSQL: tablas, restricciones, funciones y datos iniciales.

---

## ¿Por qué PostgreSQL y no MySQL u otra BD?

PostgreSQL tiene una característica que ningún otro motor gratuito tiene de forma nativa: los **EXCLUDE constraints con rangos**. Esto es fundamental para evitar el doble booking (dos reservas en la misma habitación en las mismas fechas). Además, PostgreSQL soporta PL/pgSQL para escribir funciones y triggers directamente en la base de datos.

---

## La extensión `btree_gist` — ¿Para qué sirve?

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
```

El EXCLUDE constraint que previene el doble booking necesita esta extensión. Por defecto PostgreSQL no puede comparar rangos de fechas en un índice, `btree_gist` le da esa capacidad. Sin ella, el EXCLUDE constraint simplemente no funciona.

---

## Tabla `empleado` — El personal del apartahotel

```sql
CREATE TABLE IF NOT EXISTS empleado (
    id_empleado       SERIAL PRIMARY KEY,      -- auto-incrementado, nunca se repite
    nombre            VARCHAR(100) NOT NULL,
    usuario           VARCHAR(50)  UNIQUE NOT NULL,  -- nombre de login, único
    contrasena        VARCHAR(255) NOT NULL,    -- aquí va el HASH de bcrypt, no la contraseña real
    rol               VARCHAR(30)  NOT NULL
        CHECK (rol IN ('Administrador', 'Recepcionista 24h', 'Ama de llaves',
                        'Personal de mantenimiento', 'Conserje')),
    tipo_documento    VARCHAR(30)  NOT NULL DEFAULT 'Cédula de ciudadanía'
        CHECK (tipo_documento IN ('Cédula de ciudadanía', 'Pasaporte',
                                   'Cédula de extranjería', 'Otro')),
    numero_documento  VARCHAR(30)  UNIQUE,       -- dos empleados no pueden tener el mismo doc
    correo            VARCHAR(150) UNIQUE,        -- dos empleados no pueden usar el mismo correo
    estado            VARCHAR(20)  NOT NULL DEFAULT 'Activo'
        CHECK (estado IN ('Activo', 'Inactivo'))
);
```

**Punto por punto:**
- `SERIAL PRIMARY KEY`: genera un número único automático para cada empleado (1, 2, 3...). Nunca hay que mandarlo manualmente.
- `CHECK (rol IN (...))`: PostgreSQL mismo rechaza cualquier rol que no esté en esa lista. No se puede insertar `rol = 'Jefe'` porque la BD lo bloquea.
- `DEFAULT 'Activo'`: si no se especifica el estado al insertar, la BD pone 'Activo' automáticamente.
- `UNIQUE` en `usuario`, `numero_documento` y `correo`: garantiza que no haya duplicados. Si alguien intenta registrarse con el mismo correo, PostgreSQL lanza un error antes de que el código Python haga nada.
- `VARCHAR(255)` para contraseña: los hashes de bcrypt tienen exactamente 60 caracteres, pero se usa 255 por convención de seguridad para acomodar cambios futuros.

---

## Tabla `habitacion` — Los apartamentos

```sql
CREATE TABLE IF NOT EXISTS habitacion (
    id_habitacion SERIAL PRIMARY KEY,
    numero        VARCHAR(10) UNIQUE NOT NULL,         -- "101A", "201D", etc.
    tipo          VARCHAR(30) NOT NULL
        CHECK (tipo IN ('Dúplex', 'Familiar', 'Habitaciones')),
    capacidad     INT NOT NULL,                         -- número máximo de personas
    precio_noche  DECIMAL(10,2) NOT NULL CHECK (precio_noche > 0),
    estado        VARCHAR(20) NOT NULL DEFAULT 'Disponible'
        CHECK (estado IN ('Disponible', 'Ocupada', 'En limpieza', 'Mantenimiento'))
);
```

**¿Por qué `DECIMAL(10,2)` para el precio?**
`DECIMAL` es el tipo correcto para dinero. Los tipos `FLOAT` o `DOUBLE` tienen errores de precisión (0.1 + 0.2 = 0.30000000000000004 en punto flotante). Con `DECIMAL(10,2)` se garantizan exactamente 2 decimales, sin errores de redondeo.

---

## Tabla `reserva_habitacion` — El corazón del sistema

```sql
CREATE TABLE IF NOT EXISTS reserva_habitacion (
    id_reserva    SERIAL PRIMARY KEY,
    id_huesped    INT NOT NULL REFERENCES huesped(id_huesped) ON DELETE RESTRICT,
    id_habitacion INT NOT NULL REFERENCES habitacion(id_habitacion) ON DELETE RESTRICT,
    fecha_entrada DATE NOT NULL,
    fecha_salida  DATE NOT NULL,
    estado        VARCHAR(20) NOT NULL DEFAULT 'Confirmada'
        CHECK (estado IN ('Confirmada', 'Check-In', 'Completada', 'Cancelada')),

    -- Regla básica: la salida debe ser posterior a la entrada
    CONSTRAINT chk_fechas CHECK (fecha_salida > fecha_entrada),

    -- ← LA JOYA DEL SISTEMA: previene el doble booking
    CONSTRAINT exclude_overlapping_reservations EXCLUDE USING gist (
        id_habitacion WITH =,
        daterange(fecha_entrada, fecha_salida) WITH &&
    ) WHERE (estado IN ('Confirmada', 'Check-In'))
);
```

### `REFERENCES ... ON DELETE RESTRICT`
Si un huésped tiene reservas, no puedes borrar al huésped. PostgreSQL lo impide. Esto protege la integridad referencial — no pueden quedar reservas "huérfanas" sin huésped.

### El EXCLUDE constraint — explicado simple

Imagina que la habitación 101 tiene una reserva del **1 al 5 de septiembre**.

Alguien intenta crear otra reserva para el 101 del **3 al 8 de septiembre**.

El constraint compara:
- `id_habitacion = 101` → las dos son para la misma habitación ✓ (condición cumplida)
- `daterange(1-sep, 5-sep) && daterange(3-sep, 8-sep)` → los rangos se solapan ✓

Como ambas condiciones se cumplen, PostgreSQL **rechaza la inserción automáticamente**. No importa si vienen del código Python o de dos procesos simultáneos — es imposible crear el doble booking.

**`WHERE (estado IN ('Confirmada', 'Check-In'))`**: las reservas Canceladas o Completadas no participan en el constraint. Si una reserva está Cancelada, esa habitación ya está libre para esas fechas.

---

## Función `fn_calcular_noches_y_precio()` — Cálculo en PL/pgSQL

```sql
CREATE OR REPLACE FUNCTION fn_calcular_noches_y_precio(
    p_fecha_entrada DATE,
    p_fecha_salida  DATE,
    p_precio_noche  DECIMAL
)
RETURNS TABLE (
    noches              INT,
    subtotal            DECIMAL(10,2),
    descuento_aplicado  DECIMAL(10,2),
    total               DECIMAL(10,2)
) AS $$
DECLARE
    v_noches   INT;
    v_subtotal DECIMAL(10,2);
    v_descuento DECIMAL(10,2) := 0;
BEGIN
    v_noches := p_fecha_salida - p_fecha_entrada;   -- resta de fechas = días
    IF v_noches <= 0 THEN v_noches := 1; END IF;    -- mínimo 1 noche

    v_subtotal := v_noches * p_precio_noche;

    -- Regla de negocio: estadías de más de 15 noches → 15% de descuento
    IF v_noches > 15 THEN
        v_descuento := v_subtotal * 0.15;
    END IF;

    RETURN QUERY SELECT v_noches, v_subtotal, v_descuento, v_subtotal - v_descuento;
END;
$$ LANGUAGE plpgsql;
```

**¿Por qué hacer el cálculo en la base de datos y no en Python?**
Porque si la lógica está en la BD, cualquier aplicación que use la BD (frontend, backend, herramientas admin) obtiene el mismo resultado. No hay riesgo de que el cálculo difiera entre sistemas. Además, PostgreSQL es muy eficiente para operaciones matemáticas sobre fechas.

**¿Cómo se usa desde Python?**
```python
cursor.execute(
    "SELECT noches, subtotal, descuento_aplicado, total FROM fn_calcular_noches_y_precio(%s, %s, %s)",
    (fecha_entrada, fecha_salida, precio_noche)
)
noches, subtotal, descuento, total = cursor.fetchone()
```

---

## Trigger `trg_validar_double_booking` — Validar mantenimiento

```sql
CREATE OR REPLACE FUNCTION fn_validar_double_booking()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT estado FROM habitacion WHERE id_habitacion = NEW.id_habitacion) = 'Mantenimiento' THEN
        RAISE EXCEPTION 'La habitación % se encuentra en Mantenimiento...', 
            (SELECT numero FROM habitacion WHERE id_habitacion = NEW.id_habitacion);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_double_booking
BEFORE INSERT OR UPDATE ON reserva_habitacion
FOR EACH ROW
EXECUTE FUNCTION fn_validar_double_booking();
```

**¿Qué es un trigger?**
Es código SQL que se ejecuta automáticamente ANTES o DESPUÉS de un INSERT, UPDATE o DELETE. Aquí, cada vez que alguien intenta insertar una reserva, el trigger verifica si la habitación está en Mantenimiento. Si lo está, lanza una excepción y la inserción se cancela.

**¿Por qué necesitamos el trigger si el código Python ya verifica el mantenimiento?**
Defensa en profundidad. Si alguien conecta a la BD directamente (por pgAdmin, por ejemplo) e intenta insertar una reserva manualmente, el trigger lo bloquea igual. La seguridad no depende solo del código Python.

---

## Datos seed — Los datos iniciales

```sql
-- 3 empleados con contraseñas hasheadas con bcrypt
INSERT INTO empleado (nombre, usuario, contrasena, rol) VALUES
('Sandra Milena', 'sandra_admin',  '$2b$12$...', 'Administrador'),
('Carlos Pérez',  'carlos_recep',  '$2b$12$...', 'Recepcionista 24h'),
('Marta Ama',     'marta_limpieza','$2b$12$...', 'Ama de llaves')
ON CONFLICT (usuario) DO NOTHING;

-- 5 habitaciones reales del Apartahotel Facile
INSERT INTO habitacion (numero, tipo, capacidad, precio_noche, estado) VALUES
('101A', 'Habitaciones', 2, 243000.00, 'Disponible'),
('102A', 'Habitaciones', 2, 243000.00, 'Disponible'),
('201D', 'Dúplex',       3, 350000.00, 'Disponible'),
('202D', 'Dúplex',       3, 350000.00, 'Mantenimiento'),  -- ← para probar rechazo
('301F', 'Familiar',     5, 480000.00, 'Disponible')
ON CONFLICT (numero) DO NOTHING;
```

**`ON CONFLICT ... DO NOTHING`**: Si el schema.sql se ejecuta dos veces (por ejemplo, al reiniciar el contenedor), no falla. Si los datos ya existen, los ignora. Esto hace el schema **idempotente** — puede ejecutarse múltiples veces sin errores.

**¿Por qué los hashes de bcrypt son tan largos?**
Un hash de bcrypt tiene el formato: `$2b$12$[22 caracteres de salt][31 caracteres de hash]`. El `$12$` indica el "factor de costo" (2^12 = 4096 iteraciones de hashing). Más iteraciones = más seguro, pero más lento.

### Reservas de prueba con fechas dinámicas:
```sql
INSERT INTO reserva_habitacion (...)
SELECT 1, 1, CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '4 days', 'Confirmada'
WHERE NOT EXISTS (SELECT 1 FROM reserva_habitacion WHERE id_huesped = 1 AND id_habitacion = 1);
```

**¿Por qué `CURRENT_DATE + INTERVAL`?**
Para que las fechas de prueba sean siempre futuras, sin importar cuándo se ejecute el schema. Si usáramos fechas fijas como `'2026-01-15'`, cuando pase esa fecha las reservas de prueba estarían en el pasado y los tests podrían fallar.
