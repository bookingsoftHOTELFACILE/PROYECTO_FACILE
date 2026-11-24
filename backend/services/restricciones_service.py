from typing import Dict, Any


class ForeignKeyViolationError(Exception):
    pass


class StringDataRightTruncationError(Exception):
    pass


LONGITUD_MAXIMA_USUARIO_EMPLEADO = 50


def validar_longitud_varchar_50(campo: str, valor: str, longitud_maxima: int = LONGITUD_MAXIMA_USUARIO_EMPLEADO) -> bool:
    if valor is not None and len(valor) > longitud_maxima:
        raise StringDataRightTruncationError(
            f"El valor para el campo '{campo}' tiene {len(valor)} caracteres y excede el límite VARCHAR({longitud_maxima})."
        )
    return True


def validar_insercion_reserva_fkey(
    id_huesped: int,
    id_habitacion: int,
    huespedes_existentes: list
) -> bool:
    if id_huesped not in huespedes_existentes:
        raise ForeignKeyViolationError(
            f"Violación de clave foránea: el id_huesped={id_huesped} no existe en la tabla huesped."
        )
    return True


def insertar_reserva_segura(datos_reserva: Dict[str, Any], huespedes_existentes: list) -> Dict[str, Any]:
    id_huesped = datos_reserva.get("id_huesped")
    id_habitacion = datos_reserva.get("id_habitacion")
    validar_insercion_reserva_fkey(id_huesped, id_habitacion, huespedes_existentes)
    return {
        "id_reserva": datos_reserva.get("id_reserva", 1),
        "id_huesped": id_huesped,
        "id_habitacion": id_habitacion,
        "estado": "Confirmada"
    }


def insertar_empleado_seguro(datos_empleado: Dict[str, Any]) -> Dict[str, Any]:
    usuario = datos_empleado.get("usuario", "")
    validar_longitud_varchar_50("usuario", usuario, LONGITUD_MAXIMA_USUARIO_EMPLEADO)
    return {
        "id_empleado": datos_empleado.get("id_empleado", 1),
        "usuario": usuario,
        "estado": "Activo"
    }
