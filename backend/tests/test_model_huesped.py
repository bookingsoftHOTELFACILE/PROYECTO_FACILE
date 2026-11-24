import pytest
from datetime import date
from pydantic import ValidationError
from models.schemas import Huesped

# Fecha fija de referencia para que los tests sean deterministas (FIRST)
FECHA_BASE = date(2026, 10, 26)


# TEST 1: campos obligatorios en el modelo Huesped
def test_campos_obligatorios_huesped():
    # 1. ARRANGE: faltan 'documento' y 'correo'
    datos_incompletos = {
        "nombres": "Ashly Echeverri",
        "fecha_nacimiento": date(2000, 1, 1),
        "fecha_referencia": FECHA_BASE
    }

    # 2. ACT Y 3. ASSERT: debe lanzar ValidationError
    with pytest.raises(ValidationError) as exc_info:
        Huesped(**datos_incompletos)

    errores = str(exc_info.value)
    assert "documento" in errores
    assert "correo" in errores 


# TEST 2: validacion de formato de correo con expresión regular
@pytest.mark.parametrize("correo_invalido", [
    "sin_arroba.com",
    "usuario@",
    "@dominio.com",
    "usuario@dominio",
    "espacios en@correo.com"
])
def test_formato_correo_invalido_rechazado(correo_invalido):
    # 1. ARRANGE: probamos cada correo invalido
    datos = {
        "nombres": "Carlos Perez",
        "documento": "1002345678",
        "correo": correo_invalido,
        "fecha_nacimiento": date(1995, 5, 20),
        "fecha_referencia": FECHA_BASE
    }

    # 2. ACT Y 3. ASSERT: debe ser rechazado
    with pytest.raises(ValidationError) as exc_info:
        Huesped(**datos)

    assert "el formato del correo electronico es invalido" in str(exc_info.value).lower()


# TEST 3: valores limites de mayoria de edad (17 años vs 18 años)
def test_rechaza_huesped_menor_de_edad_17_anos():
    # 1. ARRANGE: Exactamente 17 años con respecto a FECHA_BASE (2026-10-26)
    fecha_nac_17 = date(2009, 10, 27)

    # 2. ACT y 3. ASSERT: debe fallar
    with pytest.raises(ValidationError) as exc_info:
        Huesped(
            nombres="Menor de Edad",
            documento="TI123456",
            correo="menor@example.com",
            fecha_nacimiento=fecha_nac_17,
            fecha_referencia=FECHA_BASE
        )

    assert "el huesped debe ser mayor de edad" in str(exc_info.value).lower()


def test_acepta_huesped_valor_limite_exacto_18_anos():
    # 1. ARRANGE: cumple 18 años exactamente hoy
    fecha_nac_18 = date(2008, 10, 26)

    # 2. ACT: se crea el huesped 
    huesped = Huesped(
        nombres="Adulto Justo",
        documento="CC987654",
        correo="adulto@example.com",
        fecha_nacimiento=fecha_nac_18,
        fecha_referencia=FECHA_BASE
    )

    # 3. ASSERT: se crea exitosamente
    assert huesped.nombres == "Adulto Justo"
    assert huesped.fecha_nacimiento == fecha_nac_18
