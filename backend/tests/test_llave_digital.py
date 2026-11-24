"""
HU-012 — Llave digital Yale Connect SmartLock (Bonificación IoT).

Pruebas unitarias puras de `services/llave_digital.py`: sin red, sin base de
datos y sin hardware. Cubre CA-012.1 a CA-012.5 de la especificación
`docs/arquitectura/PROPUESTA_IOT_CERRADURAS_YALE.md` (secciones 3.2, 4.1 y 5).
"""
from datetime import datetime

from services.llave_digital import (
    ESTADO_ACTIVA,
    LONGITUD_PIN,
    PROTOCOLO,
    _checksum,
    esta_vigente,
    generar_llave_digital,
    generar_pin_temporal,
)

_ENTRADA = "4000-07-01"
_SALIDA = "4000-07-03"


def _llave(**kwargs):
    datos = dict(
        id_reserva=42,
        id_habitacion=101,
        numero_habitacion="101",
        fecha_entrada=_ENTRADA,
        fecha_salida=_SALIDA,
        correo_huesped="huesped@ejemplo.com",
    )
    datos.update(kwargs)
    return generar_llave_digital(**datos)


def test_pin_tiene_seis_digitos():
    pin = generar_pin_temporal()
    assert isinstance(pin, str)
    assert len(pin) == LONGITUD_PIN == 6
    assert pin.isdigit()


def test_pin_respeta_longitud_solicitada():
    assert len(generar_pin_temporal(8)) == 8
    assert len(generar_pin_temporal(4)) == 4


def test_pin_conserva_ceros_a_la_izquierda():
    for _ in range(50):
        assert len(generar_pin_temporal()) == 6


def test_pin_es_aleatorio_entre_llamadas():
    muestras = {generar_pin_temporal() for _ in range(30)}
    assert len(muestras) > 1


def test_dos_llaves_distintas_tienen_pin_distinto():
    a = _llave(id_reserva=1)
    b = _llave(id_reserva=2)
    assert a["pin_temporal"] != b["pin_temporal"]
    assert a["transaccion_id"] != b["transaccion_id"]
    assert a["dispositivo_id"] != b["dispositivo_id"]


def test_estructura_del_paquete():
    llave = _llave()
    for campo in (
        "estado", "pin_temporal", "transaccion_id", "id_habitacion",
        "id_reserva_asociada", "dispositivo_id", "tipo_permiso",
        "valido_desde", "valido_hasta", "llave_movil", "protocolo",
        "topico_mqtt", "checksum",
    ):
        assert campo in llave, f"falta el campo {campo!r} en yale_lock"

    assert llave["estado"] == ESTADO_ACTIVA == "ACTIVA"
    assert llave["tipo_permiso"] == "HUESPED_TEMPORAL"
    assert llave["protocolo"] == PROTOCOLO
    assert llave["id_habitacion"] == 101
    assert llave["id_reserva_asociada"] == 42


def test_vigencia_respeta_estandar_hotelero():
    llave = _llave()
    assert llave["valido_desde"] == f"{_ENTRADA}T15:00:00"
    assert llave["valido_hasta"] == f"{_SALIDA}T11:00:00"
    assert llave["valido_desde"] < llave["valido_hasta"]


def test_toppico_mqtt_incluye_la_habitacion():
    llave = _llave(id_habitacion=101)
    assert llave["topico_mqtt"] == (
        "hotel/facile/cerraduras/101/comando/provisionar_pin"
    )


def test_fechas_invalidas_no_tumban_el_checkin():
    llave = _llave(fecha_entrada="no-es-fecha", fecha_salida="tampoco")
    assert llave["pin_temporal"].isdigit()
    assert llave["valido_desde"] is None
    assert llave["valido_hasta"] is None
    assert esta_vigente(llave) is True


def test_checksum_es_reproducible():
    llave = _llave()
    assert llave["checksum"] == _checksum(llave)
    assert len(llave["checksum"]) == 14


def test_checksum_detecta_alteracion_del_pin():
    llave = _llave()
    manipulada = dict(llave, pin_temporal="111111")
    assert manipulada["pin_temporal"] != llave["pin_temporal"]
    assert _checksum(manipulada) != llave["checksum"]


def test_checksum_detecta_alteracion_de_la_habitacion():
    llave = _llave()
    manipulada = dict(llave, id_habitacion=999)
    assert _checksum(manipulada) != llave["checksum"]


def test_llave_movil_se_genera_con_correo():
    llave = _llave(correo_huesped="guest@hotel.co")
    assert llave["llave_movil"] is not None
    assert llave["transaccion_id"] in llave["llave_movil"]
    assert llave["pin_temporal"] in llave["llave_movil"]
    assert llave["correo_notificacion"] == "guest@hotel.co"
    assert llave["envio_guest_sms"] is True


def test_llave_movil_nula_sin_correo():
    llave = _llave(correo_huesped=None)
    assert llave["llave_movil"] is None
    assert llave["correo_notificacion"] is None
    assert llave["envio_guest_sms"] is False
    assert llave["pin_temporal"].isdigit()


def test_llave_movil_nula_con_correo_vacio():
    llave = _llave(correo_huesped="")
    assert llave["llave_movil"] is None


def test_esta_vigente_antes_del_checkout():
    llave = _llave()
    dentro = datetime.fromisoformat(f"{_ENTRADA}T18:00:00")
    assert esta_vigente(llave, instante=dentro) is True


def test_no_esta_vigente_tras_el_checkout():
    llave = _llave()
    tarde = datetime.fromisoformat(f"{_SALIDA}T11:00:01")
    assert esta_vigente(llave, instante=tarde) is False


def test_esta_vigente_falso_sin_paquete():
    assert esta_vigente(None) is False
    assert esta_vigente({}) is False
