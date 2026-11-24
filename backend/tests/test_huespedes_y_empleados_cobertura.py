"""
backend/tests/test_huespedes_y_empleados_cobertura.py

Suite de Pruebas de Cobertura Integral para Huéspedes, Empleados y Habitaciones
Cierra brechas de cobertura de endpoints, manejo de errores 4xx y reglas de negocio
para superar el umbral del 80% en el backend exigido por la Semana 8.
"""
import pytest
from fastapi.testclient import TestClient

def get_auth_token(client: TestClient, usuario: str, contrasena: str) -> str:
    res = client.post("/api/auth/login", json={"usuario": usuario, "contrasena": contrasena})
    assert res.status_code == 200, f"Fallo al autenticar {usuario}: {res.text}"
    return res.json()["access_token"]


# ==============================================================================
# 1. PRUEBAS DE HUÉSPEDES: LISTADO, ESTADO Y BAJA LÓGICA
# ==============================================================================

def test_listar_huespedes_autorizacion_y_estructura(client):
    """
    GET /api/huespedes
    - Administrador y Recepcionista 24h -> 200 OK con estructura de columnas.
    - Ama de llaves -> 403 Forbidden.
    - Sin token -> 401 Unauthorized.
    """
    t_admin = get_auth_token(client, "admin", "Admin2026!")
    t_ama = get_auth_token(client, "amallaves", "Amallaves2026!")

    # 1. Admin autorizado
    res = client.get("/api/huespedes", headers={"Authorization": f"Bearer {t_admin}"})
    assert res.status_code == 200
    huespedes = res.json()
    assert isinstance(huespedes, list)
    assert len(huespedes) >= 1
    primer_huesped = huespedes[0]
    for campo in ("id_huesped", "nombre", "documento", "correo", "estado"):
        assert campo in primer_huesped

    # 2. Rol no operativo (Ama de llaves) -> 403
    res_ama = client.get("/api/huespedes", headers={"Authorization": f"Bearer {t_ama}"})
    assert res_ama.status_code == 403

    # 3. Sin token -> 401
    res_sin_token = client.get("/api/huespedes")
    assert res_sin_token.status_code == 401


def test_cambiar_estado_huesped_validaciones(client):
    """
    PATCH /api/huespedes/{id_huesped}/estado
    - Estado 'Inactivo' y 'Activo' -> 200 OK
    - Estado inválido -> 400 Bad Request
    - ID inexistente -> 404 Not Found
    - Rol sin permiso -> 403 Forbidden
    """
    t_admin = get_auth_token(client, "admin", "Admin2026!")
    t_ama = get_auth_token(client, "amallaves", "Amallaves2026!")
    headers_admin = {"Authorization": f"Bearer {t_admin}"}

    # Estado inválido
    res_inv = client.patch("/api/huespedes/1/estado", json={"estado": "Suspendido"}, headers=headers_admin)
    assert res_inv.status_code == 400
    assert "El estado debe ser" in res_inv.json()["detail"]

    # ID inexistente
    res_404 = client.patch("/api/huespedes/999999/estado", json={"estado": "Inactivo"}, headers=headers_admin)
    assert res_404.status_code == 404

    # Cambio a Inactivo y luego restablecer a Activo
    res_inac = client.patch("/api/huespedes/1/estado", json={"estado": "Inactivo"}, headers=headers_admin)
    assert res_inac.status_code == 200
    assert res_inac.json()["huesped"]["estado"] == "Inactivo"

    res_act = client.patch("/api/huespedes/1/estado", json={"estado": "Activo"}, headers=headers_admin)
    assert res_act.status_code == 200
    assert res_act.json()["huesped"]["estado"] == "Activo"

    # Rol sin permiso
    res_ama = client.patch("/api/huespedes/1/estado", json={"estado": "Inactivo"}, headers={"Authorization": f"Bearer {t_ama}"})
    assert res_ama.status_code == 403


