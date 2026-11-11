import pytest
from fastapi.testclient import TestClient
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("JWT_SECRET", "test_secret_seguro_bookingsoft_2026")

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    try:
        from database import connection
        connection.inicializar_base_de_datos()
    except (ImportError, SystemExit, Exception):
        pass
    yield

@pytest.fixture
def client():
    from main import app
    with TestClient(app) as c:
        yield c

@pytest.fixture
def admin_token(client):
    res = client.post("/api/auth/login", json={
        "usuario": "admin",
        "contrasena": "Admin2026!"
    })
    if "access_token" not in res.json():
        res = client.post("/api/auth/login", json={
            "usuario": "bookingsoft_admin",
            "contrasena": "Admin2026!"
        })
    return res.json()["access_token"]

@pytest.fixture
def clean_reservas(client):
    pass
