from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.alerta import AlertaResponse


class ClimaActual(BaseModel):
    temperatura: float = Field(..., description="Temperatura actual en °C")
    humedad_relativa: int = Field(..., description="Humedad relativa en %")
    precipitacion: float = Field(..., description="Precipitación acumulada en mm")
    velocidad_viento: float = Field(..., description="Velocidad del viento en km/h")
    codigo_clima: int = Field(..., description="Código meteorológico WMO")
    descripcion_clima: str = Field(..., description="Descripción del tiempo")
    sensacion_termica: Optional[float] = Field(default=None, description="Sensación térmica en °C")
    presion_atmosferica: Optional[float] = Field(default=None, description="Presión atmosférica en hPa")
    hora_registro: str = Field(..., description="Hora de registro de los datos")


class PronosticoDia(BaseModel):
    fecha: str = Field(..., description="Fecha del pronóstico (YYYY-MM-DD)")
    temperatura_min: float = Field(..., description="Temperatura mínima en °C")
    temperatura_max: float = Field(..., description="Temperatura máxima en °C")
    precipitacion_total: float = Field(..., description="Precipitación total proyectada en mm")
    probabilidad_precipitacion: Optional[int] = Field(default=None, description="Probabilidad de lluvia en %")
    velocidad_viento_max: float = Field(..., description="Velocidad máxima del viento en km/h")
    descripcion_clima: str = Field(..., description="Descripción del tiempo para el día")


class ConsultaClimaResponse(BaseModel):
    id_localidad: int = Field(..., description="ID de la localidad consultada")
    localidad_nombre: str = Field(..., description="Nombre de la localidad")
    latitud: float = Field(..., description="Latitud utilizada")
    longitud: float = Field(..., description="Longitud utilizada")
    clima_actual: ClimaActual = Field(..., description="Datos del clima en tiempo real")
    pronostico_5_dias: List[PronosticoDia] = Field(default_factory=list, description="Pronóstico diario")
    alertas_detectadas: List[AlertaResponse] = Field(default_factory=list, description="Alertas generadas o vigentes")
