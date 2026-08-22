from fastapi import APIRouter, Depends, HTTPException
import psycopg2
from database import connection
from dependencies import requiere_rol

# RF-009: todos los roles del sistema tienen acceso al catálogo de habitaciones.
_TODOS_LOS_ROLES = ("Administrador", "Recepcionista 24h", "Ama de llaves", "Personal de mantenimiento", "Conserje")

router = APIRouter(prefix="/api/habitaciones", tags=["habitaciones"])

@router.get("", dependencies=[Depends(requiere_rol(*_TODOS_LOS_ROLES))])
def obtener_habitaciones():
    """Retorna el catálogo de habitaciones."""
    # Si la base de datos PostgreSQL está activa
    try:
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        cursor.execute("SELECT id_habitacion, numero, tipo, capacidad, precio_noche, estado FROM habitacion ORDER BY numero ASC")
        filas = cursor.fetchall()
        
        habitaciones = []
        for f in filas:
            habitaciones.append({
                "id_habitacion": f[0],
                "numero": f[1],
                "tipo": f[2],
                "capacidad": f[3],
                "precio_noche": float(f[4]),
                "estado": f[5]
            })
            
        cursor.close()
        conn.close()
        return habitaciones
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener habitaciones de la base de datos: {e}")
