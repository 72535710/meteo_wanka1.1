from typing import List, Optional, Dict, Any
import pyodbc

from app.database.connection import get_db_cursor, rows_to_dict_list, row_to_dict
from app.schemas.localidad import LocalidadCreate, LocalidadResponse

# Coordenadas geográficas estándar para localidades conocidas del Valle del Mantaro
COORDINATES_MAP: Dict[str, Dict[str, float]] = {
    "huancayo": {"lat": -12.0651, "lon": -75.2049},
    "concepcion": {"lat": -11.9189, "lon": -75.3117},
    "jauja": {"lat": -11.7758, "lon": -75.4969},
    "chupaca": {"lat": -12.0636, "lon": -75.2889},
    "sicaya": {"lat": -12.0305, "lon": -75.2819},
    "sapallanga": {"lat": -12.1333, "lon": -75.1667},
    "pilcomayo": {"lat": -12.0489, "lon": -75.2444},
    "orcotuna": {"lat": -11.9686, "lon": -75.3347},
    "matahuasi": {"lat": -11.9056, "lon": -75.3389},
}


class LocalityService:
    @staticmethod
    def listar_localidades() -> List[LocalidadResponse]:
        """
        Ejecuta el procedimiento almacenado sp_ListarLocalidades.
        """
        with get_db_cursor(commit=False) as cursor:
            cursor.execute("{CALL sp_ListarLocalidades}")
            rows = cursor.fetchall()
            data = rows_to_dict_list(cursor, rows)
            return [LocalidadResponse(**item) for item in data]

    @staticmethod
    def registrar_localidad(localidad: LocalidadCreate) -> LocalidadResponse:
        """
        Ejecuta el procedimiento almacenado sp_RegistrarLocalidad.
        """
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(
                "{CALL sp_RegistrarLocalidad (?, ?, ?)}",
                localidad.nombre,
                localidad.provincia,
                localidad.altitud_msnm
            )
            row = cursor.fetchone()
            new_id = int(row[0]) if row and row[0] is not None else 0
            
            return LocalidadResponse(
                id_localidad=new_id,
                nombre=localidad.nombre,
                provincia=localidad.provincia,
                altitud_msnm=localidad.altitud_msnm
            )

    @staticmethod
    def obtener_por_id(id_localidad: int) -> Optional[LocalidadResponse]:
        """
        Obtiene una localidad por su identificador único.
        """
        with get_db_cursor(commit=False) as cursor:
            cursor.execute(
                "SELECT id_localidad, nombre, provincia, altitud_msnm FROM Localidad WHERE id_localidad = ?",
                id_localidad
            )
            row = cursor.fetchone()
            if not row:
                return None
            data = row_to_dict(cursor, row)
            return LocalidadResponse(**data)

    @staticmethod
    def obtener_coordenadas(localidad_nombre: str) -> Dict[str, float]:
        """
        Retorna las coordenadas geográficas aproximadas según el nombre o las coordenadas centrales del valle.
        """
        nombre_clean = localidad_nombre.strip().lower()
        if nombre_clean in COORDINATES_MAP:
            return COORDINATES_MAP[nombre_clean]
        
        # Búsqueda parcial
        for key, coords in COORDINATES_MAP.items():
            if key in nombre_clean:
                return coords
                
        # Por defecto Huancayo / Valle del Mantaro
        return {"lat": -12.0651, "lon": -75.2049}
