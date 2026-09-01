"""
Rutas para el Centro de Negocios (Salas de Juntas y Coworking)
BookingSoft / Apartamentos Facile
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Literal
from datetime import date, time, datetime, timedelta
from database import connection
from routes.huespedes import autenticar, requiere_rol, UsuarioActual

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
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id_espacio, nombre, tipo, capacidad, precio_hora, estado FROM espacio_negocio ORDER BY id_espacio"
        )
        filas = cursor.fetchall()
        cursor.close()
        connection.liberar_conexion(conn)

        espacios = [
            {
                "id_espacio": f[0],
                "nombre": f[1],
                "tipo": f[2],
                "capacidad": f[3],
                "precio_hora": float(f[4]),
                "estado": f[5]
            }
            for f in filas
        ]
        return espacios
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor al consultar espacios del Centro de Negocios.")

@router.get("/reservas")
def listar_reservas_negocio():
    """
    Lista todas las reservas registradas para el Centro de Negocios.
    """
    try:
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        cursor.execute("""
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
            ORDER BY rn.fecha DESC, rn.hora_inicio DESC
        """)
        filas = cursor.fetchall()
        cursor.close()
        connection.liberar_conexion(conn)

        reservas = [
            {
                "id_reserva_negocio": f[0],
                "espacio": f[1],
                "tipo_espacio": f[2],
                "tipo_cliente": f[3],
                "nombre_cliente": f[4],
                "documento_cliente": f[5],
                "correo_cliente": f[6],
                "fecha": str(f[7]),
                "hora_inicio": str(f[8])[:5],
                "hora_fin": str(f[9])[:5],
                "duracion_horas": f[10],
                "precio_total": float(f[11]),
                "estado": f[12],
                "observaciones": f[13] or "",
                "creado_por": f[14]
            }
            for f in filas
        ]
        return reservas
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor al consultar reservas del Centro de Negocios.")

@router.post("/reservas", dependencies=[Depends(requiere_rol("Administrador", "Recepcionista 24h"))])
def crear_reserva_negocio(
    req: CrearReservaNegocioRequest,
    usuario: UsuarioActual = Depends(autenticar)
):
    """
    Registra una reserva por horas para Salas de Juntas o Coworking.
    Permite asociar a un Huésped Registrado o a un Cliente Externo.
    """
    audit_str = f"{usuario.nombre or 'Empleado'} ({usuario.rol})"

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
        conn = connection.obtener_conexion()
        cursor = conn.cursor()

        # Verificar espacio
        cursor.execute("SELECT id_espacio, nombre, tipo, precio_hora FROM espacio_negocio WHERE id_espacio = %s", (req.id_espacio,))
        esp_row = cursor.fetchone()
        if not esp_row:
            cursor.close()
            connection.liberar_conexion(conn)
            raise HTTPException(status_code=404, detail="El espacio del Centro de Negocios no existe.")

        esp_nombre, esp_tipo, esp_precio_hora = esp_row[1], esp_row[2], float(esp_row[3])

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
        cursor.execute("""
            SELECT id_reserva_negocio FROM reserva_negocio
            WHERE id_espacio = %s AND fecha = %s AND estado = 'Confirmada'
              AND NOT (hora_fin <= %s OR hora_inicio >= %s)
        """, (req.id_espacio, req.fecha, t_inicio, t_fin))
        if cursor.fetchone():
            cursor.close()
            connection.liberar_conexion(conn)
            raise HTTPException(status_code=409, detail=f"El espacio '{esp_nombre}' ya se encuentra reservado en ese horario ({req.hora_inicio} - {req.hora_fin}).")

        # Insertar reserva
        cursor.execute("""
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
        nuevo_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        connection.liberar_conexion(conn)

        return {
            "message": f"Reserva #{nuevo_id} para {esp_nombre} creada exitosamente por {audit_str}.",
            "id_reserva_negocio": nuevo_id,
            "precio_total": precio_total,
            "duracion_horas": duracion_horas
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor al crear la reserva del Centro de Negocios.")

@router.delete("/reservas/{id_reserva_negocio}", dependencies=[Depends(requiere_rol("Administrador", "Recepcionista 24h"))])
def cancelar_reserva_negocio(
    id_reserva_negocio: int,
    usuario: UsuarioActual = Depends(autenticar)
):
    """
    Cancela una reserva del Centro de Negocios mediante baja lógica (UPDATE estado = 'Cancelada').
    """
    audit_str = f"{usuario.nombre or 'Empleado'} ({usuario.rol})"
    try:
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        cursor.execute("UPDATE reserva_negocio SET estado = 'Cancelada', modificado_por = %s WHERE id_reserva_negocio = %s RETURNING id_reserva_negocio", (audit_str, id_reserva_negocio))
        res = cursor.fetchone()
        if not res:
            cursor.close()
            connection.liberar_conexion(conn)
            raise HTTPException(status_code=404, detail="Reserva del Centro de Negocios no encontrada.")
        conn.commit()
        cursor.close()
        connection.liberar_conexion(conn)
        return {"message": f"Reserva #{id_reserva_negocio} del Centro de Negocios cancelada exitosamente por {audit_str}."}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor al cancelar la reserva.")
