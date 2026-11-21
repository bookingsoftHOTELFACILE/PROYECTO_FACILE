"""
backend/tests/test_centro_negocios.py

Fase 3 — RF-015: reserva de salas de juntas y puestos de coworking por horas.

Cubre la lógica del endpoint que ya consumía el SPA y que hasta ahora no tenía
pruebas automatizadas:
- Catálogo de espacios (salas y coworking).
- Tarifa por horas y paquetes con descuento (bloque de 4 h y día completo de 8 h).
- Rechazo de solapamientos en el mismo espacio y fecha.
- Validación de horario (fin > inicio, formato HH:MM) y espacio inexistente.
- La baja lógica libera el horario para una nueva reserva.
"""
import uuid


def _fecha_unica():
    """Fecha lejana y aleatoria para no chocar con otras reservas de negocio."""
    return f"{6000 + (uuid.uuid4().int % 2000)}-09-{1 + (uuid.uuid4().int % 25):02d}"


def _espacios(client):
    res = client.get("/api/centro-negocios/espacios")
    assert res.status_code == 200, res.text
    return res.json()


def _espacio(client, tipo):
    return next(e for e in _espacios(client) if e["tipo"] == tipo)


def _crear(client, headers, id_espacio, fecha, hora_inicio, hora_fin):
    return client.post(
        "/api/centro-negocios/reservas",
        json={
            "id_espacio": id_espacio,
            "tipo_cliente": "Cliente Externo",
            "nombre_cliente": "Cliente Prueba Fase 3",
            "documento_cliente": "900123456",
            "correo_cliente": "cliente.fase3@example.com",
            "fecha": fecha,
            "hora_inicio": hora_inicio,
            "hora_fin": hora_fin,
            "observaciones": "Reserva creada por la suite de pruebas",
        },
        headers=headers,
    )


# ---------------------------------------------------------------------------
# Catálogo
# ---------------------------------------------------------------------------

def test_listar_espacios_del_centro_de_negocios(client):
    espacios = _espacios(client)
    tipos = {e["tipo"] for e in espacios}

    assert len(espacios) >= 3
    assert tipos == {"Sala de Juntas", "Coworking"}
    assert all(float(e["precio_hora"]) > 0 for e in espacios)


# ---------------------------------------------------------------------------
# Tarifas por horas y paquetes
# ---------------------------------------------------------------------------

def test_tarifa_por_hora_sala_de_juntas(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    sala = _espacio(client, "Sala de Juntas")

    res = _crear(client, headers, sala["id_espacio"], _fecha_unica(), "09:00", "11:00")
    assert res.status_code == 201, res.text
    data = res.json()

    assert data["duracion_horas"] == 2
    assert data["precio_total"] == 2 * float(sala["precio_hora"])


def test_bloque_de_4_horas_sala_de_juntas(client, admin_token):
    """El paquete de 4 h (250.000) es más barato que 4 × tarifa/hora."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    sala = _espacio(client, "Sala de Juntas")

    res = _crear(client, headers, sala["id_espacio"], _fecha_unica(), "08:00", "12:00")
    assert res.status_code == 201, res.text

    assert res.json()["duracion_horas"] == 4
    assert res.json()["precio_total"] == 250000.0


def test_dia_completo_sala_de_juntas(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    sala = _espacio(client, "Sala de Juntas")

    res = _crear(client, headers, sala["id_espacio"], _fecha_unica(), "08:00", "16:00")
    assert res.status_code == 201, res.text

    assert res.json()["duracion_horas"] == 8
    assert res.json()["precio_total"] == 450000.0


def test_bloque_de_4_horas_coworking(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    coworking = _espacio(client, "Coworking")

    res = _crear(client, headers, coworking["id_espacio"], _fecha_unica(), "10:00", "14:00")
    assert res.status_code == 201, res.text

    assert res.json()["duracion_horas"] == 4
    assert res.json()["precio_total"] == 70000.0


def test_dia_completo_coworking(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    coworking = _espacio(client, "Coworking")

    res = _crear(client, headers, coworking["id_espacio"], _fecha_unica(), "09:00", "17:00")
    assert res.status_code == 201, res.text

    assert res.json()["duracion_horas"] == 8
    assert res.json()["precio_total"] == 100000.0


# ---------------------------------------------------------------------------
# Reglas de agenda
# ---------------------------------------------------------------------------

def test_solapamiento_en_el_mismo_espacio_devuelve_409(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    sala = _espacio(client, "Sala de Juntas")
    fecha = _fecha_unica()

    assert _crear(client, headers, sala["id_espacio"], fecha, "09:00", "11:00").status_code == 201

    solapada = _crear(client, headers, sala["id_espacio"], fecha, "10:30", "12:00")
    assert solapada.status_code == 409
    assert "ya se encuentra reservado" in solapada.json()["detail"]


def test_horarios_contiguos_estan_permitidos(client, admin_token):
    """Terminar a las 11:00 y empezar a las 11:00 no es solapamiento."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    coworking = _espacio(client, "Coworking")
    fecha = _fecha_unica()

    assert _crear(client, headers, coworking["id_espacio"], fecha, "08:00", "11:00").status_code == 201
    assert _crear(client, headers, coworking["id_espacio"], fecha, "11:00", "13:00").status_code == 201


def test_hora_fin_anterior_o_igual_es_rechazada(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    sala = _espacio(client, "Sala de Juntas")

    res = _crear(client, headers, sala["id_espacio"], _fecha_unica(), "12:00", "12:00")
    assert res.status_code == 400
    assert "posterior a la hora de inicio" in res.json()["detail"]


def test_formato_de_hora_invalido_es_rechazado(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    sala = _espacio(client, "Sala de Juntas")

    res = _crear(client, headers, sala["id_espacio"], _fecha_unica(), "25:99", "26:00")
    assert res.status_code == 400
    assert "Formato de hora inválido" in res.json()["detail"]


def test_espacio_inexistente_devuelve_404(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = _crear(client, headers, 999999, _fecha_unica(), "09:00", "10:00")
    assert res.status_code == 404
    assert "no existe" in res.json()["detail"]


def test_cancelar_libera_el_horario(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    sala = _espacio(client, "Sala de Juntas")
    fecha = _fecha_unica()

    creada = _crear(client, headers, sala["id_espacio"], fecha, "14:00", "16:00")
    assert creada.status_code == 201, creada.text
    id_reserva = creada.json()["id_reserva_negocio"]

    assert client.delete(
        f"/api/centro-negocios/reservas/{id_reserva}", headers=headers
    ).status_code == 200

    # El horario queda libre: la baja es lógica ('Cancelada' no bloquea).
    repetida = _crear(client, headers, sala["id_espacio"], fecha, "14:00", "16:00")
    assert repetida.status_code == 201, repetida.text
