import os
import psycopg2
import sys
from dotenv import load_dotenv

# Cargar variables de entorno del archivo .env
load_dotenv()

DB_USER = os.getenv("DB_USER", "adso_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "adso_password")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "bookingsoft")


def obtener_conexion():
    """Establece y retorna la conexión con la base de datos PostgreSQL."""
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )


def inicializar_base_de_datos():
    """Conecta a PostgreSQL e inicializa tablas. Si falla la conexión, la aplicación no arranca."""
    
    print(f"[FastAPI] Conectando a la base de datos física PostgreSQL en {DB_HOST}:{DB_PORT} (Base: {DB_NAME})...")
    try:
        conn = obtener_conexion()
        cursor = conn.cursor()
        
        # Si RESET_DB=true está activo explícitamente, ejecutar reinicio destructivo de tablas
        if os.getenv("RESET_DB", "false").lower() in ("true", "1", "yes"):
            print("[FastAPI] RESET_DB=true detectado. Ejecutando limpieza destructiva de tablas...")
            cursor.execute("""
                DROP TABLE IF EXISTS factura CASCADE;
                DROP TABLE IF EXISTS check_out CASCADE;
                DROP TABLE IF EXISTS check_in CASCADE;
                DROP TABLE IF EXISTS reserva_habitacion CASCADE;
                DROP TABLE IF EXISTS habitacion CASCADE;
                DROP TABLE IF EXISTS huesped CASCADE;
                DROP TABLE IF EXISTS empleado CASCADE;
            """)
            conn.commit()

        # Verificar si las tablas principales existen. Si no, corre schema.sql para crearlas.
        cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'huesped');")
        existe = cursor.fetchone()[0]
        if not existe:
            print("[FastAPI] Estructura de tablas no detectada. Corriendo inicialización idempotente schema.sql...")
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
            print("[FastAPI] Conexión exitosa a PostgreSQL. Las tablas ya existen y están activas.")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print("\n❌ [ERROR CRÍTICO] Fallo de conexión con la base de datos PostgreSQL.")
        print(f"   Host: {DB_HOST}:{DB_PORT} | Base de datos: {DB_NAME} | Usuario: {DB_USER}")
        print(f"   Detalle del error de psycopg2: {e}")
        print("❌ El backend no puede iniciar sin base de datos. Saliendo...\n")
        sys.exit(1)
