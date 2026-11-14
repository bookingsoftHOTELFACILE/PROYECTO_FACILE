"""
backend/tests/test_checkin_checkout.py

HU-005 — Check-in y Check-out (RF de reservas y ocupación).

Criterios de aceptación cubiertos:
- CA-005.1: registrar la fecha y hora reales del check-in.
- CA-005.2: check-in directo para llegadas sin reserva previa (walk-in).
- CA-005.3: rechazar el check-in si la unidad está ocupada o en mantenimiento.
- CA-005.4: registrar la fecha y hora reales del check-out.
- CA-005.5: calcular las noches de la estadía entre entrada y salida.

Todos los tests devuelven la base al estado previo (reserva cancelada y
estado de habitación original) para no contaminar los demás suites.
"""
import uuid


def _year_unico():
    """Año lejano y aleatorio para no colisionar con el GiST de otras pruebas."""
    return 4000 + (uuid.uuid4().int % 5000)


def _habitacion_libre(client, headers):
    """Retorna la primera habitación que admite check-in ('Disponible' o 'En limpieza')."""
    res = client.get("/api/habitaciones", headers=headers)
    assert res.status_code == 200, res.text
    for hab in res.json():
        if hab["estado"] in ("Disponible", "En limpieza"):
            return hab
    raise AssertionError("No hay habitaciones libres para la prueba.")


def _crear_reserva(client, headers, hab, fecha_entrada, fecha_salida, extra=None):
    payload = {
        "id_huesped": 1,
        "id_habitacion": hab["id_habitacion"],
        "fecha_entrada": fecha_entrada,
        "fecha_salida": fecha_salida,
        "numero_personas": 1,
    }
    if extra:
        payload.update(extra)
    res = client.post("/api/reservas", json=payload, headers=headers)
    return res


def _restaurar(client, headers, id_reserva, id_habitacion, estado_original):
    """Cancela la reserva de prueba y devuelve la habitación a su estado original."""
    if id_reserva:
        client.delete(f"/api/reservas/{id_reserva}", headers=headers)
    if id_habitacion and estado_original:
        client.patch(
            f"/api/habitaciones/{id_habitacion}/estado",
            json={"estado": estado_original},
            headers=headers,
        )


def test_checkin_registra_entrada_y_ocupa_unidad(client, admin_token):
    """CA-005.1 — El check-in marca la hora real y deja la unidad en 'Ocupada'."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    hab = _habitacion_libre(client, headers)
    estado_original = hab["estado"]
    id_reserva = None
    try:
        year = _year_unico()
        res = _crear_reserva(client, headers, hab, f"{year}-03-01", f"{year}-03-04")
        assert res.status_code == 201, res.text
        id_reserva = res.json()["reserva"]["id_reserva"]
        assert res.json()["reserva"]["estado"] == "Confirmada"

        out = client.patch(
            f"/api/reservas/{id_reserva}/estado",
            json={"estado": "Check-In"},
            headers=headers,
        )
        assert out.status_code == 200, out.text
        body = out.json()
        assert body["reserva"]["estado"] == "Check-In"
        assert body["reserva"]["checkin_at"], "CA-005.1: falta la marca temporal de entrada"
        assert body["habitacion"]["estado"] == "Ocupada"

        # El listado del PMS expone la misma marca temporal (GET /api/reservas).
        lista = client.get("/api/reservas", headers=headers).json()
        fila = next(r for r in lista if r["id_reserva"] == id_reserva)
        assert fila["estado"] == "Check-In"
        assert fila["checkin_at"]
        assert fila["checkout_at"] is None
    finally:
        _restaurar(client, headers, id_reserva, hab["id_habitacion"], estado_original)


def test_checkin_rechaza_unidad_ocupada(client, admin_token):
    """CA-005.3 — No se permite check-in en una unidad que ya está ocupada."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    hab = _habitacion_libre(client, headers)
    estado_original = hab["estado"]
    id_reserva = None
    try:
        # La unidad pasa a ocupada (otro huésped ya está dentro).
        client.patch(
            f"/api/habitaciones/{hab['id_habitacion']}/estado",
            json={"estado": "Ocupada"},
            headers=headers,
        )

        year = _year_unico()
        res = _crear_reserva(client, headers, hab, f"{year}-04-01", f"{year}-04-03")
        assert res.status_code == 201, res.text
        id_reserva = res.json()["reserva"]["id_reserva"]

        out = client.patch(
            f"/api/reservas/{id_reserva}/estado",
            json={"estado": "Check-In"},
            headers=headers,
        )
        assert out.status_code == 400, out.text
        assert "ocupada" in out.json()["detail"].lower()
    finally:
        _restaurar(client, headers, id_reserva, hab["id_habitacion"], estado_original)


