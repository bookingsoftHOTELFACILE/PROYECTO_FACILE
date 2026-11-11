import pytest
from fastapi.testclient import TestClient
import os
import sys

# Agregar el directorio backend al path para que pueda importar módulos locales
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("JWT_SECRET", "super_secret_jwt_key_for_testing_123456789")

# Respaldo liviano si se corre pytest localmente sin tener psycopg2/pyjwt instalados en el sistema global
import types, json, base64
for _mod_name in ("psycopg2", "psycopg2.pool", "bcrypt", "email_validator", "dotenv"):
    try:
        __import__(_mod_name)
    except ImportError:
        _m = types.ModuleType(_mod_name)
        if _mod_name == "psycopg2":
            _m.Error = Exception
            _m.pool = types.SimpleNamespace(SimpleConnectionPool=lambda *a, **k: None)
        elif _mod_name == "email_validator":
            _m.validate_email = lambda email, **k: types.SimpleNamespace(normalized=email, local_part=email.split("@")[0])
            _m.EmailNotValidError = ValueError
            import pydantic.networks
            pydantic.networks.import_email_validator = lambda: None
        elif _mod_name == "dotenv":
            _m.load_dotenv = lambda *a, **k: None
        sys.modules[_mod_name] = _m

try:
    import jwt  # noqa: F401
except ImportError:
    _jwt_mod = types.ModuleType("jwt")
    _jwt_mod.ExpiredSignatureError = Exception
    _jwt_mod.InvalidTokenError = Exception
    _jwt_mod.encode = lambda payload, key, algorithm="HS256": base64.urlsafe_b64encode(
        json.dumps(payload, default=str).encode()
    ).decode()
    _jwt_mod.decode = lambda token, key, algorithms=None: json.loads(
        base64.urlsafe_b64decode(token.encode()).decode()
    )
    sys.modules["jwt"] = _jwt_mod

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
