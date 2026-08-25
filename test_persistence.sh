#!/bin/bash
# test_persistence.sh

set -e

# Asegurar que el entorno esté limpio y corriendo
echo "Reiniciando entorno Docker..."
docker compose down -v
docker compose up -d

echo "Esperando a que la DB esté lista..."
sleep 15

# Hacer login y obtener token
echo "Obteniendo token JWT..."
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"sandra_admin","contrasena":"Admin2026!"}' | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Fallo al obtener token."
    exit 1
fi

# Crear una reserva
echo "Creando reserva..."
RESERVA_ID=$(curl -s -X POST http://localhost:4000/api/reservas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "id_huesped": 1,
        "id_habitacion": 1,
        "fecha_entrada": "2031-01-01",
        "fecha_salida": "2031-01-05",
        "numero_personas": 2
      }' | grep -o '"id_reserva":[0-9]*' | cut -d':' -f2)

if [ -z "$RESERVA_ID" ]; then
    echo "Fallo al crear reserva."
    exit 1
fi

echo "Reserva creada exitosamente con ID: $RESERVA_ID"

echo "Deteniendo contenedor de backend..."
docker compose stop backend

echo "Iniciando contenedor de backend..."
docker compose start backend
sleep 5

echo "Verificando si la reserva sobrevive al reinicio..."
# Obtenemos las reservas y verificamos que el ID exista
HTTP_STATUS=$(curl -s -o temp_resp.json -w "%{http_code}" -X GET http://localhost:4000/api/reservas \
  -H "Authorization: Bearer $TOKEN")

if [ "$HTTP_STATUS" -ne 200 ]; then
    echo "Fallo al consultar reservas después del reinicio. Status: $HTTP_STATUS"
    exit 1
fi

if grep -q "\"id_reserva\":$RESERVA_ID" temp_resp.json; then
    echo "✅ PERSISTENCIA CONFIRMADA: La reserva $RESERVA_ID sobrevivió al reinicio del contenedor del backend."
else
    echo "❌ ERROR: La reserva $RESERVA_ID desapareció después del reinicio."
    exit 1
fi

rm temp_resp.json
echo "Prueba de persistencia completada."
