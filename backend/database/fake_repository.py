"""
backend/database/fake_repository.py

Doble de Prueba tipo FAKE (Semana 5 - Capa BD - Sebastián Parada @sebasparada).
Repositorio de reservas en memoria (RAM) que emula las operaciones de PostgreSQL
(creación, consulta, validación de traslape / double booking y cancelación)
permitiendo ejecutar pruebas unitarias deterministas en milisegundos sin base de datos real.
"""
from datetime import datetime
from typing import Dict, List, Optional, Any


class FakeReservaRepository:
    """
    Fake Repository en memoria para el módulo de reservas.
    Almacena las entidades en un diccionario en RAM: {id_reserva: dict}.
    """

    def __init__(self, seed_data: Optional[List[Dict[str, Any]]] = None):
        self._reservas: Dict[int, Dict[str, Any]] = {}
        self._next_id: int = 1

        if seed_data:
            for item in seed_data:
                self.guardar(item)

    def guardar(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        """
        Guarda o inserta una reserva en memoria asignando un ID secuencial.
        Retorna la entidad guardada como diccionario serializable.
        """
        id_reserva = datos.get("id_reserva") or self._next_id
        if id_reserva >= self._next_id:
            self._next_id = id_reserva + 1

        reserva = {
            "id_reserva": id_reserva,
            "id_huesped": datos["id_huesped"],
            "huesped_nombre": datos.get("huesped_nombre", "Huésped Genérico"),
            "huesped_documento": datos.get("huesped_documento", "00000000"),
            "id_habitacion": datos["id_habitacion"],
            "habitacion_numero": datos.get("habitacion_numero", "101"),
            "fecha_entrada": str(datos["fecha_entrada"]),
            "fecha_salida": str(datos["fecha_salida"]),
            "estado": datos.get("estado", "Confirmada"),
            "creado_por": datos.get("creado_por", "Sistema"),
        }
        self._reservas[id_reserva] = reserva
        return reserva

    def obtener_por_id(self, id_reserva: int) -> Optional[Dict[str, Any]]:
        """Busca una reserva por su ID en el almacenamiento en RAM."""
        return self._reservas.get(id_reserva)

    def listar_todas(self) -> List[Dict[str, Any]]:
        """Retorna todas las reservas almacenadas (activas y canceladas)."""
        return list(self._reservas.values())

    def listar_activas(self) -> List[Dict[str, Any]]:
        """Retorna únicamente las reservas cuyo estado no sea 'Cancelada'."""
        return [r for r in self._reservas.values() if r["estado"] != "Cancelada"]

    def cancelar(self, id_reserva: int, audit_str: str = "Sistema") -> bool:
        """
        Cancela una reserva activa actualizando su estado a 'Cancelada'.
        Retorna True si la reserva existía y fue cancelada, False si no existe.
        """
        reserva = self.obtener_por_id(id_reserva)
        if not reserva:
            return False

        reserva["estado"] = "Cancelada"
        reserva["modificado_por"] = audit_str
        return True

    def existe_traslape(self, id_habitacion: int, fecha_entrada: str, fecha_salida: str) -> bool:
        """
        Emula la restricción EXCLUDE USING GIST de PostgreSQL para double booking.
        Retorna True si para la misma habitación existe otra reserva activa
        cuyo rango de fechas se solape: (entrada1 < salida2) y (salida1 > entrada2).
        """
        f_in = datetime.strptime(str(fecha_entrada), "%Y-%m-%d").date()
        f_out = datetime.strptime(str(fecha_salida), "%Y-%m-%d").date()

        for r in self.listar_activas():
            if r["id_habitacion"] == id_habitacion:
                r_in = datetime.strptime(r["fecha_entrada"], "%Y-%m-%d").date()
                r_out = datetime.strptime(r["fecha_salida"], "%Y-%m-%d").date()
                # Condición de colisión / solapamiento
                # MUTANTE SEMANA 5: Cambiar '<' por '<=' para permitir o bloquear indebidamente salidas el mismo día
                if f_in < r_out and f_out > r_in:
                    return True
        return False

    def limpiar(self) -> None:
        """Vacía el repositorio en memoria para garantizar aislamiento entre tests."""
        self._reservas.clear()
        self._next_id = 1

