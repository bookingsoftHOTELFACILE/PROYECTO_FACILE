import pytest
import uuid
from database import connection
import bcrypt

def test_registro_exitoso(client, admin_token):
    # Utilizamos un correo y doc aleatorio para que la prueba sea idempotente
    unique_id = str(uuid.uuid4())[:8]
    payload = {
        "nombre": "Test User",
        "usuario": f"testuser_{unique_id}",
        "contrasena": "Password123!",
        "tipo_documento": "Cédula de ciudadanía",
        "numero_documento": f"999{unique_id}",
        "correo": f"test_{unique_id}@example.com",
        "rol": "Recepcionista 24h"
    }
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.post("/api/auth/registro", json=payload, headers=headers)
    
    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "Empleado registrado exitosamente."
    assert data["empleado"]["usuario"] == payload["usuario"]
    
def test_registro_usuario_duplicado(client, admin_token):
    # Se intenta registrar el usuario que ya existe por el seed data
    payload = {
        "nombre": "Duplicado",
        "usuario": "admin",  # Ya existe
        "contrasena": "Password123!",
        "tipo_documento": "Cédula de ciudadanía",
        "numero_documento": "11111111",
        "correo": "bookingsoft4@gmail.com",
        "rol": "Recepcionista 24h"
    }
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.post("/api/auth/registro", json=payload, headers=headers)
    
    assert response.status_code == 409
    assert "ya está en uso" in response.json()["detail"]

def test_login_valido(client):
    response = client.post("/api/auth/login", json={
        "usuario": "recepcion",
        "contrasena": "Recep2026!"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    # Decodificar el token para verificar sub y rol no es estricto en pruebas de e2e,
    # pero podemos verificar que el token sea un string y exista
    assert data["token_type"] == "bearer"

def test_login_credenciales_incorrectas(client):
    res_bad_pass = client.post("/api/auth/login", json={
        "usuario": "admin",
        "contrasena": "Mal12345"
    })
    res_bad_user = client.post("/api/auth/login", json={
        "usuario": "no_existe",
        "contrasena": "Admin2026!"
    })
    
    assert res_bad_pass.status_code == 401
    assert res_bad_user.status_code == 401
    # Mensaje exactamente igual para prevenir user enumeration
    assert res_bad_pass.json()["detail"] == res_bad_user.json()["detail"]

def test_login_usuario_inactivo(client):
    # Creamos un usuario inactivo directamente en BD para no depender de la lógica de registro
    conn = connection.obtener_conexion()
    cur = conn.cursor()
    unique_id = str(uuid.uuid4())[:8]
    user_name = f"inactivo_{unique_id}"
    hashed = bcrypt.hashpw(b"Inactivo123!", bcrypt.gensalt()).decode()
    cur.execute(
        """
        INSERT INTO empleado (nombre, usuario, contrasena, rol, tipo_documento, numero_documento, correo, estado)
        VALUES (%s, %s, %s, 'Recepcionista 24h', 'Cédula de ciudadanía', %s, %s, 'Inactivo')
        """,
        ("Inactivo User", user_name, hashed, f"888{unique_id}", f"inactivo_{unique_id}@example.com")
    )
    conn.commit()
    cur.close()
    conn.close()
    
    # Intentamos loguearnos
    res = client.post("/api/auth/login", json={
        "usuario": user_name,
        "contrasena": "Inactivo123!"
    })
    
    assert res.status_code == 403
    assert "cuenta inactiva" in res.json()["detail"].lower()

def test_control_acceso_sin_token(client):
    # Intentar obtener reservas sin token
    response = client.get("/api/reservas")
    assert response.status_code == 401

def test_control_acceso_rol_sin_permiso(client):
    # Login como Ama de llaves (amallaves) que no tiene permisos operativos
    res_login = client.post("/api/auth/login", json={
        "usuario": "amallaves",
        "contrasena": "Amallaves2026!"
    })
    token = res_login.json()["access_token"]
    
    # Intentar obtener reservas (restringido a Operativos)
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/reservas", headers=headers)
    
    assert res.status_code == 403

def test_control_acceso_firma_manipulada(client):
    headers = {"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake_payload.fake_signature"}
    response = client.get("/api/reservas", headers=headers)
    assert response.status_code == 401

def test_auth_social_google_nuevo_y_existente(client):
    unique_id = str(uuid.uuid4())[:8]
    payload = {
        "proveedor": "google",
        "nombre": f"Usuario Google {unique_id}",
        "correo": f"test_social_{unique_id}@gmail.com",
        "documento": f"G-{unique_id}",
        "telefono": "3009876543",
        "empresa": "Google Workspace"
    }

    user_id = None
    try:
        # 1. Primer registro social
        res1 = client.post("/api/user/auth-social", json=payload)
        assert res1.status_code == 200
        data1 = res1.json()
        assert data1["es_nuevo"] is True
        assert "usuario" in data1
        assert data1["usuario"]["correo"] == payload["correo"]
        assert data1["usuario"]["id_huesped"] is not None
        user_id = data1["usuario"]["id_huesped"]

        # 2. Segundo intento con mismo correo debe iniciar sesión sin error y retornar el mismo ID
        res2 = client.post("/api/user/auth-social", json={
            "proveedor": "google",
            "nombre": payload["nombre"],
            "correo": payload["correo"]
        })
        assert res2.status_code == 200
        data2 = res2.json()
        assert data2["es_nuevo"] is False
        assert data2["usuario"]["id_huesped"] == user_id
    finally:
        # P1-1.5 — Teardown: la suite no debe acumular huéspedes de prueba en la
        # base de datos compartida (se ejecuta también cuando un assert falla).
        if user_id is not None:
            try:
                from database import connection
                conn = connection.obtener_conexion()
                cur = conn.cursor()
                cur.execute("DELETE FROM huesped WHERE id_huesped = %s", (user_id,))
                conn.commit()
                cur.close()
                connection.liberar_conexion(conn)
            except Exception:
                pass  # El teardown nunca debe enmascarar el fallo real del test

