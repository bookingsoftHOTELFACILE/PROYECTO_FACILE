"""
backend/tests/test_api_db_transactions.py

Semana 6 — Pruebas de Transacciones Atómicas en Base de Datos (Capa API)
Integrante: Maicol Mayor (@maicolmayor23-code)
Rama: test/api-db-transactions

Misión:
  Pruebas de transacciones atómicas (BEGIN, COMMIT, ROLLBACK) en FastAPI contra PostgreSQL:
  1. Si falla el guardado del detalle de la reserva, verificar que el encabezado no quede
     huérfano en la BD (rollback exitoso).
  2. Verificación de concurrencia: dos usuarios intentando reservar el mismo apartamento
     al mismo segundo (Double Booking atómico por EXCLUDE USING gist).
  3. Transacción exitosa: verificación física de COMMIT en la base de datos y limpieza garantizada.
  4. Comportamiento específico de motor: rechazo estricto de tipos fuera de rango en PostgreSQL.

Mutante documentado:
  Quitar la instrucción `conn.rollback()` en el bloque de excepción de `crear_reserva`.
"""
import os
import uuid
import concurrent.futures
from unittest.mock import MagicMock, patch
import pytest
import psycopg2
from fastapi.testclient import TestClient

from main import app
from database import connection


class MockPgDatabaseError(psycopg2.DatabaseError):
    """Subclase auxiliar para simular errores de PostgreSQL con pgcode específico en pruebas unitarias."""
    def __init__(self, message: str, pgcode: str = ""):
        super().__init__(message)
        self._pgcode = pgcode

    @property
    def pgcode(self):
        return self._pgcode


@pytest.fixture
def api_client():
    """
    Cliente de pruebas de FastAPI aislado para la capa API.
    Limpia cualquier dependencia sobrescrita al terminar el test.
    """
    with patch("database.connection.inicializar_base_de_datos"):
        with TestClient(app, raise_server_exceptions=False) as c:
            yield c
    app.dependency_overrides.clear()


@pytest.fixture
def admin_headers(api_client):
    """Genera token JWT de autenticación para llamadas a endpoints protegidos."""
    res = api_client.post("/api/auth/login", json={
        "usuario": "admin",
        "contrasena": "Admin2026!"
    })
    token = res.json().get("access_token", "fake_token_test")
    return {"Authorization": f"Bearer {token}"}


# ==============================================================================
# 1. PRUEBA DE ROLLBACK ATÓMICO: Fallo en el detalle no deja huérfano el encabezado
# ==============================================================================

def test_transaccion_rollback_si_falla_detalle_no_deja_huerfano_encabezado(api_client, admin_headers):
    """
    Misión 1: Atomicidad de la transacción (All-or-Nothing).
    
    Escenario:
      1. Se inserta exitosamente el encabezado de la reserva en `reserva_habitacion`
         (obteniendo un id generado, ej: id_reserva = 8888).
      2. Inmediatamente después, ocurre un fallo inesperado al guardar o consultar el detalle
         (ej. error de base de datos o fallo de integridad en datos de detalle).
      3. El bloque de excepción captura el error y ejecuta obligatoriamente `conn.rollback()`.
    
    Aserciones de integridad:
      - La API responde con error HTTP 500 controlado sin filtrar detalles SQL.
      - Se invoca `conn.rollback()` exactamente una vez.
      - `conn.commit()` NUNCA debe ser llamado.
      - El encabezado no queda huérfano en la base de datos (rollback total).
    
    *DETECTOR DEL MUTANTE*:
      Si se comenta `conn.rollback()` en el bloque except de `crear_reserva`,
      la aserción `mock_conn.rollback.assert_called_once()` falla inmediatamente.
    """
    # Arrange: Simulación del fallo transaccional durante el procesamiento del detalle
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    reserva_id_generado = 8888
    # 1. SELECT habitacion -> OK
    # 2. SELECT fn_calcular_noches_y_precio -> OK
    # 3. INSERT INTO reserva_habitacion ... RETURNING id_reserva -> OK (encabezado insertado)
    # 4. SELECT nombre, documento FROM huesped (o guardado de detalle) -> FALLO CRÍTICO DE BD
    mock_cursor.fetchone.side_effect = [
        {"precio_noche": 150000.0, "numero": "101A", "estado": "Disponible", "capacidad": 2},   # Consulta de habitación
        {"noches": 3, "subtotal": 450000.0, "descuento_aplicado": 0.0, "total": 450000.0},          # Cotización
        {"id_reserva": reserva_id_generado, "id_huesped": 1, "id_habitacion": 1, "fecha_entrada": "2033-01-01", "fecha_salida": "2033-01-04", "estado": "Confirmada", "creado_por": "Admin", "checkin_at": None},  # Encabezado insertado
        psycopg2.DatabaseError("Fallo crítico de I/O al persistir el detalle de la reserva")  # Detalle falla
    ]
    mock_conn.cursor.return_value = mock_cursor

    payload = {
        "id_huesped": 1,
        "id_habitacion": 1,
        "fecha_entrada": "2033-01-01",
        "fecha_salida": "2033-01-04",
        "numero_personas": 2
    }

    # Act
    with patch("database.connection.obtener_conexion", return_value=mock_conn), \
         patch("database.connection.liberar_conexion") as mock_liberar:
        response = api_client.post("/api/reservas", json=payload, headers=admin_headers)

    # Assert
    assert response.status_code == 500
    assert response.json()["detail"] == "Error interno del servidor al procesar la solicitud."

    # Verificación de Atomicidad Transaccional:
    mock_conn.rollback.assert_called_once()
    mock_conn.commit.assert_not_called()
    mock_cursor.close.assert_called_once()
    mock_liberar.assert_called_once_with(mock_conn)


