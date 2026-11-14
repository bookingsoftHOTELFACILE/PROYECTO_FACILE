import logging
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from dependencies import requiere_rol, autenticar, autenticar_opcional, UsuarioActual
from models.schemas import UserRegistro, GuestLoginRequest, GuestRecuperarRequest, GuestRestablecerRequest
from repositories import cursor_escritura, cursor_lectura
logger = logging.getLogger("bookingsoft.huespedes")

# M-08 — prefijos de router unificados: cada endpoint declara sólo la ruta relativa
# y el prefijo vive en un solo lugar. El módulo expone dos routers porque agrupa
# dos familias de rutas distintas: el inventario de huéspedes del PMS y las
# operaciones de cuenta del portal (/api/user/*).
router = APIRouter(prefix="/api/huespedes", tags=["huespedes"])
router_user = APIRouter(prefix="/api/user", tags=["cuenta de huésped"])

class CambiarEstadoHuespedRequest(BaseModel):
    estado: str

# RF-009: solo Administrador o Recepcionista 24h pueden ver el listado de huéspedes.
@router.get("", dependencies=[Depends(requiere_rol("Administrador", "Recepcionista 24h"))])
def obtener_huespedes():
    """Retorna la lista de todos los huéspedes ordenados por id."""
    try:
        # M-05: cursor y conexión los maneja la capa de repositorios.
        with cursor_lectura() as cur:
            cur.execute("SELECT id_huesped, nombre, documento, telefono, correo, empresa, lealtad, estado, modificado_por FROM huesped ORDER BY id_huesped DESC")
            filas = cur.fetchall()

        # M-06: se lee por nombre de columna en lugar de por posición.
        return [
            {
                "id_huesped": f["id_huesped"],
                "nombre": f["nombre"],
                "documento": f["documento"],
                "telefono": f["telefono"],
                "correo": f["correo"],
                "empresa": f["empresa"],
                "lealtad": f["lealtad"],
                "estado": f["estado"],
                "modificado_por": f["modificado_por"] or ""
            }
            for f in filas
        ]
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("GET /api/huespedes — fallo al consultar el listado de huéspedes")
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud.")

@router_user.post("/registro", status_code=status.HTTP_201_CREATED)
def registrar_usuario(
    usuario: UserRegistro,
    usuario_actual: UsuarioActual | None = Depends(autenticar_opcional)
):
    """Registra un nuevo huésped validando duplicados por documento y por correo con contraseña encriptada."""
    if not usuario.nombre or not usuario.documento or not usuario.telefono or not usuario.correo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nombre, documento, teléfono y correo son campos obligatorios."
        )

    creador_str = f"{usuario_actual.nombre} ({usuario_actual.rol})" if usuario_actual else "Auto-registro Web Huésped"
    audit_str = f"Creado por: {creador_str}"

    # Generar hash bcrypt de contraseña si fue enviada o usar la cédula como clave por defecto
    clave_base = usuario.password.strip() if usuario.password else usuario.documento.strip()
    password_hash = bcrypt.hashpw(clave_base.encode(), bcrypt.gensalt()).decode()

    try:
        # M-05: commit al salir y rollback si se aborta (duplicados, por ejemplo).
        with cursor_escritura() as cur:

            # Validar si ya existe por documento o correo
            cur.execute(
                "SELECT id_huesped, documento, correo FROM huesped WHERE documento = %s OR LOWER(correo) = LOWER(%s)",
                (usuario.documento.strip(), usuario.correo.strip())
            )
            existente = cur.fetchone()
            if existente:
                if existente["documento"] == usuario.documento.strip():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Ya existe un usuario registrado con este número de documento. Inicie sesión con su contraseña."
                    )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Ya existe un usuario registrado con este correo electrónico. Inicie sesión con su contraseña."
                    )

            insertar_query = """
                INSERT INTO huesped (nombre, documento, telefono, correo, empresa, lealtad, estado, modificado_por, password_hash)
                VALUES (%s, %s, %s, %s, %s, 'Silver', 'Activo', %s, %s)
                RETURNING id_huesped, nombre, documento, telefono, correo, empresa, lealtad, estado, modificado_por
            """
            cur.execute(insertar_query, (
                usuario.nombre.strip(),
                usuario.documento.strip(),
                usuario.telefono.strip(),
                usuario.correo.strip(),
                usuario.empresa.strip() if usuario.empresa else "",
                audit_str,
                password_hash
            ))
            resultado = cur.fetchone()

        # M-06: acceso por nombre de columna.
        nuevo_usuario = {
            "id_huesped": resultado["id_huesped"],
            "nombre": resultado["nombre"],
            "documento": resultado["documento"],
            "telefono": resultado["telefono"],
            "correo": resultado["correo"],
            "empresa": resultado["empresa"],
            "lealtad": resultado["lealtad"],
            "estado": resultado["estado"],
            "modificado_por": resultado["modificado_por"]
        }

        # Log de notificación por correo enviada exitosamente
        logger.info(f"📧 [EMAIL CONFIRMATION] Notificación de bienvenida enviada a '{usuario.correo}' para el huésped '{usuario.nombre}'.")

        return {
            "message": f"¡Usuario registrado exitosamente! Se ha enviado una notificación de bienvenida a {usuario.correo}.",
            "email_sent": True,
            "usuario": nuevo_usuario
        }

    except HTTPException:
        raise
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("POST /api/user/registro — fallo al registrar el huésped con documento %r", usuario.documento)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al procesar el registro."
        )

