import pytest
from fastapi.testclient import TestClient
import os
import sys

# Agregar el directorio backend al path para que pueda importar módulos locales
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("JWT_SECRET", "super_secret_jwt_key_for_testing_123456789")

from main import app
from database import connection

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    """
    Se ejecuta una vez por sesión de pruebas para garantizar
    que la base de datos esté inicializada si está disponible.
    """
    try:
        connection.inicializar_base_de_datos()
    except (SystemExit, Exception):
        pass
    yield
    # No cerramos la db aquí, psycopg2 usa conexiones por request, pero 
    # podemos dejar esto abierto a un teardown si fuera necesario.

@pytest.fixture
def client():
    """
    Retorna una instancia de TestClient para hacer peticiones HTTP al API.
    """
    with TestClient(app) as c:
        yield c

@pytest.fixture
def admin_token(client):
    """
    Realiza login como administrador y retorna el token JWT.
    (Las credenciales deben coincidir con el seed data en schema.sql)
    """
    res = client.post("/api/auth/login", json={
        "usuario": "admin",
        "contrasena": "Admin2026!"
    })
    return res.json()["access_token"]

@pytest.fixture
def clean_reservas(client):
    """
    (Opcional) Un fixture para limpiar reservas de prueba específicas.
    Actualmente el seed inserta huéspedes y habitaciones fijas.
    Podríamos borrar las reservas creadas durante el test en una base de datos 
    dedicada, pero como usamos el seed data actual, generaremos reservas que 
    causen rollback (ej. enviando fechas que colisionen o creando datos aislados).
    """
    pass


# ==============================================================================
# P1-1.5 — HIGIENE DE LA BASE DE DATOS COMPARTIDA
# ==============================================================================

@pytest.fixture(scope="session", autouse=True)
def limpiar_residuos_de_prueba(setup_db):
    """
    Impide que la suite deje datos de prueba en la BD de desarrollo / E2E.

    Toma el snapshot de los ids existentes antes de ejecutar y, al terminar la
    sesión, borra todo lo creado por los tests (reservas primero, por la foránea
    hacia `huesped`). Así `pytest` deja la base exactamente como la encontró:
    sin huéspedes, reservas ni empleados residuales acumulándose entre corridas.
    """
    from database import connection

    TABLAS = (
        ("reserva_habitacion", "id_reserva"),
        ("reserva_negocio", "id_reserva_negocio"),
        ("huesped", "id_huesped"),
        ("empleado", "id_empleado"),
    )

    def _ids(tabla, pk):
        conn = connection.obtener_conexion()
        cur = conn.cursor()
        try:
            cur.execute(f"SELECT {pk} FROM {tabla}")
            return {fila[0] for fila in cur.fetchall()}
        finally:
            cur.close()
            connection.liberar_conexion(conn)

    try:
        antes = {tabla: _ids(tabla, pk) for tabla, pk in TABLAS}
    except Exception:
        # Sin BD no hay nada que proteger: la propia suite reportará el fallo.
        antes = None

    yield

    if antes is None:
        return

    conn = None
    try:
        conn = connection.obtener_conexion()
        cur = conn.cursor()
        try:
            for tabla, pk in TABLAS:
                nuevos = _ids(tabla, pk) - antes[tabla]
                if nuevos:
                    cur.execute(f"DELETE FROM {tabla} WHERE {pk} = ANY(%s)", (list(nuevos),))
            conn.commit()
        finally:
            cur.close()
    except Exception:
        # La higiene nunca debe convertir un pase verde en rojo.
        if conn is not None:
            try:
                conn.rollback()
            except Exception:
                pass
    finally:
        if conn is not None:
            connection.liberar_conexion(conn)
