import pytest
from fastapi.testclient import TestClient
import os
import sys

# Agregar el directorio backend al path para que pueda importar módulos locales
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from database import connection

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    """
    Se ejecuta una vez por sesión de pruebas para garantizar
    que la base de datos esté inicializada (recrea tablas de forma idempotente).
    """
    connection.inicializar_base_de_datos()
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
        "usuario": "bookingsoft_admin",
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
