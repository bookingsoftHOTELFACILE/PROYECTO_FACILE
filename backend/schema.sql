-- Base de Datos para BookingSoft (Apartahotel Facile)
-- Motor de Base de Datos: PostgreSQL

-- 1. Eliminación y recreación limpia de funciones/triggers
DROP TRIGGER IF EXISTS trg_validar_double_booking ON reserva_habitacion;

DROP FUNCTION IF EXISTS fn_validar_double_booking();
DROP FUNCTION IF EXISTS fn_calcular_noches_y_precio(DATE, DATE, DECIMAL);

-- 2. Creación Idempotente de Tablas (CREATE TABLE IF NOT EXISTS)

-- Habilitar extensión btree_gist (Requerido para EXCLUDE USING gist en reservas)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Tabla de Empleados (Personal de Apartamentos Facile)
CREATE TABLE IF NOT EXISTS empleado (
    id_empleado       SERIAL PRIMARY KEY,
    nombre            VARCHAR(100) NOT NULL,
    usuario           VARCHAR(50)  UNIQUE NOT NULL,
    contrasena        VARCHAR(255) NOT NULL,
    rol               VARCHAR(30)  NOT NULL
        CHECK (rol IN ('Administrador', 'Recepcionista 24h', 'Ama de llaves', 'Personal de mantenimiento', 'Conserje')),
    tipo_documento    VARCHAR(30)  NOT NULL DEFAULT 'Cédula de ciudadanía'
        CHECK (tipo_documento IN ('Cédula de ciudadanía', 'Pasaporte', 'Cédula de extranjería', 'Otro')),
    numero_documento  VARCHAR(30)  UNIQUE,
    correo            VARCHAR(150) UNIQUE,
    estado            VARCHAR(20)  NOT NULL DEFAULT 'Activo'
        CHECK (estado IN ('Activo', 'Inactivo'))
);


-- Tabla de Huéspedes (Hallazgo 06: Incluye creado_por y modificado_por desde esquema base)
CREATE TABLE IF NOT EXISTS huesped (
    id_huesped SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    documento VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    empresa VARCHAR(100), -- Vacío para turistas, completado para corporativos
    lealtad VARCHAR(20) NOT NULL DEFAULT 'Silver' CHECK (lealtad IN ('Silver', 'Gold', 'Platinum')),
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo',
    creado_por VARCHAR(150) DEFAULT 'Sistema',
    modificado_por VARCHAR(150) DEFAULT 'Sistema'
);

-- Tabla de Habitaciones / Apartamentos (Hallazgo 06: Incluye creado_por, modificado_por y detalle_mantenimiento)
CREATE TABLE IF NOT EXISTS habitacion (
    id_habitacion SERIAL PRIMARY KEY,
    numero VARCHAR(10) UNIQUE NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('Dúplex', 'Familiar', 'Habitaciones')),
    capacidad INT NOT NULL,
    precio_noche DECIMAL(10,2) NOT NULL CHECK (precio_noche > 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'Ocupada', 'En limpieza', 'Mantenimiento')),
    detalle_mantenimiento TEXT,
    creado_por VARCHAR(150) DEFAULT 'Sistema',
    modificado_por VARCHAR(150) DEFAULT 'Sistema'
);

-- Tabla de Reservas de Habitación (Hallazgo 06: Incluye creado_por y modificado_por)
CREATE TABLE IF NOT EXISTS reserva_habitacion (
    id_reserva SERIAL PRIMARY KEY,
    id_huesped INT NOT NULL REFERENCES huesped(id_huesped) ON DELETE RESTRICT,
    id_habitacion INT NOT NULL REFERENCES habitacion(id_habitacion) ON DELETE RESTRICT,
    fecha_entrada DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Confirmada' CHECK (estado IN ('Confirmada', 'Check-In', 'Completada', 'Cancelada')),
    creado_por VARCHAR(150) DEFAULT 'Sistema',
    modificado_por VARCHAR(150) DEFAULT 'Sistema',
    CONSTRAINT chk_fechas CHECK (fecha_salida > fecha_entrada),
    
    CONSTRAINT exclude_overlapping_reservations EXCLUDE USING gist (
        id_habitacion WITH =,
        daterange(fecha_entrada, fecha_salida) WITH &&
    ) WHERE (estado IN ('Confirmada', 'Check-In'))
);

-- 3. SQL Extendido: Funciones y Triggers en PL/pgSQL

