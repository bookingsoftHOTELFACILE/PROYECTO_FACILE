from fastapi import APIRouter, HTTPException
import psycopg2
from database import connection

router = APIRouter(prefix="/api/habitaciones", tags=["habitaciones"])

@router.get("")
def obtener_habitaciones():
    """Retorna el catálogo de habitaciones."""
    # Si estamos en modo simulación (sin base de datos real)
    if connection.es_modo_simulacion():
        return connection.habitaciones_simulacion
        
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
