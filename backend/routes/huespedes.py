import logging
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import psycopg2
from database import connection
from dependencies import requiere_rol, autenticar, autenticar_opcional, UsuarioActual
from models.schemas import UserRegistro, GuestLoginRequest, GuestRecuperarRequest, GuestRestablecerRequest
logger = logging.getLogger("bookingsoft.huespedes")

router = APIRouter(tags=["huespedes"])

class CambiarEstadoHuespedRequest(BaseModel):
    estado: str

# RF-009: solo Administrador o Recepcionista 24h pueden ver el listado de huéspedes.
@router.get("/api/huespedes", dependencies=[Depends(requiere_rol("Administrador", "Recepcionista 24h"))])
def obtener_huespedes():
    """Retorna la lista de todos los huéspedes ordenados por id."""
    try:
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        cursor.execute("ALTER TABLE huesped ADD COLUMN IF NOT EXISTS modificado_por VARCHAR(100)")
        cursor.execute("ALTER TABLE huesped ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)")
        conn.commit()
        cursor.execute("SELECT id_huesped, nombre, documento, telefono, correo, empresa, lealtad, estado, modificado_por FROM huesped ORDER BY id_huesped DESC")
        filas = cursor.fetchall()
        
        huespedes = []
        for f in filas:
            huespedes.append({
                "id_huesped": f[0],
                "nombre": f[1],
                "documento": f[2],
                "telefono": f[3],
                "correo": f[4],
                "empresa": f[5],
                "lealtad": f[6],
                "estado": f[7],
                "modificado_por": f[8] or ""
            })
            
        cursor.close()
        connection.liberar_conexion(conn)
        return huespedes
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud.")

@router.post("/api/user/registro", status_code=status.HTTP_201_CREATED)
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
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        cursor.execute("ALTER TABLE huesped ADD COLUMN IF NOT EXISTS modificado_por VARCHAR(100)")
        cursor.execute("ALTER TABLE huesped ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)")
        conn.commit()
        
        # Validar si ya existe por documento o correo
        cursor.execute(
            "SELECT id_huesped, documento, correo FROM huesped WHERE documento = %s OR LOWER(correo) = LOWER(%s)",
            (usuario.documento.strip(), usuario.correo.strip())
        )
        existente = cursor.fetchone()
        if existente:
            cursor.close()
            connection.liberar_conexion(conn)
            if existente[1] == usuario.documento.strip():
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
        cursor.execute(insertar_query, (
            usuario.nombre.strip(),
            usuario.documento.strip(),
            usuario.telefono.strip(),
            usuario.correo.strip(),
            usuario.empresa.strip() if usuario.empresa else "",
            audit_str,
            password_hash
        ))
        resultado = cursor.fetchone()
        conn.commit()
        
        nuevo_usuario = {
            "id_huesped": resultado[0],
            "nombre": resultado[1],
            "documento": resultado[2],
            "telefono": resultado[3],
            "correo": resultado[4],
            "empresa": resultado[5],
            "lealtad": resultado[6],
            "estado": resultado[7],
            "modificado_por": resultado[8]
        }
        
        cursor.close()
        connection.liberar_conexion(conn)
        
        # Log de notificación por correo enviada exitosamente
        logger.info(f"📧 [EMAIL CONFIRMATION] Notificación de bienvenida enviada a '{usuario.correo}' para el huésped '{usuario.nombre}'.")
        
        return {
            "message": f"¡Usuario registrado exitosamente! Se ha enviado una notificación de bienvenida a {usuario.correo}.",
            "email_sent": True,
            "usuario": nuevo_usuario
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error en registro de huésped: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al procesar el registro."
        )

# ── POST /api/user/login (Inicio de sesión de Huésped con Documento/Correo + Contraseña) ──
@router.post("/api/user/login")
def login_huesped(payload: GuestLoginRequest):
    """Inicia sesión del huésped validando documento/correo y contraseña encriptada."""
    q = payload.documento_o_correo.strip()
    if not q:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe ingresar su número de documento o correo electrónico."
        )

    try:
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        cursor.execute("ALTER TABLE huesped ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)")
        conn.commit()

        cursor.execute(
            "SELECT id_huesped, nombre, documento, telefono, correo, empresa, lealtad, estado, password_hash FROM huesped WHERE documento = %s OR LOWER(correo) = LOWER(%s)",
            (q, q.lower())
        )
        fila = cursor.fetchone()

        if not fila:
            cursor.close()
            connection.liberar_conexion(conn)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No encontramos un registro con estos datos. Regístrese en la opción 'Crear cuenta nueva'."
            )

        id_huesped, nombre, documento, telefono, correo, empresa, lealtad, estado, password_hash = fila

        # Validar contraseña si se proporcionó y el hash existe
        if payload.password and password_hash:
            if not bcrypt.checkpw(payload.password.encode(), password_hash.encode()):
                cursor.close()
                connection.liberar_conexion(conn)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La contraseña ingresada es incorrecta. Verifique sus datos o use '¿Olvidaste tu contraseña?'."
                )
        elif payload.password and not password_hash:
            # Asignar hash de la primera clave si la cuenta venía de migración antigua sin hash
            nuevo_hash = bcrypt.hashpw(payload.password.encode(), bcrypt.gensalt()).decode()
            cursor.execute("UPDATE huesped SET password_hash = %s WHERE id_huesped = %s", (nuevo_hash, id_huesped))
            conn.commit()

        cursor.close()
        connection.liberar_conexion(conn)

        usuario_dict = {
            "id_huesped": id_huesped,
            "nombre": nombre,
            "documento": documento,
            "telefono": telefono,
            "correo": correo,
            "empresa": empresa,
            "lealtad": lealtad,
            "estado": estado
        }

        return {
            "message": f"¡Bienvenido de nuevo, {nombre}!",
            "usuario": usuario_dict
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error en login_huesped: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al procesar el inicio de sesión."
        )

