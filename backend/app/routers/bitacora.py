from typing import List
from fastapi import APIRouter, HTTPException, status
import pyodbc

from app.schemas.bitacora import BitacoraItemResponse
from app.services.bitacora_service import BitacoraService

router = APIRouter(prefix="/bitacora", tags=["Bitácora"])


@router.get("", response_model=List[BitacoraItemResponse], summary="Consultar bitácora histórica de alertas y recomendaciones")
def consultar_bitacora():
    """
    Invoca el procedimiento almacenado sp_ConsultarBitacora para recuperar
    el historial cronológico consolidado de alertas emitidas, estados y recomendaciones técnicas.
    """
    try:
        return BitacoraService.consultar_bitacora()
    except pyodbc.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al consultar la bitácora histórica: {str(exc)}"
        )
