from decimal import Decimal
import pytest
from models.schemas import (
    habitacion_a_dto,
    validar_capacidad_habitacion,
    validar_precio_noche,
)


def test_convertir_entidad_habitacion_a_dto():
    # Arrange
    fila_bd = (
        1,
        "D101",
        "Dúplex",
        3,
        Decimal("250000.00"),
        "Disponible",
        None,
        None,
    )

    # Act
    resultado = habitacion_a_dto(fila_bd)

    # Assert
    assert isinstance(resultado, dict)
    assert resultado["id_habitacion"] == 1
    assert resultado["numero"] == "D101"
    assert resultado["tipo"] == "Dúplex"
    assert resultado["capacidad"] == 3
    assert isinstance(resultado["precio_noche"], float)
    assert resultado["precio_noche"] == 250000.0
    assert resultado["estado"] == "Disponible"
    assert resultado["modificado_por"] == ""
    assert resultado["detalle_mantenimiento"] == ""


def test_capacidad_duplex_en_el_limite_exacto():
    # Arrange
    tipo = "Dúplex"
    huespedes = 3

    # Act
    es_valido = validar_capacidad_habitacion(tipo, huespedes)

    # Assert
    assert es_valido is True


def test_capacidad_duplex_rechaza_sobrecupo():
    # Arrange
    tipo = "Dúplex"
    huespedes = 4

    # Act & Assert
    with pytest.raises(ValueError, match="Sobrecupo"):
        validar_capacidad_habitacion(tipo, huespedes)


def test_capacidad_dobles_en_el_limite_y_sobrecupo():
    # Arrange
    tipo = "Dobles"

    # Act
    es_valido = validar_capacidad_habitacion(tipo, 4)

    # Assert
    assert es_valido is True
    with pytest.raises(ValueError, match="Sobrecupo"):
        validar_capacidad_habitacion(tipo, 5)


def test_capacidad_familiar_en_el_limite_y_sobrecupo():
    # Arrange
    tipo = "Familiar"

    # Act
    es_valido = validar_capacidad_habitacion(tipo, 6)

    # Assert
    assert es_valido is True
    with pytest.raises(ValueError, match="Sobrecupo"):
        validar_capacidad_habitacion(tipo, 7)


def test_capacidad_rechaza_cero_huespedes_o_tipo_inexistente():
    # Arrange
    huespedes_invalidos = 0
    tipo_invalido = "Penthouse"

    # Act & Assert
    with pytest.raises(ValueError, match="al menos 1 huésped"):
        validar_capacidad_habitacion("Dúplex", huespedes_invalidos)

    with pytest.raises(ValueError, match="no es válido"):
        validar_capacidad_habitacion(tipo_invalido, 2)


def test_precio_noche_acepta_enteros_decimales_y_flotantes():
    # Arrange
    precio_decimal = Decimal("350000.50")
    precio_entero = 180000

    # Act
    resultado_decimal = validar_precio_noche(precio_decimal)
    resultado_entero = validar_precio_noche(precio_entero)

    # Assert
    assert isinstance(resultado_decimal, float)
    assert resultado_decimal == 350000.50
    assert isinstance(resultado_entero, float)
    assert resultado_entero == 180000.0


def test_precio_noche_rechaza_cero_negativos_o_texto():
    # Arrange
    precio_cero = 0
    precio_negativo = -250000
    precio_texto = "gratis"

    # Act & Assert
    with pytest.raises(ValueError, match="mayor a cero"):
        validar_precio_noche(precio_cero)

    with pytest.raises(ValueError, match="mayor a cero"):
        validar_precio_noche(precio_negativo)

    with pytest.raises(ValueError, match="valor numérico"):
        validar_precio_noche(precio_texto)
