from datetime import date
from typing import List, Dict, Any


def construir_consulta_sql_disponibilidad() -> str:
    """
    Retorna la consulta SQL parametrizada para consultar habitaciones disponibles
    en un rango de fechas [fecha_entrada, fecha_salida), excluyendo habitaciones
    en Mantenimiento y aquellas con reservas activas que se traslapen.
    """
    return """
        SELECT h.id_habitacion, h.numero, h.tipo, h.capacidad, h.precio_noche, h.estado
        FROM habitacion h
        WHERE h.estado != 'Mantenimiento'
          AND NOT EXISTS (
              SELECT 1 FROM reserva_habitacion r
              WHERE r.id_habitacion = h.id_habitacion
                AND r.estado IN ('Confirmada', 'Check-In')
                AND r.fecha_entrada < %s
                AND r.fecha_salida > %s
          )
        ORDER BY h.numero ASC
    """


def hay_traslape_fechas(
    entrada_solicitada: date,
    salida_solicitada: date,
    entrada_existente: date,
    salida_existente: date,
) -> bool:
    """
    Evalúa la condición matemática de la cláusula WHERE de disponibilidad:
    Dos rangos de estadía NO se chocan si la salida solicitada <= entrada existente
    o si la entrada solicitada >= salida existente.
    En caso contrario, existe traslape (choque de fechas).
    """
    if salida_solicitada <= entrada_existente or entrada_solicitada >= salida_existente:
        return False
    return True


def consultar_habitaciones_disponibles(
    habitaciones: List[Dict[str, Any]],
    reservas: List[Dict[str, Any]],
    fecha_entrada: date,
    fecha_salida: date,
) -> List[Dict[str, Any]]:
    """
    Filtra las habitaciones disponibles en el rango [fecha_entrada, fecha_salida):
    1. Excluye habitaciones cuyo estado sea 'Mantenimiento'.
    2. Excluye habitaciones que tengan alguna reserva ('Confirmada' o 'Check-In')
       que se traslape con el rango seleccionado.
    """
    if fecha_salida <= fecha_entrada:
        raise ValueError("La fecha de salida debe ser posterior a la fecha de entrada.")

    disponibles = []

    for hab in habitaciones:
        # Regla 1: Exclusión de habitaciones en mantenimiento
        if hab.get("estado") == "Mantenimiento":
            continue

        # Regla 2: Detección de traslape con reservas activas de esa habitación
        tiene_choque = False
        for res in reservas:
            if res.get("id_habitacion") != hab.get("id_habitacion"):
                continue
            if res.get("estado") not in ("Confirmada", "Check-In"):
                continue

            if hay_traslape_fechas(
                fecha_entrada,
                fecha_salida,
                res["fecha_entrada"],
                res["fecha_salida"],
            ):
                tiene_choque = True
                break

        if not tiene_choque:
            disponibles.append(hab)

    return disponibles