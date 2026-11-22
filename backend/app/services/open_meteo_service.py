import logging
from typing import Dict, Any, List
import httpx

from app.core.config import settings

logger = logging.getLogger("meteo_wanka.open_meteo")

# Tabla de códigos WMO Weather interpretation codes
WMO_DESCRIPTIONS: Dict[int, str] = {
    0: "Cielo despejado",
    1: "Principalmente despejado",
    2: "Parcialmente nublado",
    3: "Cielo cubierto o nublado",
    45: "Niebla",
    48: "Niebla con escarcha depositada",
    51: "Llovizna ligera",
    53: "Llovizna moderada",
    55: "Llovizna densa",
    61: "Lluvia ligera",
    62: "Lluvia moderada",
    65: "Lluvia intensa y continua",
    71: "Nevada ligera",
    73: "Nevada moderada",
    75: "Nevada fuerte",
    80: "Chubascos de lluvia ligeros",
    81: "Chubascos de lluvia moderados",
    82: "Chubascos torrenciales o violentos",
    95: "Tormenta eléctrica ligera o moderada",
    96: "Tormenta eléctrica con granizo leve",
    99: "Tormenta eléctrica con granizo fuerte"
}


class OpenMeteoService:
    @staticmethod
    def interpretar_codigo_wmo(code: int) -> str:
        return WMO_DESCRIPTIONS.get(code, "Condición meteorológica variable")

    @classmethod
    async def obtener_pronostico(cls, latitud: float, longitud: float) -> Dict[str, Any]:
        """
        Realiza la consulta asíncrona a la API pública de Open-Meteo.
        """
        params = {
            "latitude": latitud,
            "longitude": longitud,
            "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,surface_pressure,weather_code,wind_speed_10m",
            "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max",
            "timezone": "America/Lima"
        }
        
        url = settings.OPEN_METEO_BASE_URL
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as exc:
                logger.error(f"Error consultando Open-Meteo API ({latitud}, {longitud}): {exc}")
                raise