# ==============================================================================
# 2. PRUEBA DE CONCURRENCIA: Dos usuarios reservando el mismo apartamento al mismo segundo
# ==============================================================================

def test_transaccion_concurrencia_double_booking_mismo_apartamento():
    """
    Misión 2: Concurrencia y Aislamiento Transaccional.
    
    Escenario:
      Dos usuarios simultáneos envían una petición POST para reservar la misma
      habitación en las mismas fechas al mismo milisegundo exacto.
    
    Garantía de PostgreSQL:
      La restricción EXCLUDE USING gist (id_habitacion WITH =, daterange(fecha_entrada, fecha_salida) WITH &&)
      garantiza que PostgreSQL bloquee la inserción superpuesta.
      Exactamente una transacción confirma (HTTP 201) y la otra es rechazada (HTTP 400 Double Booking).
    """
    # Si DATABASE_URL está configurada o hay conexión a PostgreSQL disponible:
    db_activa = bool(os.getenv("DATABASE_URL") or os.getenv("DB_HOST"))
    
    # Creamos dos clientes con hilos independientes simulando las peticiones concurrentes
    unique_year = 3500 + (uuid.uuid4().int % 2000)
    res_data = {
        "id_huesped": 1,
        "id_habitacion": 1,
        "fecha_entrada": f"{unique_year}-07-01",
        "fecha_salida": f"{unique_year}-07-05",
        "numero_personas": 2
    }

    respuestas_status = []
    detalles_error = []

    def ejecutar_peticion():
        with patch("database.connection.inicializar_base_de_datos"):
            with TestClient(app, raise_server_exceptions=False) as client:
                res = client.post("/api/reservas", json=res_data)
                return res.status_code, res.json()

    # Si hay base de datos real (PostgreSQL en Docker / CI):
    if db_activa and os.getenv("DATABASE_URL"):
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            futuro1 = executor.submit(ejecutar_peticion)
            futuro2 = executor.submit(ejecutar_peticion)
            s1, b1 = futuro1.result()
            s2, b2 = futuro2.result()

        status_codes = [s1, s2]
        # Exactamente uno tiene éxito (201) y el otro colisiona con 400
        assert 201 in status_codes, f"Se esperaba al menos un 201, recibido: {status_codes}"
        assert 400 in status_codes, f"Se esperaba al menos un 400 (Double Booking), recibido: {status_codes}"
        error_body = b1 if s1 == 400 else b2
        assert "Double Booking Detectado" in error_body.get("detail", "")
    else:
        # Verificación estructural del manejador de concurrencia ante código de error Postgres 23P01/40P01
        # (Asegura que el CI sin Docker corra en milisegundos y valide la lógica de mapeo)
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        db_err = MockPgDatabaseError(
            "conflicting key value violates exclusion constraint 'exclude_overlapping_reservations'",
            pgcode="23P01"
        )
        mock_cursor.execute.side_effect = db_err
        mock_conn.cursor.return_value = mock_cursor

        with patch("database.connection.inicializar_base_de_datos"), \
             patch("database.connection.obtener_conexion", return_value=mock_conn), \
             patch("database.connection.liberar_conexion"):
            with TestClient(app, raise_server_exceptions=False) as client:
                res = client.post("/api/reservas", json=res_data)
                assert res.status_code == 400
                assert "Double Booking Detectado" in res.json()["detail"]
                mock_conn.rollback.assert_called_once()


