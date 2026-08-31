from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import psycopg2
from database import connection
from dependencies import requiere_rol, autenticar, UsuarioActual
from models.schemas import UserRegistro

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
        conn.close()
        return huespedes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener huéspedes: {e}")

@router.post("/api/user/registro", status_code=status.HTTP_201_CREATED, dependencies=[Depends(requiere_rol("Administrador", "Recepcionista 24h"))])
def registrar_usuario(
    usuario: UserRegistro,
    usuario_actual: UsuarioActual = Depends(autenticar)
):
    """Registra un nuevo huésped validando que el documento sea único y auditando al empleado autenticado."""
    if not usuario.nombre or not usuario.documento or not usuario.telefono or not usuario.correo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nombre, documento, teléfono y correo son campos obligatorios."
        )
        
    audit_str = f"Creado por: {usuario_actual.nombre or 'Empleado'} ({usuario_actual.rol})"
    
    try:
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        cursor.execute("ALTER TABLE huesped ADD COLUMN IF NOT EXISTS modificado_por VARCHAR(100)")
        conn.commit()
        
        cursor.execute("SELECT id_huesped FROM huesped WHERE documento = %s", (usuario.documento,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
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
        conn.close()
        return {"message": f"Huésped '{usuario.nombre}' registrado exitosamente por {usuario_actual.nombre} ({usuario_actual.rol}).", "usuario": nuevo_usuario}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en base de datos al registrar usuario: {e}"
        )

@router.patch("/api/huespedes/{id_huesped}/estado")
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
        cursor.execute("ALTER TABLE huesped ADD COLUMN IF NOT EXISTS modificado_por VARCHAR(100)")
        cursor.execute(
            "UPDATE huesped SET estado = %s, modificado_por = %s WHERE id_huesped = %s RETURNING id_huesped, nombre, estado, modificado_por",
            (datos.estado, audit_str, id_huesped)
        )
        res = cursor.fetchone()
        if not res:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Huésped no encontrado.")
            
        conn.commit()
        cursor.close()
        conn.close()
        
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
        raise HTTPException(status_code=500, detail=f"Error al cambiar estado de huésped: {e}")

@router.delete("/api/huespedes/{id_huesped}")
def eliminar_huesped(
    id_huesped: int,
    usuario: UsuarioActual = Depends(autenticar)
):
    """Elimina un huésped y sus reservas auditando quién realizó la acción."""
    audit_str = f"{usuario.nombre or 'Empleado'} ({usuario.rol})"
    try:
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        cursor.execute("SELECT nombre FROM huesped WHERE id_huesped = %s", (id_huesped,))
        row = cursor.fetchone()
        nombre = row[0] if row else f"#{id_huesped}"
        
        cursor.execute("DELETE FROM reserva_habitacion WHERE id_huesped = %s", (id_huesped,))
        cursor.execute("DELETE FROM huesped WHERE id_huesped = %s", (id_huesped,))
        conn.commit()
        cursor.close()
        conn.close()
        return {"message": f"Huésped '{nombre}' eliminado exitosamente por {audit_str}."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar huésped: {e}")
