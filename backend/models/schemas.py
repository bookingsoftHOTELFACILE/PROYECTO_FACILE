from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal

try:
    import email_validator  # noqa: F401
except ImportError:
    EmailStr = str


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


CAPACIDADES_POR_TIPO = {
    "Dúplex": 3,
    "Dobles": 4,
    "Familiar": 6,
    "Familiares": 6,
    "Habitaciones": 2,
}


def habitacion_a_dto(fila: tuple) -> dict:
    return {
        "id_habitacion": fila[0],
        "numero": fila[1],
        "tipo": fila[2],
        "capacidad": int(fila[3]),
        "precio_noche": validar_precio_noche(fila[4]),
        "estado": fila[5],
        "modificado_por": fila[6] or "",
        "detalle_mantenimiento": fila[7] or "",
    }


def validar_capacidad_habitacion(tipo: str, huespedes: int) -> bool:
    if tipo not in CAPACIDADES_POR_TIPO:
        raise ValueError(f"El tipo de habitación '{tipo}' no es válido.")

    if huespedes < 1:
        raise ValueError("La habitación debe tener al menos 1 huésped.")

    capacidad_maxima = CAPACIDADES_POR_TIPO[tipo]
    if huespedes > capacidad_maxima:
        raise ValueError(
            f"Sobrecupo: la habitación '{tipo}' permite máximo {capacidad_maxima} huéspedes."
        )

    return True


def validar_precio_noche(precio) -> float:
    if isinstance(precio, bool) or not isinstance(precio, (int, float)) and not hasattr(precio, "__float__"):
        raise ValueError("El precio por noche debe ser un valor numérico.")

    try:
        precio_limpio = float(precio)
    except (TypeError, ValueError):
        raise ValueError("El precio por noche debe ser un valor numérico.")

    if precio_limpio <= 0:
        raise ValueError("El precio por noche debe ser mayor a cero.")

    return round(precio_limpio, 2)

