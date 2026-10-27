"""
backend/tests/test_reservas.py

Pruebas de integración para el módulo de reservas:
- Regla de negocio: descuento del 15% para estancias > 15 noches (RF-011).
- Regla de negocio: rechazo si número de personas supera la capacidad (RF-011).
- Concurrencia: EXCLUDE USING gist garantiza que dos reservas simultáneas para
  la misma habitación y fechas solapadas no puedan coexistir (RNF-009).
"""
import uuid
import concurrent.futures


def test_reserva_descuento(client, admin_token):
    """RF-011 / RN-011.2 — Descuento del 15% para estancias > 15 noches."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    hab_res = client.get("/api/habitaciones", headers=headers)
    assert hab_res.status_code == 200
    habs = hab_res.json()
    hab = next(h for h in habs if h["numero"] == "101A")

    year = 3000 + (uuid.uuid4().int % 1000)
    res_data = {
        "id_huesped": 1,
        "id_habitacion": hab["id_habitacion"],
        "fecha_entrada": f"{year}-01-01",
        "fecha_salida": f"{year}-01-17",   # 16 noches → aplica descuento
        "numero_personas": 2
    }
    response = client.post("/api/reservas", json=res_data, headers=headers)
    assert response.status_code == 201, response.text

    data = response.json()
    noches = data["cotizacion"]["noches"]
    subtotal = data["cotizacion"]["subtotal"]
    descuento = data["cotizacion"]["descuento"]

    assert noches == 16
    assert subtotal == 16 * hab["precio_noche"]
    assert descuento == subtotal * 0.15


def test_reserva_supera_capacidad(client, admin_token):
    """RF-011 / RN-011.4 — Rechazo si numero_personas > capacidad de la habitación."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    hab_res = client.get("/api/habitaciones", headers=headers)
    assert hab_res.status_code == 200
    habs = hab_res.json()
    hab = next(h for h in habs if h["numero"] == "101A")

    res_data = {
        "id_huesped": 1,
        "id_habitacion": hab["id_habitacion"],
        "fecha_entrada": "2030-02-01",
        "fecha_salida": "2030-02-05",
        "numero_personas": 5    # habitación 101A tiene capacidad para 2
    }
    response = client.post("/api/reservas", json=res_data, headers=headers)

    assert response.status_code == 400
    assert "Capacidad excedida" in response.json()["detail"]


def test_reserva_concurrencia_double_booking():
    """
    RNF-009 — Concurrencia: el EXCLUDE CONSTRAINT USING gist en PostgreSQL
    garantiza atomicidad. Dos hilos que intentan reservar la misma habitación
    en el mismo rango de fechas de forma simultánea producen exactamente:
      - un 201 (reserva creada)
      - un 400 con "Double Booking Detectado"

    Implementación:
    - Usa httpx.Client contra el servidor HTTP real levantado en el contenedor
      (localhost:4000). Esto evita interferencias de estado compartido entre
      hilos y con el ciclo de vida de TestClient dentro del proceso pytest.
    - Cada hilo tiene su propio httpx.Client (conexión HTTP independiente),
      garantizando aislamiento completo a nivel de red y de psycopg2.
    - uuid4().int % 5000 + 4000 → años en [4000, 8999] (5000 valores distintos),
      válidos para PostgreSQL DATE (máx. 9999), con 128 bits de entropía real.
    - Teardown por DB directa: borra la reserva creada para no acumular datos
      basura entre ejecuciones de la suite.
    """
    import httpx
    from database import connection

    BASE_URL = "http://localhost:4000"

    # ── Autenticación ─────────────────────────────────────────────────────────
    with httpx.Client(base_url=BASE_URL) as c:
        r = c.post("/api/auth/login", json={
            "usuario": "bookingsoft_admin",
            "contrasena": "Admin2026!"
        })
        token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # ── Fecha única ──────────────────────────────────────────────────────────
    # 5000 valores posibles en [4000, 8999]: aun con 100 corridas previas
    # acumuladas, la probabilidad de colisión es < 2% y el teardown limpia.
    year = 4000 + (uuid.uuid4().int % 5000)   # rango garantizado: [4000, 8999]

    res_data = {
        "id_huesped": 1,
        "id_habitacion": 5,           # habitación dedicada a este test
        "fecha_entrada": f"{year}-10-01",
        "fecha_salida": f"{year}-10-10",
        "numero_personas": 2
    }

    # ── Disparo concurrente ──────────────────────────────────────────────────
    def hacer_reserva():
        with httpx.Client(base_url=BASE_URL) as c:
            return c.post("/api/reservas", json=res_data, headers=headers)

    id_reserva_creada = None
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            future1 = executor.submit(hacer_reserva)
            future2 = executor.submit(hacer_reserva)
            response1 = future1.result()
            response2 = future2.result()

        status_codes = [response1.status_code, response2.status_code]

        # Exactamente uno debe crear la reserva, el otro debe recibir 400.
        assert 201 in status_codes, (
            f"Se esperaba que al menos un hilo recibiera 201 (reserva creada). "
            f"Obtenido: {status_codes}. "
            f"Hilo 1: {response1.json()} | Hilo 2: {response2.json()}"
        )
        assert 400 in status_codes, (
            f"Se esperaba que al menos un hilo recibiera 400 (Double Booking). "
            f"Obtenido: {status_codes}. "
            f"Hilo 1: {response1.json()} | Hilo 2: {response2.json()}"
        )

        # El 400 debe ser específicamente por Double Booking, no otro error
        error_response = response1 if response1.status_code == 400 else response2
        assert "Double Booking Detectado" in error_response.json()["detail"], (
            f"El 400 recibido no corresponde a Double Booking: "
            f"{error_response.json()['detail']}"
        )

        ok_response = response1 if response1.status_code == 201 else response2
        id_reserva_creada = ok_response.json()["reserva"]["id_reserva"]

    finally:
        # ── Teardown: eliminar la reserva creada vía DB directa ───────────────
        # Usa obtener_conexion() directamente (no pasa por la app) para evitar
        # dependencia del ciclo de vida de TestClient en el teardown.
        if id_reserva_creada is not None:
            try:
                conn = connection.obtener_conexion()
                cur = conn.cursor()
                cur.execute(
                    "DELETE FROM reserva_habitacion WHERE id_reserva = %s",
                    (id_reserva_creada,)
                )
                conn.commit()
                cur.close()
                conn.close()
            except Exception:
                pass   # Teardown nunca debe enmascarar el fallo real del test
