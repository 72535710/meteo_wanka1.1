from typing import List
from fastapi import APIRouter, HTTPException, status
import pyodbc

from app.schemas.localidad import LocalidadCreate, LocalidadResponse
from app.services.locality_service import LocalityService

router = APIRouter(prefix="/localidades", tags=["Localidades"])


@router.get("", response_model=List[LocalidadResponse], summary="Listar todas las localidades registradas")
def listar_localidades():
    """
    Invoca el procedimiento almacenado sp_ListarLocalidades para obtener
    el catálogo completo de localidades del Valle del Mantaro.
    """
    try:
        return LocalityService.listar_localidades()
    except pyodbc.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al consultar base de datos: {str(exc)}"
        )


@router.post("", response_model=LocalidadResponse, status_code=status.HTTP_201_CREATED, summary="Registrar una nueva localidad")
def registrar_localidad(payload: LocalidadCreate):
    """
    Invoca el procedimiento almacenado sp_RegistrarLocalidad para agregar una nueva localidad.
    """
    try:
        return LocalityService.registrar_localidad(payload)
    except pyodbc.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar localidad en base de datos: {str(exc)}"
        )


@router.get("/{id_localidad}", response_model=LocalidadResponse, summary="Obtener una localidad por ID")
def obtener_localidad(id_localidad: int):
    """
    Consulta los detalles de una localidad por su identificador primario.
    """
    try:
        localidad = LocalityService.obtener_por_id(id_localidad)
        if not localidad:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Localidad con ID {id_localidad} no encontrada."
            )
        return localidad
    except pyodbc.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al consultar base de datos: {str(exc)}"
        )
