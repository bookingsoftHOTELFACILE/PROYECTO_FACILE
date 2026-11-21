import logging
from datetime import datetime
import bcrypt
import psycopg2
from fastapi import APIRouter, Depends, HTTPException, status
from dependencies import requiere_rol, autenticar, autenticar_opcional, UsuarioActual
from models.schemas import ReservaCreate, ReservaEstadoUpdate, ReservaUpdate
from repositories import cursor_escritura, cursor_lectura
from services.reservas_service import (
    validar_fechas_reserva,
    validar_habitacion_disponible,
    validar_checkin_habitacion,
    parse_fecha,
    ValidationError as ServiceValidationError
)
from services.llave_digital import generar_llave_digital
logger = logging.getLogger("bookingsoft.reservas")

# RF-009: roles autorizados para el módulo de reservas.
_ROLES_RESERVAS = ("Administrador", "Recepcionista 24h")

router = APIRouter(prefix="/api/reservas", tags=["reservas"])


def _crear_huesped_atomico(cur, datos, audit_str: str) -> int:
    """
    P1-1.4 — Da de alta un huésped usando el cursor (y por lo tanto la transacción)
    que ya está abierta por `cursor_escritura`.

    Si después la reserva falla (double booking, capacidad, unidad en
    mantenimiento...), el `rollback` elimina también el huésped: no quedan huéspedes
    huérfanos creados "a medio camino".
    """
    nombre = (datos.nombre or "").strip()
    documento = (datos.documento or "").strip()
    telefono = (datos.telefono or "").strip()
    correo = (datos.correo or "").strip()

    if not nombre or not documento or not telefono or not correo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nombre, documento, teléfono y correo son campos obligatorios para registrar al huésped."
        )

    cur.execute(
        "SELECT id_huesped FROM huesped WHERE documento = %s OR LOWER(correo) = LOWER(%s)",
        (documento, correo.lower())
    )
    if cur.fetchone():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un huésped con este documento o correo. Selecciónelo del listado para continuar."
        )

    # Misma regla que POST /api/user/registro: contraseña propia o la cédula por defecto.
    clave_base = (datos.password or "").strip() or documento
    password_hash = bcrypt.hashpw(clave_base.encode(), bcrypt.gensalt()).decode()

    cur.execute(
        """
        INSERT INTO huesped (nombre, documento, telefono, correo, empresa, lealtad, estado, modificado_por, password_hash)
        VALUES (%s, %s, %s, %s, %s, 'Silver', 'Activo', %s, %s)
        RETURNING id_huesped
        """,
        (
            nombre,
            documento,
            telefono,
            correo,
            (datos.empresa or "").strip(),
            audit_str,
            password_hash,
        ),
    )
    return cur.fetchone()["id_huesped"]

