"""
backend/tests/test_bd_fake_repository.py

Pruebas unitarias de Dobles de Prueba tipo FAKE (Semana 5 - Capa BD - Sebastián Parada @sebasparada).
Verifica el repositorio en memoria FakeReservaRepository:
  1. Operaciones CRUD en memoria (guardar, autoincremento de ID, consulta por ID).
  2. Filtrado de reservas activas excluyendo canceladas.
  3. Detección de traslape de fechas (Double Booking) emulando EXCLUDE de PostgreSQL.
  4. Cancelación segura de reservas y manejo de IDs inexistentes.
  5. Ejecución ultra rápida en memoria (Principios FIRST - Fast) en milisegundos sin PostgreSQL.
"""
import time
import pytest
from database.fake_repository import FakeReservaRepository


@pytest.fixture
def fake_repo():
    """Retorna una instancia limpia del repositorio en memoria para cada prueba."""
    repo = FakeReservaRepository()
    yield repo
    repo.limpiar()


# ==============================================================================
# 1. PRUEBA: Guardar y recuperar reserva por ID en memoria
# ==============================================================================

def test_fake_repository_guardar_y_obtener_por_id(fake_repo):
    # Arrange: datos de una nueva reserva
    datos = {
        "id_huesped": 1,
        "huesped_nombre": "Sebastián Parada",
        "huesped_documento": "1098765432",
        "id_habitacion": 101,
        "habitacion_numero": "D101",
        "fecha_entrada": "2026-12-01",
        "fecha_salida": "2026-12-05",
        "creado_por": "Recepcionista 24h",
    }

    # Act: guardamos en el fake repository
    guardada = fake_repo.guardar(datos)
    recuperada = fake_repo.obtener_por_id(guardada["id_reserva"])

    # Assert: comprobamos persistencia en RAM e integridad de datos
    assert guardada["id_reserva"] == 1
    assert recuperada is not None
    assert recuperada["huesped_nombre"] == "Sebastián Parada"
    assert recuperada["habitacion_numero"] == "D101"
    assert recuperada["estado"] == "Confirmada"


# ==============================================================================
# 2. PRUEBA: Listado de activas excluye reservas canceladas
# ==============================================================================

def test_fake_repository_listar_activas_excluye_canceladas(fake_repo):
    # Arrange: sembramos dos reservas
    r1 = fake_repo.guardar({
        "id_huesped": 1,
        "id_habitacion": 101,
        "fecha_entrada": "2026-12-01",
        "fecha_salida": "2026-12-03",
    })
    r2 = fake_repo.guardar({
        "id_huesped": 2,
        "id_habitacion": 102,
        "fecha_entrada": "2026-12-04",
        "fecha_salida": "2026-12-08",
    })

    # Act: cancelamos la primera reserva
    resultado_cancelar = fake_repo.cancelar(r1["id_reserva"], audit_str="Admin Test")

    # Assert
    assert resultado_cancelar is True
    activas = fake_repo.listar_activas()
    todas = fake_repo.listar_todas()

    assert len(activas) == 1
    assert activas[0]["id_reserva"] == r2["id_reserva"]
    assert len(todas) == 2
    assert fake_repo.obtener_por_id(r1["id_reserva"])["estado"] == "Cancelada"


# ==============================================================================
# 3. PRUEBA: Cancelar ID inexistente retorna False
# ==============================================================================

def test_fake_repository_cancelar_inexistente_retorna_false(fake_repo):
    # Act & Assert: intentar cancelar un ID que no está en el Fake
    exito = fake_repo.cancelar(99999, audit_str="Admin")
    assert exito is False


# ==============================================================================
# 4. PRUEBA: Detección de colisión de fechas (Double Booking en memoria)
# ==============================================================================

def test_fake_repository_detecta_traslape_double_booking(fake_repo):
    # Arrange: Habitación 201 reservada del 10 al 15 de diciembre
    fake_repo.guardar({
        "id_huesped": 1,
        "id_habitacion": 201,
        "fecha_entrada": "2026-12-10",
        "fecha_salida": "2026-12-15",
    })

    # Act & Assert 1: Solapamiento parcial (12 al 17) -> Debe dar True
    assert fake_repo.existe_traslape(201, "2026-12-12", "2026-12-17") is True

    # Act & Assert 2: Misma habitación, pero entra el día que sale la otra (15 al 20) -> False (permitido)
    assert fake_repo.existe_traslape(201, "2026-12-15", "2026-12-20") is False

    # Act & Assert 3: Rango de fechas coincidente pero en OTRA habitación (202) -> False
    assert fake_repo.existe_traslape(202, "2026-12-10", "2026-12-15") is False


# ==============================================================================
# 5. PRUEBA: Traslape ignorado si la reserva previa está cancelada
# ==============================================================================

def test_fake_repository_ignora_traslape_si_reserva_fue_cancelada(fake_repo):
    # Arrange: Creamos reserva y luego la cancelamos
    reserva = fake_repo.guardar({
        "id_huesped": 1,
        "id_habitacion": 301,
        "fecha_entrada": "2026-12-20",
        "fecha_salida": "2026-12-25",
    })
    fake_repo.cancelar(reserva["id_reserva"])

    # Act & Assert: Intentar reservar el mismo rango exacto en la misma habitación
    # Como la anterior fue cancelada, la habitación está libre (traslape = False)
    assert fake_repo.existe_traslape(301, "2026-12-20", "2026-12-25") is False


# ==============================================================================
# 6. PRUEBA: Rendimiento ultra rápido (Principios FIRST - Fast)
# ==============================================================================

def test_fake_repository_rendimiento_en_milisegundos(fake_repo):
    """
    Verifica que el Fake Repository ejecute 200 operaciones en RAM
    en menos de 50 milisegundos sin latencia de disco ni PostgreSQL.
    """
    inicio = time.perf_counter()

    for i in range(1, 101):
        fake_repo.guardar({
            "id_huesped": i,
            "id_habitacion": 100 + (i % 10),
            "fecha_entrada": "2026-11-01",
            "fecha_salida": "2026-11-05",
        })

    assert len(fake_repo.listar_todas()) == 100
    fake_repo.cancelar(50)
    assert len(fake_repo.listar_activas()) == 99

    duracion = time.perf_counter() - inicio
    # Debe tardar muchísimo menos de 0.05s (50 ms)
    assert duracion < 0.05

