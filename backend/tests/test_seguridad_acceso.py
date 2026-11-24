"""
backend/tests/test_seguridad_acceso.py

Fase C — Hallazgos de seguridad del análisis de arquitectura:

- H-01: `DELETE /api/reservas/{id}` exige autenticación y rol operativo.
  Antes usaba `autenticar_opcional`, por lo que cualquier cliente sin token
  podía cancelar una reserva conociendo únicamente su identificador.
- H-02: `GET /api/habitaciones` exige rol operativo. El inventario completo
  (detalle de mantenimiento y quién lo modificó) no debe ser legible sin sesión.
  El portal público consume `GET /api/habitaciones/publicas`, que devuelve un
  catálogo mínimo sin datos internos.
"""
import uuid


def _reserva_de_prueba(client, admin_token):
    """Crea una reserva cancelable y retorna (id_reserva, id_habitacion)."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    habs = client.get("/api/habitaciones/publicas").json()
    hab = next(h for h in habs if h["estado"] in ("Disponible", "En limpieza"))
    year = 5000 + (uuid.uuid4().int % 3000)
    res = client.post("/api/reservas", json={
        "id_huesped": 1,
        "id_habitacion": hab["id_habitacion"],
        "fecha_entrada": f"{year}-02-01",
        "fecha_salida": f"{year}-02-03",
        "numero_personas": 1,
    }, headers=headers)
    assert res.status_code == 201, res.text
    return res.json()["reserva"]["id_reserva"], hab["id_habitacion"]


def test_delete_reserva_requiere_token(client, admin_token):
    """H-01 — Sin token no se puede cancelar ninguna reserva."""
    res = client.delete("/api/reservas/1")
    assert res.status_code in (401, 403), res.text


def test_delete_reserva_con_rol_operativo(client, admin_token):
    """H-01 — El personal operativo sí puede cancelar (regresión del flujo normal)."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    id_reserva, id_habitacion = _reserva_de_prueba(client, admin_token)
    try:
        res = client.delete(f"/api/reservas/{id_reserva}", headers=headers)
        assert res.status_code == 200, res.text
        assert "cancelada exitosamente" in res.json()["message"]
    finally:
        client.patch(
            f"/api/habitaciones/{id_habitacion}/estado",
            json={"estado": "Disponible"},
            headers=headers,
        )


def test_habitaciones_completas_requieren_rol(client):
    """H-02 — Sin sesión no se lee el inventario completo."""
    res = client.get("/api/habitaciones")
    assert res.status_code in (401, 403), res.text


def test_habitaciones_publicas_sin_sesion(client):
    """H-02 — El portal público sí puede listar el catálogo mínimo."""
    res = client.get("/api/habitaciones/publicas")
    assert res.status_code == 200, res.text
    habs = res.json()
    assert habs, "El catálogo público no debería estar vacío"

    # Debe traer lo necesario para reservar y NADA de datos internos.
    muestra = habs[0]
    for campo in ("id_habitacion", "numero", "tipo", "capacidad", "precio_noche", "estado"):
        assert campo in muestra, f"Falta el campo público '{campo}'"
    for campo_prohibido in ("detalle_mantenimiento", "modificado_por"):
        assert campo_prohibido not in muestra, f"El catálogo público expone '{campo_prohibido}'"


def test_habitaciones_completas_con_rol(client, admin_token):
    """H-02 — El rol operativo mantiene acceso al inventario completo."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.get("/api/habitaciones", headers=headers)
    assert res.status_code == 200, res.text
    muestra = res.json()[0]
    assert "detalle_mantenimiento" in muestra
    assert "modificado_por" in muestra


def test_sesion_de_huesped_no_otorga_inventario_completo(client):
    """H-02 — La sesión de huésped no emite JWT, así que el portal usa el catálogo público."""
    login = client.post("/api/user/login", json={
        "documento_o_correo": "john.doe@example.com",
        "password": "john123",
    })
    assert login.status_code == 200, login.text
    cuerpo = login.json()
    # El login de huésped no devuelve credencial: no hay con qué pedir el inventario completo.
    assert "access_token" not in cuerpo and "token" not in cuerpo

    res = client.get("/api/habitaciones")
    assert res.status_code in (401, 403), res.text

    publicas = client.get("/api/habitaciones/publicas")
    assert publicas.status_code == 200
    assert publicas.json()
