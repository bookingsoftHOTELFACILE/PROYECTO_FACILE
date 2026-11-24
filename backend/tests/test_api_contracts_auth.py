"""
backend/tests/test_api_contracts_auth.py

Pruebas de Contrato HTTP para la Capa API (Semana 4 - José Chico @jocmiguelchicoc).
Endpoints probados:
  - POST /api/auth/login
  - POST /api/auth/registro

Verifica códigos HTTP (200, 201, 401, 422), headers y estructura de JSON según especificación OpenAPI/FastAPI.
"""
from unittest.mock import MagicMock, patch
import pytest
import bcrypt
from fastapi.testclient import TestClient
from main import app
from routes.auth import _crear_token


@pytest.fixture
def mock_client():
    """
    Retorna una instancia de TestClient evitando la inicialización
    de la base de datos real durante el lifespan.
    """
    with patch("database.connection.inicializar_base_de_datos"):
        with TestClient(app, raise_server_exceptions=False) as c:
            yield c


# ==============================================================================
# 1. PRUEBAS DE CONTRATO HTTP: POST /api/auth/login
# ==============================================================================

def test_contrato_login_exitoso_retorna_200_y_schema_token(mock_client):
    """
    Contrato Éxito:
    - Status code: HTTP 200 OK
    - Content-Type: application/json
    - Schema: {"access_token": str, "token_type": "bearer"}
    """
    # Arrange: simular credenciales válidas en la base de datos
    password_plana = "Admin2026!"
    hashed_password = bcrypt.hashpw(password_plana.encode(), bcrypt.gensalt()).decode()
    
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    # Retorna: id_empleado, contrasena, rol, estado, nombre
    mock_cursor.fetchone.return_value = (1, hashed_password, "Administrador", "Activo", "Admin Test")
    mock_conn.cursor.return_value = mock_cursor

    payload = {
        "usuario": "admin_test",
        "contrasena": password_plana,
    }

    # Act
    with patch("database.connection.obtener_conexion", return_value=mock_conn), \
         patch("database.connection.liberar_conexion"):
        response = mock_client.post("/api/auth/login", json=payload)

    # Assert
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/json")
    
    data = response.json()
    assert "access_token" in data
    assert isinstance(data["access_token"], str)
    assert len(data["access_token"]) > 20
    assert data["token_type"] == "bearer"


def test_contrato_login_credenciales_invalidas_retorna_401(mock_client):
    """
    Contrato Error de Autenticación:
    - Status code: HTTP 401 UNAUTHORIZED
    - Header: WWW-Authenticate: Bearer
    - Detail: "Credenciales incorrectas."
    """
    # Arrange: simular usuario inexistente
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = None
    mock_conn.cursor.return_value = mock_cursor

    payload = {
        "usuario": "usuario_fantasma",
        "contrasena": "ClaveErronea123*",
    }

    # Act
    with patch("database.connection.obtener_conexion", return_value=mock_conn), \
         patch("database.connection.liberar_conexion"):
        response = mock_client.post("/api/auth/login", json=payload)

    # Assert
    assert response.status_code == 401
    assert "WWW-Authenticate" in response.headers
    assert response.json()["detail"] == "Credenciales incorrectas."


@pytest.mark.parametrize("payload_incompleto,campo_faltante", [
    ({"contrasena": "SoloPassword123"}, "usuario"),
    ({"usuario": "solo_usuario"}, "contrasena"),
    ({}, "usuario"),
])
def test_contrato_login_payload_incompleto_retorna_422(mock_client, payload_incompleto, campo_faltante):
    """
    Contrato Validación Pydantic (Campos obligatorios faltantes):
    - Status code: HTTP 422 UNPROCESSABLE ENTITY
    - Estructura de error Pydantic: detail con array de errores y locación.
    """
    # Act
    response = mock_client.post("/api/auth/login", json=payload_incompleto)

    # Assert
    assert response.status_code == 422
    detalles = response.json().get("detail", [])
    assert any(campo_faltante in err["loc"] for err in detalles)


