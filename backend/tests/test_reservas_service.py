"""
backend/tests/test_reservas_service.py

Pruebas unitarias para el servicio de reservas (Capa API - Maicol Mayor @maicolmayor23-code).
Aplica principios FIRST, patrón AAA, particiones de equivalencia, valores límite y tests parametrizados.
"""
from datetime import date
import pytest

from services.reservas_service import (
    ValidationError,
    validar_fechas_reserva,
    validar_habitacion_disponible,
    calcular_costo_estadia,
)


# ==============================================================================
# 1. PRUEBAS: Validación de reglas de reserva (fechas de entrada y salida)
# ==============================================================================

def test_validar_fechas_reserva_acepta_rango_valido():
    """Verifica que un rango válido (fecha_salida > fecha_entrada) sea aceptado."""
    # Arrange
    fecha_entrada = "2026-07-01"
    fecha_salida = "2026-07-05"

    # Act
    f_in, f_out = validar_fechas_reserva(fecha_entrada, fecha_salida)

    # Assert
    assert f_in == date(2026, 7, 1)
    assert f_out == date(2026, 7, 5)


def test_validar_fechas_reserva_rechaza_fechas_iguales_limite():
    """
    Valor Límite Crítico:
    Verifica que fecha_salida igual a fecha_entrada sea rechazada.
    Este test es el detector del mutante: si la regla cambia de
    'fecha_salida <= fecha_entrada' a 'fecha_salida < fecha_entrada',
    este caso falla y mata al mutante.
    """
    # Arrange: mismo día (borde exacto de la partición)
    fecha_entrada = "2026-08-15"
    fecha_salida = "2026-08-15"

    # Act & Assert
    with pytest.raises(ValidationError, match="La fecha de salida debe ser posterior a la fecha de entrada."):
        validar_fechas_reserva(fecha_entrada, fecha_salida)


@pytest.mark.parametrize(
    ("fecha_in", "fecha_out", "error_msg"),
    [
        ("2026-09-10", "2026-09-09", "La fecha de salida debe ser posterior a la fecha de entrada."),
        ("2026-12-31", "2026-01-01", "La fecha de salida debe ser posterior a la fecha de entrada."),
        ("invalido", "2026-09-09", "Formato de fechas inválido. Debe ser AAAA-MM-DD."),
        ("2026-09-10", "2026-13-45", "Formato de fechas inválido. Debe ser AAAA-MM-DD."),
    ],
)
def test_validar_fechas_reserva_casos_invalidos_parametrizados(fecha_in, fecha_out, error_msg):
    """Test parametrizado para particiones inválidas (fechas invertidas y formatos erróneos)."""
    # Arrange, Act & Assert
    with pytest.raises(ValidationError, match=error_msg):
        validar_fechas_reserva(fecha_in, fecha_out)


# ==============================================================================
# 2. PRUEBAS: Verificación de habitación en mantenimiento
# ==============================================================================

def test_validar_habitacion_disponible_rechaza_mantenimiento():
    """Verifica que una habitación en mantenimiento no admita reservas."""
    # Arrange
    estado = "Mantenimiento"
    numero_hab = "204B"

    # Act & Assert
    with pytest.raises(ValidationError, match="se encuentra en Mantenimiento y no acepta nuevas reservas"):
        validar_habitacion_disponible(estado, numero_hab)


@pytest.mark.parametrize(
    "estado_invalido",
    ["mantenimiento", "MANTENIMIENTO", " Mantenimiento "],
)
def test_validar_habitacion_disponible_rechaza_variantes_mantenimiento(estado_invalido):
    """Test parametrizado comprobando que variaciones de mayúsculas y espacios se rechacen."""
    # Arrange, Act & Assert
    with pytest.raises(ValidationError, match="no acepta nuevas reservas"):
        validar_habitacion_disponible(estado_invalido, "101A")


@pytest.mark.parametrize(
    "estado_valido",
    ["Disponible", "Ocupada", "Limpieza"],
)
def test_validar_habitacion_disponible_permite_otros_estados(estado_valido):
    """Verifica que estados diferentes a mantenimiento sean aprobados por esta regla."""
    # Arrange, Act & Assert
    assert validar_habitacion_disponible(estado_valido, "102A") is True


def test_validar_habitacion_disponible_requiere_estado():
    """Verifica que se exija un estado no vacío."""
    with pytest.raises(ValidationError, match="El estado de la habitación es obligatorio"):
        validar_habitacion_disponible("", "101")


# ==============================================================================
# 3. PRUEBAS: Cálculo del costo total de estadía en el backend
# ==============================================================================

def test_calcular_costo_estadia_sin_descuento():
    """Verifica el cálculo de estadía estándar (sin superar 15 noches)."""
    # Arrange
    fecha_in = "2026-10-01"
    fecha_out = "2026-10-06"  # 5 noches
    precio_noche = 120000.0

    # Act
    resultado = calcular_costo_estadia(fecha_in, fecha_out, precio_noche)

    # Assert
    assert resultado["noches"] == 5
    assert resultado["subtotal"] == 600000.0
    assert resultado["descuento"] == 0.0
    assert resultado["total"] == 600000.0


@pytest.mark.parametrize(
    ("noches_delta", "espera_descuento", "desc_factor"),
    [
        (15, False, 0.0),   # Borde exacto: 15 noches NO tiene descuento (> 15)
        (16, True, 0.15),   # Borde superior: 16 noches SÍ recibe 15% de descuento
    ],
)
def test_calcular_costo_estadia_valores_limite_descuento(noches_delta, espera_descuento, desc_factor):
    """
    Valores Límite de la regla RF-011:
    Descuento del 15% para estancias > 15 noches.
    Prueba el borde en 15 noches y en 16 noches.
    """
    # Arrange
    from datetime import timedelta
    f_in = date(2026, 11, 1)
    f_out = f_in + timedelta(days=noches_delta)
    precio_noche = 100000.0

    # Act
    cotizacion = calcular_costo_estadia(f_in, f_out, precio_noche)

    # Assert
    subtotal_esperado = noches_delta * 100000.0
    descuento_esperado = round(subtotal_esperado * desc_factor, 2)
    total_esperado = subtotal_esperado - descuento_esperado

    assert cotizacion["noches"] == noches_delta
    assert cotizacion["subtotal"] == subtotal_esperado
    assert cotizacion["descuento"] == descuento_esperado
    assert cotizacion["total"] == total_esperado


def test_calcular_costo_estadia_precio_negativo_falla():
    """Verifica que no se permitan precios por noche negativos."""
    # Arrange, Act & Assert
    with pytest.raises(ValidationError, match="El precio por noche debe ser mayor o igual a 0"):
        calcular_costo_estadia("2026-10-01", "2026-10-05", -50000)


def test_validar_fechas_reserva_tipo_invalido():
    """Verifica que tipos no compatibles (ej. None o int) lancen ValidationError."""
    with pytest.raises(ValidationError, match="Tipo de dato de fecha inválido"):
        validar_fechas_reserva(None, "2026-10-05")

