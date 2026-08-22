from pydantic import BaseModel, EmailStr
from typing import Optional, Literal


# --- Schemas de Huéspedes (existentes) ---

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


# --- Schemas de Empleados / Autenticación (Sprint 1) ---

ROLES_VALIDOS = Literal[
    'Administrador',
    'Recepcionista 24h',
    'Ama de llaves',
    'Personal de mantenimiento',
    'Conserje'
]

class EmpleadoRegistro(BaseModel):
    """Payload para registrar un nuevo empleado (CA-001.x)."""
    nombre: str
    usuario: str
    contrasena: str
    rol: Optional[ROLES_VALIDOS] = 'Recepcionista 24h'  # CA-001.7: rol por defecto

class LoginRequest(BaseModel):
    """Payload para inicio de sesión con usuario y contraseña (CA-002.x)."""
    usuario: str
    contrasena: str

class TokenResponse(BaseModel):
    """Respuesta exitosa de login con el JWT."""
    access_token: str
    token_type: str = "bearer"
