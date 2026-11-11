"""
backend/tests/test_api_contracts.py

Pruebas de Contrato HTTP para la Capa API (Semana 4 - Sebastián Parada @sebasparada).
Endpoints probados:
  - GET /api/reservas
  - PUT /api/reservas/{id}/cancelar
"""
from datetime import date
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from main import app
from routes.auth import _crear_token


@pytest.fixture
def client_contrato():
    """
    Crea un TestClient aislando la inicialización de la base de datos
    para validar únicamente el contrato HTTP de la capa API.
    """
    with patch("database.connection.inicializar_base_de_datos"):
        with TestClient(app, raise_server_exceptions=False) as c:
            yield c


# ==============================================================================
# 1. CONTRATO HTTP: GET /api/reservas (200 OK y arreglo JSON)
# ==============================================================================

def test_contrato_consultar_reservas_retorna_200_y_arreglo_json(client_contrato):
    # Arrange: preparamos token de empleado autorizado y fila simulada de BD
    token = _crear_token(id_empleado=1, rol="Administrador", nombre="Sebastián Parada")
    headers = {"Authorization": f"Bearer {token}"}

    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.fetchall.return_value = [
        (
            101,
            5,
            "Juan Pérez",
            "10203040",
            3,
            "201A",
            "Dúplex",
            date(2026, 11, 15),
            date(2026, 11, 18),
            "Confirmada",
            "Recepción",
        )
    ]
    mock_conn.cursor.return_value = mock_cursor

    # Act: enviamos petición GET al endpoint
    with patch("database.connection.obtener_conexion", return_value=mock_conn), \
         patch("database.connection.liberar_conexion"):
        response = client_contrato.get("/api/reservas", headers=headers)

    # Assert: validamos código 200, header JSON y estructura de arreglo
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/json")

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["id_reserva"] == 101
    assert data[0]["huesped_nombre"] == "Juan Pérez"
    assert data[0]["habitacion_numero"] == "201A"
    assert data[0]["estado"] == "Confirmada"


# ==============================================================================
# 2. CONTRATO HTTP: PUT /api/reservas/{id}/cancelar (200 OK con estado Cancelada)
# ==============================================================================

def test_contrato_cancelar_reserva_existente_retorna_200_y_estado_cancelada(client_contrato):
    # Arrange: simulamos que la reserva #101 sí existe en la base de datos
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    # Retorna (id_habitacion, estado_actual)
    mock_cursor.fetchone.return_value = (3, "Confirmada")
    mock_conn.cursor.return_value = mock_cursor

    # Act: llamamos al endpoint PUT de cancelación
    with patch("database.connection.obtener_conexion", return_value=mock_conn), \
         patch("database.connection.liberar_conexion"):
        response = client_contrato.put("/api/reservas/101/cancelar")

    # Assert: validamos código HTTP 200 y estado "Cancelada" en el JSON
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/json")

    data = response.json()
    assert data["id_reserva"] == 101
    assert data["estado"] == "Cancelada"
    assert "cancelada exitosamente" in data["message"]


# ==============================================================================
# 3. CONTRATO HTTP: PUT /api/reservas/{id}/cancelar (404 Reserva no encontrada)
# ==============================================================================

def test_contrato_cancelar_reserva_inexistente_retorna_404(client_contrato):
    # Arrange: simulamos que la reserva #9999 no existe (fetchone retorna None)
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = None
    mock_conn.cursor.return_value = mock_cursor

    # Act: intentamos cancelar una reserva inexistente
    with patch("database.connection.obtener_conexion", return_value=mock_conn), \
         patch("database.connection.liberar_conexion"):
        response = client_contrato.put("/api/reservas/9999/cancelar")

    # Assert: validamos código HTTP 404 y el mensaje exacto del contrato
    # (Este test atrapa el mutante si se cambia el texto "Reserva no encontrada")
    assert response.status_code == 404
    assert response.headers["content-type"].startswith("application/json")
    assert response.json()["detail"] == "Reserva no encontrada"


# ==============================================================================
# 4. CONTRATO HTTP ADICIONAL: GET /api/reservas sin token (401 Unauthorized)
# ==============================================================================

def test_contrato_consultar_reservas_sin_token_retorna_401(client_contrato):
    # Act: consultamos sin enviar encabezado Authorization
    response = client_contrato.get("/api/reservas")

    # Assert: el contrato exige 401 cuando no hay credenciales
    assert response.status_code == 401

