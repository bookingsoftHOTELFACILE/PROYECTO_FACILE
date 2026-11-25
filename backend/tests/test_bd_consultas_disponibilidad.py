import pytest
from datetime import date
from services.disponibilidad_service import (
    construir_consulta_sql_disponibilidad,
    hay_traslape_fechas,
    consultar_habitaciones_disponibles,
)


def test_habitacion_libre_en_rango_de_fechas_seleccionado():
    # Arrange: habitación disponible con una reserva del 10 al 15 de noviembre,
    # y consultamos del 5 al 10 de noviembre (valor límite exacto: sale el mismo día que inicia la otra)
    habitaciones = [
        {"id_habitacion": 101, "numero": "101", "tipo": "Dúplex", "estado": "Disponible"}
    ]
    reservas = [
        {
            "id_reserva": 1,
            "id_habitacion": 101,
            "fecha_entrada": date(2026, 11, 10),
            "fecha_salida": date(2026, 11, 15),
            "estado": "Confirmada",
        }
    ]
    fecha_entrada_buscada = date(2026, 11, 5)
    fecha_salida_buscada = date(2026, 11, 10)

    # Act: consultar disponibilidad en el rango seleccionado
    resultado = consultar_habitaciones_disponibles(
        habitaciones, reservas, fecha_entrada_buscada, fecha_salida_buscada
    )

    # Assert: la habitación 101 debe aparecer libre porque el check-out 10 nov no choca con check-in 10 nov
    assert len(resultado) == 1
    assert resultado[0]["numero"] == "101"


def test_deteccion_de_traslape_de_fechas_excluye_habitacion_ocupada():
    # Arrange: habitación 102 reservada del 10 al 15 de noviembre;
    # se intenta buscar disponibilidad del 12 al 18 de noviembre (choca del 12 al 15)
    habitaciones = [
        {"id_habitacion": 102, "numero": "102", "tipo": "Doble", "estado": "Disponible"}
    ]
    reservas = [
        {
            "id_reserva": 2,
            "id_habitacion": 102,
            "fecha_entrada": date(2026, 11, 10),
            "fecha_salida": date(2026, 11, 15),
            "estado": "Confirmada",
        }
    ]

    # Act: consultar en fechas que se cruzan con la reserva activa
    resultado = consultar_habitaciones_disponibles(
        habitaciones, reservas, date(2026, 11, 12), date(2026, 11, 18)
    )

    # Assert: detecta el traslape y retorna lista vacía (no disponible)
    assert resultado == []
    assert hay_traslape_fechas(
        date(2026, 11, 12), date(2026, 11, 18),
        date(2026, 11, 10), date(2026, 11, 15)
    ) is True


def test_exclusion_de_habitaciones_en_mantenimiento():
    # Arrange: dos habitaciones sin ninguna reserva, pero la 201 está en 'Mantenimiento'
    habitaciones = [
        {"id_habitacion": 201, "numero": "201", "tipo": "Familiar", "estado": "Mantenimiento"},
        {"id_habitacion": 202, "numero": "202", "tipo": "Estándar", "estado": "Disponible"},
    ]
    reservas = []

    # Act: consultar disponibilidad del 1 al 5 de diciembre
    resultado = consultar_habitaciones_disponibles(
        habitaciones, reservas, date(2026, 12, 1), date(2026, 12, 5)
    )

    # Assert: excluye la 201 en Mantenimiento y solo devuelve la 202
    assert len(resultado) == 1
    assert resultado[0]["numero"] == "202"


def test_consulta_sql_incluye_clausulas_where_mantenimiento_y_fechas():
    # Arrange & Act: obtener la consulta SQL parametrizada
    sql = construir_consulta_sql_disponibilidad()

    # Assert: verifica que la consulta SQL filtre Mantenimiento y rango de fechas en WHERE
    assert "WHERE h.estado != 'Mantenimiento'" in sql
    assert "r.fecha_entrada < %s" in sql
    assert "r.fecha_salida > %s" in sql