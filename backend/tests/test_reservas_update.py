"""
backend/tests/test_reservas_update.py

Fase 3 — RF-013: modificación de una reserva existente (fechas, unidad y notas).

Reglas cubiertas:
- Se recalculan noches y descuento con la política única del sistema.
- El cambio de unidad se refleja en la reserva y en su folio.
- Un solapamiento con otra reserva se rechaza con 409 y NO deja cambios a medias.
- Una reserva en Check-In / Completada es inmutable (409).
- No se puede mover una reserva a una unidad en Mantenimiento.
- Edición restringida a Administrador / Recepcionista 24h.
- El check-out devuelve el saldo pendiente (maduración Fase 3).
"""
import uuid


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------

def _year_unico():
    """Año lejano y aleatorio para no colisionar con el GiST de otras pruebas."""
    return 6000 + (uuid.uuid4().int % 3000)


def _habitaciones_disponibles(client, headers):
    res = client.get("/api/habitaciones", headers=headers)
    assert res.status_code == 200, res.text
    return [h for h in res.json() if h["estado"] == "Disponible"]


def _crear_reserva(client, headers, id_habitacion, entrada, salida):
    res = client.post(
        "/api/reservas",
        json={
            "id_huesped": 1,
            "id_habitacion": id_habitacion,
            "fecha_entrada": entrada,
            "fecha_salida": salida,
            "numero_personas": 1,
        },
        headers=headers,
    )
    assert res.status_code == 201, res.text
    return res.json()["reserva"]


def _restaurar_habitacion(client, headers, id_habitacion):
    client.patch(
        f"/api/habitaciones/{id_habitacion}/estado",
        json={"estado": "Disponible"},
        headers=headers,
    )


# ---------------------------------------------------------------------------
# RF-013 — edición de la reserva
# ---------------------------------------------------------------------------

def test_actualizar_fechas_recalcula_cotizacion(client, admin_token):
    """Ampliar la estadía recalcula noches y descuento, y el folio coincide."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    hab = _habitaciones_disponibles(client, headers)[0]
    year = _year_unico()

    reserva = _crear_reserva(
        client, headers, hab["id_habitacion"], f"{year}-03-01", f"{year}-03-04"
    )

    nuevo_fin = f"{year}-03-12"  # 11 noches → tramo de descuento del 10 %
    res = client.patch(
        f"/api/reservas/{reserva['id_reserva']}",
        json={"fecha_entrada": f"{year}-03-01", "fecha_salida": nuevo_fin},
        headers=headers,
    )
    assert res.status_code == 200, res.text
    data = res.json()

    assert data["reserva"]["fecha_salida"] == nuevo_fin
    assert data["reserva"]["estado"] == "Confirmada"
    assert data["cotizacion"]["noches"] == 11
    assert data["cotizacion"]["descuento"] > 0

    # El folio (que es la fuente de verdad financiera) devuelve lo mismo.
    folio = client.get(f"/api/reservas/{reserva['id_reserva']}/folio", headers=headers).json()
    assert folio["cotizacion"]["noches"] == 11
    assert folio["cotizacion"]["total"] == data["cotizacion"]["total"]


def test_actualizar_unidad_de_la_reserva(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    disponibles = _habitaciones_disponibles(client, headers)
    assert len(disponibles) >= 2, "Se necesitan al menos dos unidades disponibles"

    origen, destino = disponibles[0], disponibles[1]
    year = _year_unico()
    reserva = _crear_reserva(
        client, headers, origen["id_habitacion"], f"{year}-05-01", f"{year}-05-03"
    )

    res = client.patch(
        f"/api/reservas/{reserva['id_reserva']}",
        json={"id_habitacion": destino["id_habitacion"]},
        headers=headers,
    )
    assert res.status_code == 200, res.text
    data = res.json()

    assert data["reserva"]["id_habitacion"] == destino["id_habitacion"]
    assert data["reserva"]["habitacion_numero"] == destino["numero"]


def test_actualizar_observaciones(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    hab = _habitaciones_disponibles(client, headers)[0]
    year = _year_unico()
    reserva = _crear_reserva(
        client, headers, hab["id_habitacion"], f"{year}-06-01", f"{year}-06-03"
    )

    nota = "Llegada después de las 22:00. Cuna para bebé."
    res = client.patch(
        f"/api/reservas/{reserva['id_reserva']}",
        json={"observaciones": nota},
        headers=headers,
    )
    assert res.status_code == 200, res.text
    assert res.json()["reserva"]["observaciones"] == nota

    listado = client.get("/api/reservas", headers=headers).json()
    fila = next(r for r in listado if r["id_reserva"] == reserva["id_reserva"])
    assert fila["observaciones"] == nota


def test_solapamiento_al_editar_devuelve_409_y_no_cambia_nada(client, admin_token):
    """Si el nuevo rango choca con otra reserva, el GiST aborta y nada queda a medias."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    hab = _habitaciones_disponibles(client, headers)[0]
    year = _year_unico()

    primera = _crear_reserva(
        client, headers, hab["id_habitacion"], f"{year}-07-01", f"{year}-07-05"
    )
    segunda = _crear_reserva(
        client, headers, hab["id_habitacion"], f"{year}-07-10", f"{year}-07-12"
    )

    # Intentar mover la segunda encima de la primera
    res = client.patch(
        f"/api/reservas/{segunda['id_reserva']}",
        json={"fecha_entrada": f"{year}-07-03", "fecha_salida": f"{year}-07-06"},
        headers=headers,
    )
    assert res.status_code == 409, res.text
    assert "Double Booking" in res.json()["detail"]

    # La reserva conserva sus fechas originales
    listado = client.get("/api/reservas", headers=headers).json()
    sin_cambios = next(r for r in listado if r["id_reserva"] == segunda["id_reserva"])
    assert sin_cambios["fecha_entrada"] == f"{year}-07-10"
    assert sin_cambios["fecha_salida"] == f"{year}-07-12"
    assert primera["id_reserva"] != segunda["id_reserva"]


