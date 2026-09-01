"""
backend/dependencies.py
Sprint 1 — Infraestructura de autenticación y autorización reutilizable

RF-009: Validación de permisos basada en JWT + rol.
RN-009.3: El control de permisos se aplica en toda solicitud al servidor.

Uso en endpoints:
    # Solo requiere estar autenticado:
    @router.get("/ruta", dependencies=[Depends(autenticar)])

    # Requiere rol específico (uno o varios):
    @router.get("/ruta", dependencies=[Depends(requiere_rol("Administrador"))])
    @router.get("/ruta", dependencies=[Depends(requiere_rol("Administrador", "Recepcionista 24h"))])

    # Con acceso al usuario en sesión dentro del handler:
    @router.get("/ruta")
    def mi_endpoint(usuario: UsuarioActual = Depends(autenticar)):
        return {"hola": usuario.rol}
"""
import os
from dataclasses import dataclass
from typing import Callable

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

# ── Configuración (misma fuente que auth.py) ──────────────────────────────────
_JWT_SECRET = os.getenv("JWT_SECRET", "").strip()
_JWT_ALGORITHM = "HS256"

# HTTPBearer extrae automáticamente el token de "Authorization: Bearer <token>"
# auto_error=False permite manejar el 401 con un mensaje en español
_bearer_scheme = HTTPBearer(auto_error=False)


@dataclass
class UsuarioActual:
    """Datos del empleado autenticado extraídos del JWT."""
    id_empleado: int
    rol: str
    nombre: str = ""


# ── Dependencia base: autenticar ──────────────────────────────────────────────
def autenticar(
    credenciales: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> UsuarioActual:
    """
    Dependencia de FastAPI que:
    1. Extrae el JWT del header Authorization: Bearer <token>.
    2. Valida firma y expiración con JWT_SECRET.
    3. Devuelve UsuarioActual(id_empleado, rol, nombre) si es válido.
    4. Lanza HTTP 401 si el token falta, expiró o la firma es inválida.

    RF-009 / RN-009.3: control en toda solicitud al servidor.
    """
    _no_autenticado = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado. Proporcione un token Bearer válido.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credenciales is None:
        raise _no_autenticado

    try:
        payload = jwt.decode(
            credenciales.credentials,
            _JWT_SECRET,
            algorithms=[_JWT_ALGORITHM],
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token ha expirado. Inicie sesión nuevamente.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        # Cubre firma inválida, token manipulado, formato incorrecto, etc.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    sub = payload.get("sub")
    rol = payload.get("rol")
    nombre = payload.get("nombre", "")

    if not sub or not rol:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token con estructura inesperada.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return UsuarioActual(id_empleado=int(sub), rol=rol, nombre=nombre)


# ── Dependencia de autorización: requiere_rol ─────────────────────────────────
def requiere_rol(*roles_permitidos: str) -> Callable:
    """
    Fábrica de dependencias que restringe el acceso a uno o varios roles.

    Uso:
        @router.get("/admin-only", dependencies=[Depends(requiere_rol("Administrador"))])
        @router.get("/multi-rol", dependencies=[Depends(requiere_rol("Administrador", "Recepcionista 24h"))])

    RF-009 / RN-009.1: cada endpoint tiene definido explícitamente el conjunto
    de roles autorizados.
    """
    def _verificar(usuario: UsuarioActual = Depends(autenticar)) -> UsuarioActual:
        if usuario.rol not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere uno de los siguientes roles: {', '.join(roles_permitidos)}.",
            )
        return usuario
    return _verificar