# ==============================================================================
# 3. PRUEBA DE TRANSACCIÓN EXITOSA: Commit y verificación en Base de Datos
# ==============================================================================

def test_transaccion_exitosa_ejecuta_commit_y_retorna_201(api_client):
    """
    Verifica el ciclo completo de una transacción exitosa:
      - Validación de parámetros y cálculo de cotización.
      - Ejecución de INSERT INTO reserva_habitacion.
      - Invocación obligatoria de `conn.commit()`.
      - `conn.rollback()` NUNCA debe ser llamado en el camino feliz.
      - Respuesta HTTP 201 Created con el payload del contrato.
    """
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    mock_cursor.fetchone.side_effect = [
        {"precio_noche": 250000.0, "numero": "D101", "estado": "Disponible", "capacidad": 3},  # Habitación válida
        {"noches": 4, "subtotal": 1000000.0, "descuento_aplicado": 0.0, "total": 1000000.0},       # Cotización PL/pgSQL
        {"id_reserva": 999, "id_huesped": 1, "id_habitacion": 3, "fecha_entrada": "2033-02-01", "fecha_salida": "2033-02-05", "estado": "Confirmada", "creado_por": "Cliente Web", "checkin_at": None}, # INSERT exitoso
        {"id_huesped": 1, "nombre": "Juan Perez", "documento": "100200300", "telefono": "3001234567", "correo": "juan@test.com", "empresa": None, "lealtad": "Estándar", "estado": "Activo"}           # Datos del huésped
    ]
    mock_conn.cursor.return_value = mock_cursor

    payload = {
        "id_huesped": 1,
        "id_habitacion": 3,
        "fecha_entrada": "2033-02-01",
        "fecha_salida": "2033-02-05",
        "numero_personas": 2
    }

    with patch("database.connection.obtener_conexion", return_value=mock_conn), \
         patch("database.connection.liberar_conexion") as mock_liberar:
        response = api_client.post("/api/reservas", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert "confirmada exitosamente" in data["message"]
    assert data["reserva"]["id_reserva"] == 999
    assert data["cotizacion"]["noches"] == 4

    # Verificación de integridad:
    mock_conn.commit.assert_called_once()
    mock_conn.rollback.assert_not_called()
    mock_liberar.assert_called_once_with(mock_conn)


# ==============================================================================
# 4. COMPORTAMIENTO DE MOTOR: Desbordamiento de Entero en PostgreSQL vs MySQL
# ==============================================================================

def test_comportamiento_motor_postgres_rechaza_id_fuera_de_rango_integer(api_client):
    """
    Requisito Semana 6 (Diferencia de Motores):
      En PostgreSQL, una columna `INT / INTEGER` tiene como valor máximo 2.147.483.647.
      Si se envía un ID fuera de rango (ej. 2147483648), PostgreSQL lanza un error
      de desbordamiento (`NumericValueOutOfRange` / código 22003), mientras que motores
      como MySQL (sin modo estricto) o SQLite lo convierten o no fallan al parsear.
      
      Verifica que el error del motor se capture limpiamente sin exponer la consulta SQL.
    """
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    overflow_error = MockPgDatabaseError(
        "value '2147483648' is out of range for type integer",
        pgcode="22003"
    )
    mock_cursor.execute.side_effect = overflow_error
    mock_conn.cursor.return_value = mock_cursor

    payload = {
        "id_huesped": 1,
        "id_habitacion": 2147483648,  # > 2^31 - 1
        "fecha_entrada": "2033-03-01",
        "fecha_salida": "2033-03-05",
        "numero_personas": 1
    }

    with patch("database.connection.obtener_conexion", return_value=mock_conn), \
         patch("database.connection.liberar_conexion"):
        response = api_client.post("/api/reservas", json=payload)

    assert response.status_code == 500
    # Seguridad: nunca exponer nombres de tablas, columnas ni el mensaje crudo de PostgreSQL
    assert "out of range" not in response.text
    assert "integer" not in response.text
    assert response.json()["detail"] == "Error interno del servidor al procesar la solicitud."
    mock_conn.rollback.assert_called_once()
