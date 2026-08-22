from pydantic import BaseModel, EmailStr, Field
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
    # RN-011.4: el número de personas no puede superar la capacidad de la unidad.
    # RF-011: campo obligatorio, debe ser mayor a cero.
    numero_personas: int = Field(..., ge=1, description="Número de personas (mín. 1, no puede superar la capacidad de la unidad)")


# --- Schemas de Empleados / Autenticación (Sprint 1) ---

ROLES_VALIDOS = Literal[
    'Administrador',
    'Recepcionista 24h',
    'Ama de llaves',
    'Personal de mantenimiento',
    'Conserje'
]

TIPOS_DOCUMENTO = Literal[
    'Cédula de ciudadanía',
    'Pasaporte',
    'Cédula de extranjería',
    'Otro'
]

class EmpleadoRegistro(BaseModel):
    """
    Payload para registrar un nuevo empleado (CA-001.x).
    Campos obligatorios según CA-001.1: tipo_documento, numero_documento, nombre, correo,
    usuario, contrasena. El rol y tipo_documento tienen valores por defecto.
    """
    # CA-001.1: campos de identidad personal
    tipo_documento: Optional[TIPOS_DOCUMENTO] = 'Cédula de ciudadanía'  # CA-001.5
    numero_documento: str                                                  # CA-001.3
    nombre: str
    correo: EmailStr                                                       # CA-001.4
    # Credenciales de acceso al sistema
    usuario: str
    contrasena: str
    # CA-001.7: rol por defecto si no se especifica
    rol: Optional[ROLES_VALIDOS] = 'Recepcionista 24h'


class LoginRequest(BaseModel):
    """Payload para inicio de sesión con usuario y contraseña (CA-002.x)."""
    usuario: str
    contrasena: str

class TokenResponse(BaseModel):
    """Respuesta exitosa de login con el JWT."""
    access_token: str
    token_type: str = "bearer"
