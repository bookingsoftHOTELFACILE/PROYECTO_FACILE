import os
import sys
import logging
import psycopg2
import psycopg2.pool
from dotenv import load_dotenv

# Configurar logger para que errores de DB vayan al servidor, nunca al cliente
logger = logging.getLogger("bookingsoft.db")

# Cargar variables de entorno del archivo .env
load_dotenv()

DB_USER     = os.getenv("DB_USER",     "adso_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "adso_password")
DB_HOST     = os.getenv("DB_HOST",     "localhost")
DB_PORT     = os.getenv("DB_PORT",     "5432")
DB_NAME     = os.getenv("DB_NAME",     "bookingsoft")

# Hallazgo 08: Pool de conexiones para evitar crear un handshake TCP por cada petición.
# ThreadedConnectionPool es compatible con FastAPI (Starlette usa hilos por defecto).
_pool: psycopg2.pool.ThreadedConnectionPool | None = None


def _inicializar_pool() -> None:
    """Crea el pool la primera vez. Mínimo 1 conexión, máximo 20."""
    global _pool
    _pool = psycopg2.pool.ThreadedConnectionPool(
        minconn=1,
        maxconn=20,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
    )
    logger.info("[DB Pool] Pool de conexiones ThreadedConnectionPool inicializado (1–20 conexiones).")


def obtener_conexion() -> psycopg2.extensions.connection:
    """
    Obtiene una conexión del pool. Si el pool aún no fue inicializado lo crea.
    Hallazgo 08: Sin pool, cada petición abría y cerraba un handshake TCP completo.
    """
    global _pool
    if _pool is None or _pool.closed:
        _inicializar_pool()
    return _pool.getconn()


def liberar_conexion(conn: psycopg2.extensions.connection) -> None:
    """Devuelve la conexión al pool en lugar de cerrarla."""
    global _pool
    if _pool and not _pool.closed and conn:
        _pool.putconn(conn)


# Migraciones idempotentes que schema.sql no puede aplicar por sí solo:
# schema.sql solo se ejecuta cuando las tablas no existen, por lo que las bases vivas
# no recibirían columnas nuevas. Cada entrada debe ser segura de repetir (IF NOT EXISTS).
# Ver también el bloque ALTER equivalente dentro de schema.sql.
_MIGRACIONES = (
    # HU-005 (CA-005.1 / CA-005.4): marca temporal física del check-in / check-out.
    "ALTER TABLE reserva_habitacion ADD COLUMN IF NOT EXISTS checkin_at TIMESTAMP",
    "ALTER TABLE reserva_habitacion ADD COLUMN IF NOT EXISTS checkout_at TIMESTAMP",
    # Fase 3 — RF-013: notas internas de la reserva, editables desde el PMS.
    "ALTER TABLE reserva_habitacion ADD COLUMN IF NOT EXISTS observaciones VARCHAR(300)",
    # Fase 2 — Módulo financiero (pagos + factura electrónica simulada). Las bases
    # vivas no reciben las tablas nuevas de schema.sql, así que viajan aquí.
    """
    CREATE TABLE IF NOT EXISTS pago (
        id_pago        SERIAL PRIMARY KEY,
        id_reserva     INT NOT NULL REFERENCES reserva_habitacion(id_reserva) ON DELETE CASCADE,
        monto          DECIMAL(12,2) NOT NULL CHECK (monto > 0),
        metodo         VARCHAR(30) NOT NULL CHECK (metodo IN
            ('Efectivo', 'Tarjeta de crédito', 'Tarjeta de débito', 'PSE', 'Nequi', 'Transferencia', 'Bono')),
        estado         VARCHAR(20) NOT NULL DEFAULT 'Confirmado' CHECK (estado IN
            ('Pendiente', 'Confirmado', 'Rechazado', 'Anulado', 'Reembolsado')),
        referencia     VARCHAR(80),
        referencia_gateway VARCHAR(80),
        gateway        VARCHAR(30) NOT NULL DEFAULT 'simulado',
        creado_por     VARCHAR(150) DEFAULT 'Sistema',
        modificado_por VARCHAR(150) DEFAULT 'Sistema',
        creado_en      TIMESTAMP NOT NULL DEFAULT now(),
        modificado_en  TIMESTAMP
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_pago_reserva ON pago(id_reserva)",
    # Factura electrónica SIMULADA (borrador UBL 2.1). Una por reserva.
    """
    CREATE TABLE IF NOT EXISTS factura (
        id_factura    SERIAL PRIMARY KEY,
        id_reserva    INT UNIQUE NOT NULL REFERENCES reserva_habitacion(id_reserva) ON DELETE CASCADE,
        consecutivo   VARCHAR(30) UNIQUE NOT NULL,
        cufe          VARCHAR(64) NOT NULL,
        fecha_emision TIMESTAMP NOT NULL DEFAULT now(),
        estado        VARCHAR(20) NOT NULL DEFAULT 'Borrador' CHECK (estado IN ('Borrador', 'Emitida', 'Anulada')),
        xml           TEXT NOT NULL,
        creado_por    VARCHAR(150) DEFAULT 'Sistema'
    )
    """,
)


def _aplicar_migraciones(cursor):
    """Ejecuta las migraciones idempotentes declaradas en _MIGRACIONES."""
    for sql in _MIGRACIONES:
        cursor.execute(sql)


def inicializar_base_de_datos():
    """
    Conecta a PostgreSQL e inicializa tablas via schema.sql.
    - Crea el pool de conexiones (Hallazgo 08).
    - Si falla la conexión, la aplicación no arranca.
    """
    print(f"[FastAPI] Conectando a PostgreSQL en {DB_HOST}:{DB_PORT} (Base: {DB_NAME})...")
    try:
        _inicializar_pool()
        conn = obtener_conexion()
        cursor = conn.cursor()

        # Si RESET_DB=true está activo explícitamente, ejecutar reinicio destructivo de tablas
        if os.getenv("RESET_DB", "false").lower() in ("true", "1", "yes"):
            print("[FastAPI] RESET_DB=true detectado. Ejecutando limpieza destructiva de tablas...")
            # Hallazgo 13: se eliminaron los DROP TABLE huérfanos (check_out, check_in).
            # Fase 2: `pago` y `factura` se eliminan ANTES que `reserva_habitacion`
            # (foránea hacia ella) para no romper el orden de borrado.
            cursor.execute("""
                DROP TABLE IF EXISTS factura CASCADE;
                DROP TABLE IF EXISTS pago CASCADE;
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

        # Aplica las columnas nuevas a bases vivas (idempotente).
        _aplicar_migraciones(cursor)
        conn.commit()

        cursor.close()
        liberar_conexion(conn)

    except Exception as e:
        # Hallazgo 07 / M-07: el detalle técnico va al log del servidor, nunca al cliente.
        logger.exception(
            "[ERROR CRÍTICO] Fallo de conexión con PostgreSQL. Host: %s:%s | Base: %s | Usuario: %s",
            DB_HOST, DB_PORT, DB_NAME, DB_USER
        )
        print(f"\n❌ [ERROR CRÍTICO] Fallo de conexión con la base de datos PostgreSQL.")
        print(f"   Host: {DB_HOST}:{DB_PORT} | Base: {DB_NAME} | Usuario: {DB_USER}")
        print(f"   Detalle: {e}")
        print("❌ El backend no puede iniciar sin base de datos. Saliendo...\n")
        sys.exit(1)