def test_no_se_edita_una_reserva_en_checkin(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    hab = _habitaciones_disponibles(client, headers)[0]
    year = _year_unico()

    reserva = _crear_reserva(
        client, headers, hab["id_habitacion"], f"{year}-08-01", f"{year}-08-03"
    )
    try:
        checkin = client.patch(
            f"/api/reservas/{reserva['id_reserva']}/estado",
            json={"estado": "Check-In"},
            headers=headers,
        )
        assert checkin.status_code == 200, checkin.text

        res = client.patch(
            f"/api/reservas/{reserva['id_reserva']}",
            json={"fecha_salida": f"{year}-08-05"},
            headers=headers,
        )
        assert res.status_code == 409
        assert "Check-In" in res.json()["detail"]
    finally:
        client.delete(f"/api/reservas/{reserva['id_reserva']}", headers=headers)
        _restaurar_habitacion(client, headers, hab["id_habitacion"])


def test_no_se_mueve_a_una_unidad_en_mantenimiento(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    disponibles = _habitaciones_disponibles(client, headers)
    origen, destino = disponibles[0], disponibles[1]
    year = _year_unico()
    reserva = _crear_reserva(
        client, headers, origen["id_habitacion"], f"{year}-09-01", f"{year}-09-03"
    )

    client.patch(
        f"/api/habitaciones/{destino['id_habitacion']}/estado",
        json={"estado": "Mantenimiento", "detalle_mantenimiento": "Prueba RF-013"},
        headers=headers,
    )
    try:
        res = client.patch(
            f"/api/reservas/{reserva['id_reserva']}",
            json={"id_habitacion": destino["id_habitacion"]},
            headers=headers,
        )
        assert res.status_code == 400, res.text
        assert "Mantenimiento" in res.json()["detail"]
    finally:
        _restaurar_habitacion(client, headers, destino["id_habitacion"])


def test_patch_sin_campos_devuelve_400(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.patch("/api/reservas/1", json={}, headers=headers)
    assert res.status_code == 400
    assert "al menos un campo" in res.json()["detail"].lower()


def test_edicion_restringida_a_roles(client, amallaves_token):
    headers = {"Authorization": f"Bearer {amallaves_token}"}
    res = client.patch("/api/reservas/1", json={"observaciones": "x"}, headers=headers)
    assert res.status_code == 403


# ---------------------------------------------------------------------------
# Maduración Fase 3 — el check-out informa el saldo pendiente
# ---------------------------------------------------------------------------

def test_checkout_devuelve_saldo_pendiente(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    hab = _habitaciones_disponibles(client, headers)[0]
    year = _year_unico()
    reserva = _crear_reserva(
        client, headers, hab["id_habitacion"], f"{year}-10-01", f"{year}-10-04"
    )
    id_res = reserva["id_reserva"]

    try:
        assert client.patch(
            f"/api/reservas/{id_res}/estado", json={"estado": "Check-In"}, headers=headers
        ).status_code == 200

        res = client.patch(
            f"/api/reservas/{id_res}/estado", json={"estado": "Completada"}, headers=headers
        )
        assert res.status_code == 200, res.text
        folio = res.json()["folio"]

        assert folio["total"] > 0
        assert folio["pagado"] == 0
        assert folio["saldo"] == folio["total"]
        assert folio["estado_pago"] == "Pendiente"
    finally:
        client.delete(f"/api/reservas/{id_res}", headers=headers)
        _restaurar_habitacion(client, headers, hab["id_habitacion"])


def test_checkout_con_pago_total_cierra_el_saldo(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    hab = _habitaciones_disponibles(client, headers)[0]
    year = _year_unico()
    reserva = _crear_reserva(
        client, headers, hab["id_habitacion"], f"{year}-11-01", f"{year}-11-03"
    )
    id_res = reserva["id_reserva"]

    try:
        total = client.get(f"/api/reservas/{id_res}/folio", headers=headers).json()["totales"]["total"]
        pago = client.post(
            f"/api/reservas/{id_res}/pagos",
            json={"monto": total, "metodo": "Efectivo"},
            headers=headers,
        )
        assert pago.status_code == 201, pago.text

        assert client.patch(
            f"/api/reservas/{id_res}/estado", json={"estado": "Check-In"}, headers=headers
        ).status_code == 200

        res = client.patch(
            f"/api/reservas/{id_res}/estado", json={"estado": "Completada"}, headers=headers
        )
        assert res.status_code == 200, res.text
        folio = res.json()["folio"]

        assert folio["saldo"] == 0
        assert folio["pagado"] == folio["total"]
        assert folio["estado_pago"] == "Pagado"
    finally:
        client.delete(f"/api/reservas/{id_res}", headers=headers)
        _restaurar_habitacion(client, headers, hab["id_habitacion"])
