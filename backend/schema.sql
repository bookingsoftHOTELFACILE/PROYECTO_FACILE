-- Base de Datos para BookingSoft (Apartahotel Facile)
-- Motor de Base de Datos: PostgreSQL

-- 1. Eliminación de tablas y funciones previas (para reinicialización limpia)
DROP TRIGGER IF EXISTS trg_validar_double_booking ON reserva_habitacion;
DROP TRIGGER IF EXISTS trg_habitacion_estado_checkout ON check_out;
DROP TRIGGER IF EXISTS trg_habitacion_estado_checkin ON check_in;

DROP FUNCTION IF EXISTS fn_validar_double_booking();
DROP FUNCTION IF EXISTS fn_actualizar_estado_checkout();
DROP FUNCTION IF EXISTS fn_actualizar_estado_checkin();
DROP FUNCTION IF EXISTS fn_calcular_noches_y_precio(DATE, DATE, DECIMAL);

DROP TABLE IF EXISTS factura CASCADE;
DROP TABLE IF EXISTS check_out CASCADE;
DROP TABLE IF EXISTS check_in CASCADE;
DROP TABLE IF EXISTS reserva_habitacion CASCADE;
DROP TABLE IF EXISTS habitacion CASCADE;
DROP TABLE IF EXISTS huesped CASCADE;
DROP TABLE IF EXISTS empleado CASCADE;

-- 2. Creación de Tablas

-- Tabla de Empleados (Personal de Apartamentos Facile)
CREATE TABLE empleado (
    id_empleado SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('Administrador', 'Recepcionista 24h', 'Ama de llaves', 'Personal de mantenimiento', 'Conserje'))
);

-- Tabla de Huéspedes
CREATE TABLE huesped (
    id_huesped SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    documento VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    empresa VARCHAR(100), -- Vacío para turistas, completado para corporativos
    lealtad VARCHAR(20) NOT NULL DEFAULT 'Silver' CHECK (lealtad IN ('Silver', 'Gold', 'Platinum')),
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo'
);

-- Tabla de Habitaciones / Apartamentos
CREATE TABLE habitacion (
    id_habitacion SERIAL PRIMARY KEY,
    numero VARCHAR(10) UNIQUE NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('Dúplex', 'Familiar', 'Habitaciones')),
    capacidad INT NOT NULL,
    precio_noche DECIMAL(10,2) NOT NULL CHECK (precio_noche > 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'Ocupada', 'En limpieza', 'Mantenimiento'))
);

-- Tabla de Reservas de Habitación
CREATE TABLE reserva_habitacion (
    id_reserva SERIAL PRIMARY KEY,
    id_huesped INT NOT NULL REFERENCES huesped(id_huesped) ON DELETE RESTRICT,
    id_habitacion INT NOT NULL REFERENCES habitacion(id_habitacion) ON DELETE RESTRICT,
    fecha_entrada DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Confirmada' CHECK (estado IN ('Confirmada', 'Check-In', 'Completada', 'Cancelada')),
    CONSTRAINT chk_fechas CHECK (fecha_salida > fecha_entrada)
);

-- 3. SQL Extendido: Funciones y Triggers en PL/pgSQL

-- A. Función para validar Double Booking en PostgreSQL
CREATE OR REPLACE FUNCTION fn_validar_double_booking()
RETURNS TRIGGER AS $$
DECLARE
    habitacion_ocupada BOOLEAN;
