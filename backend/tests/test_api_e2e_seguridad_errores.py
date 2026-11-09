"""
backend/tests/test_api_e2e_seguridad_errores.py

Pruebas de API desde el Ángulo E2E — Transversal: Seguridad y Contrato de Errores
(Semana 4 - Maicol Mayor @maicolmayor23-code).

Evalúa con base de datos aislada (TestClient + dependency_overrides + mocks de conexión):
  1. Endpoints protegidos (401 Sin autenticar, 403 Rol insuficiente, 200 Autorizado).
  2. Contrato de error ante JSON mal formado (400 Bad Request con {"detail": "..."} y Content-Type: application/json).
  3. Contrato de error ante tipos incorrectos en el JSON (422 Unprocessable Content).
  4. Seguridad en respuestas de error (500 Internal Server Error sin filtrar stack traces, rutas internas ni consultas SQL).
"""
from unittest.mock import MagicMock, patch
import psycopg2
import pytest
from fastapi.testclient import TestClient

from main import app
from dependencies import UsuarioActual, autenticar


@pytest.fixture
def isolated_client():
    """
    Entrega un TestClient con el ciclo de vida de la BD aislado y limpia
    cualquier override de dependencias (app.dependency_overrides) al finalizar cada test
    para cumplir el principio FIRST (Isolated).
    """
    with patch("database.connection.inicializar_base_de_datos"):
        with TestClient(app, raise_server_exceptions=False) as c:
            yield c
    app.dependency_overrides.clear()


# ==============================================================================
# 1. ENDPOINTS PROTEGIDOS: 401 (Sin token), 403 (Rol insuficiente) y 200 (Autorizado)
# ==============================================================================

def test_endpoint_protegido_responde_401_sin_token(isolated_client):
    """
    Caso 1 (Sin autenticar -> 401):
    Verifica que un endpoint protegido (/api/empleados) rechace peticiones sin header
    Authorization devolviendo código 401, Content-Type application/json y clave 'detail'.
    """
    response = isolated_client.get("/api/empleados")

    assert response.status_code == 401
    assert response.headers["content-type"].startswith("application/json")
    body = response.json()
    assert "detail" in body
    assert "No autenticado" in body["detail"]


def test_endpoint_protegido_responde_403_con_rol_insuficiente(isolated_client):
    """
    Caso 2 (Autenticado sin permiso -> 403):
    Usa app.dependency_overrides[autenticar] para simular un usuario con rol 'Ama de llaves'
    intentando acceder a GET /api/empleados (restringido a Administrador y Recepcionista 24h).
    """
    app.dependency_overrides[autenticar] = lambda: UsuarioActual(
        id_empleado=7,
        rol="Ama de llaves",
        nombre="Marta Limpieza",
    )

    response = isolated_client.get("/api/empleados")

    assert response.status_code == 403
    assert response.headers["content-type"].startswith("application/json")
    body = response.json()
    assert "detail" in body
    assert "Acceso denegado" in body["detail"]


def test_endpoint_protegido_responde_200_con_rol_autorizado_y_sin_contrasena(isolated_client):
    """
    Caso 3 (Autorizado -> 200 OK):
    Usa app.dependency_overrides[autenticar] para simular un 'Administrador' y aísla la BD
    verificando código 200, Content-Type application/json y que no se filtre la contraseña.
    """
    app.dependency_overrides[autenticar] = lambda: UsuarioActual(
        id_empleado=1,
        rol="Administrador",
        nombre="Admin BookingSoft",
    )

    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.fetchall.return_value = [
        (1, "Admin BookingSoft", "bookingsoft_admin", "Administrador", "Activo", "Cédula de ciudadanía", "10000001", "admin@bookingsoft.com")
    ]
    mock_conn.cursor.return_value = mock_cursor

    with patch("database.connection.obtener_conexion", return_value=mock_conn), \
         patch("database.connection.liberar_conexion"):
        response = isolated_client.get("/api/empleados")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/json")
    empleados = response.json()
    assert isinstance(empleados, list)
    assert len(empleados) == 1
    assert empleados[0]["usuario"] == "bookingsoft_admin"
    assert "contrasena" not in empleados[0]


# ==============================================================================
# 2. CONTRATO DE ERRORES: JSON MAL FORMADO (400), TIPOS INCORRECTOS (422) Y SEGURIDAD SQL (500)
# ==============================================================================

def test_json_mal_formado_responde_400_con_detail_json_controlado(isolated_client):
    """
    Caso 4 (JSON mal formado -> 400 Bad Request):
    Envía texto crudo inválido como JSON ('{"usuario":') con Content-Type: application/json.
    Verifica que el manejador de excepciones devuelva HTTP 400 en JSON con {"detail": "..."}
    y nunca HTML ni trazas internas.
    """
    response = isolated_client.post(
        "/api/auth/login",
        content='{"usuario": "bookingsoft_admin",',
        headers={"Content-Type": "application/json"},
    )

    assert response.status_code == 400
    assert response.headers["content-type"].startswith("application/json")
    body = response.json()
    assert body == {"detail": "JSON mal formado en el cuerpo de la petición."}


def test_tipos_incorrectos_responde_422_sin_exponer_internos(isolated_client):
    """
    Caso 5 (Tipos incorrectos -> 422 Unprocessable Content):
    Envía JSON sintácticamente válido pero con tipos incompatibles (id_habitacion y numero_personas
    como texto no numérico). Verifica respuesta 422 en JSON con ubicación del campo erróneo.
    """
    response = isolated_client.post(
        "/api/reservas",
        json={
            "id_huesped": 1,
            "id_habitacion": "no-es-un-numero",
            "fecha_entrada": "2026-12-01",
            "fecha_salida": "2026-12-05",
            "numero_personas": "texto-invalido",
        },
    )

    assert response.status_code == 422
    assert response.headers["content-type"].startswith("application/json")
    body = response.json()
    assert "detail" in body
    assert isinstance(body["detail"], list)
    campos_con_error = [err["loc"][-1] for err in body["detail"]]
    assert "id_habitacion" in campos_con_error
    assert "numero_personas" in campos_con_error


def test_error_base_de_datos_responde_500_sin_filtrar_sql_ni_stack_trace(isolated_client):
    """
    Caso 6 (Seguridad ante fallos de BD -> 500 Internal Server Error):
    Simula un fallo interno de PostgreSQL (psycopg2.DatabaseError con consulta SQL sensible).
    Verifica que la API responda 500 con formato {"detail": "..."} genérico y NUNCA filtre
    consultas SQL, nombres de tablas ni stack traces al cliente.
    """
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.execute.side_effect = psycopg2.DatabaseError(
        'FATAL: relation "reserva_habitacion" SELECT * FROM empleado WHERE contrasena = ... at /app/backend/routes/reservas.py'
    )
    mock_conn.cursor.return_value = mock_cursor

    payload = {
        "id_huesped": 1,
        "id_habitacion": 1,
        "fecha_entrada": "2027-01-10",
        "fecha_salida": "2027-01-15",
        "numero_personas": 2,
    }

    with patch("database.connection.obtener_conexion", return_value=mock_conn), \
         patch("database.connection.liberar_conexion"):
        response = isolated_client.post("/api/reservas", json=payload)

    assert response.status_code == 500
    assert response.headers["content-type"].startswith("application/json")
    body = response.json()
    assert body == {"detail": "Error interno del servidor al procesar la solicitud."}
    texto_respuesta = response.text.lower()
    assert "select " not in texto_respuesta
    assert "reserva_habitacion" not in texto_respuesta
    assert "traceback" not in texto_respuesta
    assert "/app/backend" not in texto_respuesta