def test_eliminar_huesped_baja_logica(client):
    """
    DELETE /api/huespedes/{id_huesped}
    - Solo Administrador puede dar de baja lógica a un huésped.
    - Recepcionista 24h -> 403 Forbidden.
    - ID inexistente -> 404 Not Found.
    """
    t_admin = get_auth_token(client, "admin", "Admin2026!")
    t_recep = get_auth_token(client, "recepcion", "Recep2026!")

    # 1. Crear un huésped temporal para borrarlo
    res_crear = client.post("/api/user/registro", json={
        "nombre": "Huesped Para Borrar",
        "documento": "BORRAR-99999",
        "telefono": "3119998877",
        "correo": "borrar.temp@example.com",
        "password": "Password123!"
    })
    assert res_crear.status_code == 201
    id_creado = res_crear.json()["usuario"]["id_huesped"]

    # 2. Recepcionista intenta borrar -> 403
    res_recep = client.delete(f"/api/huespedes/{id_creado}", headers={"Authorization": f"Bearer {t_recep}"})
    assert res_recep.status_code == 403

    # 3. Administrador borra exitosamente -> 200
    res_admin = client.delete(f"/api/huespedes/{id_creado}", headers={"Authorization": f"Bearer {t_admin}"})
    assert res_admin.status_code == 200
    assert "desactivado (baja lógica)" in res_admin.json()["message"]

    # 4. Intentar borrar ID inexistente -> 404
    res_404 = client.delete("/api/huespedes/999999", headers={"Authorization": f"Bearer {t_admin}"})
    assert res_404.status_code == 404


# ==============================================================================
# 2. PRUEBAS DE CUENTA DE HUÉSPED: LOGIN, RECUPERACIÓN Y SOCIAL AUTH
# ==============================================================================

def test_login_huesped_caminos_y_errores(client):
    """
    POST /api/user/login
    - Campo vacío -> 400
    - Contraseña vacía -> 400
    - Usuario inexistente -> 400
    - Contraseña incorrecta -> 401
    - Login exitoso -> 200
    """
    # 1. Campo de búsqueda vacío
    res_vacio = client.post("/api/user/login", json={"documento_o_correo": "   ", "password": "123"})
    assert res_vacio.status_code == 400

    # 2. Contraseña vacía
    res_pass_vacia = client.post("/api/user/login", json={"documento_o_correo": "john.doe@example.com", "password": ""})
    assert res_pass_vacia.status_code == 400

    # 3. Usuario inexistente
    res_no_existe = client.post("/api/user/login", json={"documento_o_correo": "no.existe@booking.com", "password": "any"})
    assert res_no_existe.status_code == 400
    assert "No encontramos un registro" in res_no_existe.json()["detail"]

    # 4. Contraseña errónea
    res_bad_pass = client.post("/api/user/login", json={"documento_o_correo": "john.doe@example.com", "password": "ClaveIncorrecta!"})
    assert res_bad_pass.status_code == 401
    assert "Credenciales inválidas" in res_bad_pass.json()["detail"]

    # 5. Login exitoso con huésped seed
    res_ok = client.post("/api/user/login", json={"documento_o_correo": "john.doe@example.com", "password": "john123"})
    assert res_ok.status_code == 200
    assert "Bienvenido de nuevo" in res_ok.json()["message"]
    assert res_ok.json()["usuario"]["correo"] == "john.doe@example.com"


def test_recuperar_y_restablecer_password(client):
    """
    POST /api/user/recuperar-password & POST /api/user/restablecer-password
    - Flujo completo de recuperación y actualización de clave.
    """
    # 1. Recuperar con campo vacío -> 400
    res_rec_vacio = client.post("/api/user/recuperar-password", json={"correo_o_documento": "  "})
    assert res_rec_vacio.status_code == 400

    # 2. Recuperar usuario inexistente -> 400
    res_rec_no = client.post("/api/user/recuperar-password", json={"correo_o_documento": "inexistente@correo.com"})
    assert res_rec_no.status_code == 400

    # 3. Recuperar usuario existente -> 200 con correo enmascarado
    res_rec_ok = client.post("/api/user/recuperar-password", json={"correo_o_documento": "john.doe@example.com"})
    assert res_rec_ok.status_code == 200
    assert "instrucciones" in res_rec_ok.json()["message"]

    # 4. Restablecer con contraseña muy corta (< 4 caracteres) -> 400
    res_rest_corta = client.post("/api/user/restablecer-password", json={
        "correo_o_documento": "john.doe@example.com",
        "nueva_password": "12"
    })
    assert res_rest_corta.status_code == 400

    # 5. Restablecer usuario inexistente -> 400
    res_rest_no = client.post("/api/user/restablecer-password", json={
        "correo_o_documento": "fantasma@example.com",
        "nueva_password": "NuevaClave2026!"
    })
    assert res_rest_no.status_code == 400

    # 6. Restablecer exitoso
    res_rest_ok = client.post("/api/user/restablecer-password", json={
        "correo_o_documento": "john.doe@example.com",
        "nueva_password": "NuevaClave2026!"
    })
    assert res_rest_ok.status_code == 200

    # 7. Comprobar login con nueva clave
    res_log_nueva = client.post("/api/user/login", json={
        "documento_o_correo": "john.doe@example.com",
        "password": "NuevaClave2026!"
    })
    assert res_log_nueva.status_code == 200

    # 8. Devolver clave a john123 para no afectar otras pruebas
    client.post("/api/user/restablecer-password", json={
        "correo_o_documento": "john.doe@example.com",
        "nueva_password": "john123"
    })


