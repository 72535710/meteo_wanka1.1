from fastapi import APIRouter, HTTPException, status
import pyodbc

from app.schemas.recomendacion import RecomendacionCreate, RecomendacionResponse
from app.services.alert_service import AlertService

router = APIRouter(prefix="/recomendaciones", tags=["Recomendaciones"])


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED, summary="Registrar recomendación agronómica asociada a una alerta")
def registrar_recomendacion(payload: RecomendacionCreate):
    """
    Invoca el procedimiento almacenado sp_RegistrarRecomendacion para asociar
    acciones técnicas de mitigación a una alerta generada.
    """
    try:
        new_id = AlertService.registrar_recomendacion(payload)
        return {
            "id_recomendacion": new_id,
            "id_alerta": payload.id_alerta,
            "titulo": payload.titulo,
            "mensaje": "Recomendación técnica registrada exitosamente."
        }
    except pyodbc.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar recomendación en base de datos: {str(exc)}"
        )
