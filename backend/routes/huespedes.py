from fastapi import APIRouter, Depends, HTTPException, status
import psycopg2
from database import connection
from dependencies import requiere_rol
from models.schemas import UserRegistro

router = APIRouter(tags=["huespedes"])

# RF-009: solo Administrador o Recepcionista 24h pueden ver el listado de huéspedes.
@router.get("/api/huespedes", dependencies=[Depends(requiere_rol("Administrador", "Recepcionista 24h"))])
def obtener_huespedes():
    """Retorna la lista de todos los huéspedes."""
    # Si la base de datos PostgreSQL está activa
    try:
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        cursor.execute("SELECT id_huesped, nombre, documento, telefono, correo, empresa, lealtad, estado FROM huesped ORDER BY nombre ASC")
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
                "estado": f[7]
            })
            
        cursor.close()
        conn.close()
        return huespedes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener huéspedes: {e}")

@router.post("/api/user/registro", status_code=status.HTTP_201_CREATED)
def registrar_usuario(usuario: UserRegistro):
    """Registra un nuevo huésped validando que el documento sea único."""
    if not usuario.nombre or not usuario.documento or not usuario.telefono or not usuario.correo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nombre, documento, teléfono y correo son campos obligatorios."
        )
        
    # --- MODO BASE DE DATOS FÍSICA (PostgreSQL) ---
    try:
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        
        # Validar documento duplicado en Postgres
        cursor.execute("SELECT id_huesped FROM huesped WHERE documento = %s", (usuario.documento,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este número de documento ya está registrado."
            )
            
        # Insertar nuevo registro
        insertar_query = """
            INSERT INTO huesped (nombre, documento, telefono, correo, empresa, lealtad, estado)
            VALUES (%s, %s, %s, %s, %s, 'Silver', 'Activo')
            RETURNING id_huesped, nombre, documento, telefono, correo, empresa, lealtad, estado
        """
        cursor.execute(insertar_query, (usuario.nombre, usuario.documento, usuario.telefono, usuario.correo, usuario.empresa))
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
            "estado": resultado[7]
        }
        
        cursor.close()
        conn.close()
        return {"message": "Usuario registrado exitosamente para realizar reservas.", "usuario": nuevo_usuario}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en base de datos al registrar usuario: {e}"
        )