def test_checkout_registra_salida_calcula_noches_y_libera_unidad(client, admin_token):
    """CA-005.4 / CA-005.5 — Check-out con hora real, noches calculadas y unidad a limpieza."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    hab = _habitacion_libre(client, headers)
    estado_original = hab["estado"]
    id_reserva = None
    try:
        year = _year_unico()
        res = _crear_reserva(client, headers, hab, f"{year}-05-01", f"{year}-05-03")  # 2 noches
        assert res.status_code == 201, res.text
        id_reserva = res.json()["reserva"]["id_reserva"]

        assert client.patch(
            f"/api/reservas/{id_reserva}/estado",
            json={"estado": "Check-In"},
            headers=headers,
        ).status_code == 200

        out = client.patch(
            f"/api/reservas/{id_reserva}/estado",
            json={"estado": "Completada"},
            headers=headers,
        )
        assert out.status_code == 200, out.text
        body = out.json()
        assert body["reserva"]["estado"] == "Completada"
        assert body["reserva"]["checkout_at"], "CA-005.4: falta la marca temporal de salida"
        assert body["reserva"]["noches"] == 2, "CA-005.5: noches mal calculadas"
        assert body["habitacion"]["estado"] == "En limpieza"
    finally:
        _restaurar(client, headers, id_reserva, hab["id_habitacion"], estado_original)


def test_transicion_invalida_se_rechaza(client, admin_token):
    """El ciclo de vida es 'Confirmada -> Check-In -> Completada'; saltarlo devuelve 409."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    hab = _habitacion_libre(client, headers)
    estado_original = hab["estado"]
    id_reserva = None
    try:
        year = _year_unico()
        res = _crear_reserva(client, headers, hab, f"{year}-06-01", f"{year}-06-03")
        assert res.status_code == 201, res.text
        id_reserva = res.json()["reserva"]["id_reserva"]

        # Confirmada -> Completada directamente (sin pasar por check-in).
        out = client.patch(
            f"/api/reservas/{id_reserva}/estado",
            json={"estado": "Completada"},
            headers=headers,
        )
        assert out.status_code == 409, out.text
        assert "check-out" in out.json()["detail"].lower()

        # Reserva inexistente -> 404.
        missing = client.patch(
            "/api/reservas/99999999/estado",
            json={"estado": "Check-In"},
            headers=headers,
        )
        assert missing.status_code == 404
    finally:
        _restaurar(client, headers, id_reserva, hab["id_habitacion"], estado_original)


def test_checkin_directo_walk_in(client, admin_token):
    """CA-005.2 — El personal operativo puede registrar el check-in al crear la reserva."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    hab = _habitacion_libre(client, headers)
    estado_original = hab["estado"]
    id_reserva = None
    try:
        year = _year_unico()
        res = _crear_reserva(
            client, headers, hab,
            f"{year}-07-01", f"{year}-07-03",
            extra={"checkin_inmediato": True},
        )
        assert res.status_code == 201, res.text
        body = res.json()
        id_reserva = body["reserva"]["id_reserva"]
        assert body["reserva"]["estado"] == "Check-In"
        assert body["reserva"]["checkin_at"]
        assert "Check-in directo" in body["message"]

        hab_actualizada = next(
            h for h in client.get("/api/habitaciones", headers=headers).json()
            if h["id_habitacion"] == hab["id_habitacion"]
        )
        assert hab_actualizada["estado"] == "Ocupada"
    finally:
        _restaurar(client, headers, id_reserva, hab["id_habitacion"], estado_original)


def test_checkin_directo_bloqueado_para_publico(client, admin_token):
    """CA-005.2 / seguridad: el público no autenticado no puede forzar un check-in."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    hab = _habitacion_libre(client, headers)
    estado_original = hab["estado"]
    id_reserva = None
    try:
        year = _year_unico()

        # Reserva pública SIN token y con check-in directo -> rechazada.
        res = client.post(
            "/api/reservas",
            json={
                "id_huesped": 1,
                "id_habitacion": hab["id_habitacion"],
                "fecha_entrada": f"{year}-08-01",
                "fecha_salida": f"{year}-08-03",
                "numero_personas": 1,
                "checkin_inmediato": True,
            },
        )
        assert res.status_code == 403, res.text
        assert "personal autorizado" in res.json()["detail"].lower()

        # Regresión: la reserva pública normal (web) sigue funcionando sin token.
        publica = client.post(
            "/api/reservas",
            json={
                "id_huesped": 1,
                "id_habitacion": hab["id_habitacion"],
                "fecha_entrada": f"{year}-09-01",
                "fecha_salida": f"{year}-09-03",
                "numero_personas": 1,
            },
        )
        assert publica.status_code == 201, publica.text
        id_reserva = publica.json()["reserva"]["id_reserva"]
        assert publica.json()["reserva"]["estado"] == "Confirmada"
        assert publica.json()["reserva"]["checkin_at"] is None
    finally:
        _restaurar(client, headers, id_reserva, hab["id_habitacion"], estado_original)


def test_cambiar_estado_requiere_autenticacion(client):
    """PATCH /api/reservas/{id}/estado exige JWT (RF-009)."""
    res = client.patch(
        "/api/reservas/1/estado",
        json={"estado": "Check-In"},
    )
    assert res.status_code == 401, res.text
