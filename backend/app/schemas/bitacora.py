from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class BitacoraItemResponse(BaseModel):
    id_alerta: int = Field(..., description="Identificador de la alerta")
    localidad: str = Field(..., description="Nombre de la localidad")
    tipo_alerta: str = Field(..., description="Tipo de alerta meteorológica")
    nivel_riesgo: str = Field(..., description="Nivel de riesgo asignado")
    detalle_alerta: str = Field(..., description="Descripción técnica de la alerta")
    fecha_registro: datetime = Field(..., description="Fecha y hora de registro")
    estado: str = Field(..., description="Estado de la alerta")
    recomendacion: Optional[str] = Field(default=None, description="Título de la recomendación agronómica asociada")
    detalle_recomendacion: Optional[str] = Field(default=None, description="Detalle de la recomendación agronómica")

    model_config = ConfigDict(from_attributes=True)
