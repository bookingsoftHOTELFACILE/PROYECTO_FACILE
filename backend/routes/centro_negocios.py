"""
Rutas para el Centro de Negocios (Salas de Juntas y Coworking)
BookingSoft / Apartamentos Facile
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Literal
from datetime import date, time, datetime, timedelta
import logging

from routes.huespedes import autenticar, requiere_rol, UsuarioActual
from repositories import cursor_escritura, cursor_lectura

from dependencies import autenticar_opcional

logger = logging.getLogger("bookingsoft.centro_negocios")

router = APIRouter(prefix="/api/centro-negocios", tags=["Centro de Negocios"])

class CrearReservaNegocioRequest(BaseModel):
    id_espacio: int
    tipo_cliente: Literal["Huésped Registrado", "Cliente Externo"]
    id_huesped: Optional[int] = None
    nombre_cliente: str = Field(..., min_length=2, max_length=150)
    documento_cliente: Optional[str] = None
    correo_cliente: Optional[str] = None
    fecha: date
    hora_inicio: str = Field(..., example="09:00")
    hora_fin: str = Field(..., example="11:00")
    observaciones: Optional[str] = None

@router.get("/espacios")
def listar_espacios():
    """
    Obtiene el inventario de espacios del Centro de Negocios (Salas de Juntas y Coworking).
    """
    try:
        with cursor_lectura() as cur:
            cur.execute(
                "SELECT id_espacio, nombre, tipo, capacidad, precio_hora, estado FROM espacio_negocio ORDER BY id_espacio"
            )
            filas = cur.fetchall()

        # M-06: cada fila es un dict, se lee por nombre de columna.
        return [
            {
                "id_espacio": f["id_espacio"],
                "nombre": f["nombre"],
                "tipo": f["tipo"],
                "capacidad": f["capacidad"],
                "precio_hora": float(f["precio_hora"]),
                "estado": f["estado"]
            }
            for f in filas
        ]
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("GET /api/centro-negocios/espacios — fallo al consultar el inventario")
        raise HTTPException(status_code=500, detail="Error interno del servidor al consultar espacios del Centro de Negocios.")

@router.get("/reservas")
def listar_reservas_negocio():
    """
    Lista todas las reservas activas registradas para el Centro de Negocios.
    """
    try:
        with cursor_lectura() as cur:
            cur.execute("""
                SELECT 
                    rn.id_reserva_negocio,
                    en.nombre AS espacio,
                    en.tipo AS tipo_espacio,
                    rn.tipo_cliente,
                    rn.nombre_cliente,
                    rn.documento_cliente,
                    rn.correo_cliente,
                    rn.fecha,
                    rn.hora_inicio,
                    rn.hora_fin,
                    rn.duracion_horas,
                    rn.precio_total,
                    rn.estado,
                    rn.observaciones,
                    rn.creado_por
                FROM reserva_negocio rn
                JOIN espacio_negocio en ON rn.id_espacio = en.id_espacio
                WHERE rn.estado = 'Confirmada'
                ORDER BY rn.id_reserva_negocio ASC
            """)
            filas = cur.fetchall()

        # M-06: se lee por nombre de columna (los alias SQL son las claves del dict).
        return [
            {
                "id_reserva_negocio": f["id_reserva_negocio"],
                "espacio": f["espacio"],
                "tipo_espacio": f["tipo_espacio"],
                "tipo_cliente": f["tipo_cliente"],
                "nombre_cliente": f["nombre_cliente"],
                "documento_cliente": f["documento_cliente"],
                "correo_cliente": f["correo_cliente"],
                "fecha": str(f["fecha"]),
                "hora_inicio": str(f["hora_inicio"])[:5],
                "hora_fin": str(f["hora_fin"])[:5],
                "duracion_horas": f["duracion_horas"],
                "precio_total": float(f["precio_total"]),
                "estado": f["estado"],
                "observaciones": f["observaciones"] or "",
                "creado_por": f["creado_por"]
            }
            for f in filas
        ]
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("GET /api/centro-negocios/reservas — fallo al consultar reservas del Centro de Negocios")
        raise HTTPException(status_code=500, detail="Error interno del servidor al consultar reservas del Centro de Negocios.")

@router.post("/reservas")
def crear_reserva_negocio(
    req: CrearReservaNegocioRequest,
    usuario: Optional[UsuarioActual] = Depends(autenticar_opcional)
):
    """
    Registra una reserva por horas para Salas de Juntas o Coworking.
    Permite asociar a un Huésped Registrado o a un Cliente Externo.
    """
    audit_str = f"{usuario.nombre if usuario else 'Cliente Web'} ({usuario.rol if usuario else 'Público'})"

    try:
        t_inicio = datetime.strptime(req.hora_inicio, "%H:%M").time()
        t_fin = datetime.strptime(req.hora_fin, "%H:%M").time()
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de hora inválido. Use el formato HH:MM (ejemplo: '09:30').")

    if t_fin <= t_inicio:
        raise HTTPException(status_code=400, detail="La hora de finalización debe ser posterior a la hora de inicio.")

    # Calcular duración en horas
    dt_inicio = datetime.combine(req.fecha, t_inicio)
    dt_fin = datetime.combine(req.fecha, t_fin)
    duracion_segundos = (dt_fin - dt_inicio).total_seconds()
    duracion_horas = max(1, int(duracion_segundos // 3600))

    try:
        # M-05: commit/rollback vive en la capa de repositorios.
        with cursor_escritura() as cur:

            # Verificar espacio
            cur.execute("SELECT id_espacio, nombre, tipo, precio_hora FROM espacio_negocio WHERE id_espacio = %s", (req.id_espacio,))
            esp_row = cur.fetchone()
            if not esp_row:
                raise HTTPException(status_code=404, detail="El espacio del Centro de Negocios no existe.")

            esp_nombre = esp_row["nombre"]
            esp_tipo = esp_row["tipo"]
            esp_precio_hora = float(esp_row["precio_hora"])

            # Tarifas con descuento por bloque de horas (referencia)
            if esp_tipo == "Sala de Juntas":
                if duracion_horas >= 8:
                    precio_total = 450000.0  # Día completo
                elif duracion_horas >= 4:
                    precio_total = 250000.0  # Bloque 4 horas
                else:
                    precio_total = duracion_horas * esp_precio_hora
            else: # Coworking
                if duracion_horas >= 8:
                    precio_total = 100000.0  # Día completo
                elif duracion_horas >= 4:
                    precio_total = 70000.0   # Bloque 4 horas
                else:
                    precio_total = duracion_horas * esp_precio_hora

            # Validar solapamiento de horarios en el mismo espacio y fecha
            cur.execute("""
                SELECT id_reserva_negocio FROM reserva_negocio
                WHERE id_espacio = %s AND fecha = %s AND estado = 'Confirmada'
                  AND NOT (hora_fin <= %s OR hora_inicio >= %s)
            """, (req.id_espacio, req.fecha, t_inicio, t_fin))
            if cur.fetchone():
                raise HTTPException(status_code=409, detail=f"El espacio '{esp_nombre}' ya se encuentra reservado en ese horario ({req.hora_inicio} - {req.hora_fin}).")

            # Insertar reserva
            cur.execute("""
                INSERT INTO reserva_negocio (
                    id_espacio, tipo_cliente, id_huesped, nombre_cliente, documento_cliente, correo_cliente,
                    fecha, hora_inicio, hora_fin, duracion_horas, precio_total, estado, observaciones, creado_por, modificado_por
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Confirmada', %s, %s, %s)
                RETURNING id_reserva_negocio
            """, (
                req.id_espacio, req.tipo_cliente, req.id_huesped, req.nombre_cliente,
                req.documento_cliente, req.correo_cliente, req.fecha, t_inicio, t_fin,
                duracion_horas, precio_total, req.observaciones, audit_str, audit_str
            ))
            nuevo_id = cur.fetchone()["id_reserva_negocio"]

        return {
            "message": f"Reserva #{nuevo_id} para {esp_nombre} creada exitosamente.",
            "id_reserva_negocio": nuevo_id,
            "precio_total": precio_total,
            "duracion_horas": duracion_horas
        }
    except HTTPException:
        raise
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("POST /api/centro-negocios/reservas — fallo al crear la reserva del espacio %s", req.id_espacio)
        raise HTTPException(status_code=500, detail="Error interno del servidor al crear la reserva del Centro de Negocios.")

@router.delete("/reservas/{id_reserva_negocio}")
def cancelar_reserva_negocio(
    id_reserva_negocio: int,
    usuario: Optional[UsuarioActual] = Depends(autenticar_opcional)
):
    """
    Cancela una reserva del Centro de Negocios mediante baja lógica (UPDATE estado = 'Cancelada').
    """
    audit_str = f"{usuario.nombre if usuario else 'Cliente Web'} ({usuario.rol if usuario else 'Público'})"
    try:
        with cursor_escritura() as cur:
            cur.execute(
                "UPDATE reserva_negocio SET estado = 'Cancelada', modificado_por = %s WHERE id_reserva_negocio = %s RETURNING id_reserva_negocio",
                (audit_str, id_reserva_negocio),
            )
            if not cur.fetchone():
                # Antes este 404 era absorbido por el `except Exception` genérico y
                # respondía 500; ahora se propaga con su código correcto.
                raise HTTPException(status_code=404, detail="Reserva del Centro de Negocios no encontrada.")

        return {"message": f"Reserva #{id_reserva_negocio} del Centro de Negocios cancelada exitosamente."}
    except HTTPException:
        raise
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("DELETE /api/centro-negocios/reservas/%s — fallo al cancelar la reserva", id_reserva_negocio)
        raise HTTPException(status_code=500, detail="Error interno del servidor al cancelar la reserva.")