# RF-009: consulta de reservas restringida a roles operativos.
@router.get("", dependencies=[Depends(requiere_rol(*_ROLES_RESERVAS))])
def obtener_reservas():
    """Retorna el listado completo de reservas registradas incluyendo auditoría de quien reservó."""
    try:
        with cursor_lectura() as cur:
            query_text = """
                SELECT r.id_reserva, r.id_huesped, h.nombre as huesped_nombre, h.documento as huesped_documento,
                       r.id_habitacion, hab.numero as habitacion_numero, hab.tipo as habitacion_tipo,
                       r.fecha_entrada, r.fecha_salida, r.estado, r.creado_por,
                       r.observaciones, r.checkin_at, r.checkout_at
                FROM reserva_habitacion r
                JOIN huesped h ON r.id_huesped = h.id_huesped
                JOIN habitacion hab ON r.id_habitacion = hab.id_habitacion
                WHERE r.estado != 'Cancelada'
                ORDER BY r.id_reserva ASC
            """
            cur.execute(query_text)
            filas = cur.fetchall()

        # M-06: se lee por nombre de columna (los alias SQL son las claves).
        reservas = []
        for f in filas:
            fecha_entrada = f["fecha_entrada"]
            fecha_salida = f["fecha_salida"]
            reservas.append({
                "id_reserva": f["id_reserva"],
                "id_huesped": f["id_huesped"],
                "huesped_nombre": f["huesped_nombre"],
                "huesped_documento": f["huesped_documento"],
                "id_habitacion": f["id_habitacion"],
                "habitacion_numero": f["habitacion_numero"],
                "habitacion_tipo": f["habitacion_tipo"],
                "fecha_entrada": fecha_entrada.strftime("%Y-%m-%d") if hasattr(fecha_entrada, 'strftime') else str(fecha_entrada),
                "fecha_salida": fecha_salida.strftime("%Y-%m-%d") if hasattr(fecha_salida, 'strftime') else str(fecha_salida),
                "estado": f["estado"],
                "creado_por": f["creado_por"] or "",
                # Fase 3 — RF-013: notas internas de la reserva.
                "observaciones": f["observaciones"] or "",
                # HU-005 (CA-005.1 / CA-005.4): marca temporal física real, vacía si no hay check-in.
                "checkin_at": f["checkin_at"].strftime("%Y-%m-%d %H:%M") if f["checkin_at"] else None,
                "checkout_at": f["checkout_at"].strftime("%Y-%m-%d %H:%M") if f["checkout_at"] else None
            })

        return reservas
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("GET /api/reservas — fallo al consultar el listado de reservas")
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

    try:
        # M-05: una sola transacción con commit al salir y rollback si algo falla.
        with cursor_escritura() as cur:

            # P1-1.4 — Alta atómica del huésped: se da de alta aquí mismo, dentro de
            # la MISMA transacción que la reserva. Si la reserva es rechazada
            # (double booking, capacidad, mantenimiento), el rollback deshace también
            # el alta del huésped y no quedan perfiles huérfanos.
            if reserva.nuevo_huesped is not None:
                if reserva.id_huesped is not None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Indique id_huesped o adjunte nuevo_huesped, no ambos."
                    )
                reserva.id_huesped = _crear_huesped_atomico(cur, reserva.nuevo_huesped, audit_str)
            elif reserva.id_huesped is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Debe indicar id_huesped o adjuntar nuevo_huesped para crear la reserva."
                )

            # A. Obtener datos de la habitación
            cur.execute("SELECT precio_noche, numero, estado, capacidad FROM habitacion WHERE id_habitacion = %s", (reserva.id_habitacion,))
            hab_row = cur.fetchone()
            if not hab_row:
                raise HTTPException(status_code=404, detail="La habitación especificada no existe.")
            precio_noche = hab_row["precio_noche"]
            numero_hab = hab_row["numero"]
            estado_hab = hab_row["estado"]
            capacidad_hab = hab_row["capacidad"]

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
            cur.execute("SELECT noches, subtotal, descuento_aplicado, total FROM fn_calcular_noches_y_precio(%s, %s, %s)",
                        (reserva.fecha_entrada, reserva.fecha_salida, precio_noche))
            cot_row = cur.fetchone()
            noches = cot_row["noches"]
            subtotal = cot_row["subtotal"]
            descuento = cot_row["descuento_aplicado"]
            total = cot_row["total"]

            # C. Insertar la reserva registrando creado_por
            # HU-005: con check-in directo nace en 'Check-In' con su marca temporal real.
            insertar_query = """
                INSERT INTO reserva_habitacion (id_huesped, id_habitacion, fecha_entrada, fecha_salida, estado, checkin_at, creado_por)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id_reserva, id_huesped, id_habitacion, fecha_entrada, fecha_salida, estado, creado_por, checkin_at
            """
            estado_inicial = 'Check-In' if es_checkin_directo else 'Confirmada'
            checkin_inicial = datetime.now() if es_checkin_directo else None
            cur.execute(insertar_query, (
                reserva.id_huesped, reserva.id_habitacion, reserva.fecha_entrada,
                reserva.fecha_salida, estado_inicial, checkin_inicial, audit_str
            ))
            res_row = cur.fetchone()

            # Obtener detalles del huésped (recién creado o preexistente)
            cur.execute(
                "SELECT id_huesped, nombre, documento, telefono, correo, empresa, lealtad, estado "
                "FROM huesped WHERE id_huesped = %s",
                (reserva.id_huesped,)
            )
            hues_row = cur.fetchone()
            if not hues_row:
                raise HTTPException(status_code=404, detail="El huésped especificado no existe.")

            # HU-005: la unidad queda ocupada en cuanto se registra la entrada física.
            if es_checkin_directo:
                cur.execute(
                    "UPDATE habitacion SET estado = 'Ocupada', modificado_por = %s WHERE id_habitacion = %s",
                    (audit_str, reserva.id_habitacion)
                )

        # M-06: las filas salen como dict; se leen por nombre de columna.
        nueva_res = {
            "id_reserva": res_row["id_reserva"],
            "id_huesped": res_row["id_huesped"],
            "huesped_nombre": hues_row["nombre"] if hues_row else "",
            "huesped_documento": hues_row["documento"] if hues_row else "",
            "id_habitacion": res_row["id_habitacion"],
            "habitacion_numero": numero_hab,
            "habitacion_tipo": "",
            "fecha_entrada": res_row["fecha_entrada"].strftime("%Y-%m-%d") if hasattr(res_row["fecha_entrada"], 'strftime') else str(res_row["fecha_entrada"]),
            "fecha_salida": res_row["fecha_salida"].strftime("%Y-%m-%d") if hasattr(res_row["fecha_salida"], 'strftime') else str(res_row["fecha_salida"]),
            "estado": res_row["estado"],
            "creado_por": res_row["creado_por"],
            "checkin_at": res_row["checkin_at"].strftime("%Y-%m-%d %H:%M") if res_row["checkin_at"] else None,
            "checkout_at": None
        }

        # La llave se emite después del commit: si la transacción falló no debe
        # quedar un PIN provisionado para una reserva inexistente.
        yale_lock = None
        if es_checkin_directo:
            yale_lock = generar_llave_digital(
                id_reserva=res_row["id_reserva"],
                id_habitacion=res_row["id_habitacion"],
                numero_habitacion=numero_hab,
                fecha_entrada=res_row["fecha_entrada"],
                fecha_salida=res_row["fecha_salida"],
                correo_huesped=(hues_row or {}).get("correo"),
            )

        return {
            "message": (
                f"Check-in directo registrado por {audit_str}."
                if es_checkin_directo
                else f"Reserva confirmada exitosamente por {audit_str}."
            ),
            "reserva": nueva_res,
            # P1-1.4: perfil del huésped (recién creado o el que ya existía) para que
            # el PMS lo seleccione sin una segunda petición.
            "huesped": hues_row,
            # Sólo el check-in directo provisiona PIN en la cerradura.
            "yale_lock": yale_lock,
            "cotizacion": {
                "noches": noches,
                "subtotal": float(subtotal),
                "descuento": float(descuento),
                "total": float(total)
            }
        }
    except psycopg2.Error as db_err:
        # La transacción ya hizo rollback al salir de `cursor_escritura()`.
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
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("POST /api/reservas — fallo de base de datos al crear la reserva")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al procesar la solicitud."
        )
    except HTTPException:
        raise
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("POST /api/reservas — fallo inesperado al crear la reserva de la habitación %s", reserva.id_habitacion)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al procesar la solicitud."  # Hallazgo 07: msg técnico en logger, no en HTTP
        )