BEGIN
    -- Comprobar si hay traslape con otra reserva activa
    SELECT EXISTS (
        SELECT 1 
        FROM reserva_habitacion 
        WHERE id_habitacion = NEW.id_habitacion
          AND estado IN ('Confirmada', 'Check-In')
          AND id_reserva != NEW.id_reserva -- Excluir la misma reserva si es actualización
          AND NEW.fecha_entrada < fecha_salida 
          AND NEW.fecha_salida > fecha_entrada
    ) INTO habitacion_ocupada;

    IF habitacion_ocupada THEN
        RAISE EXCEPTION 'Double Booking Detectado: La habitación % ya está reservada para el rango de fechas % a %.', 
            (SELECT numero FROM habitacion WHERE id_habitacion = NEW.id_habitacion), 
            NEW.fecha_entrada, 
            NEW.fecha_salida;
    END IF;

    -- Comprobar si la habitación está en mantenimiento en la base de datos
    IF (SELECT estado FROM habitacion WHERE id_habitacion = NEW.id_habitacion) = 'Mantenimiento' THEN
        RAISE EXCEPTION 'La habitación % se encuentra en Mantenimiento y no acepta nuevas reservas.', 
            (SELECT numero FROM habitacion WHERE id_habitacion = NEW.id_habitacion);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger asociado para validar double-booking antes de insertar o modificar reservas
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
    -- Calcular diferencia de días
    v_noches := p_fecha_salida - p_fecha_entrada;
    IF v_noches <= 0 THEN
        v_noches := 1;
    END IF;

    v_subtotal := v_noches * p_precio_noche;

    -- Aplicar regla de negocio de estadías largas (> 15 noches recibe 15% de descuento)
    IF v_noches > 15 THEN
        v_descuento := v_subtotal * 0.15;
    END IF;

    v_total := v_subtotal - v_descuento;

    RETURN QUERY SELECT v_noches, v_subtotal, v_descuento, v_total;
END;
$$ LANGUAGE plpgsql;


-- 4. Sembrado de Datos Iniciales (Seed Data)

-- Insertar Empleados de Prueba
-- Contraseñas en texto plano para el script (el backend las cifrará con bcrypt, aquí sembramos para pruebas rápidas)
INSERT INTO empleado (nombre, usuario, contrasena, rol) VALUES
('Sandra Milena', 'sandra_admin', '$2b$10$Ushj8m0k0s0A7pE9.309Lu9RzR8a.D3Gg7J1/fJv2nU9/hZ1f.oJy', 'Administrador'), -- pass: admin123
('Carlos Pérez', 'carlos_recep', '$2b$10$Ushj8m0k0s0A7pE9.309Lu9RzR8a.D3Gg7J1/fJv2nU9/hZ1f.oJy', 'Recepcionista 24h'), -- pass: admin123
('Marta Ama', 'marta_limpieza', 'marta123', 'Ama de llaves');

-- Insertar Habitaciones Reales de Apartamentos Facile (Dúplex, Familiar, Habitaciones)
INSERT INTO habitacion (numero, tipo, capacidad, precio_noche, estado) VALUES
('101A', 'Habitaciones', 2, 243000.00, 'Disponible'), -- 1 Habitación estándar
('102A', 'Habitaciones', 2, 243000.00, 'Disponible'),
('201D', 'Dúplex', 3, 350000.00, 'Disponible'),       -- Apartamento Dúplex
('202D', 'Dúplex', 3, 350000.00, 'Mantenimiento'),     -- En mantenimiento (ej. secadora fallando)
('301F', 'Familiar', 5, 480000.00, 'Disponible');      -- Apartamento Familiar

-- Insertar Huéspedes Iniciales
INSERT INTO huesped (nombre, documento, telefono, correo, empresa, lealtad, estado) VALUES
('John Doe', '12345678', '3115551234', 'john.doe@example.com', NULL, 'Silver', 'Activo'),
('Sofía Restrepo', '98765432', '3126667890', 'sofia.restrepo@bancolombia.com.co', 'Bancolombia', 'Gold', 'Activo'),
('Thomas Miller', 'PP998877', '+155589012', 'thomas.miller@siemens.com', 'Siemens', 'Platinum', 'Activo');

-- Insertar Reservas de Prueba sin conflictos de fechas
INSERT INTO reserva_habitacion (id_huesped, id_habitacion, fecha_entrada, fecha_salida, estado) VALUES
(1, 1, CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '4 days', 'Confirmada'),
(2, 3, CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days', 'Confirmada');
