"""
backend/routes/habitaciones.py
Sprint 1 & Sprint 3 — Catálogo y Consulta de Disponibilidad de Habitaciones

RF-009 / RF-012: Consulta de disponibilidad de unidades habitacionales en tiempo real.
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from database import connection
from dependencies import requiere_rol

# Todos los roles del sistema tienen acceso al catálogo general de habitaciones
_TODOS_LOS_ROLES = ("Administrador", "Recepcionista 24h", "Ama de llaves", "Personal de mantenimiento", "Conserje")

# Roles autorizados para consulta operacional de disponibilidad y reservas
_ROLES_DISPONIBILIDAD = ("Administrador", "Recepcionista 24h", "Conserje")

router = APIRouter(prefix="/api/habitaciones", tags=["habitaciones"])


# ── GET /api/habitaciones ─────────────────────────────────────────────────────
@router.get("", dependencies=[Depends(requiere_rol(*_TODOS_LOS_ROLES))])
def obtener_habitaciones():
    """Retorna el catálogo general de habitaciones."""
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


# ── GET /api/habitaciones/disponibilidad (RF-012) ──────────────────────────────
@router.get("/disponibilidad", dependencies=[Depends(requiere_rol(*_ROLES_DISPONIBILIDAD))])
def consultar_disponibilidad(
    fecha_entrada: str,
    fecha_salida: str,
    id_habitacion: Optional[int] = None,
):
    """
    RF-012 — Consulta de disponibilidad de habitaciones por rango de fechas en tiempo real.

    - Roles autorizados: Administrador, Recepcionista 24h, Conserje.
    - Query Params:
        * fecha_entrada (AAAA-MM-DD): Obligatorio
        * fecha_salida (AAAA-MM-DD): Obligatorio
        * id_habitacion (int): Opcional (filtra por una habitación específica)
    - Reutiliza la lógica de solapamiento de fechas contra `reserva_habitacion` (estado 'Confirmada' o 'Check-In').
    """
    # 1. Validar formato de fechas
    try:
        entrada_dt = datetime.strptime(fecha_entrada.strip(), "%Y-%m-%d").date()
        salida_dt = datetime.strptime(fecha_salida.strip(), "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de fechas inválido. Debe ser AAAA-MM-DD."
        )

    # 2. Validar coherencia de fechas
    if salida_dt <= entrada_dt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de salida debe ser posterior a la fecha de entrada."
        )

    try:
        conn = connection.obtener_conexion()
        cur = conn.cursor()

        # Si se especificó id_habitacion, validar que exista
        if id_habitacion is not None:
            cur.execute("SELECT id_habitacion FROM habitacion WHERE id_habitacion = %s", (id_habitacion,))
            if not cur.fetchone():
                cur.close(); conn.close()
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"La habitación especificada con id {id_habitacion} no existe."
                )

        # Consulta SQL con determinación de disponibilidad por solapamiento de daterange
        query = """
            SELECT 
                h.id_habitacion, 
                h.numero, 
                h.tipo, 
                h.capacidad, 
                h.precio_noche, 
                h.estado AS estado_base,
                CASE 
                    WHEN h.estado = 'Mantenimiento' THEN 'Mantenimiento'
                    WHEN EXISTS (
                        SELECT 1 FROM reserva_habitacion r
                        WHERE r.id_habitacion = h.id_habitacion
                          AND r.estado IN ('Confirmada', 'Check-In')
                          AND r.fecha_entrada < %s::date
                          AND r.fecha_salida > %s::date
                    ) THEN 'Ocupada'
                    ELSE 'Disponible'
                END AS estado_rango
            FROM habitacion h
            WHERE 1=1
        """
        params = [fecha_salida, fecha_entrada]

        if id_habitacion is not None:
            query += " AND h.id_habitacion = %s"
            params.append(id_habitacion)

        query += " ORDER BY h.numero ASC"

        cur.execute(query, params)
        filas = cur.fetchall()

        resultado = []
        for f in filas:
            id_hab, numero, tipo, capacidad, precio_noche, estado_base, estado_rango = f
            es_disponible = (estado_rango == 'Disponible')
            resultado.append({
                "id_habitacion": id_hab,
                "numero": numero,
                "tipo": tipo,
                "capacidad": capacidad,
                "precio_noche": float(precio_noche),
                "estado_base": estado_base,
                "estado_rango": estado_rango,
                "disponible": es_disponible
            })

        cur.close()
        conn.close()

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al consultar disponibilidad: {e}"
        )