# RF-013 (Fase 3): modificación de una reserva existente (fechas, unidad y notas).
@router.patch("/{id_reserva}", dependencies=[Depends(requiere_rol(*_ROLES_RESERVAS))])
def actualizar_reserva(
    id_reserva: int,
    cambios: ReservaUpdate,
    usuario: UsuarioActual = Depends(autenticar)
):
    """
    Modifica una reserva **sin** perder su identidad (RF-013).

    - Sólo se editan reservas en estado `Confirmada`: una estancia en curso o ya
      cerrada es inmutable (para moverla se cancela y se crea otra).
    - Todos los campos son opcionales; los no enviados conservan su valor.
    - El cambio se aplica en UNA transacción: si el nuevo rango de fechas choca con
      otra reserva de la unidad, el constraint GiST aborta la escritura completa.
    - La cotización devuelta se recalcula con la tarifa vigente y la política única
      de descuentos (fn_calcular_noches_y_precio).
    """
    audit_str = f"{usuario.nombre or 'Empleado'} ({usuario.rol})"

    if all(
        valor is None
        for valor in (cambios.fecha_entrada, cambios.fecha_salida,
                      cambios.id_habitacion, cambios.observaciones)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Indique al menos un campo a modificar (fechas, unidad u observaciones)."
        )

    try:
        with cursor_escritura() as cur:
            cur.execute(
                """SELECT r.id_reserva, r.id_habitacion, r.fecha_entrada, r.fecha_salida,
                          r.estado, r.observaciones
                   FROM reserva_habitacion r
                   WHERE r.id_reserva = %s""",
                (id_reserva,),
            )
            actual = cur.fetchone()
            if not actual:
                raise HTTPException(status_code=404, detail=f"La reserva #{id_reserva} no existe.")

            if actual["estado"] != "Confirmada":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        f"No se puede modificar una reserva en estado '{actual['estado']}'. "
                        "Sólo se editan reservas Confirmadas (para mover una estancia en curso, "
                        "cancele y cree una nueva)."
                    ),
                )

            nueva_entrada = cambios.fecha_entrada or actual["fecha_entrada"]
            nueva_salida = cambios.fecha_salida or actual["fecha_salida"]
            nuevo_id_hab = cambios.id_habitacion or actual["id_habitacion"]

            try:
                validar_fechas_reserva(nueva_entrada, nueva_salida)
            except ServiceValidationError as e:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

            # Unidad destino (puede ser la misma): debe existir y no estar en mantenimiento.
            cur.execute(
                "SELECT numero, capacidad, estado, precio_noche FROM habitacion WHERE id_habitacion = %s",
                (nuevo_id_hab,),
            )
            destino = cur.fetchone()
            if not destino:
                raise HTTPException(status_code=404, detail="La habitación especificada no existe.")
            try:
                validar_habitacion_disponible(destino["estado"], destino["numero"])
            except ServiceValidationError as e:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

            observaciones = (
                cambios.observaciones
                if cambios.observaciones is not None
                else actual["observaciones"]
            )

            cur.execute(
                """UPDATE reserva_habitacion
                   SET fecha_entrada = %s, fecha_salida = %s, id_habitacion = %s,
                       observaciones = %s, modificado_por = %s
                   WHERE id_reserva = %s""",
                (nueva_entrada, nueva_salida, nuevo_id_hab, observaciones, audit_str, id_reserva),
            )

            cur.execute(
                "SELECT noches, subtotal, descuento_aplicado, total FROM fn_calcular_noches_y_precio(%s, %s, %s)",
                (nueva_entrada, nueva_salida, destino["precio_noche"]),
            )
            cot = cur.fetchone()

            cur.execute(
                """SELECT r.id_reserva, r.id_huesped, h.nombre AS huesped_nombre,
                          h.documento AS huesped_documento, r.id_habitacion,
                          hab.numero AS habitacion_numero, hab.tipo AS habitacion_tipo,
                          r.fecha_entrada, r.fecha_salida, r.estado, r.creado_por,
                          r.observaciones, r.checkin_at, r.checkout_at
                   FROM reserva_habitacion r
                   JOIN huesped h ON h.id_huesped = r.id_huesped
                   JOIN habitacion hab ON hab.id_habitacion = r.id_habitacion
                   WHERE r.id_reserva = %s""",
                (id_reserva,),
            )
            fila = cur.fetchone()

        return {
            "message": f"Reserva #{id_reserva} actualizada por {audit_str}.",
            "reserva": {
                "id_reserva": fila["id_reserva"],
                "id_huesped": fila["id_huesped"],
                "huesped_nombre": fila["huesped_nombre"],
                "huesped_documento": fila["huesped_documento"],
                "id_habitacion": fila["id_habitacion"],
                "habitacion_numero": fila["habitacion_numero"],
                "habitacion_tipo": fila["habitacion_tipo"],
                "fecha_entrada": fila["fecha_entrada"].strftime("%Y-%m-%d"),
                "fecha_salida": fila["fecha_salida"].strftime("%Y-%m-%d"),
                "estado": fila["estado"],
                "creado_por": fila["creado_por"] or "",
                "observaciones": fila["observaciones"] or "",
                "checkin_at": fila["checkin_at"].strftime("%Y-%m-%d %H:%M") if fila["checkin_at"] else None,
                "checkout_at": fila["checkout_at"].strftime("%Y-%m-%d %H:%M") if fila["checkout_at"] else None,
            },
            "cotizacion": {
                "noches": cot["noches"],
                "subtotal": float(cot["subtotal"]),
                "descuento": float(cot["descuento_aplicado"]),
                "total": float(cot["total"]),
            },
        }
    except psycopg2.Error as db_err:
        pgcode = getattr(db_err, "pgcode", "") or ""
        err_msg = str(db_err)
        if pgcode in ("23P01", "40P01") or "exclude_overlapping_reservations" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Double Booking Detectado: la unidad ya está reservada para el rango de fechas solicitado.",
            )
        if pgcode == "23514" or "chk_fechas" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La fecha de salida debe ser posterior a la fecha de entrada.",
            )
        if pgcode == "P0001" or "Mantenimiento" in err_msg:
            limpio = err_msg.split("CONTEXT:")[0].replace("ERROR: ", "").strip()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=limpio)
        logger.exception("PATCH /api/reservas/%s — fallo de base de datos al modificar la reserva", id_reserva)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al procesar la solicitud.",
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("PATCH /api/reservas/%s — fallo inesperado al modificar la reserva", id_reserva)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al procesar la solicitud.",
        )


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
    try:
        # M-05: una sola transacción; commit al salir del bloque y rollback si algo falla.
        with cursor_escritura() as cur:
            cur.execute(
                """SELECT estado, id_habitacion, fecha_entrada, fecha_salida, checkin_at
                   FROM reserva_habitacion WHERE id_reserva = %s""",
                (id_reserva,)
            )
            fila = cur.fetchone()
            if not fila:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                    detail=f"La reserva #{id_reserva} no existe.")

            # M-06: acceso por nombre de columna en lugar del desempaquetado posicional.
            estado_actual = fila["estado"]
            id_habitacion = fila["id_habitacion"]
            fecha_entrada = fila["fecha_entrada"]
            fecha_salida = fila["fecha_salida"]
            checkin_at = fila["checkin_at"]

            if nuevo_estado == "Check-In":
                # CA-005.3: solo se entra a una reserva confirmada y una unidad libre.
                if estado_actual != "Confirmada":
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"No es posible el check-in: la reserva está en estado '{estado_actual}'."
                    )
                cur.execute("SELECT numero, estado FROM habitacion WHERE id_habitacion = %s", (id_habitacion,))
                hab_row = cur.fetchone()
                if not hab_row:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                        detail="La habitación de la reserva no existe.")
                numero_hab = hab_row["numero"]
                estado_hab = hab_row["estado"]
                try:
                    validar_checkin_habitacion(estado_hab, numero_hab)
                except ServiceValidationError as e:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

                cur.execute(
                    """UPDATE reserva_habitacion
                       SET estado = 'Check-In', checkin_at = NOW(), modificado_por = %s
                       WHERE id_reserva = %s""",
                    (audit_str, id_reserva)
                )
                cur.execute(
                    "UPDATE habitacion SET estado = 'Ocupada', modificado_por = %s WHERE id_habitacion = %s",
                    (audit_str, id_habitacion)
                )

                cur.execute(
                    """SELECT r.checkin_at, r.checkout_at, r.fecha_entrada, r.fecha_salida,
                              hab.numero AS hab_numero, hues.correo AS huesped_correo
                       FROM reserva_habitacion r
                       JOIN habitacion hab ON hab.id_habitacion = r.id_habitacion
                       LEFT JOIN huesped hues ON hues.id_huesped = r.id_huesped
                       WHERE r.id_reserva = %s""",
                    (id_reserva,)
                )
                marcas = cur.fetchone()
                yale_lock = generar_llave_digital(
                    id_reserva=id_reserva,
                    id_habitacion=id_habitacion,
                    numero_habitacion=marcas["hab_numero"],
                    fecha_entrada=marcas["fecha_entrada"],
                    fecha_salida=marcas["fecha_salida"],
                    correo_huesped=marcas["huesped_correo"],
                )
                # El return cierra el contexto y dispara el commit (M-05).
                return {
                    "message": (
                        f"Check-in registrado para la reserva #{id_reserva} por {audit_str}. "
                        f"Código de cerradura Yale: {yale_lock['pin_temporal']} (válido hasta {yale_lock['valido_hasta']})."
                    ),
                    "reserva": {
                        "id_reserva": id_reserva,
                        "estado": "Check-In",
                        "checkin_at": marcas["checkin_at"].strftime("%Y-%m-%d %H:%M") if marcas["checkin_at"] else None,
                        "checkout_at": marcas["checkout_at"].strftime("%Y-%m-%d %H:%M") if marcas["checkout_at"] else None,
                    },
                    "habitacion": {"id_habitacion": id_habitacion, "estado": "Ocupada"},
                    "yale_lock": yale_lock,
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

            # Fase 3 — Maduración: el check-out devuelve el estado financiero de la
            # reserva para que recepción pueda avisar de un saldo pendiente al cerrar.
            cur.execute("SELECT precio_noche FROM habitacion WHERE id_habitacion = %s", (id_habitacion,))
            precio_actual = float(cur.fetchone()["precio_noche"])
            cur.execute(
                "SELECT total FROM fn_calcular_noches_y_precio(%s, %s, %s)",
                (fecha_entrada, fecha_salida, precio_actual),
            )
            total_estadia = float(cur.fetchone()["total"])
            cur.execute(
                "SELECT COALESCE(SUM(monto), 0) AS pagado FROM pago WHERE id_reserva = %s AND estado = 'Confirmado'",
                (id_reserva,),
            )
            pagado = float(cur.fetchone()["pagado"])
            saldo = round(max(0.0, total_estadia - pagado), 2)
            estado_pago = "Pagado" if pagado > 0 and saldo <= 0 else ("Parcial" if pagado > 0 else "Pendiente")

            cur.execute(
                """UPDATE reserva_habitacion
                   SET estado = 'Completada', checkout_at = NOW(), modificado_por = %s
                   WHERE id_reserva = %s""",
                (audit_str, id_reserva)
            )
            # El ciclo operativo de la unidad: Ocupada -> En limpieza (README).
            cur.execute(
                "UPDATE habitacion SET estado = 'En limpieza', modificado_por = %s WHERE id_habitacion = %s",
                (audit_str, id_habitacion)
            )

            cur.execute(
                "SELECT checkin_at, checkout_at FROM reserva_habitacion WHERE id_reserva = %s",
                (id_reserva,)
            )
            marcas = cur.fetchone()
            # El return cierra el contexto y dispara el commit (M-05).
            return {
                "message": f"Check-out registrado para la reserva #{id_reserva} por {audit_str}.",
                "reserva": {
                    "id_reserva": id_reserva,
                    "estado": "Completada",
                    "noches": noches,
                    "checkin_at": marcas["checkin_at"].strftime("%Y-%m-%d %H:%M") if marcas["checkin_at"] else None,
                    "checkout_at": marcas["checkout_at"].strftime("%Y-%m-%d %H:%M") if marcas["checkout_at"] else None,
                },
                "habitacion": {"id_habitacion": id_habitacion, "estado": "En limpieza"},
                "folio": {
                    "total": round(total_estadia, 2),
                    "pagado": round(pagado, 2),
                    "saldo": saldo,
                    "estado_pago": estado_pago,
                },
            }

    except HTTPException:
        raise
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("PATCH /api/reservas/%s/estado — fallo inesperado al cambiar el estado", id_reserva)
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud.")


# RF-009: el borrado lógico de una reserva también exige rol operativo (H-01).
@router.delete("/{id_reserva}", dependencies=[Depends(requiere_rol(*_ROLES_RESERVAS))])
def eliminar_reserva(
    id_reserva: int,
    usuario: UsuarioActual = Depends(autenticar)
):
    """Cancela una reserva (baja lógica) registrando quién lo hizo."""
    audit_str = f"{usuario.nombre or 'Empleado'} ({usuario.rol})"
    try:
        # M-05: commit/rollback vive en la capa de repositorios.
        with cursor_escritura() as cur:
            cur.execute("SELECT id_habitacion, estado FROM reserva_habitacion WHERE id_reserva = %s", (id_reserva,))
            res_row = cur.fetchone()

            if res_row:
                id_hab = res_row["id_habitacion"]
                estado_res = res_row["estado"]
                if estado_res in ("Check-In", "Completada", "Ocupada"):
                    cur.execute("UPDATE habitacion SET estado = 'En limpieza', modificado_por = %s WHERE id_habitacion = %s", (audit_str, id_hab))
                else:
                    cur.execute("UPDATE habitacion SET estado = 'Disponible', modificado_por = %s WHERE id_habitacion = %s", (audit_str, id_hab))

            cur.execute("UPDATE reserva_habitacion SET estado = 'Cancelada', modificado_por = %s WHERE id_reserva = %s", (audit_str, id_reserva))

        return {"message": f"Reserva #{id_reserva} cancelada exitosamente por {audit_str}."}
    except Exception:
        # Hallazgo M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception("DELETE /api/reservas/%s — fallo inesperado al cancelar la reserva", id_reserva)
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar la solicitud.")
