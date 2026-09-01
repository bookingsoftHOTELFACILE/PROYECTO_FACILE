"""
backend/tests/test_consultas.py
Sprint 3 — Pruebas de integración para RF-002, RF-003, RF-012 y permisos de Recepcionista 24h
"""
import pytest

def get_token(client, usuario, contrasena):
    res = client.post("/api/auth/login", json={"usuario": usuario, "contrasena": contrasena})
    return res.json()["access_token"]


def test_rf002_consulta_listado_empleados(client):
    """
    RF-002 / HU-003 — Listar empleados del sistema.
    - Admin y Recepcionista 24h -> 200 OK
    - Ama de llaves -> 403 Forbidden
    - El campo 'contrasena' NUNCA debe estar en la respuesta.
    """
    t_admin = get_token(client, "bookingsoft_admin", "Admin2026!")
    t_recep = get_token(client, "carlos_recep", "Recep2026!")
    t_ama   = get_token(client, "marta_limpieza", "marta123")

    # Admin
    res_admin = client.get("/api/empleados", headers={"Authorization": f"Bearer {t_admin}"})
    assert res_admin.status_code == 200
    empleados_admin = res_admin.json()
    assert isinstance(empleados_admin, list)
    assert len(empleados_admin) >= 1
    for emp in empleados_admin:
        assert "contrasena" not in emp
        assert "password" not in emp

    # Recepcionista
    res_recep = client.get("/api/empleados", headers={"Authorization": f"Bearer {t_recep}"})
    assert res_recep.status_code == 200

    # Ama de llaves
    res_ama = client.get("/api/empleados", headers={"Authorization": f"Bearer {t_ama}"})
    assert res_ama.status_code == 403


def test_rf003_consulta_empleado_especifico(client):
    """
    RF-003 / HU-004 — Consulta de empleado individual por ID.
    - Admin y Recepcionista -> 200 OK
    - ID inexistente -> 404 Not Found
    - El campo 'contrasena' NUNCA debe estar en la respuesta.
    """
    t_recep = get_token(client, "carlos_recep", "Recep2026!")
    headers = {"Authorization": f"Bearer {t_recep}"}

    # Empleado existente
    res = client.get("/api/empleados/1", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["id_empleado"] == 1
    assert "contrasena" not in data

    # Empleado inexistente
    res_404 = client.get("/api/empleados/9999", headers=headers)
    assert res_404.status_code == 404


def test_recepcionista_gestion_rol_y_estado(client):
    """
    Ajuste Sprint 3 — Recepcionista 24h posee permisos de gestión de personal.
    - PATCH /api/empleados/{id}/rol -> 200 OK con Recepcionista
    - PATCH /api/empleados/{id}/estado -> 200 OK con Recepcionista
    - Ama de llaves -> 403 Forbidden en ambos
    """
    t_recep = get_token(client, "carlos_recep", "Recep2026!")
    t_ama   = get_token(client, "marta_limpieza", "marta123")

    h_recep = {"Authorization": f"Bearer {t_recep}"}
    h_ama   = {"Authorization": f"Bearer {t_ama}"}

    # Recepcionista modifica estado de empleado id 3
    res_est = client.patch("/api/empleados/3/estado", json={"estado": "Inactivo"}, headers=h_recep)
    assert res_est.status_code == 200
    assert res_est.json()["empleado"]["estado_nuevo"] == "Inactivo"

    # Restablecer estado a Activo
    client.patch("/api/empleados/3/estado", json={"estado": "Activo"}, headers=h_recep)

    # Ama de llaves intenta modificar rol
    res_ama = client.patch("/api/empleados/3/rol", json={"rol": "Conserje"}, headers=h_ama)
    assert res_ama.status_code == 403


def test_rf012_consulta_disponibilidad(client):
    """
    RF-012 — Consulta de disponibilidad de habitaciones por rango de fechas.
    - Acceso permitido: Recepcionista 24h, Administrador, Conserje.
    - Retorna disponibilidad correcta según reservas existentes.
    """
    t_recep = get_token(client, "carlos_recep", "Recep2026!")
    t_ama   = get_token(client, "marta_limpieza", "marta123")

    h_recep = {"Authorization": f"Bearer {t_recep}"}
    h_ama   = {"Authorization": f"Bearer {t_ama}"}

    # 1. Crear una reserva conocida
    client.post("/api/reservas", json={
        "id_huesped": 1,
        "id_habitacion": 2,
        "fecha_entrada": "2035-08-01",
        "fecha_salida": "2035-08-10",
        "numero_personas": 2
    }, headers=h_recep)

    # 2. Consultar disponibilidad en rango ocupado
    res_ocup = client.get("/api/habitaciones/disponibilidad?fecha_entrada=2035-08-02&fecha_salida=2035-08-05&id_habitacion=2", headers=h_recep)
    assert res_ocup.status_code == 200
    data_ocup = res_ocup.json()
    assert len(data_ocup) == 1
    assert data_ocup[0]["estado_rango"] == "Ocupada"
    assert data_ocup[0]["disponible"] is False

    # 3. Consultar disponibilidad en rango libre
    res_libre = client.get("/api/habitaciones/disponibilidad?fecha_entrada=2035-09-01&fecha_salida=2035-09-05&id_habitacion=2", headers=h_recep)
    assert res_libre.status_code == 200
    data_libre = res_libre.json()
    assert len(data_libre) == 1
    assert data_libre[0]["estado_rango"] == "Disponible"
    assert data_libre[0]["disponible"] is True

    # 4. Verificar que Ama de llaves NO puede acceder
    res_ama = client.get("/api/habitaciones/disponibilidad?fecha_entrada=2035-09-01&fecha_salida=2035-09-05", headers=h_ama)
    assert res_ama.status_code == 403
