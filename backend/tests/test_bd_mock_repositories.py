"""
backend/tests/test_bd_mock_repositories.py

Pruebas de Dobles de Prueba (Mocks y Stubs) para la Capa BD (Semana 5 - José Chico @jocmiguelchicoc).
Aísla la base de datos PostgreSQL utilizando `unittest.mock` para verificar:
  1. Resiliencia ante fallos de conexión (OperationalError capturado limpiamente).
  2. Manejo seguro de consultas vacías retornando lista vacía `[]`.
  3. Ejecución obligatoria de `conn.rollback()` cuando falla una transacción de escritura.
  4. Ejecución de `conn.commit()` sin rollback cuando la transacción es exitosa.
"""
from unittest.mock import MagicMock, patch
import pytest
import psycopg2
from fastapi.testclient import TestClient
from main import app
from routes.auth import _crear_token


@pytest.fixture
def mock_client():
    """TestClient configurado para pruebas unitarias sin levantar base de datos real."""
    with patch("database.connection.inicializar_base_de_datos"):
        with TestClient(app, raise_server_exceptions=False) as c:
            yield c


@pytest.fixture
def auth_headers():
    """Token de rol autorizado (Recepcionista 24h) para el módulo de reservas."""
    token = _crear_token(id_empleado=2, rol="Recepcionista 24h", nombre="Recepcionista Test")
    return {"Authorization": f"Bearer {token}"}


# ==============================================================================
# 1. PRUEBA: Fallo de conexión a BD capturado sin tumbar el servidor
# ==============================================================================

def test_bd_fallo_conexion_captura_excepcion_sin_tumbar_app(mock_client, auth_headers):
    """
    Doble de Prueba: Simulación de caída de servidor PostgreSQL (OperationalError).
    Verifica que el servicio capture la excepción y devuelva un HTTP 500 controlado
    sin que el proceso de FastAPI se caiga ni exponga stack traces de infraestructura.
    """
    # Arrange: simular que la conexión al pool falla
    with patch("database.connection.obtener_conexion", side_effect=psycopg2.OperationalError("could not connect to server: Connection refused")):
        # Act
        response = mock_client.get("/api/reservas", headers=auth_headers)

    # Assert
    assert response.status_code == 500
    data = response.json()
    assert data["detail"] == "Error interno del servidor al procesar la solicitud."
    # Comprobar que no se fugan contraseñas ni cadenas de conexión en el error
    assert "postgresql://" not in str(data)
    assert "password" not in str(data).lower()


# ==============================================================================
# 2. PRUEBA: Consulta sin filas retorna lista vacía []
# ==============================================================================

def test_bd_consulta_sin_filas_retorna_lista_vacia(mock_client, auth_headers):
    """
    Doble de Prueba: Stub de cursor con cursor.fetchall() retornando lista vacía.
    Verifica que la API retorne HTTP 200 con JSON `[]` en lugar de null o error 404.
    """
    # Arrange: Mock de conexión y cursor que devuelve 0 registros
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.fetchall.return_value = []
    mock_conn.cursor.return_value = mock_cursor

    with patch("database.connection.obtener_conexion", return_value=mock_conn), \
         patch("database.connection.liberar_conexion"):
        # Act
        response = mock_client.get("/api/reservas", headers=auth_headers)

    # Assert
    assert response.status_code == 200
    assert response.json() == []
    mock_cursor.execute.assert_called_once()
    mock_cursor.close.assert_called_once()


# ==============================================================================
# 3. PRUEBA: Transacción fallida ejecuta rollback() obligatoriamente
# ==============================================================================

def test_bd_transaccion_fallida_ejecuta_rollback(mock_client, auth_headers):
    """
    Doble de Prueba: Mock con Spy sobre métodos transaccionales (.commit() y .rollback()).
    Simula un fallo de base de datos durante la cancelación de una reserva.
    Verifica que la conexión invoque conn.rollback() y NUNCA invoque conn.commit().
    
    *ESTE TEST ES EL DETECTOR DEL MUTANTE DE LA SEMANA 5*:
    Si se elimina `conn.rollback()` del bloque except, este test falla.
    """
    # Arrange: reserva existente encontrada en el primer SELECT, pero el UPDATE falla
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    
    # 1. SELECT id_habitacion, estado -> encontrado
    # 2. UPDATE habitacion -> exitoso
    # 3. UPDATE reserva_habitacion -> ERROR de base de datos simulado
    mock_cursor.fetchone.return_value = (101, "Confirmada")
    mock_cursor.execute.side_effect = [
        None,  # SELECT exitoso
        None,  # UPDATE habitacion exitoso
        psycopg2.DatabaseError("Simulated write error: Deadlock detected")  # UPDATE reserva falla
    ]
    mock_conn.cursor.return_value = mock_cursor

    with patch("database.connection.obtener_conexion", return_value=mock_conn), \
         patch("database.connection.liberar_conexion") as mock_liberar:
        # Act
        response = mock_client.delete("/api/reservas/99", headers=auth_headers)

    # Assert
    assert response.status_code == 500
    # Verificación de integridad transaccional (Doble de prueba)
    mock_conn.rollback.assert_called_once()
    mock_conn.commit.assert_not_called()
    mock_cursor.close.assert_called_once()
    mock_liberar.assert_called_once_with(mock_conn)


# ==============================================================================
# 4. PRUEBA: Transacción exitosa ejecuta commit() sin rollback
# ==============================================================================

def test_bd_transaccion_exitosa_ejecuta_commit_sin_rollback(mock_client, auth_headers):
    """
    Verifica el camino feliz transaccional:
    - Se invoca conn.commit() exactamente una vez.
    - conn.rollback() NUNCA debe ser llamado.
    """
    # Arrange
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = (101, "Disponible")
    mock_conn.cursor.return_value = mock_cursor

    with patch("database.connection.obtener_conexion", return_value=mock_conn), \
         patch("database.connection.liberar_conexion") as mock_liberar:
        # Act
        response = mock_client.delete("/api/reservas/99", headers=auth_headers)

    # Assert
    assert response.status_code == 200
    assert "cancelada exitosamente" in response.json()["message"]
    mock_conn.commit.assert_called_once()
    mock_conn.rollback.assert_not_called()
    mock_liberar.assert_called_once_with(mock_conn)
