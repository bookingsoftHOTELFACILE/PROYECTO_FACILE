import logging
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
import psycopg2
from database import connection
from dependencies import requiere_rol, autenticar, UsuarioActual
from models.schemas import ReservaCreate
logger = logging.getLogger("bookingsoft.reservas")

# RF-009: roles autorizados para el módulo de reservas.
_ROLES_RESERVAS = ("Administrador", "Recepcionista 24h", "Conserje")

router = APIRouter(prefix="/api/reservas", tags=["reservas"])

# RF-009: consulta de reservas restringida a roles operativos.
@router.get("", dependencies=[Depends(requiere_rol(*_ROLES_RESERVAS))])
def obtener_reservas():
    """Retorna el listado completo de reservas registradas incluyendo auditoría de quien reservó."""
    try:
        # Hallazgo 06: creado_por declarado en schema.sql
        
        query_text = """
            SELECT r.id_reserva, r.id_huesped, h.nombre as huesped_nombre, h.documento as huesped_documento,
                   r.id_habitacion, hab.numero as habitacion_numero, hab.tipo as habitacion_tipo,
                   r.fecha_entrada, r.fecha_salida, r.estado, r.creado_por
            FROM reserva_habitacion r
            JOIN huesped h ON r.id_huesped = h.id_huesped
            JOIN habitacion hab ON r.id_habitacion = hab.id_habitacion
            ORDER BY r.fecha_entrada DESC
        """
        cursor.execute(query_text)
        filas = cursor.fetchall()
        
        reservas = []
        for f in filas:
            reservas.append({
                "id_reserva": f[0],
                "id_huesped": f[1],
                "huesped_nombre": f[2],
                "huesped_documento": f[3],
                "id_habitacion": f[4],
                "habitacion_numero": f[5],
                "habitacion_tipo": f[6],
                "fecha_entrada": f[7].strftime("%Y-%m-%d") if hasattr(f[7], 'strftime') else str(f[7]),
                "fecha_salida": f[8].strftime("%Y-%m-%d") if hasattr(f[8], 'strftime') else str(f[8]),
                "estado": f[9],
                "creado_por": f[10] or ""
            })
            
        cursor.close()
        connection.liberar_conexion(conn)
        return reservas
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud."  # Hallazgo 07: msg en logger, no en HTTP
        )

