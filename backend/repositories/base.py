"""
backend/repositories/base.py

Capa de repositorio (Fase D / hallazgo M-05) — punto único de acceso a
PostgreSQL para las rutas.

Antes cada endpoint repetía el patrón manual::

    conn = connection.obtener_conexion()
    cur = conn.cursor()
    try:
        ...
        conn.commit()
    finally:
        cur.close()
        connection.liberar_conexion(conn)

Ese patrón es propenso a errores: un `return` o un `raise HTTPException` a
medio camino dejaba la conexión sin cerrar y, peor aún, **sin `rollback`**, de
modo que la transacción abierta volvía al pool y afectaba a la siguiente
petición que la reutilizara.

Aquí el ciclo de vida vive en un solo lugar y los endpoints sólo ven el cursor::

    with cursor_escritura() as cur:
        cur.execute("INSERT ...")

M-06 — Los cursores se crean con `RealDictCursor`: cada fila se consulta por
**nombre de columna** (`fila["id_reserva"]`) y no por posición (`fila[0]`).
El acceso posicional es frágil: añadir una columna a un `SELECT` desordena
silenciosamente todos los consumidores de esa consulta.
"""
import logging
from contextlib import contextmanager

from psycopg2.extras import RealDictCursor

from database import connection

logger = logging.getLogger("bookingsoft.repositories")


def _crear_cursor():
    """Abre una conexión del pool y crea un cursor por nombre de columna (M-06)."""
    conn = connection.obtener_conexion()
    try:
        return conn, conn.cursor(cursor_factory=RealDictCursor)
    except BaseException:
        connection.liberar_conexion(conn)
        raise


def _cerrar(conn, cur) -> None:
    """Cierra el cursor y devuelve la conexión al pool sin enmascarar el error original."""
    try:
        cur.close()
    except Exception:  # pragma: no cover - cierre defensivo
        logger.debug("No fue posible cerrar el cursor; se devuelve la conexión al pool.")
    connection.liberar_conexion(conn)


@contextmanager
def cursor_lectura():
    """
    Cursor de solo lectura.

    Libera la conexión al salir igual que el código anterior, sin confirmar
    transacciones: nada se escribe desde este bloque.
    """
    conn, cur = _crear_cursor()
    try:
        yield cur
    finally:
        _cerrar(conn, cur)


@contextmanager
def cursor_escritura():
    """
    Cursor con ciclo de vida de transacción completo.

    - Éxito: `commit()` automático (los endpoints ya no lo escriben a mano).
    - Fallo (incluido `HTTPException`): `rollback()` automático, de modo que
      una operación abortada no deja escrituras a medias ni una transacción
      abierta de vuelta en el pool.
    """
    conn, cur = _crear_cursor()
    try:
        yield cur
    except BaseException:
        try:
            conn.rollback()
        except Exception:  # pragma: no cover - rollback defensivo
            logger.debug("No fue posible hacer rollback de la transacción abortada.")
        raise
    else:
        try:
            conn.commit()
        except Exception:
            # Un commit fallido no debe dejar la conexión "exitosa" en el pool.
            try:
                conn.rollback()
            except Exception:  # pragma: no cover - rollback defensivo
                logger.debug("No fue posible hacer rollback tras un commit fallido.")
            raise
    finally:
        _cerrar(conn, cur)
