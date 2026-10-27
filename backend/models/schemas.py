from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Literal
from datetime import date
import re

# --- Schemas de Huéspedes (existentes) ---

class UserRegistro(BaseModel):
    nombre: str
    documento: str
    telefono: str
    correo: str
    empresa: Optional[str] = None
    password: Optional[str] = None

class GuestLoginRequest(BaseModel):
    documento_o_correo: str
    password: Optional[str] = None

class GuestRecuperarRequest(BaseModel):
    correo_o_documento: str

class GuestRestablecerRequest(BaseModel):
    correo_o_documento: str
    nueva_password: str

class ReservaCreate(BaseModel):
    id_huesped: int
    id_habitacion: int
    fecha_entrada: str
    fecha_salida: str
    # RN-011.4: el número de personas no puede superar la capacidad de la unidad.
    # RF-011: campo obligatorio, debe ser mayor a cero.
    numero_personas: int = Field(..., ge=1, description="Número de personas (mín. 1, no puede superar la capacidad de la unidad)")


# --- Schemas de Empleados / Autenticación (Sprint 1) ---

ROLES_ASIGNABLES = Literal[
    'Recepcionista 24h',
    'Ama de llaves',
    'Personal de mantenimiento',
    'Conserje'
]

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
    # CA-001.7: rol por defecto si no se especifica (roles asignables operativos)
    rol: Optional[ROLES_ASIGNABLES] = 'Recepcionista 24h'


class LoginRequest(BaseModel):
    """Payload para inicio de sesión con usuario y contraseña (CA-002.x)."""
    usuario: str
    contrasena: str

class TokenResponse(BaseModel):
    """Respuesta exitosa de login con el JWT."""
    access_token: str
    token_type: str = "bearer"

class Huesped(BaseModel):
    nombres: str
    documento: str
    correo: str
    fecha_nacimiento: date
    fecha_referencia: Optional[date] = None

    # REGLA 1: validar formato de correo con Regex
    @field_validator('correo')
    @classmethod
    def validar_formato_correo(cls, valor: str) -> str:
        patron = r'^[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}$'
        if not re.match(patron, valor.strip()):
            raise ValueError("El formato del correo electronico es invalido")
        return valor.strip().lower()

    # REGLA 2: validar mayoria de edad (minimo 18 años)
    @field_validator('fecha_nacimiento')
    @classmethod
    def validar_mayoria_edad(cls, fecha_nac: date, info) -> date:
        ref = info.data.get('fecha_referencia') or date.today()
        edad = ref.year - fecha_nac.year - ((ref.month, ref.day) < (fecha_nac.month, fecha_nac.day))

        if edad < 18:
            raise ValueError("El huesped debe ser mayor de edad (minimo 18 años).")
        return fecha_nac
