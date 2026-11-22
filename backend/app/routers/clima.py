from fastapi import APIRouter, HTTPException, Query, status
import httpx
import pyodbc

from app.schemas.clima import ConsultaClimaResponse
from app.services.alert_service import AlertService
from app.services.open_meteo_service import OpenMeteoService

router = APIRouter(prefix="/clima", tags=["Clima & Open-Meteo"])


@router.get("/consultar/{id_localidad}", response_model=ConsultaClimaResponse, summary="Consultar clima Open-Meteo y evaluar alertas para una localidad")
async def consultar_clima_localidad(id_localidad: int):
    """
    1. Obtiene las coordenadas de la localidad desde la base de datos.
    2. Consulta las condiciones climáticas actuales y pronóstico en tiempo real desde Open-Meteo.
    3. Evalúa el motor de reglas agroclimáticas.
    4. Previene la duplicación de alertas si ya existe una alerta activa reciente.
    5. Registra alertas y recomendaciones pertinentes mediante procedimientos almacenados.
    """
    try:
        resultado = await AlertService.consultar_clima_y_generar_alertas(id_localidad)
        return resultado
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(val_err))
    except httpx.HTTPError as http_err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error en comunicación con servicio externo Open-Meteo: {str(http_err)}"
        )
    except pyodbc.Error as db_err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en base de datos: {str(db_err)}"
        )


@router.get("/raw", summary="Consulta climática directa a Open-Meteo por coordenadas")
async def consulta_directa_coordenadas(
    latitud: float = Query(..., description="Latitud geográfica"),
    longitud: float = Query(..., description="Longitud geográfica")
):
    """
    Consulta directa sin procesamiento agronómico ni registro en base de datos.
    """
    try:
        return await OpenMeteoService.obtener_pronostico(latitud, longitud)
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error en Open-Meteo: {str(exc)}"
        )
