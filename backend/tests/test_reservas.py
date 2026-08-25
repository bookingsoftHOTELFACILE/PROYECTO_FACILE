import pytest
import threading
import concurrent.futures
from httpx import Client

def test_reserva_descuento(client, admin_token):
    # Reserva de más de 15 noches (aplica 15% descuento)
    # Habitacion 1, precio_noche = 243,000 (según seed data)
    import random
    year = 2030 + random.randint(1, 1000)
    res_data = {
        "id_huesped": 1,
        "id_habitacion": 1,
        "fecha_entrada": f"{year}-01-01",
        "fecha_salida": f"{year}-01-17", # 16 noches
        "numero_personas": 2
    }
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.post("/api/reservas", json=res_data, headers=headers)
    assert response.status_code == 201, response.text
    
    data = response.json()
    noches = data["cotizacion"]["noches"]
    subtotal = data["cotizacion"]["subtotal"]
    descuento = data["cotizacion"]["descuento"]
    
    assert noches == 16
    assert subtotal == 16 * 243000
    assert descuento == subtotal * 0.15

def test_reserva_supera_capacidad(client, admin_token):
    # Habitacion 1 tiene capacidad para 2 personas.
    res_data = {
        "id_huesped": 1,
        "id_habitacion": 1,
        "fecha_entrada": "2030-02-01",
        "fecha_salida": "2030-02-05",
        "numero_personas": 5 # Supera la capacidad
    }
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.post("/api/reservas", json=res_data, headers=headers)
    
    assert response.status_code == 400
    assert "Capacidad excedida" in response.json()["detail"]

def test_reserva_concurrencia_double_booking():
    """
    Simulamos dos llamadas casi simultáneas para la misma habitación 
    y fechas. Solo una debe ganar, la otra debe fallar por Double Booking.
    """
    from fastapi.testclient import TestClient
    from main import app
    
    # Generar token real (vamos a hacerlo sincrono una vez)
    with TestClient(app) as local_client:
        r = local_client.post("/api/auth/login", json={"usuario": "sandra_admin", "contrasena": "Admin2026!"})
        token = r.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
    
    import random
    year = 2030 + random.randint(1, 1000)
    res_data = {
        "id_huesped": 1,
        "id_habitacion": 5, # Usar otra habitacion
        "fecha_entrada": f"{year}-10-01",
        "fecha_salida": f"{year}-10-10",
        "numero_personas": 2
    }
    
    def hacer_reserva():
        # Instanciar TestClient local al hilo, apuntando a app
        with TestClient(app) as c:
            return c.post("/api/reservas", json=res_data, headers=headers)

    # Disparar 2 hilos al mismo tiempo
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        future1 = executor.submit(hacer_reserva)
        future2 = executor.submit(hacer_reserva)
        
        response1 = future1.result()
        response2 = future2.result()

    status_codes = [response1.status_code, response2.status_code]
    
    # Validamos que exactamente uno sea 201 (Creado) y otro sea 400 (Double Booking)
    assert 201 in status_codes
    assert 400 in status_codes
    
    # Verificar que el error del 400 sea específicamente por Double Booking
    error_response = response1 if response1.status_code == 400 else response2
    assert "Double Booking Detectado" in error_response.json()["detail"]
