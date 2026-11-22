from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
import pyodbc

from app.schemas.alerta import AlertaCreate, AlertaResponse, AlertaUpdateEstado
from app.services.alert_service import AlertService

router = APIRouter(prefix="/alertas", tags=["Alertas"])


@router.get("", response_model=List[AlertaResponse], summary="Consultar alertas registradas")
def listar_alertas(
    id_localidad: Optional[int] = Query(default=None, description="Filtrar por localidad"),
    estado: Optional[str] = Query(default=None, description="Filtrar por estado (p. ej. Activa, Inactiva, Atendida)")
):
    """
    Retorna la lista de alertas con sus datos de localidad y fecha de registro.
    """
    try:
        return AlertService.listar_alertas(id_localidad=id_localidad, estado=estado)
    except pyodbc.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al consultar alertas: {str(exc)}"
        )


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED, summary="Registrar alerta meteorológica manualmente")
def registrar_alerta(payload: AlertaCreate):
    """
    Invoca el procedimiento almacenado sp_RegistrarAlerta.
    """
    try:
        new_id = AlertService.registrar_alerta(payload)
        return {
            "id_alerta": new_id,
            "mensaje": "Alerta registrada exitosamente.",
            "data": payload.model_dump()
        }
    except pyodbc.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar alerta en base de datos: {str(exc)}"
        )


@router.patch("/{id_alerta}/estado", summary="Actualizar estado de una alerta")
@router.put("/{id_alerta}/estado", summary="Actualizar estado de una alerta")
def actualizar_estado(id_alerta: int, payload: AlertaUpdateEstado):
    """
    Invoca el procedimiento almacenado sp_ActualizarEstadoAlerta para modificar el estado
    (por ejemplo: 'Activa', 'Inactiva', 'Cerrada', 'Atendida').
    """
    try:
        actualizado = AlertService.actualizar_estado_alerta(id_alerta, payload.estado)
        if not actualizado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No se encontró la alerta con ID {id_alerta} o no hubo cambios."
            )
        return {
            "id_alerta": id_alerta,
            "nuevo_estado": payload.estado,
            "mensaje": "Estado de alerta actualizado correctamente."
        }
    except pyodbc.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar estado de la alerta: {str(exc)}"
        )
