import logging
from contextlib import contextmanager
from typing import Generator, Any, Dict, List, Optional
import pyodbc

from app.core.config import settings

logger = logging.getLogger("meteo_wanka.database")


def get_db_connection() -> pyodbc.Connection:
    """
    Crea y retorna una nueva conexión pyodbc a SQL Server utilizando la configuración.
    """
    conn_str = settings.odbc_connection_str
    try:
        connection = pyodbc.connect(conn_str, autocommit=False)
        return connection
    except pyodbc.Error as exc:
        logger.error(f"Error al conectar con SQL Server: {exc}")
        raise


@contextmanager
def get_db_cursor(commit: bool = False) -> Generator[pyodbc.Cursor, None, None]:
    """
    Context manager para obtener un cursor de base de datos.
    Maneja commit / rollback y el cierre de conexión de forma limpia.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        yield cursor
        if commit:
            conn.commit()
    except Exception as exc:
        conn.rollback()
        logger.error(f"Error durante la transacción en base de datos: {exc}")
        raise
    finally:
        cursor.close()
        conn.close()


def row_to_dict(cursor: pyodbc.Cursor, row: pyodbc.Row) -> Dict[str, Any]:
    """
    Convierte una fila de pyodbc.Row a un diccionario Python con nombres de columnas.
    """
    if row is None:
        return {}
    columns = [column[0] for column in cursor.description]
    return dict(zip(columns, row))


def rows_to_dict_list(cursor: pyodbc.Cursor, rows: List[pyodbc.Row]) -> List[Dict[str, Any]]:
    """
    Convierte una lista de filas pyodbc.Row a una lista de diccionarios Python.
    """
    if not rows:
        return []
    columns = [column[0] for column in cursor.description]
    return [dict(zip(columns, row)) for row in rows]
