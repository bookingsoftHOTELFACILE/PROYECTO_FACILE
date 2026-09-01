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
        CHECK (rol IN ('Administrador', 'Recepcionista 24h', 'Ama de llaves', 'Personal de mantenimiento')),
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
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('Dúplex', 'Doble', 'Familiar', 'Habitación')),
    capacidad INT NOT NULL,
    precio_noche DECIMAL(10,2) NOT NULL CHECK (precio_noche > 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'Ocupada', 'En limpieza', 'Mantenimiento')),
    detalle_mantenimiento TEXT,
    creado_por VARCHAR(150) DEFAULT 'Sistema',
    modificado_por VARCHAR(150) DEFAULT 'Sistema'
);

-- Tabla de Espacios del Centro de Negocios (Salas de Juntas y Coworking)
CREATE TABLE IF NOT EXISTS espacio_negocio (
    id_espacio SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('Sala de Juntas', 'Coworking')),
    capacidad INT NOT NULL,
    precio_hora DECIMAL(10,2) NOT NULL CHECK (precio_hora > 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'Mantenimiento')),
    creado_por VARCHAR(150) DEFAULT 'Sistema',
    modificado_por VARCHAR(150) DEFAULT 'Sistema'
);

-- Tabla de Reservas del Centro de Negocios (Por Horas)
CREATE TABLE IF NOT EXISTS reserva_negocio (
    id_reserva_negocio SERIAL PRIMARY KEY,
    id_espacio INT NOT NULL REFERENCES espacio_negocio(id_espacio) ON DELETE RESTRICT,
    tipo_cliente VARCHAR(30) NOT NULL CHECK (tipo_cliente IN ('Huésped Registrado', 'Cliente Externo')),
    id_huesped INT REFERENCES huesped(id_huesped) ON DELETE RESTRICT,
    nombre_cliente VARCHAR(150) NOT NULL,
    documento_cliente VARCHAR(30),
    correo_cliente VARCHAR(150),
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    duracion_horas INT NOT NULL CHECK (duracion_horas > 0),
    precio_total DECIMAL(10,2) NOT NULL CHECK (precio_total > 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'Confirmada' CHECK (estado IN ('Confirmada', 'Completada', 'Cancelada')),
    observaciones TEXT,
    creado_por VARCHAR(150) DEFAULT 'Sistema',
    modificado_por VARCHAR(150) DEFAULT 'Sistema',
    CONSTRAINT chk_horas CHECK (hora_fin > hora_inicio)
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

-- Sembrado de 38 Alojamientos Reales Facile (14 Dúplex, 11 Doble, 2 Familiar, 11 Habitación) + 2 Legacy para Tests
INSERT INTO habitacion (numero, tipo, capacidad, precio_noche, estado) VALUES
-- Legacy para compatibilidad de tests
('101A', 'Habitación', 2, 180000.00, 'Disponible'),
('102A', 'Habitación', 2, 180000.00, 'Disponible'),
-- 14 Dúplex ($250.000 COP/noche - Cap: 3 - 1 Cama Queen + Sofá-cama)
('D101', 'Dúplex', 3, 250000.00, 'Disponible'),
('D102', 'Dúplex', 3, 250000.00, 'Disponible'),
('D103', 'Dúplex', 3, 250000.00, 'Disponible'),
('D104', 'Dúplex', 3, 250000.00, 'Disponible'),
('D105', 'Dúplex', 3, 250000.00, 'Disponible'),
('D106', 'Dúplex', 3, 250000.00, 'Disponible'),
('D107', 'Dúplex', 3, 250000.00, 'Disponible'),
('D108', 'Dúplex', 3, 250000.00, 'Disponible'),
('D109', 'Dúplex', 3, 250000.00, 'Disponible'),
('D110', 'Dúplex', 3, 250000.00, 'Disponible'),
('D111', 'Dúplex', 3, 250000.00, 'Disponible'),
('D112', 'Dúplex', 3, 250000.00, 'Disponible'),
('D113', 'Dúplex', 3, 250000.00, 'Disponible'),
('D114', 'Dúplex', 3, 250000.00, 'Disponible'),
-- 11 Dobles ($320.000 COP/noche - Cap: 5 - 2 Camas Queen + Sofá-cama)
('DB201', 'Doble', 5, 320000.00, 'Disponible'),
('DB202', 'Doble', 5, 320000.00, 'Disponible'),
('DB203', 'Doble', 5, 320000.00, 'Disponible'),
('DB204', 'Doble', 5, 320000.00, 'Disponible'),
('DB205', 'Doble', 5, 320000.00, 'Disponible'),
('DB206', 'Doble', 5, 320000.00, 'Disponible'),
('DB207', 'Doble', 5, 320000.00, 'Disponible'),
('DB208', 'Doble', 5, 320000.00, 'Disponible'),
('DB209', 'Doble', 5, 320000.00, 'Disponible'),
('DB210', 'Doble', 5, 320000.00, 'Disponible'),
('DB211', 'Doble', 5, 320000.00, 'Disponible'),
-- 2 Familiares ($390.000 COP/noche - Cap: 7 - 3 Camas Queen + Sofá-cama)
('F301', 'Familiar', 7, 390000.00, 'Disponible'),
('F302', 'Familiar', 7, 390000.00, 'Disponible'),
-- 11 Habitaciones ($180.000 COP/noche - Cap: 2 - 1 Cama Queen)
('H401', 'Habitación', 2, 180000.00, 'Disponible'),
('H402', 'Habitación', 2, 180000.00, 'Disponible'),
('H403', 'Habitación', 2, 180000.00, 'Disponible'),
('H404', 'Habitación', 2, 180000.00, 'Disponible'),
('H405', 'Habitación', 2, 180000.00, 'Disponible'),
('H406', 'Habitación', 2, 180000.00, 'Disponible'),
('H407', 'Habitación', 2, 180000.00, 'Disponible'),
('H408', 'Habitación', 2, 180000.00, 'Disponible'),
('H409', 'Habitación', 2, 180000.00, 'Disponible'),
('H410', 'Habitación', 2, 180000.00, 'Disponible'),
('H411', 'Habitación', 2, 180000.00, 'Disponible')
ON CONFLICT (numero) DO NOTHING;

-- Sembrado de Espacios de Centro de Negocios
INSERT INTO espacio_negocio (nombre, tipo, capacidad, precio_hora) VALUES
('Sala de Juntas 1', 'Sala de Juntas', 10, 70000.00),
('Sala de Juntas 2', 'Sala de Juntas', 10, 70000.00),
('Espacio Coworking (Flex)', 'Coworking', 15, 20000.00)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO huesped (nombre, documento, telefono, correo, empresa, lealtad, estado) VALUES
('John Doe', '12345678', '3115551234', 'john.doe@example.com', NULL, 'Silver', 'Activo'),
('Sofía Restrepo', '98765432', '3126667890', 'sofia.restrepo@bancolombia.com.co', 'Bancolombia', 'Gold', 'Activo'),
('Thomas Miller', 'PP998877', '+155589012', 'thomas.miller@siemens.com', 'Siemens', 'Platinum', 'Activo')
ON CONFLICT (documento) DO NOTHING;

INSERT INTO reserva_habitacion (id_huesped, id_habitacion, fecha_entrada, fecha_salida, estado)
SELECT h.id_huesped, hab.id_habitacion, CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '4 days', 'Confirmada'
FROM huesped h, habitacion hab
WHERE h.documento = '12345678' AND hab.numero = '101A'
AND NOT EXISTS (
    SELECT 1 FROM reserva_habitacion rh 
    JOIN huesped hu ON rh.id_huesped = hu.id_huesped 
    WHERE hu.documento = '12345678'
);

INSERT INTO reserva_habitacion (id_huesped, id_habitacion, fecha_entrada, fecha_salida, estado)
SELECT h.id_huesped, hab.id_habitacion, CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days', 'Confirmada'
FROM huesped h, habitacion hab
WHERE h.documento = '98765432' AND hab.numero = 'D101'
AND NOT EXISTS (
    SELECT 1 FROM reserva_habitacion rh 
    JOIN huesped hu ON rh.id_huesped = hu.id_huesped 
    WHERE hu.documento = '98765432'
);

