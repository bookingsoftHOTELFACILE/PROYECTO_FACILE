"""
backend/tests/test_pagos.py

Fase 2 — Módulo financiero: folio con IVA desglosado, cobros vía pasarela
(simulada), anulación con RBAC y factura electrónica SIMULADA UBL 2.1.

Reglas cubiertas:
- IVA 19% incluido en la tarifa: base + iva == total (el total NO sube).
- Sólo los pagos 'Confirmado' descuentan del saldo (rechazados y anulados no).
- El monto no puede superar el saldo (anti doble captura).
- Cobro restringido a Administrador / Recepcionista; anulación sólo Administrador.
- Reserva cancelada: sin cobros ni factura.
"""
import uuid
from xml.etree import ElementTree

UBl_NS = {"cbc": "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"}


def _crear_reserva(client, admin_token, noches=5):
    """Crea una reserva de prueba sobre la habitación 101A y devuelve su payload."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    habs = client.get("/api/habitaciones", headers=headers).json()
    hab = next(h for h in habs if h["numero"] == "101A")

    year = 3000 + (uuid.uuid4().int % 1000)
    dia = 1 + (uuid.uuid4().int % 20)
    entrada = f"{year}-06-{dia:02d}"
    salida = f"{year}-06-{(dia + noches):02d}"

    res = client.post(
        "/api/reservas",
        json={
            "id_huesped": 1,
            "id_habitacion": hab["id_habitacion"],
            "fecha_entrada": entrada,
            "fecha_salida": salida,
            "numero_personas": 2,
        },
        headers=headers,
    )
    assert res.status_code == 201, res.text
    return res.json()["reserva"]


def _pago(client, admin_token, id_reserva, monto, metodo="Efectivo", referencia=None):
    body = {"monto": monto, "metodo": metodo}
    if referencia is not None:
        body["referencia"] = referencia
    return client.post(
        f"/api/reservas/{id_reserva}/pagos", json=body,
        headers={"Authorization": f"Bearer {admin_token}"},
    )


# ==============================================================================
# 1. FOLIO
# ==============================================================================

def test_folio_desglosa_iva_y_saldo(client, admin_token):
    """El folio desglosa el IVA 19% ya incluido: base + iva == total y saldo == total."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    reserva = _crear_reserva(client, admin_token)

    res = client.get(f"/api/reservas/{reserva['id_reserva']}/folio", headers=headers)
    assert res.status_code == 200, res.text
    folio = res.json()

    # Estructura del folio
    assert folio["reserva"]["id_reserva"] == reserva["id_reserva"]
    assert folio["estado_pago"] == "Pendiente"
    assert folio["pagos"] == []

    cot = folio["cotizacion"]
    iva = folio["iva"]
    totales = folio["totales"]

    # La cotización del folio respeta la política única de descuento
    assert cot["total"] == round(cot["subtotal"] - cot["descuento"], 2)
    assert cot["noches"] == 5

    # IVA 19% incluido: desglose exacto sin alterar el total
    assert iva["iva_pct"] == 19
    assert iva["base"] + iva["iva"] == iva["total"]
    assert iva["total"] == cot["total"]

    # Sin cobros: todo el total sigue pendiente
    assert totales["pagado"] == 0
    assert totales["saldo"] == cot["total"]