-- A. Función para validar mantenimiento en PostgreSQL
CREATE OR REPLACE FUNCTION fn_validar_double_booking()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT estado FROM habitacion WHERE id_habitacion = NEW.id_habitacion) = 'Mantenimiento' THEN
        RAISE EXCEPTION 'La habitación % se encuentra en Mantenimiento y no acepta nuevas reservas.', 
            (SELECT numero FROM habitacion WHERE id_habitacion = NEW.id_habitacion);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_double_booking
BEFORE INSERT OR UPDATE ON reserva_habitacion
FOR EACH ROW
EXECUTE FUNCTION fn_validar_double_booking();


-- B. Función en PL/pgSQL para cálculo de costo de noches y precio
CREATE OR REPLACE FUNCTION fn_calcular_noches_y_precio(
    p_fecha_entrada DATE, 
    p_fecha_salida DATE, 
    p_precio_noche DECIMAL
)
RETURNS TABLE (
    noches INT,
    subtotal DECIMAL(10,2),
    descuento_aplicado DECIMAL(10,2),
    total DECIMAL(10,2)
) AS $$
DECLARE
    v_noches INT;
    v_subtotal DECIMAL(10,2);
    v_descuento DECIMAL(10,2) := 0;
    v_total DECIMAL(10,2);
BEGIN
    v_noches := p_fecha_salida - p_fecha_entrada;
    IF v_noches <= 0 THEN
        v_noches := 1;
    END IF;

    v_subtotal := v_noches * p_precio_noche;

    IF v_noches > 15 THEN
        v_descuento := v_subtotal * 0.15;
    END IF;

    v_total := v_subtotal - v_descuento;

    RETURN QUERY SELECT v_noches, v_subtotal, v_descuento, v_total;
END;
$$ LANGUAGE plpgsql;


-- 4. Sembrado Idempotente de Datos Iniciales (Seed Data)

INSERT INTO empleado (nombre, usuario, contrasena, rol) VALUES
('Equipo BookingSoft', 'bookingsoft_admin', '$2b$12$sXAtCTFM7Wvc/O0LGW1Dpu/YXoMnnQhnXlMv/kHTPnqf3EvYkYEz.', 'Administrador'), -- Admin2026!
('Carlos Pérez',  'carlos_recep',  '$2b$12$75PPpWmNsyZQg45hS2qi9uNeNMxA7sIX9.B.PROrQqurtPK33Hf3W',  'Recepcionista 24h'), -- Recep2026!
('Marta Ama',     'marta_limpieza','$2b$12$HHsRN.dJnQo7IRfnlCPlLOgKVsJHmoxE8NIyslNN7MQKpxAKkUrEu', 'Ama de llaves')       -- marta123
ON CONFLICT (usuario) DO NOTHING;

INSERT INTO habitacion (numero, tipo, capacidad, precio_noche, estado) VALUES
('101A', 'Habitaciones', 2, 243000.00, 'Disponible'),
('102A', 'Habitaciones', 2, 243000.00, 'Disponible'),
('201D', 'Dúplex', 3, 350000.00, 'Disponible'),
('202D', 'Dúplex', 3, 350000.00, 'Mantenimiento'),
('301F', 'Familiar', 5, 480000.00, 'Disponible')
ON CONFLICT (numero) DO NOTHING;

INSERT INTO huesped (nombre, documento, telefono, correo, empresa, lealtad, estado) VALUES
('John Doe', '12345678', '3115551234', 'john.doe@example.com', NULL, 'Silver', 'Activo'),
('Sofía Restrepo', '98765432', '3126667890', 'sofia.restrepo@bancolombia.com.co', 'Bancolombia', 'Gold', 'Activo'),
('Thomas Miller', 'PP998877', '+155589012', 'thomas.miller@siemens.com', 'Siemens', 'Platinum', 'Activo')
ON CONFLICT (documento) DO NOTHING;

INSERT INTO reserva_habitacion (id_huesped, id_habitacion, fecha_entrada, fecha_salida, estado)
SELECT 1, 1, CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '4 days', 'Confirmada'
WHERE NOT EXISTS (SELECT 1 FROM reserva_habitacion WHERE id_huesped = 1 AND id_habitacion = 1);

INSERT INTO reserva_habitacion (id_huesped, id_habitacion, fecha_entrada, fecha_salida, estado)
SELECT 2, 3, CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days', 'Confirmada'
WHERE NOT EXISTS (SELECT 1 FROM reserva_habitacion WHERE id_huesped = 2 AND id_habitacion = 3);