def test_auth_social_huesped_validaciones(client):
    """
    POST /api/user/auth-social
    - Parámetros faltantes -> 400
    - Usuario existente -> 200 (es_nuevo = False)
    - Usuario nuevo -> 200 (es_nuevo = True)
    """
    # 1. Faltan datos obligatorios
    res_invalido = client.post("/api/user/auth-social", json={"proveedor": "Google", "nombre": "", "correo": ""})
    assert res_invalido.status_code == 400

    # 2. Huésped existente (john.doe@example.com)
    res_existente = client.post("/api/user/auth-social", json={
        "proveedor": "Google",
        "nombre": "John Doe",
        "correo": "john.doe@example.com"
    })
    assert res_existente.status_code == 200
    assert res_existente.json()["es_nuevo"] is False

    # 3. Nuevo huésped social
    import uuid
    correo_nuevo = f"social_{uuid.uuid4().hex[:6]}@gmail.com"
    res_nuevo = client.post("/api/user/auth-social", json={
        "proveedor": "Apple",
        "nombre": "Cliente Apple Test",
        "correo": correo_nuevo
    })
    assert res_nuevo.status_code == 200
    assert res_nuevo.json()["es_nuevo"] is True
    assert res_nuevo.json()["usuario"]["correo"] == correo_nuevo


# ==============================================================================
# 3. PRUEBAS DE GESTIÓN DE EMPLEADOS: FILTROS Y PROTECCIÓN DE SUPERUSUARIO
# ==============================================================================

def test_listar_empleados_con_filtros(client):
    """
    GET /api/empleados
    - Filtrar por estado 'Activo' e 'Inactivo'.
    - Filtrar por rol 'Recepcionista 24h'.
    - Combinación sin resultados.
    """
    t_admin = get_auth_token(client, "admin", "Admin2026!")
    headers = {"Authorization": f"Bearer {t_admin}"}

    # 1. Filtro por estado Activo
    res_activos = client.get("/api/empleados?estado=Activo", headers=headers)
    assert res_activos.status_code == 200
    for emp in res_activos.json():
        assert emp["estado"] == "Activo"

    # 2. Filtro por rol
    res_recep = client.get("/api/empleados?rol=Recepcionista 24h", headers=headers)
    assert res_recep.status_code == 200
    for emp in res_recep.json():
        assert emp["rol"] == "Recepcionista 24h"

    # 3. Filtro sin coincidencias
    res_vacio = client.get("/api/empleados?estado=Inactivo&rol=Grupo BookingSoft", headers=headers)
    assert res_vacio.status_code == 200
    assert res_vacio.json() == []


def test_modificar_rol_empleado_validaciones(client):
    """
    PATCH /api/empleados/{id}/rol
    - Protección de superusuario Grupo BookingSoft (id 1) -> 403 Forbidden
    - Rol no permitido (ej. 'Administrador' o rol inventado) -> 400 Bad Request
    - Empleado no encontrado -> 404 Not Found
    - Cambio válido -> 200 OK
    """
    t_admin = get_auth_token(client, "admin", "Admin2026!")
    headers = {"Authorization": f"Bearer {t_admin}"}

    # 1. Bloqueo al creador Grupo BookingSoft
    res_super = client.patch("/api/empleados/1/rol", json={"rol": "Personal de mantenimiento"}, headers=headers)
    assert res_super.status_code == 403
    assert "inmutable" in res_super.json()["detail"]

    # 2. Rol no asignable
    res_inv = client.patch("/api/empleados/3/rol", json={"rol": "Gerente General"}, headers=headers)
    assert res_inv.status_code == 400

    # 3. Empleado inexistente
    res_404 = client.patch("/api/empleados/999999/rol", json={"rol": "Ama de llaves"}, headers=headers)
    assert res_404.status_code == 404

    # 4. Cambio válido
    res_ok = client.patch("/api/empleados/3/rol", json={"rol": "Personal de mantenimiento"}, headers=headers)
    assert res_ok.status_code == 200
    assert res_ok.json()["empleado"]["rol_nuevo"] == "Personal de mantenimiento"

    # Restaurar rol a Recepcionista 24h
    client.patch("/api/empleados/3/rol", json={"rol": "Recepcionista 24h"}, headers=headers)