# RF-009 / RF-011 / Hallazgo 03: solo roles operativos autorizados pueden crear reservas.
@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(requiere_rol("Administrador", "Recepcionista 24h", "Recepcionista Noche"))])
def crear_reserva(
    reserva: ReservaCreate,
    usuario: UsuarioActual = Depends(autenticar)
):
    """Crea una reserva de habitación calculando cotización e impidiendo colisiones de fechas (RF-011) registrando la auditoría del empleado."""
    audit_str = f"{usuario.nombre or 'Empleado'} ({usuario.rol})"
    
    # 1. Validar formato y coherencia de fechas
    try:
        entrada_dt = datetime.strptime(reserva.fecha_entrada, "%Y-%m-%d").date()
        salida_dt = datetime.strptime(reserva.fecha_salida, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de fechas inválido. Debe ser AAAA-MM-DD."
        )

    conn = None
    cursor = None
    try:
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        
        # A. Obtener datos de la habitación
        cursor.execute("SELECT precio_noche, numero, estado, capacidad FROM habitacion WHERE id_habitacion = %s", (reserva.id_habitacion,))
        hab_row = cursor.fetchone()
        if not hab_row:
            raise HTTPException(status_code=404, detail="La habitación especificada no existe.")
        precio_noche, numero_hab, estado_hab, capacidad_hab = hab_row
        
        if estado_hab == "Mantenimiento":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"La habitación {numero_hab} se encuentra en Mantenimiento y no acepta nuevas reservas."
            )

        if reserva.numero_personas > capacidad_hab:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Capacidad excedida: la habitación {numero_hab} admite máximo "
                    f"{capacidad_hab} persona(s), pero se solicitaron {reserva.numero_personas}."
                )
            )
            
        # B. Calcular noches y liquidación usando la función PL/pgSQL
        cursor.execute("SELECT noches, subtotal, descuento_aplicado, total FROM fn_calcular_noches_y_precio(%s, %s, %s)",
                       (reserva.fecha_entrada, reserva.fecha_salida, precio_noche))
        cot_row = cursor.fetchone()
        noches, subtotal, descuento, total = cot_row
        
        # C. Insertar la reserva registrando creado_por
        insertar_query = """
            INSERT INTO reserva_habitacion (id_huesped, id_habitacion, fecha_entrada, fecha_salida, estado, creado_por)
            VALUES (%s, %s, %s, %s, 'Confirmada', %s)
            RETURNING id_reserva, id_huesped, id_habitacion, fecha_entrada, fecha_salida, estado, creado_por
        """
        cursor.execute(insertar_query, (reserva.id_huesped, reserva.id_habitacion, reserva.fecha_entrada, reserva.fecha_salida, audit_str))
        res_row = cursor.fetchone()
        
        # Obtener detalles del huésped
        cursor.execute("SELECT nombre, documento FROM huesped WHERE id_huesped = %s", (reserva.id_huesped,))
        hues_row = cursor.fetchone()
        
        conn.commit()
        
        nueva_res = {
            "id_reserva": res_row[0],
            "id_huesped": res_row[1],
            "huesped_nombre": hues_row[0],
            "huesped_documento": hues_row[1],
            "id_habitacion": res_row[2],
            "habitacion_numero": numero_hab,
            "habitacion_tipo": "",
            "fecha_entrada": res_row[3].strftime("%Y-%m-%d") if hasattr(res_row[3], 'strftime') else str(res_row[3]),
            "fecha_salida": res_row[4].strftime("%Y-%m-%d") if hasattr(res_row[4], 'strftime') else str(res_row[4]),
            "estado": res_row[5],
            "creado_por": res_row[6]
        }
        
        return {
            "message": f"Reserva confirmada exitosamente por {audit_str}.",
            "reserva": nueva_res,
            "cotizacion": {
                "noches": noches,
                "subtotal": float(subtotal),
                "descuento": float(descuento),
                "total": float(total)
            }
        }
    except psycopg2.Error as db_err:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        pgcode = getattr(db_err, 'pgcode', '') or ''
        err_msg = str(db_err)

        if pgcode in ('23P01', '40P01') or 'exclude_overlapping_reservations' in err_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Double Booking Detectado: La habitación ya está reservada para el rango de fechas solicitado."
            )
        if pgcode == '23514' or 'chk_fechas' in err_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La fecha de salida debe ser posterior a la fecha de entrada."
            )
        if pgcode == 'P0001' or 'Mantenimiento' in err_msg:
            cleaned = err_msg.split('CONTEXT:')[0].replace('ERROR: ', '').strip()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=cleaned)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error de base de datos relacional: {err_msg}"
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al procesar la solicitud."  # Hallazgo 07: msg técnico en logger, no en HTTP
        )
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                connection.liberar_conexion(conn)
            except Exception:
                pass

# Hallazgo 03: Solo Administrador y Recepcionista 24h pueden cancelar reservas.
@router.delete("/{id_reserva}", dependencies=[Depends(requiere_rol("Administrador", "Recepcionista 24h"))])
def eliminar_reserva(
    id_reserva: int,
    usuario: UsuarioActual = Depends(autenticar)
):
    """
    Hallazgo 04: Cancela una reserva mediante baja lógica (UPDATE estado = 'Cancelada') sin destruir historial.
    """
    audit_str = f"{usuario.nombre or 'Empleado'} ({usuario.rol})"
    try:
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        
        # Obtener datos de la reserva antes de cancelarla
        cursor.execute("SELECT id_habitacion, estado FROM reserva_habitacion WHERE id_reserva = %s", (id_reserva,))
        res_row = cursor.fetchone()
        
        if res_row:
            id_hab, estado_res = res_row
            if estado_res in ("Check-In", "Completada", "Ocupada"):
                cursor.execute("UPDATE habitacion SET estado = 'En limpieza', modificado_por = %s WHERE id_habitacion = %s", (audit_str, id_hab))
            else:
                cursor.execute("UPDATE habitacion SET estado = 'Disponible', modificado_por = %s WHERE id_habitacion = %s", (audit_str, id_hab))
        
        # Hallazgo 04: Baja lógica para preservar el registro contable de reservas
        cursor.execute("UPDATE reserva_habitacion SET estado = 'Cancelada', modificado_por = %s WHERE id_reserva = %s", (audit_str, id_reserva))
        conn.commit()
        cursor.close()
        connection.liberar_conexion(conn)
        return {"message": f"Reserva #{id_reserva} cancelada exitosamente por {audit_str}."}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud."  # Hallazgo 07: msg en logger, no en HTTP
        )
