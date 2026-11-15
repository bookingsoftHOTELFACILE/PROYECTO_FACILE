import pytest
from unittest.mock import patch
from services.email_service import (
    procesar_reserva_con_notificacion,
    EmailDeliveryError
)


@patch("services.email_service.enviar_correo")
def test_crear_reserva_llama_enviar_correo_con_parametros_correctos(mock_enviar):
    mock_enviar.return_value = True
    datos_reserva = {
        "id_reserva": 501,
        "correo_cliente": "ashly.echeverri@bookingsoft.com",
        "nombre_cliente": "Ashly Echeverri",
        "habitacion": "D101"
    }

    resultado = procesar_reserva_con_notificacion(datos_reserva, funcion_envio=mock_enviar)

    assert resultado["reserva_guardada"] is True
    assert resultado["correo_enviado"] is True

    mock_enviar.assert_called_once_with(
        destinatario="ashly.echeverri@bookingsoft.com",
        asunto="Confirmación de Reserva #501 - Hotel BookingSoft",
        cuerpo="Hola Ashly Echeverri, tu reserva #501 ha sido confirmada con éxito."
    )


@patch("services.email_service.enviar_correo")
def test_crear_reserva_con_servidor_smtp_caido_no_bloquea_usuario(mock_enviar):
    mock_enviar.side_effect = EmailDeliveryError("Error de conexión: SMTP Server Down")

    datos_reserva = {
        "id_reserva": 502,
        "correo_cliente": "carlos.mendoza@gmail.com",
        "nombre_cliente": "Carlos Mendoza"
    }

    resultado = procesar_reserva_con_notificacion(datos_reserva, funcion_envio=mock_enviar)

    assert resultado["reserva_guardada"] is True
    assert resultado["correo_enviado"] is False
    assert "SMTP Server Down" in resultado["error_notificacion"]
