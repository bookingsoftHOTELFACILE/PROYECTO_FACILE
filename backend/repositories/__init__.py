"""Módulo de repositorios: acceso a datos con cursor por nombre y transacciones seguras."""
from repositories.base import cursor_escritura, cursor_lectura

__all__ = ["cursor_escritura", "cursor_lectura"]
