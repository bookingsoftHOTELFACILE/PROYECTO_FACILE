import os
import psycopg2
from dotenv import load_dotenv

# Cargar variables de entorno del archivo .env
load_dotenv()

DB_USER = os.getenv("DB_USER", "adso_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "adso_password")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "bookingsoft")

# Bandera para saber si trabajamos con base de datos real o simulación en memoria
MODO_SIMULACION = False

# Datos en memoria iniciales para que el sistema funcione Zero-Config (offline)
huespedes_simulacion = [
    {
        "id_huesped": 1,
        "nombre": "John Doe",
        "documento": "12345678",
        "telefono": "3115551234",
        "correo": "john.doe@example.com",
        "empresa": None,
        "lealtad": "Silver",
        "estado": "Activo"
    },
    {
        "id_huesped": 2,
        "nombre": "Sofía Restrepo",
        "documento": "98765432",
        "telefono": "3126667890",
        "correo": "sofia.restrepo@bancolombia.com.co",
        "empresa": "Bancolombia",
        "lealtad": "Gold",
        "estado": "Activo"
    },
    {
        "id_huesped": 3,
        "nombre": "Thomas Miller",
        "documento": "PP998877",
        "telefono": "+155589012",
        "correo": "thomas.miller@siemens.com",
        "empresa": "Siemens",
        "lealtad": "Platinum",
        "estado": "Activo"
    }
]

habitaciones_simulacion = [
    {"id_habitacion": 1, "numero": "101A", "tipo": "Habitaciones", "capacidad": 2, "precio_noche": 243000.00, "estado": "Disponible"},
    {"id_habitacion": 2, "numero": "102A", "tipo": "Habitaciones", "capacidad": 2, "precio_noche": 243000.00, "estado": "Disponible"},
    {"id_habitacion": 3, "numero": "201D", "tipo": "Dúplex", "capacidad": 3, "precio_noche": 350000.00, "estado": "Disponible"},
    {"id_habitacion": 4, "numero": "202D", "tipo": "Dúplex", "capacidad": 3, "precio_noche": 350000.00, "estado": "Mantenimiento"},
    {"id_habitacion": 5, "numero": "301F", "tipo": "Familiar", "capacidad": 5, "precio_noche": 480000.00, "estado": "Disponible"}
]

reservas_simulacion = [
    {
        "id_reserva": 1,
        "id_huesped": 1,
        "huesped_nombre": "John Doe",
        "huesped_documento": "12345678",
        "id_habitacion": 1,
        "habitacion_numero": "101A",
        "habitacion_tipo": "Habitaciones",
        "fecha_entrada": "2026-06-15",
        "fecha_salida": "2026-06-18",
        "estado": "Confirmada"
    },
    {
        "id_reserva": 2,
        "id_huesped": 2,
        "huesped_nombre": "Sofía Restrepo",
        "huesped_documento": "98765432",
        "id_habitacion": 3,
        "habitacion_numero": "201D",
        "habitacion_tipo": "Dúplex",
        "fecha_entrada": "2026-06-20",
        "fecha_salida": "2026-06-25",
        "estado": "Confirmada"
    }
]

def obtener_conexion():
    """Establece y retorna la conexión con la base de datos PostgreSQL."""
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )

def es_modo_simulacion() -> bool:
    """Retorna True si estamos en modo simulación offline (sin base de datos física)."""
    return MODO_SIMULACION

def establecer_modo_simulacion(valor: bool):
    """Permite encender o apagar la bandera del modo simulación."""
    global MODO_SIMULACION
    MODO_SIMULACION = valor

def inicializar_base_de_datos():
    """Intenta conectar a PostgreSQL. Si falla, activa el modo simulación en memoria."""
    global MODO_SIMULACION
    print("[FastAPI] Conectando a la base de datos física (PostgreSQL)...")
    try:
        conn = obtener_conexion()
        cursor = conn.cursor()
        
        # Verificar si la tabla huesped existe. Si no, corre schema.sql para crearla.
        cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'huesped');")
        existe = cursor.fetchone()[0]
        if not existe:
            print("[FastAPI] Estructura de tablas no detectada. Corriendo inicialización schema.sql...")
            schema_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "schema.sql")
            if os.path.exists(schema_path):
                with open(schema_path, "r", encoding="utf-8") as f:
                    schema_sql = f.read()
                cursor.execute(schema_sql)
                conn.commit()
                print("[FastAPI] Base de datos física inicializada y sembrada con éxito.")
            else:
                print("[FastAPI] ADVERTENCIA: No se encontró schema.sql.")
        else:
            print("[FastAPI] Conexión exitosa a PostgreSQL. Las tablas están activas.")
            
        cursor.close()
        conn.close()
        MODO_SIMULACION = False
    except Exception as e:
        MODO_SIMULACION = True
        print("\n⚠️  [FastAPI] ADVERTENCIA: No se pudo conectar a la base de datos PostgreSQL.")
        print(f"Detalle: {e}")
        print("Activando MODO SIMULACIÓN en memoria para demostración funcional (Zero-Config).\n")