# ── POST /api/user/recuperar-password (Solicitud de recuperación de contraseña) ──
@router.post("/api/user/recuperar-password")
def recuperar_password(payload: GuestRecuperarRequest):
    """Genera y envía por correo electrónico las instrucciones para restablecer la contraseña."""
    q = payload.correo_o_documento.strip()
    if not q:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ingrese su número de documento o correo electrónico registrado."
        )

    try:
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id_huesped, nombre, documento, correo FROM huesped WHERE documento = %s OR LOWER(correo) = LOWER(%s)",
            (q, q.lower())
        )
        fila = cursor.fetchone()
        cursor.close()
        connection.liberar_conexion(conn)

        if not fila:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No encontramos ninguna cuenta registrada con este correo o número de documento."
            )

        id_huesped, nombre, documento, correo = fila
        logger.info(f"📧 [PASSWORD RESET NOTIFICATION] Instrucciones para restablecer contraseña enviadas a '{correo}' ({nombre}).")

        partes = correo.split('@')
        correo_enmascarado = partes[0][:2] + "***@" + partes[1] if len(partes) == 2 else correo

        return {
            "message": f"Hemos enviado las instrucciones para restablecer tu contraseña al correo {correo_enmascarado}. Revisa tu bandeja de entrada o carpeta de Spam.",
            "correo": correo,
            "documento": documento
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error en recuperar_password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al procesar la solicitud de recuperación."
        )

# ── POST /api/user/restablecer-password (Cambio de contraseña) ──
@router.post("/api/user/restablecer-password")
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
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        cursor.execute("ALTER TABLE huesped ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)")
        conn.commit()

        cursor.execute(
            "UPDATE huesped SET password_hash = %s WHERE documento = %s OR LOWER(correo) = LOWER(%s) RETURNING id_huesped, nombre, correo",
            (nuevo_hash, q, q.lower())
        )
        resultado = cursor.fetchone()
        conn.commit()
        cursor.close()
        connection.liberar_conexion(conn)

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se encontró el usuario para actualizar la contraseña."
            )

        logger.info(f"🔑 [PASSWORD UPDATED] Contraseña restablecida con éxito para '{resultado[1]}' ({resultado[2]}).")

        return {
            "message": "Su contraseña ha sido restablecida exitosamente. Ya puede iniciar sesión con su nueva clave."
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error en restablecer_password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al actualizar la contraseña."
        )

# Hallazgo 03: Se requiere rol Recepcionista o Administrador para modificar estado de huésped
@router.patch("/api/huespedes/{id_huesped}/estado", dependencies=[Depends(requiere_rol("Administrador", "Recepcionista 24h", "Recepcionista Noche"))])
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
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        # Hallazgo 06: modificado_por en schema.sql
        cursor.execute(
            "UPDATE huesped SET estado = %s, modificado_por = %s WHERE id_huesped = %s RETURNING id_huesped, nombre, estado, modificado_por",
            (datos.estado, audit_str, id_huesped)
        )
        res = cursor.fetchone()
        if not res:
            cursor.close()
            connection.liberar_conexion(conn)
            raise HTTPException(status_code=404, detail="Huésped no encontrado.")
            
        conn.commit()
        cursor.close()
        connection.liberar_conexion(conn)
        
        accion = "activado" if datos.estado == "Activo" else "desactivado"
        return {
            "message": f"Huésped '{res[1]}' {accion} por {audit_str}.",
            "huesped": {
                "id_huesped": res[0],
                "nombre": res[1],
                "estado": res[2],
                "modificado_por": res[3]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud."  # Hallazgo 07: msg en logger, no en HTTP
        )

# Hallazgo 03: Solo Administrador puede dar de baja a un huésped.
@router.delete("/api/huespedes/{id_huesped}", dependencies=[Depends(requiere_rol("Administrador"))])
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
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        cursor.execute("SELECT nombre FROM huesped WHERE id_huesped = %s", (id_huesped,))
        row = cursor.fetchone()
        if not row:
            cursor.close()
            connection.liberar_conexion(conn)
            raise HTTPException(status_code=404, detail="Huésped no encontrado.")
        nombre = row[0]
        
        # Hallazgo 04: Baja lógica del huésped marcándolo como Inactivo (preserva reservas)
        cursor.execute("UPDATE huesped SET estado = 'Inactivo', modificado_por = %s WHERE id_huesped = %s", (audit_str, id_huesped))
        conn.commit()
        cursor.close()
        connection.liberar_conexion(conn)
        return {"message": f"Huésped '{nombre}' desactivado (baja lógica) exitosamente por {audit_str}."}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud."  # Hallazgo 07: msg en logger, no en HTTP
        )