# ==============================================================================
# 2. PRUEBAS DE CONTRATO HTTP: POST /api/auth/registro
# ==============================================================================

def test_contrato_registro_exitoso_retorna_201_y_payload_sin_contrasena(mock_client):
    """
    Contrato Creación:
    - Status code: HTTP 201 CREATED
    - Estructura: mensaje de confirmación y datos del empleado creado con estado 'Activo'.
    - Seguridad: NUNCA retornar la contraseña en la respuesta.
    """
    # Arrange: token de administrador válido
    admin_token = _crear_token(id_empleado=1, rol="Administrador", nombre="Admin Root")
    headers = {"Authorization": f"Bearer {admin_token}"}

    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    # 1. numero_doc no existe, 2. correo no existe, 3. usuario no existe, 4. RETURNING nuevo empleado
    mock_cursor.fetchone.side_effect = [
        None,  # doc unico
        None,  # correo unico
        None,  # usuario unico
        (10, "Carlos Recepcionista", "carlos_recep_test", "Recepcionista 24h", "Activo") # fila insertada
    ]
    mock_conn.cursor.return_value = mock_cursor

    payload = {
        "nombre": "Carlos Recepcionista",
        "usuario": "carlos_recep_test",
        "contrasena": "Segura2026*",
        "tipo_documento": "Cédula de ciudadanía",
        "numero_documento": "1002003004",
        "correo": "carlos.recep@facile.com",
        "rol": "Recepcionista 24h"
    }

    # Act
    with patch("database.connection.obtener_conexion", return_value=mock_conn), \
         patch("database.connection.liberar_conexion"):
        response = mock_client.post("/api/auth/registro", json=payload, headers=headers)

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "Empleado registrado exitosamente."
    assert data["empleado"]["estado"] == "Activo"
    assert data["empleado"]["usuario"] == "carlos_recep_test"
    # Verificación estricta de seguridad en contrato
    assert "contrasena" not in data["empleado"]


def test_contrato_registro_sin_token_retorna_401(mock_client):
    """
    Contrato Seguridad:
    - Endpoint protegido para administradores.
    - Status code sin token: HTTP 401 UNAUTHORIZED.
    """
    payload = {
        "nombre": "Sin Token",
        "usuario": "sintoken",
        "contrasena": "Segura2026*",
        "tipo_documento": "Cédula de ciudadanía",
        "numero_documento": "12345678",
        "correo": "sintoken@facile.com"
    }

    # Act: sin header Authorization
    response = mock_client.post("/api/auth/registro", json=payload)

    # Assert
    assert response.status_code == 401


@pytest.mark.parametrize("campo_invalido,valor_invalido", [
    ("correo", "correo_sin_arroba"),
    ("tipo_documento", "Pasaporte Galactico Invalido"),
])
def test_contrato_registro_validaciones_pydantic_retorna_422(mock_client, campo_invalido, valor_invalido):
    """
    Contrato Tipado y Validaciones Pydantic:
    - Formato de email inválido o enum de documento no permitido.
    - Status code: HTTP 422 UNPROCESSABLE ENTITY.
    """
    admin_token = _crear_token(id_empleado=1, rol="Administrador", nombre="Admin Root")
    headers = {"Authorization": f"Bearer {admin_token}"}

    payload = {
        "nombre": "Usuario Invalido",
        "usuario": "usuario_inv",
        "contrasena": "Segura2026*",
        "tipo_documento": "Cédula de ciudadanía",
        "numero_documento": "11223344",
        "correo": "valido@facile.com"
    }
    payload[campo_invalido] = valor_invalido

    # Act
    response = mock_client.post("/api/auth/registro", json=payload, headers=headers)

    # Assert
    assert response.status_code == 422
    detalles = response.json().get("detail", [])
    assert any(campo_invalido in err["loc"] for err in detalles)
