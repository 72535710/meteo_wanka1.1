from typing import List
from app.database.connection import get_db_cursor, rows_to_dict_list
from app.schemas.bitacora import BitacoraItemResponse


class BitacoraService:
    @staticmethod
    def consultar_bitacora() -> List[BitacoraItemResponse]:
        """
        Ejecuta el procedimiento almacenado sp_ConsultarBitacora.
        Retorna el historial completo de alertas y recomendaciones ordenado cronológicamente descendente.
        """
        with get_db_cursor(commit=False) as cursor:
            cursor.execute("{CALL sp_ConsultarBitacora}")
            rows = cursor.fetchall()
            data = rows_to_dict_list(cursor, rows)
            return [BitacoraItemResponse(**item) for item in data]
