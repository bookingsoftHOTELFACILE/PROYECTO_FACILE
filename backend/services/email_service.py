from typing import Dict, Any


class EmailDeliveryError(Exception):
    pass


def enviar_correo(destinatario: str, asunto: str, cuerpo: str) -> bool:
    if not destinatario or "@" not in destinatario:
        raise ValueError("Dirección de correo destinatario inválida.")
    return True


def procesar_reserva_con_notificacion(
    reserva_data: Dict[str, Any],
    funcion_envio=enviar_correo
) -> Dict[str, Any]:
    id_reserva = reserva_data.get("id_reserva", 1)
    cliente_email = reserva_data.get("correo_cliente")
    cliente_nombre = reserva_data.get("nombre_cliente", "Huésped")

    correo_enviado = False
    error_notificacion = None

    try:
        asunto = f"Confirmación de Reserva #{id_reserva} - Hotel BookingSoft"
        cuerpo = f"Hola {cliente_nombre}, tu reserva #{id_reserva} ha sido confirmada con éxito."

        correo_enviado = funcion_envio(
            destinatario=cliente_email,
            asunto=asunto,
            cuerpo=cuerpo
        )
    except Exception as e:
        error_notificacion = str(e)
        correo_enviado = False

    return {
        "reserva_guardada": True,
        "id_reserva": id_reserva,
        "correo_enviado": correo_enviado,
        "error_notificacion": error_notificacion
    }
