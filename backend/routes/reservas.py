from fastapi import APIRouter, HTTPException, status
from datetime import datetime
import psycopg2
from database import connection
from models.schemas import ReservaCreate

router = APIRouter(prefix="/api/reservas", tags=["reservas"])

@router.get("")
def obtener_reservas():
    """Retorna el listado completo de reservas registradas."""
    # Si estamos en modo simulación (sin base de datos real)
    if connection.es_modo_simulacion():
        return connection.reservas_simulacion
        
    # Si la base de datos PostgreSQL está activa
    try:
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        query_text = """
            SELECT r.id_reserva, r.id_huesped, h.nombre as huesped_nombre, h.documento as huesped_documento,
                   r.id_habitacion, hab.numero as habitacion_numero, hab.tipo as habitacion_tipo,
                   r.fecha_entrada, r.fecha_salida, r.estado
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
                "estado": f[9]
            })
            
        cursor.close()
        conn.close()
        return reservas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener reservas: {e}")

@router.post("", status_code=status.HTTP_201_CREATED)
def crear_reserva(reserva: ReservaCreate):
    """Crea una reserva de habitación calculando cotización e impidiendo colisiones de fechas."""
    
    # 1. Validar formato y coherencia de fechas
    try:
        entrada_dt = datetime.strptime(reserva.fecha_entrada, "%Y-%m-%d").date()
        salida_dt = datetime.strptime(reserva.fecha_salida, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de fechas inválido. Debe ser AAAA-MM-DD."
        )
        
    if salida_dt <= entrada_dt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de salida debe ser posterior a la fecha de entrada."
        )
        
    # --- MODO SIMULACIÓN ---
    if connection.es_modo_simulacion():
        # A. Obtener datos de la habitación
        habitacion = next((h for h in connection.habitaciones_simulacion if h["id_habitacion"] == reserva.id_habitacion), None)
        if not habitacion:
            raise HTTPException(status_code=404, detail="La habitación especificada no existe.")
            
        # B. Comprobar si está en mantenimiento
        if habitacion["estado"] == "Mantenimiento":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"La habitación {habitacion['numero']} se encuentra en Mantenimiento y no acepta nuevas reservas."
            )
            
        # C. Validar colisión de fechas (Double Booking)
        for r in connection.reservas_simulacion:
            if r["id_habitacion"] == reserva.id_habitacion and r["estado"] in ["Confirmada", "Check-In"]:
                r_e = datetime.strptime(r["fecha_entrada"], "%Y-%m-%d").date() if isinstance(r["fecha_entrada"], str) else r["fecha_entrada"]
                r_s = datetime.strptime(r["fecha_salida"], "%Y-%m-%d").date() if isinstance(r["fecha_salida"], str) else r["fecha_salida"]
                
                # Fórmula de solapamiento
                if entrada_dt < r_s and salida_dt > r_e:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Double Booking Detectado: La habitación {habitacion['numero']} ya está reservada para el rango de fechas {r_e} a {r_s}."
                    )
                    
        # D. Calcular liquidación (descuento del 15% para estancias largas de más de 15 noches)
        noches = (salida_dt - entrada_dt).days
        subtotal = noches * float(habitacion["precio_noche"])
        descuento = subtotal * 0.15 if noches > 15 else 0.0
        total = subtotal - descuento
        
        # Obtener nombre del huésped
        huesped = next((g for g in connection.huespedes_simulacion if g["id_huesped"] == reserva.id_huesped), None)
        if not huesped:
            raise HTTPException(status_code=404, detail="El huésped especificado no existe.")
            
        # Crear reserva en memoria
        nuevo_id = max(r["id_reserva"] for r in connection.reservas_simulacion) + 1 if connection.reservas_simulacion else 1
        nueva_reserva = {
            "id_reserva": nuevo_id,
            "id_huesped": reserva.id_huesped,
            "huesped_nombre": huesped["nombre"],
            "huesped_documento": huesped["documento"],
            "id_habitacion": reserva.id_habitacion,
            "habitacion_numero": habitacion["numero"],
            "habitacion_tipo": habitacion["tipo"],
            "fecha_entrada": reserva.fecha_entrada,
            "fecha_salida": reserva.fecha_salida,
            "estado": "Confirmada"
        }
        connection.reservas_simulacion.append(nueva_reserva)
        
        return {
            "message": "Reserva creada y bloqueada exitosamente.",
            "reserva": nueva_reserva,
            "cotizacion": {
                "noches": noches,
                "subtotal": subtotal,
                "descuento": descuento,
                "total": total
            }
        }
        
    # --- MODO BASE DE DATOS FÍSICA (PostgreSQL) ---
    try:
        conn = connection.obtener_conexion()
        cursor = conn.cursor()
        
        # A. Obtener datos de la habitación
        cursor.execute("SELECT precio_noche, numero, estado FROM habitacion WHERE id_habitacion = %s", (reserva.id_habitacion,))
        hab_row = cursor.fetchone()
        if not hab_row:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="La habitación especificada no existe.")
        precio_noche, numero_hab, estado_hab = hab_row
        
        # Validar si está en mantenimiento en base de datos
        if estado_hab == "Mantenimiento":
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"La habitación {numero_hab} se encuentra en Mantenimiento y no acepta nuevas reservas."
            )
            
        # B. Calcular noches y liquidación usando la función PL/pgSQL
        cursor.execute("SELECT noches, subtotal, descuento_aplicado, total FROM fn_calcular_noches_y_precio(%s, %s, %s)",
                       (reserva.fecha_entrada, reserva.fecha_salida, precio_noche))
        cot_row = cursor.fetchone()
        noches, subtotal, descuento, total = cot_row
        
        # C. Insertar la reserva (se disparará el trigger trg_validar_double_booking)
        insertar_query = """
            INSERT INTO reserva_habitacion (id_huesped, id_habitacion, fecha_entrada, fecha_salida, estado)
            VALUES (%s, %s, %s, %s, 'Confirmada')
            RETURNING id_reserva, id_huesped, id_habitacion, fecha_entrada, fecha_salida, estado
        """
        cursor.execute(insertar_query, (reserva.id_huesped, reserva.id_habitacion, reserva.fecha_entrada, reserva.fecha_salida))
        res_row = cursor.fetchone()
        
        # Obtener detalles del huésped
        cursor.execute("SELECT nombre, documento FROM huesped WHERE id_huesped = %s", (reserva.id_huesped,))
        hues_row = cursor.fetchone()
        
        conn.commit()
        cursor.close()
        conn.close()
        
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
            "estado": res_row[5]
        }
        
        return {
            "message": "Reserva creada y bloqueada exitosamente.",
            "reserva": nueva_res,
            "cotizacion": {
                "noches": noches,
                "subtotal": float(subtotal),
                "descuento": float(descuento),
                "total": float(total)
            }
        }
    except psycopg2.Error as db_err:
        err_msg = str(db_err)
        # Capturar la excepción del trigger PL/pgSQL
        if "Double Booking" in err_msg or "Mantenimiento" in err_msg or "chk_fechas" in err_msg:
            cleaned_msg = err_msg.split("CONTEXT:")[0].replace("error: ", "").replace("ERROR: ", "").strip()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=cleaned_msg)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error de base de datos relacional: {err_msg}"
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {e}"
        )
