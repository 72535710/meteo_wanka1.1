from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class LocalidadBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100, description="Nombre de la localidad")
    provincia: str = Field(..., min_length=2, max_length=100, description="Provincia a la que pertenece")
    altitud_msnm: Optional[int] = Field(default=None, ge=0, le=7000, description="Altitud en metros sobre el nivel del mar")


class LocalidadCreate(LocalidadBase):
    pass


class LocalidadResponse(LocalidadBase):
    id_localidad: int = Field(..., description="Identificador único de la localidad")

    model_config = ConfigDict(from_attributes=True)
