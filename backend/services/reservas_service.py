"""
backend/services/reservas_service.py

Lógica de negocio pura para el servicio de reservas de BookingSoft.
Aislado completamente de base de datos, peticiones HTTP y efectos no deterministas (Principios FIRST).
"""
from datetime import date, datetime
from typing import Union, Tuple, Dict, Any


class ValidationError(Exception):
    """Excepción para errores de validación de reglas de negocio en reservas."""
    pass


def parse_fecha(fecha: Union[str, date]) -> date:
    """Convierte una fecha en formato YYYY-MM-DD o valida un objeto date."""
    if isinstance(fecha, date):
        return fecha
    if isinstance(fecha, str):
        try:
            return datetime.strptime(fecha.strip(), "%Y-%m-%d").date()
        except ValueError:
            raise ValidationError("Formato de fechas inválido. Debe ser AAAA-MM-DD.")
    raise ValidationError("Tipo de dato de fecha inválido. Se espera string (AAAA-MM-DD) o date.")


def validar_fechas_reserva(
    fecha_entrada: Union[str, date],
    fecha_salida: Union[str, date]
) -> Tuple[date, date]:
    """
    RN-011.1 / Validación de reglas de reserva:
    La fecha de salida no puede ser anterior ni igual a la de entrada.

    Lanza ValidationError si fecha_salida <= fecha_entrada.
    Retorna la tupla (fecha_entrada, fecha_salida) como objetos date.
    """
    f_entrada = parse_fecha(fecha_entrada)
    f_salida = parse_fecha(fecha_salida)

    # Regla: salida > entrada (fecha_salida <= fecha_entrada es inválido)
    if f_salida <= f_entrada:
        raise ValidationError("La fecha de salida debe ser posterior a la fecha de entrada.")

    return f_entrada, f_salida


def validar_habitacion_disponible(
    estado_habitacion: str,
    numero_habitacion: str = ""
) -> bool:
    """
    RN-011.3 / Validación de estado de habitación:
    Verifica que la habitación no se encuentre en Mantenimiento.
    Una habitación en Mantenimiento no admite reservas.

    Lanza ValidationError si estado_habitacion es 'Mantenimiento'.
    """
    if not estado_habitacion or not estado_habitacion.strip():
        raise ValidationError("El estado de la habitación es obligatorio.")

    estado_limpio = estado_habitacion.strip()
    if estado_limpio.lower() == "mantenimiento":
        num_str = f" {numero_habitacion}".rstrip()
        raise ValidationError(
            f"La habitación{num_str} se encuentra en Mantenimiento y no acepta nuevas reservas."
        )

    return True


def calcular_costo_estadia(
    fecha_entrada: Union[str, date],
    fecha_salida: Union[str, date],
    precio_noche: float
) -> Dict[str, Any]:
    """
    RN-011.2 / Cálculo del costo total de estadía en el backend:
    - Calcula número de noches (fecha_salida - fecha_entrada).
    - Subtotal = noches * precio_noche.
    - Descuento del 15% sobre el subtotal si noches > 15 (en 15 noches no aplica, en 16 noches sí).
    - Total = subtotal - descuento.

    Lanza ValidationError si el precio_noche es negativo o si las fechas son inválidas.
    """
    if precio_noche is None or float(precio_noche) < 0:
        raise ValidationError("El precio por noche debe ser mayor o igual a 0.")

    f_entrada, f_salida = validar_fechas_reserva(fecha_entrada, fecha_salida)
    noches = (f_salida - f_entrada).days

    precio = float(precio_noche)
    subtotal = round(noches * precio, 2)

    # Regla de descuento por larga estancia (> 15 noches)
    if noches > 15:
        descuento = round(subtotal * 0.15, 2)
    else:
        descuento = 0.0

    total = round(subtotal - descuento, 2)

    return {
        "noches": noches,
        "subtotal": subtotal,
        "descuento": descuento,
        "total": total
    }
