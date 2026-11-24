"""
backend/tests/test_reservas.py

Pruebas de integración para el módulo de reservas:
- Regla de negocio: descuento por larga estadía (10% de 7 a 14 noches y 15% desde
  15 noches) — política publicada y RF-011.
- Regla de negocio: rechazo si número de personas supera la capacidad (RF-011).
- Concurrencia: EXCLUDE USING gist garantiza que dos reservas simultáneas para
  la misma habitación y fechas solapadas no puedan coexistir (RNF-009).
"""
import os
import uuid
import concurrent.futures


def test_reserva_descuento(client, admin_token):
    """RF-011 — Descuento del 15% para estancias de 15 noches o más."""
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
    import socket
    import threading
    import time
    from contextlib import contextmanager
    from unittest.mock import patch
    import httpx
    import uvicorn
    from main import app
    from database import connection

    @contextmanager
    def _asegurar_servidor_http(url_base: str):
        """Usa el servidor externo si responde /health; si no (ej. CI), levanta Uvicorn efímero."""
        try:
            with httpx.Client(base_url=url_base, timeout=1.0) as c:
                if c.get("/health").status_code == 200:
                    yield url_base
                    return
        except httpx.HTTPError:
            pass

        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(("127.0.0.1", 0))
            puerto = s.getsockname()[1]

        class _TestServer(uvicorn.Server):
            def install_signal_handlers(self):
                pass

        config = uvicorn.Config(app, host="127.0.0.1", port=puerto, log_level="warning")
        server = _TestServer(config)
        url_local = f"http://127.0.0.1:{puerto}"

        with patch("database.connection.inicializar_base_de_datos"):
            hilo = threading.Thread(target=server.run, daemon=True)
            hilo.start()
            try:
                listo = False
                for _ in range(50):
                    try:
                        with httpx.Client(base_url=url_local, timeout=0.5) as c:
                            if c.get("/health").status_code == 200:
                                listo = True
                                break
                    except httpx.HTTPError:
                        time.sleep(0.1)
                assert listo, f"No respondió el servidor HTTP temporal en {url_local}"
                yield url_local
            finally:
                server.should_exit = True
                hilo.join(timeout=5)

    # Puerto del backend: 4000 dentro de la red Docker, 4001 en el host.
    # Configurable con API_BASE_URL para ejecutar la suite fuera del contenedor.
    BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:4000")

    with _asegurar_servidor_http(BASE_URL) as server_url:
        # ── Autenticación ─────────────────────────────────────────────────────────
        with httpx.Client(base_url=server_url) as c:
            r = c.post("/api/auth/login", json={
                "usuario": "admin",
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
            with httpx.Client(base_url=server_url) as c:
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


def _borrar_huesped_y_reserva(id_reserva=None, documento=None):
    """Teardown directo contra la BD (nunca enmascara el fallo real del test)."""
    from database import connection
    conn = connection.obtener_conexion()
    cur = conn.cursor()
    try:
        if id_reserva is not None:
            cur.execute("DELETE FROM reserva_habitacion WHERE id_reserva = %s", (id_reserva,))
        if documento is not None:
            cur.execute("DELETE FROM huesped WHERE documento = %s", (documento,))
        conn.commit()
    finally:
        cur.close()
        connection.liberar_conexion(conn)


def test_alta_atomica_huesped_y_reserva(client, admin_token):
    """P1-1.4 — El huésped walk-in se da de alta en la MISMA transacción que la
    reserva (un solo POST) y el backend devuelve el perfil para seleccionarlo."""
    from database import connection

    headers = {"Authorization": f"Bearer {admin_token}"}
    hab_res = client.get("/api/habitaciones", headers=headers)
    assert hab_res.status_code == 200
    hab = next(h for h in hab_res.json() if h["numero"] == "101A")

    year = 3000 + (uuid.uuid4().int % 1000)
    documento = f"AT{uuid.uuid4().int % 10**12}"
    res_data = {
        "id_habitacion": hab["id_habitacion"],
        "fecha_entrada": f"{year}-03-01",
        "fecha_salida": f"{year}-03-04",
        "numero_personas": 2,
        "nuevo_huesped": {
            "nombre": "Huesped Atomico QA",
            "documento": documento,
            "telefono": "+57 3009998888",
            "correo": f"{documento}@example.com",
            "empresa": "QA Atomica",
            "password": documento,
        },
    }

    id_reserva = None
    try:
        response = client.post("/api/reservas", json=res_data, headers=headers)
        assert response.status_code == 201, response.text

        data = response.json()
        id_reserva = data["reserva"]["id_reserva"]

        # El huésped viene en la respuesta y queda como dueño de la reserva.
        assert data["huesped"]["documento"] == documento
        assert data["reserva"]["huesped_documento"] == documento

        # Y existe efectivamente en la BD.
        conn = connection.obtener_conexion()
        cur = conn.cursor()
        try:
            cur.execute("SELECT COUNT(*) FROM huesped WHERE documento = %s", (documento,))
            assert cur.fetchone()[0] == 1
        finally:
            cur.close()
            connection.liberar_conexion(conn)
    finally:
        _borrar_huesped_y_reserva(id_reserva, documento)


def test_alta_atomica_rollback_si_reserva_falla(client, admin_token):
    """P1-1.4 — Si la reserva es rechazada (capacidad excedida), el alta del huésped
    se deshace: no queda ningún perfil huérfano en la base de datos."""
    from database import connection

    headers = {"Authorization": f"Bearer {admin_token}"}
    hab_res = client.get("/api/habitaciones", headers=headers)
    assert hab_res.status_code == 200
    hab = next(h for h in hab_res.json() if h["numero"] == "101A")  # capacidad 2

    year = 3000 + (uuid.uuid4().int % 1000)
    documento = f"RB{uuid.uuid4().int % 10**12}"
    res_data = {
        "id_habitacion": hab["id_habitacion"],
        "fecha_entrada": f"{year}-04-01",
        "fecha_salida": f"{year}-04-05",
        "numero_personas": 5,  # excede la capacidad: fuerza el rechazo
        "nuevo_huesped": {
            "nombre": "Huesped Rollback QA",
            "documento": documento,
            "telefono": "+57 3001112222",
            "correo": f"{documento}@example.com",
            "empresa": "QA Rollback",
            "password": documento,
        },
    }

    response = client.post("/api/reservas", json=res_data, headers=headers)
    assert response.status_code == 400
    assert "Capacidad excedida" in response.json()["detail"]

    # El huésped NO debe haber quedado registrado (rollback de la transacción).
    conn = connection.obtener_conexion()
    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM huesped WHERE documento = %s", (documento,))
        assert cur.fetchone()[0] == 0, "El huésped quedó huérfano tras el rechazo de la reserva."
    finally:
        cur.close()
        connection.liberar_conexion(conn)
