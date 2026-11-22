from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class AlertaBase(BaseModel):
    id_localidad: int = Field(..., description="Identificador de la localidad afectada")
    tipo_alerta: str = Field(..., min_length=3, max_length=30, description="Tipo de alerta meteorológica (p. ej. Helada, Lluvia intensa)")
    nivel_riesgo: str = Field(..., min_length=3, max_length=20, description="Nivel de riesgo (Bajo, Moderado, Alto, Crítico)")
    descripcion: str = Field(..., min_length=5, max_length=500, description="Descripción técnica de la alerta")


class AlertaCreate(AlertaBase):
    pass


class AlertaUpdateEstado(BaseModel):
    estado: str = Field(..., min_length=3, max_length=20, description="Nuevo estado de la alerta (p. ej. Activa, Inactiva, Atendida)")


class AlertaResponse(AlertaBase):
    id_alerta: int = Field(..., description="Identificador único de la alerta")
    fecha_registro: datetime = Field(..., description="Fecha y hora de registro de la alerta")
    estado: str = Field(..., description="Estado actual de la alerta")
    localidad_nombre: Optional[str] = Field(default=None, description="Nombre de la localidad")

    model_config = ConfigDict(from_attributes=True)
