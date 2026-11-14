import logging
logger = logging.getLogger("bookingsoft.habitaciones")
"""
backend/routes/habitaciones.py
Sprint 1 & Sprint 3 — Catálogo y Consulta de Disponibilidad de Habitaciones

RF-009 / RF-012: Consulta de disponibilidad de unidades habitacionales en tiempo real.
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from dependencies import requiere_rol
from repositories import cursor_escritura, cursor_lectura

# Todos los roles del sistema tienen acceso al catálogo general de habitaciones
_TODOS_LOS_ROLES = ("Administrador", "Recepcionista 24h", "Ama de llaves", "Personal de mantenimiento")

# Roles autorizados para consulta operacional de disponibilidad y reservas
_ROLES_DISPONIBILIDAD = ("Administrador", "Recepcionista 24h")

router = APIRouter(prefix="/api/habitaciones", tags=["habitaciones"])


# ── GET /api/habitaciones ─────────────────────────────────────────────────────
# H-02: el inventario completo (incluye detalle de mantenimiento y quién lo
# modificó) exige rol operativo; el portal público usa /api/habitaciones/publicas.
@router.get("", dependencies=[Depends(requiere_rol(*_TODOS_LOS_ROLES))])
def obtener_habitaciones():
    """Retorna el catálogo general de habitaciones (roles operativos)."""
    try:
        # M-05: cursor, conexión y liberación viven en la capa de repositorios.
        with cursor_lectura() as cur:
            # Hallazgo 06: Columnas modificado_por y detalle_mantenimiento declaradas directamente en schema.sql
            cur.execute("SELECT id_habitacion, numero, tipo, capacidad, precio_noche, estado, modificado_por, detalle_mantenimiento FROM habitacion")
            filas = cur.fetchall()

        # M-06: cada fila es un dict; se lee por nombre de columna.
        return [
            {
                "id_habitacion": f["id_habitacion"],
                "numero": f["numero"],
                "tipo": f["tipo"],
                "capacidad": f["capacidad"],
                "precio_noche": float(f["precio_noche"]),
                "estado": f["estado"],
                "modificado_por": f["modificado_por"] or "",
                "detalle_mantenimiento": f["detalle_mantenimiento"] or ""
            }
            for f in filas
        ]

    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("GET /api/habitaciones — fallo al consultar el catálogo")
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud.")


# ── GET /api/habitaciones/publicas ────────────────────────────────────────────
# H-02: catálogo mínimo sin sesión para el portal público (HU-009). Expone lo
# necesario para mostrar el inventario sin filtrar datos internos de operación.
@router.get("/publicas")
def obtener_habitaciones_publicas():
    """Retorna el catálogo público de habitaciones sin datos internos de mantenimiento."""
    try:
        with cursor_lectura() as cur:
            cur.execute(
                "SELECT id_habitacion, numero, tipo, capacidad, precio_noche, estado FROM habitacion"
            )
            filas = cur.fetchall()

        # M-06: acceso por nombre de columna.
        return [
            {
                "id_habitacion": f["id_habitacion"],
                "numero": f["numero"],
                "tipo": f["tipo"],
                "capacidad": f["capacidad"],
                "precio_noche": float(f["precio_noche"]),
                "estado": f["estado"],
            }
            for f in filas
        ]
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("GET /api/habitaciones/publicas — fallo al consultar el catálogo público")
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud.")


# ── GET /api/habitaciones/disponibilidad (RF-012) ──────────────────────────────
@router.get("/disponibilidad", dependencies=[Depends(requiere_rol(*_ROLES_DISPONIBILIDAD))])
def consultar_disponibilidad(
    fecha_entrada: str,
    fecha_salida: str,
    id_habitacion: Optional[int] = None,
):
    """
    RF-012 — Consulta de disponibilidad de habitaciones por rango de fechas en tiempo real.

    - Roles autorizados: Administrador, Recepcionista 24h.
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
        with cursor_lectura() as cur:

            # Si se especificó id_habitacion, validar que exista
            if id_habitacion is not None:
                cur.execute("SELECT id_habitacion FROM habitacion WHERE id_habitacion = %s", (id_habitacion,))
                if not cur.fetchone():
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

        # M-06: se lee por nombre de columna en lugar del desempaquetado posicional.
        resultado = []
        for f in filas:
            es_disponible = (f["estado_rango"] == 'Disponible')
            resultado.append({
                "id_habitacion": f["id_habitacion"],
                "numero": f["numero"],
                "tipo": f["tipo"],
                "capacidad": f["capacidad"],
                "precio_noche": float(f["precio_noche"]),
                "estado_base": f["estado_base"],
                "estado_rango": f["estado_rango"],
                "disponible": es_disponible
            })

        return resultado

    except HTTPException:
        raise
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception(
            "GET /api/habitaciones/disponibilidad — fallo al consultar el rango %s → %s (habitación %s)",
            fecha_entrada, fecha_salida, id_habitacion,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al procesar la solicitud."  # Hallazgo 07: msg técnico en logger, no en HTTP
        )


# ── PATCH /api/habitaciones/{id_habitacion}/estado ────────────────────────────
from pydantic import BaseModel
from dependencies import autenticar, UsuarioActual

class HabitacionEstadoUpdate(BaseModel):
    estado: str
    detalle_mantenimiento: Optional[str] = None

_ROLES_GESTION_HABITACION = ("Administrador", "Ama de llaves", "Personal de mantenimiento", "Recepcionista 24h")

@router.patch("/{id_habitacion}/estado", dependencies=[Depends(requiere_rol(*_ROLES_GESTION_HABITACION))])
def cambiar_estado_habitacion(
    id_habitacion: int,
    data: HabitacionEstadoUpdate,
    usuario: UsuarioActual = Depends(autenticar)
):
    """
    Gestión de Mantenimiento y Amas de Llaves (Estándar OPERA PMS).
    Permite cambiar el estado de la habitación y registrar reportes de daño.
    """
    estados_validos = ("Disponible", "Ocupada", "En limpieza", "Mantenimiento")
    if data.estado not in estados_validos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Estado inválido. Debe ser uno de: {', '.join(estados_validos)}"
        )
        
    audit_str = f"{usuario.nombre or 'Empleado'} ({usuario.rol})"
    detalle = data.detalle_mantenimiento or ""
    
    try:
        # M-05: commit / rollback viven en la capa de repositorios.
        with cursor_escritura() as cur:
            # Hallazgo 06: Columnas modificado_por y detalle_mantenimiento declaradas directamente en schema.sql

            # Si se restablece a Disponible o En limpieza sin especificar detalle, se borra el reporte de daño anterior
            if data.estado in ("Disponible", "En limpieza") and not data.detalle_mantenimiento:
                detalle = ""

            cur.execute(
                "UPDATE habitacion SET estado = %s, modificado_por = %s, detalle_mantenimiento = %s WHERE id_habitacion = %s RETURNING numero",
                (data.estado, audit_str, detalle, id_habitacion)
            )
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="La habitación especificada no existe.")

            numero_hab = row["numero"]

        msg_extra = f" [Reporte: {detalle}]" if detalle else ""
        return {
            "message": f"Apartamento {numero_hab} actualizado a estado '{data.estado}' por {audit_str}.{msg_extra}",
            "id_habitacion": id_habitacion,
            "estado": data.estado,
            "modificado_por": audit_str,
            "detalle_mantenimiento": detalle
        }
    except HTTPException:
        raise
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("PATCH /api/habitaciones/%s/estado — fallo al actualizar el estado", id_habitacion)
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud."  # Hallazgo 07: msg en logger, no en HTTP
        )

