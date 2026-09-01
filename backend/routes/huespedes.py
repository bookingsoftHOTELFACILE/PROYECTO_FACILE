import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import psycopg2
from database import connection
from dependencies import requiere_rol, autenticar, UsuarioActual
from models.schemas import UserRegistro
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
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud."  # Hallazgo 07: msg en logger, no en HTTP
        )

@router.post("/api/user/registro", status_code=status.HTTP_201_CREATED)
def registrar_usuario(usuario: UserRegistro):
    """Registra un nuevo huésped validando que el documento sea único."""
    if not usuario.nombre or not usuario.documento or not usuario.telefono or not usuario.correo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nombre, documento, teléfono y correo son campos obligatorios."
        )
        
    audit_str = "Auto-registro (Huésped)"
    
    try:
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        cursor.execute("ALTER TABLE huesped ADD COLUMN IF NOT EXISTS modificado_por VARCHAR(100)")
        conn.commit()
        
        cursor.execute("SELECT id_huesped FROM huesped WHERE documento = %s", (usuario.documento,))
        if cursor.fetchone():
            cursor.close()
            connection.liberar_conexion(conn)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este número de documento ya está registrado."
            )
            
        insertar_query = """
            INSERT INTO huesped (nombre, documento, telefono, correo, empresa, lealtad, estado, modificado_por)
            VALUES (%s, %s, %s, %s, %s, 'Silver', 'Activo', %s)
            RETURNING id_huesped, nombre, documento, telefono, correo, empresa, lealtad, estado, modificado_por
        """
        cursor.execute(insertar_query, (usuario.nombre, usuario.documento, usuario.telefono, usuario.correo, usuario.empresa, audit_str))
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
        return {"message": "Usuario registrado exitosamente para realizar reservas.", "usuario": nuevo_usuario}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al procesar la solicitud."  # Hallazgo 07: msg técnico en logger, no en HTTP
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