def test_folio_devuelve_404_si_la_reserva_no_existe(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.get("/api/reservas/999999/folio", headers=headers)
    assert res.status_code == 404


# ==============================================================================
# 2. COBROS
# ==============================================================================

def test_pago_parcial_actualiza_saldo(client, admin_token):
    """Un cobro parcial confirma, descuenta del saldo y deja el folio en 'Parcial'."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    reserva = _crear_reserva(client, admin_token)
    id_res = reserva["id_reserva"]

    total = client.get(f"/api/reservas/{id_res}/folio", headers=headers).json()["totales"]["total"]
    mitad = round(total / 2, 2)

    res = _pago(client, admin_token, id_res, mitad, metodo="PSE", referencia="PSE-001")
    assert res.status_code == 201, res.text
    data = res.json()

    assert data["aprobado"] is True
    assert data["pago"]["estado"] == "Confirmado"
    assert data["pago"]["metodo"] == "PSE"
    assert data["pago"]["referencia"] == "PSE-001"
    assert data["pago"]["referencia_gateway"].startswith("SIM-")

    folio = data["folio"]
    assert folio["totales"]["pagado"] == mitad
    assert folio["totales"]["saldo"] == round(total - mitad, 2)
    assert folio["estado_pago"] == "Parcial"


def test_pago_total_deja_el_folio_pagado(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    id_res = _crear_reserva(client, admin_token)["id_reserva"]

    total = client.get(f"/api/reservas/{id_res}/folio", headers=headers).json()["totales"]["total"]
    res = _pago(client, admin_token, id_res, total, metodo="Tarjeta de débito")
    assert res.status_code == 201, res.text

    folio = res.json()["folio"]
    assert folio["totales"]["saldo"] == 0
    assert folio["estado_pago"] == "Pagado"


def test_pago_monto_mayor_al_saldo_se_rechaza(client, admin_token):
    """Nunca se puede cobrar más del saldo pendiente (anti doble captura)."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    id_res = _crear_reserva(client, admin_token)["id_reserva"]

    total = client.get(f"/api/reservas/{id_res}/folio", headers=headers).json()["totales"]["total"]
    res = _pago(client, admin_token, id_res, total + 1000)
    assert res.status_code == 400
    assert "supera el saldo" in res.json()["detail"]


def test_pago_monto_no_positivo_se_rechaza(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    id_res = _crear_reserva(client, admin_token)["id_reserva"]

    res = _pago(client, admin_token, id_res, 0)
    assert res.status_code == 422  # validación pydantic (gt=0)


def test_cobro_rechazado_por_pasarela_no_descuenta(client, admin_token):
    """
    Un intento rechazado se registra para auditoría pero NO descuenta del saldo:
    la referencia que empieza con 'RECHAZO' simula una tarjeta declinada.
    """
    headers = {"Authorization": f"Bearer {admin_token}"}
    id_res = _crear_reserva(client, admin_token)["id_reserva"]

    total = client.get(f"/api/reservas/{id_res}/folio", headers=headers).json()["totales"]["total"]

    res = _pago(client, admin_token, id_res, total, metodo="Tarjeta de crédito",
                referencia="RECHAZO-4242")
    assert res.status_code == 201, res.text
    data = res.json()

    assert data["aprobado"] is False
    assert data["pago"]["estado"] == "Rechazado"
    assert data["folio"]["totales"]["pagado"] == 0
    assert data["folio"]["totales"]["saldo"] == total
    assert data["folio"]["estado_pago"] == "Pendiente"


def test_anular_pago_restaura_saldo(client, admin_token, amallaves_token):
    """Anular (sólo Administrador) restaura el saldo; Recepción/Ama de llaves: 403."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    id_res = _crear_reserva(client, admin_token)["id_reserva"]

    total = client.get(f"/api/reservas/{id_res}/folio", headers=headers).json()["totales"]["total"]
    res_pago = _pago(client, admin_token, id_res, total)
    assert res_pago.status_code == 201
    id_pago = res_pago.json()["pago"]["id_pago"]

    # RBAC: Ama de llaves no puede anular cobros
    res_forbidden = client.post(
        f"/api/reservas/{id_res}/pagos/{id_pago}/anular",
        headers={"Authorization": f"Bearer {amallaves_token}"},
    )
    assert res_forbidden.status_code == 403

    # Administrador sí: el saldo vuelve a estar disponible
    res_anular = client.post(
        f"/api/reservas/{id_res}/pagos/{id_pago}/anular", headers=headers
    )
    assert res_anular.status_code == 200, res_anular.text
    data = res_anular.json()

    assert data["pago"]["estado"] == "Anulado"
    assert data["folio"]["totales"]["pagado"] == 0
    assert data["folio"]["totales"]["saldo"] == total
    assert data["folio"]["estado_pago"] == "Pendiente"


def test_cobros_restringidos_a_roles(client, amallaves_token):
    """RF-009: el Ama de llaves no accede al folio ni a los cobros (403)."""
    headers = {"Authorization": f"Bearer {amallaves_token}"}
    assert client.get("/api/reservas/1/folio", headers=headers).status_code == 403
    assert client.post(
        "/api/reservas/1/pagos", json={"monto": 1000, "metodo": "Efectivo"}, headers=headers
    ).status_code == 403


def test_no_se_cobra_sobre_reserva_cancelada(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    id_res = _crear_reserva(client, admin_token)["id_reserva"]

    assert client.delete(f"/api/reservas/{id_res}", headers=headers).status_code == 200

    res = _pago(client, admin_token, id_res, 1000)
    assert res.status_code == 400
    assert "cancelada" in res.json()["detail"].lower()


# ==============================================================================
# 3. FACTURA ELECTRÓNICA SIMULADA (DIAN — borrador UBL 2.1)
# ==============================================================================

def test_factura_xml_simulada_es_descargable(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    id_res = _crear_reserva(client, admin_token)["id_reserva"]

    res = client.get(f"/api/reservas/{id_res}/factura.xml", headers=headers)
    assert res.status_code == 200, res.text
    assert res.headers["content-type"].startswith("application/xml")
    assert res.headers["X-Factura-Simulada"] == "true"
    assert f"FACT-{id_res:08d}" in res.headers["Content-Disposition"]
    assert len(res.headers["X-CUFE"]) == 64  # hash sha-256

    xml = res.text
    assert "DOCUMENTO SIMULADA" in xml or "DOCUMENTO SIMULADO" in xml
    assert "Invoice" in xml
    assert "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" in xml

    # Es XML bien formado y la factura desglosa el IVA
    raiz = ElementTree.fromstring(xml)
    nsp = {"cbc": UBl_NS["cbc"]}
    assert raiz.find("cbc:ID", nsp).text == f"FACT-{id_res:08d}"

    total = client.get(f"/api/reservas/{id_res}/folio", headers=headers).json()["totales"]["total"]
    payable = raiz.find(".//cbc:PayableAmount", nsp)
    assert abs(float(payable.text) - total) < 0.01


def test_factura_se_genera_una_sola_vez_y_se_puede_emitir(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    id_res = _crear_reserva(client, admin_token)["id_reserva"]

    primera = client.get(f"/api/reservas/{id_res}/factura.xml", headers=headers)
    assert primera.status_code == 200
    assert primera.headers["X-Factura-Estado"] == "Borrador"

    # Idempotente: la segunda llamada devuelve el MISMO documento
    segunda = client.get(f"/api/reservas/{id_res}/factura.xml", headers=headers)
    assert segunda.text == primera.text
    assert segunda.headers["X-CUFE"] == primera.headers["X-CUFE"]

    # ?emitir=true cambia el estado a Emitida (sigue siendo simulada)
    emitida = client.get(f"/api/reservas/{id_res}/factura.xml?emitir=true", headers=headers)
    assert emitida.headers["X-Factura-Estado"] == "Emitida"
    assert emitida.text == primera.text


def test_no_se_factura_una_reserva_cancelada(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    id_res = _crear_reserva(client, admin_token)["id_reserva"]

    assert client.delete(f"/api/reservas/{id_res}", headers=headers).status_code == 200
    res = client.get(f"/api/reservas/{id_res}/factura.xml", headers=headers)
    assert res.status_code == 400
