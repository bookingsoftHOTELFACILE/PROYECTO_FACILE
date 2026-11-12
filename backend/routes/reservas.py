import logging
from datetime import datetime
import psycopg2
from fastapi import APIRouter, Depends, HTTPException, status
from database import connection
from dependencies import requiere_rol, autenticar, autenticar_opcional, UsuarioActual
from models.schemas import ReservaCreate, ReservaEstadoUpdate
from services.reservas_service import (
    validar_fechas_reserva,
    validar_habitacion_disponible,
    validar_checkin_habitacion,
    parse_fecha,
    ValidationError as ServiceValidationError
)
logger = logging.getLogger("bookingsoft.reservas")

# RF-009: roles autorizados para el módulo de reservas.
_ROLES_RESERVAS = ("Administrador", "Recepcionista 24h", "Conserje")

router = APIRouter(prefix="/api/reservas", tags=["reservas"])

# RF-009: consulta de reservas restringida a roles operativos.
@router.get("", dependencies=[Depends(requiere_rol(*_ROLES_RESERVAS))])
def obtener_reservas():
    """Retorna el listado completo de reservas registradas incluyendo auditoría de quien reservó."""
    conn = None
    cursor = None
    try:
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        
        query_text = """
            SELECT r.id_reserva, r.id_huesped, h.nombre as huesped_nombre, h.documento as huesped_documento,
                   r.id_habitacion, hab.numero as habitacion_numero, hab.tipo as habitacion_tipo,
                   r.fecha_entrada, r.fecha_salida, r.estado, r.creado_por,
                   r.checkin_at, r.checkout_at
            FROM reserva_habitacion r
            JOIN huesped h ON r.id_huesped = h.id_huesped
            JOIN habitacion hab ON r.id_habitacion = hab.id_habitacion
            WHERE r.estado != 'Cancelada'
            ORDER BY r.id_reserva ASC
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
                "creado_por": f[10] or "",
                # HU-005 (CA-005.1 / CA-005.4): marca temporal física real, vacía si no hay check-in.
                "checkin_at": f[11].strftime("%Y-%m-%d %H:%M") if f[11] else None,
                "checkout_at": f[12].strftime("%Y-%m-%d %H:%M") if f[12] else None
            })
            
        cursor.close()
        connection.liberar_conexion(conn)
        return reservas
    except Exception as e:
        if cursor:
            try: cursor.close()
            except Exception: pass
        if conn:
            try: connection.liberar_conexion(conn)
            except Exception: pass
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud.")

# RF-009 / RF-011: Permite crear reservas tanto a personal autorizado como a clientes directos (Web / Walk-in)
@router.post("", status_code=status.HTTP_201_CREATED)
def crear_reserva(
    reserva: ReservaCreate,
    usuario: UsuarioActual | None = Depends(autenticar_opcional)
):
    """Crea una reserva de habitación calculando cotización e impidiendo colisiones de fechas (RF-011) registrando la auditoría del creador."""
    audit_str = f"{usuario.nombre or 'Empleado'} ({usuario.rol})" if usuario else "Huésped (Reserva Web)"
    
    # 1. Validar formato y coherencia de fechas usando el servicio (Capa API)
    try:
        entrada_dt, salida_dt = validar_fechas_reserva(reserva.fecha_entrada, reserva.fecha_salida)
    except ServiceValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
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
        
        # Validación de estado con el servicio
        try:
            validar_habitacion_disponible(estado_hab, numero_hab)
        except ServiceValidationError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

        if reserva.numero_personas > capacidad_hab:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Capacidad excedida: la habitación {numero_hab} admite máximo "
                    f"{capacidad_hab} persona(s), pero se solicitaron {reserva.numero_personas}."
                )
            )

        # HU-005 / CA-005.2: registro de check-in directo para llegadas sin reserva previa.
        # Restringido a personal operativo: el público (autenticar_opcional) nunca puede usarlo.
        es_checkin_directo = bool(reserva.checkin_inmediato)
        if es_checkin_directo:
            if not (usuario and usuario.rol in _ROLES_RESERVAS):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Solo el personal autorizado puede registrar un check-in directo."
                )
            # HU-005 / CA-005.3: no se permite check-in en unidad ocupada o en mantenimiento.
            try:
                validar_checkin_habitacion(estado_hab, numero_hab)
            except ServiceValidationError as e:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

        # B. Calcular noches y liquidación usando la función PL/pgSQL
        cursor.execute("SELECT noches, subtotal, descuento_aplicado, total FROM fn_calcular_noches_y_precio(%s, %s, %s)",
                       (reserva.fecha_entrada, reserva.fecha_salida, precio_noche))
        cot_row = cursor.fetchone()
        noches, subtotal, descuento, total = cot_row
        
        # C. Insertar la reserva registrando creado_por
        # HU-005: con check-in directo nace en 'Check-In' con su marca temporal real.
        insertar_query = """
            INSERT INTO reserva_habitacion (id_huesped, id_habitacion, fecha_entrada, fecha_salida, estado, checkin_at, creado_por)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id_reserva, id_huesped, id_habitacion, fecha_entrada, fecha_salida, estado, creado_por, checkin_at
        """
        estado_inicial = 'Check-In' if es_checkin_directo else 'Confirmada'
        checkin_inicial = datetime.now() if es_checkin_directo else None
        cursor.execute(insertar_query, (
            reserva.id_huesped, reserva.id_habitacion, reserva.fecha_entrada,
            reserva.fecha_salida, estado_inicial, checkin_inicial, audit_str
        ))
        res_row = cursor.fetchone()
        
        # Obtener detalles del huésped
        cursor.execute("SELECT nombre, documento FROM huesped WHERE id_huesped = %s", (reserva.id_huesped,))
        hues_row = cursor.fetchone()

        # HU-005: la unidad queda ocupada en cuanto se registra la entrada física.
        if es_checkin_directo:
            cursor.execute(
                "UPDATE habitacion SET estado = 'Ocupada', modificado_por = %s WHERE id_habitacion = %s",
                (audit_str, reserva.id_habitacion)
            )

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
            "creado_por": res_row[6],
            "checkin_at": res_row[7].strftime("%Y-%m-%d %H:%M") if res_row[7] else None,
            "checkout_at": None
        }
        
        return {
            "message": (
                f"Check-in directo registrado por {audit_str}."
                if es_checkin_directo
                else f"Reserva confirmada exitosamente por {audit_str}."
            ),
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

# HU-005 (CA-005.1 / CA-005.4 / CA-005.5): entrada y salida física de huéspedes.
@router.patch("/{id_reserva}/estado", dependencies=[Depends(requiere_rol(*_ROLES_RESERVAS))])
def cambiar_estado_reserva(
    id_reserva: int,
    data: ReservaEstadoUpdate,
    usuario: UsuarioActual = Depends(autenticar)
):
    """
    Registra el check-in o el check-out de una reserva (README: `Confirmada -> Check-In -> Completada`).

    - `Check-In`   (CA-005.1): marca la hora real de entrada y deja la unidad en 'Ocupada'.
    - `Completada` (CA-005.4): marca la hora real de salida, libera la unidad a 'En limpieza'
      y calcula las noches de la estadía entre fecha de entrada y fecha de salida (CA-005.5).

    Cualquier otra transición se rechaza con 409 para no romper el ciclo de vida.
    """
    nuevo_estado = data.estado
    audit_str = f"{usuario.nombre or 'Empleado'} ({usuario.rol})"
    conn = None
    cursor = None
    try:
        conn = connection.obtener_conexion()
        cursor = conn.cursor()

        cursor.execute(
            """SELECT estado, id_habitacion, fecha_entrada, fecha_salida, checkin_at
               FROM reserva_habitacion WHERE id_reserva = %s""",
            (id_reserva,)
        )
        fila = cursor.fetchone()
        if not fila:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"La reserva #{id_reserva} no existe.")

        estado_actual, id_habitacion, fecha_entrada, fecha_salida, checkin_at = fila

        if nuevo_estado == "Check-In":
            # CA-005.3: solo se entra a una reserva confirmada y una unidad libre.
            if estado_actual != "Confirmada":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"No es posible el check-in: la reserva está en estado '{estado_actual}'."
                )
            cursor.execute("SELECT numero, estado FROM habitacion WHERE id_habitacion = %s", (id_habitacion,))
            hab_row = cursor.fetchone()
            if not hab_row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                    detail="La habitación de la reserva no existe.")
            numero_hab, estado_hab = hab_row
            try:
                validar_checkin_habitacion(estado_hab, numero_hab)
            except ServiceValidationError as e:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

            cursor.execute(
                """UPDATE reserva_habitacion
                   SET estado = 'Check-In', checkin_at = NOW(), modificado_por = %s
                   WHERE id_reserva = %s""",
                (audit_str, id_reserva)
            )
            cursor.execute(
                "UPDATE habitacion SET estado = 'Ocupada', modificado_por = %s WHERE id_habitacion = %s",
                (audit_str, id_habitacion)
            )
            conn.commit()

            cursor.execute(
                "SELECT checkin_at, checkout_at FROM reserva_habitacion WHERE id_reserva = %s",
                (id_reserva,)
            )
            marcas = cursor.fetchone()
            return {
                "message": f"Check-in registrado para la reserva #{id_reserva} por {audit_str}.",
                "reserva": {
                    "id_reserva": id_reserva,
                    "estado": "Check-In",
                    "checkin_at": marcas[0].strftime("%Y-%m-%d %H:%M") if marcas[0] else None,
                    "checkout_at": marcas[1].strftime("%Y-%m-%d %H:%M") if marcas[1] else None,
                },
                "habitacion": {"id_habitacion": id_habitacion, "estado": "Ocupada"}
            }

        # ---- Check-out (CA-005.4 / CA-005.5) ----
        if estado_actual != "Check-In":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"No es posible el check-out: la reserva está en estado '{estado_actual}'."
            )
        if not checkin_at:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No es posible el check-out: la reserva no tiene registrado el check-in."
            )

        # CA-005.5: noches reales de la estadía entre fecha de entrada y fecha de salida.
        noches = (parse_fecha(fecha_salida) - parse_fecha(fecha_entrada)).days

        cursor.execute(
            """UPDATE reserva_habitacion
               SET estado = 'Completada', checkout_at = NOW(), modificado_por = %s
               WHERE id_reserva = %s""",
            (audit_str, id_reserva)
        )
        # El ciclo operativo de la unidad: Ocupada -> En limpieza (README).
        cursor.execute(
            "UPDATE habitacion SET estado = 'En limpieza', modificado_por = %s WHERE id_habitacion = %s",
            (audit_str, id_habitacion)
        )
        conn.commit()

        cursor.execute(
            "SELECT checkin_at, checkout_at FROM reserva_habitacion WHERE id_reserva = %s",
            (id_reserva,)
        )
        marcas = cursor.fetchone()
        return {
            "message": f"Check-out registrado para la reserva #{id_reserva} por {audit_str}.",
            "reserva": {
                "id_reserva": id_reserva,
                "estado": "Completada",
                "noches": noches,
                "checkin_at": marcas[0].strftime("%Y-%m-%d %H:%M") if marcas[0] else None,
                "checkout_at": marcas[1].strftime("%Y-%m-%d %H:%M") if marcas[1] else None,
            },
            "habitacion": {"id_habitacion": id_habitacion, "estado": "En limpieza"}
        }
    except HTTPException as he:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        raise he
    except Exception:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        logger.exception("Error inesperado al cambiar el estado de la reserva #%s", id_reserva)
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud.")
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            connection.liberar_conexion(conn)


# RF-009: el borrado lógico de una reserva también exige rol operativo (H-01).
@router.delete("/{id_reserva}", dependencies=[Depends(requiere_rol(*_ROLES_RESERVAS))])
def eliminar_reserva(
    id_reserva: int,
    usuario: UsuarioActual = Depends(autenticar)
):
    """Cancela una reserva (baja lógica) registrando quién lo hizo."""
    audit_str = f"{usuario.nombre or 'Empleado'} ({usuario.rol})"
    conn = None
    cursor = None
    try:
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id_habitacion, estado FROM reserva_habitacion WHERE id_reserva = %s", (id_reserva,))
        res_row = cursor.fetchone()
        
        if res_row:
            id_hab, estado_res = res_row
            if estado_res in ("Check-In", "Completada", "Ocupada"):
                cursor.execute("UPDATE habitacion SET estado = 'En limpieza', modificado_por = %s WHERE id_habitacion = %s", (audit_str, id_hab))
            else:
                cursor.execute("UPDATE habitacion SET estado = 'Disponible', modificado_por = %s WHERE id_habitacion = %s", (audit_str, id_hab))
        
        cursor.execute("UPDATE reserva_habitacion SET estado = 'Cancelada', modificado_por = %s WHERE id_reserva = %s", (audit_str, id_reserva))
        conn.commit()
        return {"message": f"Reserva #{id_reserva} cancelada exitosamente por {audit_str}."}
    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud.")
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            connection.liberar_conexion(conn)
