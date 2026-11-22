from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class RecomendacionBase(BaseModel):
    id_alerta: int = Field(..., description="Identificador de la alerta asociada")
    titulo: str = Field(..., min_length=3, max_length=150, description="Título breve de la recomendación técnica")
    descripcion: str = Field(..., min_length=5, max_length=500, description="Detalle de las acciones agronómicas preventivas")


class RecomendacionCreate(RecomendacionBase):
    pass


class RecomendacionResponse(RecomendacionBase):
    id_recomendacion: int = Field(..., description="Identificador único de la recomendación")

    model_config = ConfigDict(from_attributes=True)
