"""
backend/routes/auth.py
Sprint 1 — Autenticación JWT + bcrypt

RF-001 / HU-001: Registro de empleado
RF-004 / HU-002: Login con JWT
RF-007 / HU-002: Validación de credenciales (mismo mensaje para usuario inexistente y contraseña incorrecta)
RF-008      : Cifrado de contraseña con bcrypt
"""
import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, status

from database import connection
from dependencies import UsuarioActual, autenticar, requiere_rol
from models.schemas import EmpleadoRegistro, LoginRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

# ── Configuración JWT ──────────────────────────────────────────────────────────
_JWT_SECRET = os.getenv("JWT_SECRET", "")
_JWT_ALGORITHM = "HS256"
_JWT_EXPIRY_HOURS = 8  # CA-002.2: acceso válido por 8 horas



def _crear_token(id_empleado: int, rol: str) -> str:
    """Genera un JWT firmado con id y rol del empleado."""
    if not _JWT_SECRET:
        raise RuntimeError("JWT_SECRET no está configurado.")
    expira = datetime.now(tz=timezone.utc) + timedelta(hours=_JWT_EXPIRY_HOURS)
    payload = {
        "sub": str(id_empleado),
        "rol": rol,
        "exp": expira,
    }
    return jwt.encode(payload, _JWT_SECRET, algorithm=_JWT_ALGORITHM)


# ── POST /api/auth/registro ───────────────────────────────────────────────────
@router.post("/registro", status_code=status.HTTP_201_CREATED)
def registrar_empleado(datos: EmpleadoRegistro):
    """
    RF-001 / HU-001 — Registra un nuevo empleado del sistema.

    CA-001.1: acepta tipo_documento, numero_documento, nombre, correo, usuario, contrasena.
    CA-001.2: crea el usuario, lo deja en estado 'Activo', asigna el rol indicado o por defecto.
    CA-001.3: rechaza si el numero_documento ya existe.
    CA-001.4: rechaza si el correo ya existe.
    CA-001.5: tipo_documento restringido a enum (Pydantic + CHECK en DB).
    CA-001.6: contraseña almacenada con bcrypt, nunca en texto plano.
    CA-001.7: si no se provee rol, el sistema asigna 'Recepcionista 24h'.
    CA-001.8: estado inicial siempre 'Activo'.
    CA-001.9: campos obligatorios validados por Pydantic (422 si faltan).
    """
    # CA-001.9: campos obligatorios no pueden ser vacíos
    campos_requeridos = {
        "nombre": datos.nombre,
        "usuario": datos.usuario,
        "contrasena": datos.contrasena,
        "numero_documento": datos.numero_documento,
        "correo": str(datos.correo),
    }
    vacios = [campo for campo, valor in campos_requeridos.items() if not str(valor).strip()]
    if vacios:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Los siguientes campos son obligatorios y no pueden estar vacíos: {', '.join(vacios)}.",
        )

    # Hash bcrypt (CA-001.6 / RF-008)
    hashed = bcrypt.hashpw(datos.contrasena.encode(), bcrypt.gensalt()).decode()

    try:
        conn = connection.obtener_conexion()
        cur = conn.cursor()

        # CA-001.3: numero_documento único
        cur.execute("SELECT id_empleado FROM empleado WHERE numero_documento = %s", (datos.numero_documento.strip(),))
        if cur.fetchone():
            cur.close(); conn.close()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El número de documento ya está registrado.",
            )

        # CA-001.4: correo único
        cur.execute("SELECT id_empleado FROM empleado WHERE correo = %s", (str(datos.correo).lower(),))
        if cur.fetchone():
            cur.close(); conn.close()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El correo electrónico ya está en uso.",
            )

        # CA-001.3b: usuario único (nombre de login)
        cur.execute("SELECT id_empleado FROM empleado WHERE usuario = %s", (datos.usuario.strip(),))
        if cur.fetchone():
            cur.close(); conn.close()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El nombre de usuario ya está en uso.",
            )

        # CA-001.2 / CA-001.8: INSERT con estado 'Activo' fijo
        cur.execute(
            """
            INSERT INTO empleado (nombre, usuario, contrasena, rol, tipo_documento, numero_documento, correo, estado)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'Activo')
            RETURNING id_empleado, nombre, usuario, rol, estado
            """,
            (
                datos.nombre.strip(),
                datos.usuario.strip(),
                hashed,
                datos.rol,
                datos.tipo_documento,
                datos.numero_documento.strip(),
                str(datos.correo).lower(),
            ),
        )
        fila = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        return {
            "message": "Empleado registrado exitosamente.",
            "empleado": {
                "id_empleado": fila[0],
                "nombre": fila[1],
                "usuario": fila[2],
                "rol": fila[3],
                "estado": fila[4],  # CA-001.8: confirma que es 'Activo'
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar empleado: {e}",
        )




# ── POST /api/auth/login ──────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(credenciales: LoginRequest):
    """
    RF-004 / HU-002 — Login con contraseña y emisión de JWT.

    CA-002.2: retorna token si las credenciales son correctas.
    CA-002.3: mensaje de error IDÉNTICO si el usuario no existe O la contraseña es incorrecta
              (no revelar cuál de los dos falló).
    CA-002.4: rechaza acceso si el usuario está inactivo (sin campo estado en empleado
              en este sprint; aplica para futura extensión).
    """
    _CRED_ERROR = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales incorrectas.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        conn = connection.obtener_conexion()
        cur = conn.cursor()
        cur.execute(
            "SELECT id_empleado, contrasena, rol FROM empleado WHERE usuario = %s",
            (credenciales.usuario,),
        )
        fila = cur.fetchone()
        cur.close()
        conn.close()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al autenticar: {e}",
        )

    # CA-002.3: misma respuesta tanto si el usuario no existe como si la contraseña es incorrecta
    if fila is None:
        raise _CRED_ERROR

    id_empleado, hash_guardado, rol = fila
    if not bcrypt.checkpw(credenciales.contrasena.encode(), hash_guardado.encode()):
        raise _CRED_ERROR

    token = _crear_token(id_empleado, rol)
    return TokenResponse(access_token=token)


# ── GET /api/auth/test-admin — ENDPOINT TEMPORAL DE PRUEBA (borrar en PR) ─────
@router.get(
    "/test-admin",
    summary="[TEST TEMPORAL] Solo accesible para Administrador",
    dependencies=[Depends(requiere_rol("Administrador"))],
)
def test_solo_admin(usuario: UsuarioActual = Depends(autenticar)):
    """
    Endpoint temporal para verificar que requiere_rol() funciona correctamente.
    Pruebas:
      - Sin token       → 401
      - Token Recepcionista → 403
      - Token Administrador → 200
      - Token manipulado    → 401
    Eliminar antes de hacer merge a develop.
    """
    return {
        "message": "Acceso concedido al área de administración.",
        "id_empleado": usuario.id_empleado,
        "rol": usuario.rol,
    }
