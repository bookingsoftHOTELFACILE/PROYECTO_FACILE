"""
Servicio de llaves digitales para cerraduras Yale Connect SmartLock (IoT).
Genera el paquete ``yale_lock`` emitido al confirmar un check-in directo.
"""
from __future__ import annotations

import hashlib
import logging
import secrets
from datetime import datetime
from typing import Any, Dict, Optional

logger = logging.getLogger("bookingsoft.llave_digital")

TIPO_PERMISO = "HUESPED_TEMPORAL"
HORA_CHECKIN = 15
HORA_CHECKOUT = 11
ESTADO_ACTIVA = "ACTIVA"
LONGITUD_PIN = 6
TOPICO_PROVISIONAMIENTO = "hotel/facile/cerraduras/{id}/comando/provisionar_pin"
PROTOCOLO = "MQTTS v5.0 / TLS 1.3 :8883"


def generar_pin_temporal(longitud: int = LONGITUD_PIN) -> str:
    """PIN de acceso aleatorio y criptográficamente seguro."""
    return str(secrets.randbelow(10 ** longitud)).zfill(longitud)


def _checksum(paquete: Dict[str, Any]) -> str:
    """Hash SHA-256 truncado del paquete para verificar integridad en tránsito."""
    canonico = "|".join(
        f"{clave}={paquete[clave]}"
        for clave in sorted(paquete)
        if clave != "checksum"
    )
    return hashlib.sha256(canonico.encode("utf-8")).hexdigest()[:14]


def generar_llave_digital(
    *,
    id_reserva: int,
    id_habitacion: int,
    numero_habitacion: Any,
    fecha_entrada: str,
    fecha_salida: str,
    correo_huesped: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Construye el objeto ``yale_lock`` con el PIN temporal del huésped.

    La vigencia sigue el estándar hotelero: el PIN nace a las 15:00 del día de
    entrada y expira a las 11:00 del día de salida.
    """
    pin = generar_pin_temporal()
    numero = str(numero_habitacion or "S/N").strip()

    try:
        entrada = datetime.strptime(str(fecha_entrada)[:10], "%Y-%m-%d")
        salida = datetime.strptime(str(fecha_salida)[:10], "%Y-%m-%d")
    except (TypeError, ValueError):
        logger.warning(
            "generar_llave_digital: rango de fechas inválido (%s -> %s).",
            fecha_entrada, fecha_salida,
        )
        entrada = salida = None

    valido_desde = entrada.replace(hour=HORA_CHECKIN).isoformat() if entrada else None
    valido_hasta = salida.replace(hour=HORA_CHECKOUT).isoformat() if salida else None

    serial = secrets.token_hex(3).upper()
    dispositivo_id = f"YALE-APTO-{numero}-SN{serial}"
    transaccion_id = f"tx_yale_{secrets.randbelow(900000) + 100000}"

    llave_movil = (
        f"https://bookingsoft.app/llave/{transaccion_id}?pin={pin}"
        if correo_huesped
        else None
    )

    paquete: Dict[str, Any] = {
        "estado": ESTADO_ACTIVA,
        "pin_temporal": pin,
        "transaccion_id": transaccion_id,
        "id_habitacion": id_habitacion,
        "id_reserva_asociada": id_reserva,
        "dispositivo_id": dispositivo_id,
        "tipo_permiso": TIPO_PERMISO,
        "valido_desde": valido_desde,
        "valido_hasta": valido_hasta,
        "llave_movil": llave_movil,
        "correo_notificacion": correo_huesped,
        "protocolo": PROTOCOLO,
        "topico_mqtt": TOPICO_PROVISIONAMIENTO.format(id=id_habitacion),
        "envio_guest_sms": bool(correo_huesped),
    }
    paquete["checksum"] = _checksum(paquete)

    logger.info(
        "Llave digital emitida: reserva=%s apto=%s dispositivo=%s",
        id_reserva, numero, dispositivo_id,
    )
    return paquete


def esta_vigente(llave: Optional[Dict[str, Any]], instante: Optional[datetime] = None) -> bool:
    """Indica si un paquete sigue dentro de su ventana de vigencia."""
    if not llave:
        return False
    hasta = llave.get("valido_hasta")
    if not hasta:
        return True
    try:
        limite = datetime.fromisoformat(str(hasta))
    except ValueError:
        return True
    return (instante or datetime.now()) <= limite
