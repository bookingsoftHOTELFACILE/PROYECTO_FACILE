from pydantic import BaseModel
from typing import Optional

class UserRegistro(BaseModel):
    nombre: str
    documento: str
    telefono: str
    correo: str
    empresa: Optional[str] = None

class ReservaCreate(BaseModel):
    id_huesped: int
    id_habitacion: int
    fecha_entrada: str
    fecha_salida: str
