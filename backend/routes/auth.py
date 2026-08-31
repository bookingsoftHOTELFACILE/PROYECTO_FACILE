"""
backend/routes/auth.py
Sprint 1 — Autenticación JWT + bcrypt

RF-001 / HU-001       : Registro de empleado
RF-004 / HU-002       : Login con JWT
RF-005 / HU-002 CA-002.5: Cierre de sesión (stateless — invalidación en cliente)
RF-007 / HU-002 CA-002.3: Mismo mensaje para usuario inexistente y contraseña incorrecta
RF-008                : Cifrado de contraseña con bcrypt
RF-010 / HU-002 CA-002.4: Rechazo de login si usuario está Inactivo (mensaje diferenciado)
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


def _crear_token(id_empleado: int, rol: str, nombre: str = "") -> str:
    """Genera un JWT firmado con id, rol y nombre del empleado."""
    if not _JWT_SECRET:
        raise RuntimeError("JWT_SECRET no está configurado.")
    expira = datetime.now(tz=timezone.utc) + timedelta(hours=_JWT_EXPIRY_HOURS)
    payload = {
        "sub": str(id_empleado),
        "rol": rol,
        "nombre": nombre,
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

    CA-002.2: retorna token si las credenciales son correctas y el usuario está Activo.
    CA-002.3: mensaje de error IDÉNTICO si el usuario no existe O la contraseña es incorrecta
              (no revelar cuál de los dos falló).
    CA-002.4 / RN-010.3: rechaza con mensaje diferenciado si el usuario existe, la contraseña
              es correcta, pero su estado es 'Inactivo'. Aquí sí corresponde indicar el motivo.
    """
    _CRED_ERROR = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales incorrectas.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        conn = connection.obtener_conexion()
        cur = conn.cursor()
        # Incluimos 'estado' para aplicar CA-002.4 / RN-010.3
        cur.execute(
            "SELECT id_empleado, contrasena, rol, estado, nombre FROM empleado WHERE usuario = %s",
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

    # CA-002.3: misma respuesta si el usuario no existe o la contraseña es incorrecta
    if fila is None:
        raise _CRED_ERROR

    id_empleado, hash_guardado, rol, estado, nombre = fila
    if not bcrypt.checkpw(credenciales.contrasena.encode(), hash_guardado.encode()):
        raise _CRED_ERROR

    # CA-002.4 / RN-010.3: credenciales correctas pero cuenta deshabilitada.
    # Aquí sí corresponde revelar el motivo (no es un fallo de credenciales).
    if estado != "Activo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta inactiva. Contacte al administrador del sistema.",
        )

    token = _crear_token(id_empleado, rol, nombre)
    return TokenResponse(access_token=token)


# ── POST /api/auth/logout ─────────────────────────────────────────────────────
@router.post("/logout", dependencies=[Depends(autenticar)])
def logout():
    """
    RF-005 / HU-002 CA-002.5 — Cierre de sesión.

    Decisión de diseño — enfoque stateless:
    - El servidor confirma el cierre y el cliente descarta el token.
    - No se implementa blacklist server-side: ningún RF, RN ni HU lo exige
      y el stack no incluye Redis ni infraestructura equivalente.
    - RN-005.2 (no acceso post-logout) se cumple por la expiración del JWT
      y la responsabilidad del cliente de no reenviar el token descartado.
    """
    return {"message": "Sesión cerrada exitosamente. Descarte el token en el cliente."}