# ── POST /api/user/login (Inicio de sesión de Huésped con Documento/Correo + Contraseña) ──
@router_user.post("/login")
def login_huesped(payload: GuestLoginRequest):
    """Inicia sesión del huésped validando documento/correo y contraseña encriptada."""
    q = payload.documento_o_correo.strip()
    if not q:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe ingresar su número de documento o correo electrónico."
        )

    try:
        # M-05: el bloque puede escribir (inicializa la contraseña de cuentas semilla).
        with cursor_escritura() as cur:

            cur.execute(
                "SELECT id_huesped, nombre, documento, telefono, correo, empresa, lealtad, estado, password_hash FROM huesped WHERE documento = %s OR LOWER(correo) = LOWER(%s)",
                (q, q.lower())
            )
            fila = cur.fetchone()

            if not fila:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No encontramos un registro con estos datos. Regístrese en la opción 'Crear cuenta nueva'."
                )

            # M-06: acceso por nombre de columna.
            id_huesped = fila["id_huesped"]
            nombre = fila["nombre"]
            password_hash = fila["password_hash"]

            # 1. Validar que el huésped sí envió una contraseña (evita el login nulo)
            if not payload.password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La contraseña es obligatoria."
                )

            # 2. Si no tenía contraseña previa (cuenta semilla de BD), inicializar con la primera clave enviada
            if not password_hash:
                nuevo_hash = bcrypt.hashpw(payload.password.encode(), bcrypt.gensalt()).decode()
                cur.execute("UPDATE huesped SET password_hash = %s WHERE id_huesped = %s", (nuevo_hash, id_huesped))
            # 3. Si ya tiene contraseña registrada, validar que coincida con el hash
            elif not bcrypt.checkpw(payload.password.encode(), password_hash.encode()):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Credenciales inválidas."
                )

        usuario_dict = {
            "id_huesped": id_huesped,
            "nombre": nombre,
            "documento": fila["documento"],
            "telefono": fila["telefono"],
            "correo": fila["correo"],
            "empresa": fila["empresa"],
            "lealtad": fila["lealtad"],
            "estado": fila["estado"]
        }

        return {
            "message": f"¡Bienvenido de nuevo, {nombre}!",
            "usuario": usuario_dict
        }

    except HTTPException:
        raise
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("POST /api/user/login — fallo al iniciar sesión con %r", q)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al procesar el inicio de sesión."
        )

# ── POST /api/user/recuperar-password (Solicitud de recuperación de contraseña) ──
@router_user.post("/recuperar-password")
def recuperar_password(payload: GuestRecuperarRequest):
    """Genera y envía por correo electrónico las instrucciones para restablecer la contraseña."""
    q = payload.correo_o_documento.strip()
    if not q:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ingrese su número de documento o correo electrónico registrado."
        )

    try:
        with cursor_lectura() as cur:
            cur.execute(
                "SELECT id_huesped, nombre, documento, correo FROM huesped WHERE documento = %s OR LOWER(correo) = LOWER(%s)",
                (q, q.lower())
            )
            fila = cur.fetchone()

            if not fila:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No encontramos ninguna cuenta registrada con este correo o número de documento."
                )

        nombre = fila["nombre"]
        correo = fila["correo"]
        logger.info(f"📧 [PASSWORD RESET NOTIFICATION] Instrucciones para restablecer contraseña enviadas a '{correo}' ({nombre}).")

        partes = correo.split('@')
        correo_enmascarado = partes[0][:2] + "***@" + partes[1] if len(partes) == 2 else correo

        return {
            "message": f"Hemos enviado las instrucciones para restablecer tu contraseña al correo {correo_enmascarado}. Revisa tu bandeja de entrada o carpeta de Spam.",
            "correo": correo,
            "documento": fila["documento"]
        }
    except HTTPException:
        raise
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("POST /api/user/recuperar-password — fallo al consultar la cuenta %r", q)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al procesar la solicitud de recuperación."
        )