def test_modificar_estado_empleado_validaciones(client):
    """
    PATCH /api/empleados/{id}/estado
    - Bloqueo de desactivación a Grupo BookingSoft (id 1) -> 403 Forbidden
    - Estado inválido -> 400 Bad Request
    - Empleado no encontrado -> 404 Not Found
    """
    t_admin = get_auth_token(client, "admin", "Admin2026!")
    headers = {"Authorization": f"Bearer {t_admin}"}

    # 1. Intento de desactivar a Grupo BookingSoft
    res_super = client.patch("/api/empleados/1/estado", json={"estado": "Inactivo"}, headers=headers)
    assert res_super.status_code == 403
    assert "Grupo BookingSoft" in res_super.json()["detail"] or "protegido" in res_super.json()["detail"]

    # 2. Estado inválido
    res_inv = client.patch("/api/empleados/3/estado", json={"estado": "Suspendido"}, headers=headers)
    assert res_inv.status_code == 400

    # 3. Empleado no encontrado
    res_404 = client.patch("/api/empleados/999999/estado", json={"estado": "Inactivo"}, headers=headers)
    assert res_404.status_code == 404


# ==============================================================================
# 4. PRUEBAS DE HABITACIONES: DISPONIBILIDAD Y GESTIÓN DE MANTENIMIENTO
# ==============================================================================

def test_habitaciones_disponibilidad_errores_de_validacion(client):
    """
    GET /api/habitaciones/disponibilidad
    - Formato de fecha inválido -> 400 Bad Request
    - fecha_salida <= fecha_entrada -> 400 Bad Request
    - id_habitacion inexistente -> 404 Not Found
    """
    t_admin = get_auth_token(client, "admin", "Admin2026!")
    headers = {"Authorization": f"Bearer {t_admin}"}

    # 1. Formato de fecha inválido
    res_fmt = client.get("/api/habitaciones/disponibilidad?fecha_entrada=2026/11/01&fecha_salida=2026/11/05", headers=headers)
    assert res_fmt.status_code == 400
    assert "Formato de fechas inválido" in res_fmt.json()["detail"]

    # 2. Salida anterior a entrada
    res_inv = client.get("/api/habitaciones/disponibilidad?fecha_entrada=2026-11-10&fecha_salida=2026-11-05", headers=headers)
    assert res_inv.status_code == 400
    assert "posterior" in res_inv.json()["detail"]

    # 3. Habitación no encontrada
    res_404 = client.get("/api/habitaciones/disponibilidad?fecha_entrada=2026-11-01&fecha_salida=2026-11-05&id_habitacion=999999", headers=headers)
    assert res_404.status_code == 404


def test_cambiar_estado_habitacion_mantenimiento(client):
    """
    PATCH /api/habitaciones/{id_habitacion}/estado
    - Cambiar estado a 'Mantenimiento' con reporte de daño -> 200 OK
    - Restaurar a 'Disponible' limpiando el reporte -> 200 OK
    - Estado no válido -> 400 Bad Request
    - Habitación inexistente -> 404 Not Found
    """
    t_ama = get_auth_token(client, "amallaves", "Amallaves2026!")
    headers = {"Authorization": f"Bearer {t_ama}"}

    # 1. Estado inválido
    res_inv = client.patch("/api/habitaciones/1/estado", json={"estado": "Clausurada"}, headers=headers)
    assert res_inv.status_code == 400
    assert "Estado inválido" in res_inv.json()["detail"]

    # 2. Habitación inexistente
    res_404 = client.patch("/api/habitaciones/999999/estado", json={"estado": "Disponible"}, headers=headers)
    assert res_404.status_code == 404

    # 3. Cambiar a Mantenimiento con reporte
    res_mant = client.patch("/api/habitaciones/1/estado", json={
        "estado": "Mantenimiento",
        "detalle_mantenimiento": "Revisión técnica de aire acondicionado"
    }, headers=headers)
    assert res_mant.status_code == 200
    assert res_mant.json()["estado"] == "Mantenimiento"
    assert "Revisión técnica" in res_mant.json()["detalle_mantenimiento"]

    # 4. Restaurar a Disponible
    res_disp = client.patch("/api/habitaciones/1/estado", json={"estado": "Disponible"}, headers=headers)
    assert res_disp.status_code == 200
    assert res_disp.json()["estado"] == "Disponible"
    assert res_disp.json()["detalle_mantenimiento"] == ""
