import pytest
from services.restricciones_service import (
    ForeignKeyViolationError,
    StringDataRightTruncationError,
    LONGITUD_MAXIMA_USUARIO_EMPLEADO,
    validar_longitud_varchar_50,
    insertar_reserva_segura,
    insertar_empleado_seguro
)


def test_insertar_reserva_con_huesped_inexistente_falla_por_foreign_key():
    huespedes_en_bd = [1, 2, 3]
    id_huesped_inexistente = 99999
    datos_reserva = {
        "id_reserva": 1001,
        "id_huesped": id_huesped_inexistente,
        "id_habitacion": 101,
        "fecha_entrada": "2026-12-01",
        "fecha_salida": "2026-12-05"
    }

    with pytest.raises(ForeignKeyViolationError, match="Violación de clave foránea"):
        insertar_reserva_segura(datos_reserva, huespedes_existentes=huespedes_en_bd)


def test_guardar_texto_300_caracteres_en_varchar_50_falla_por_longitud():
    usuario_invalido_300_chars = "A" * 300
    datos_empleado = {
        "id_empleado": 99,
        "usuario": usuario_invalido_300_chars,
        "nombre": "Empleado Test"
    }

    with pytest.raises(StringDataRightTruncationError, match=r"excede el límite VARCHAR\(50\)"):
        insertar_empleado_seguro(datos_empleado)

    assert len(usuario_invalido_300_chars) == 300
    assert LONGITUD_MAXIMA_USUARIO_EMPLEADO == 50
    assert len(usuario_invalido_300_chars) > LONGITUD_MAXIMA_USUARIO_EMPLEADO