# ── POST /api/user/restablecer-password (Cambio de contraseña) ──
@router_user.post("/restablecer-password")
def restablecer_password(payload: GuestRestablecerRequest):
    """Restablece la contraseña del huésped."""
    q = payload.correo_o_documento.strip()
    if not q or not payload.nueva_password or len(payload.nueva_password.strip()) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Documento/correo y una nueva contraseña de al menos 4 caracteres son obligatorios."
        )

    nuevo_hash = bcrypt.hashpw(payload.nueva_password.strip().encode(), bcrypt.gensalt()).decode()

    try:
        with cursor_escritura() as cur:
            cur.execute(
                "UPDATE huesped SET password_hash = %s WHERE documento = %s OR LOWER(correo) = LOWER(%s) RETURNING id_huesped, nombre, correo",
                (nuevo_hash, q, q.lower())
            )
            resultado = cur.fetchone()

            if not resultado:
                # Antes se confirmaba (commit) un UPDATE sin filas y luego se abortaba;
                # ahora el rollback del contexto deja la transacción limpia.
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No se encontró el usuario para actualizar la contraseña."
                )

        logger.info(f"🔑 [PASSWORD UPDATED] Contraseña restablecida con éxito para '{resultado['nombre']}' ({resultado['correo']}).")

        return {
            "message": "Su contraseña ha sido restablecida exitosamente. Ya puede iniciar sesión con su nueva clave."
        }
    except HTTPException:
        raise
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("POST /api/user/restablecer-password — fallo al actualizar la contraseña de %r", q)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al actualizar la contraseña."
        )

# Hallazgo 03: Se requiere rol Recepcionista o Administrador para modificar estado de huésped
@router.patch("/{id_huesped}/estado", dependencies=[Depends(requiere_rol("Administrador", "Recepcionista 24h"))])
def cambiar_estado_huesped(
    id_huesped: int,
    datos: CambiarEstadoHuespedRequest,
    usuario: UsuarioActual = Depends(autenticar)
):
    """
    Cambia el estado de un huésped ('Activo' / 'Inactivo') guardando
    la auditoría del empleado (Nombre + Rol) que realizó el cambio.
    """
    if datos.estado not in ("Activo", "Inactivo"):
        raise HTTPException(status_code=400, detail="El estado debe ser 'Activo' o 'Inactivo'.")

    audit_str = f"{usuario.nombre or 'Empleado'} ({usuario.rol})"
    try:
        with cursor_escritura() as cur:
            cur.execute(
                "UPDATE huesped SET estado = %s, modificado_por = %s WHERE id_huesped = %s RETURNING id_huesped, nombre, estado, modificado_por",
                (datos.estado, audit_str, id_huesped)
            )
            res = cur.fetchone()
            if not res:
                raise HTTPException(status_code=404, detail="Huésped no encontrado.")

        accion = "activado" if datos.estado == "Activo" else "desactivado"
        # M-06: acceso por nombre de columna.
        return {
            "message": f"Huésped '{res['nombre']}' {accion} por {audit_str}.",
            "huesped": {
                "id_huesped": res["id_huesped"],
                "nombre": res["nombre"],
                "estado": res["estado"],
                "modificado_por": res["modificado_por"]
            }
        }
    except HTTPException:
        raise
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("PATCH /api/huespedes/%s/estado — fallo al cambiar el estado", id_huesped)
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud.")

# Hallazgo 03: Solo Administrador puede dar de baja a un huésped.
@router.delete("/{id_huesped}", dependencies=[Depends(requiere_rol("Administrador"))])
def eliminar_huesped(
    id_huesped: int,
    usuario: UsuarioActual = Depends(autenticar)
):
    """
    Hallazgo 04: Realiza baja lógica (UPDATE estado = 'Inactivo') para preservar el historial
    contable de reservas y respetar la integridad referencial (ON DELETE RESTRICT).
    """
    audit_str = f"{usuario.nombre or 'Empleado'} ({usuario.rol})"
    try:
        with cursor_escritura() as cur:
            cur.execute("SELECT nombre FROM huesped WHERE id_huesped = %s", (id_huesped,))
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Huésped no encontrado.")
            nombre = row["nombre"]

            # Hallazgo 04: Baja lógica del huésped marcándolo como Inactivo (preserva reservas)
            cur.execute("UPDATE huesped SET estado = 'Inactivo', modificado_por = %s WHERE id_huesped = %s", (audit_str, id_huesped))

        return {"message": f"Huésped '{nombre}' desactivado (baja lógica) exitosamente por {audit_str}."}
    except HTTPException:
        raise
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("DELETE /api/huespedes/%s — fallo en la baja lógica", id_huesped)
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud.")
