import logging
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.database.connection import get_db_cursor, rows_to_dict_list, row_to_dict
from app.schemas.alerta import AlertaCreate, AlertaResponse, AlertaUpdateEstado
from app.schemas.recomendacion import RecomendacionCreate, RecomendacionResponse
from app.schemas.clima import ConsultaClimaResponse, ClimaActual, PronosticoDia
from app.services.locality_service import LocalityService
from app.services.open_meteo_service import OpenMeteoService
from app.services.rules_engine import RulesEngine, ReglaAlertaResultado

logger = logging.getLogger("meteo_wanka.alert_service")


class AlertService:
    @staticmethod
    def existe_alerta_activa_reciente(
        id_localidad: int,
        tipo_alerta: str,
        horas_ventana: int = 12
    ) -> Optional[Dict[str, Any]]:
        """
        Verifica si existe una alerta activa del mismo tipo para la localidad
        dentro de la ventana de horas especificada, para evitar alertas duplicadas.
        """
        with get_db_cursor(commit=False) as cursor:
            query = """
                SELECT TOP 1 id_alerta, id_localidad, tipo_alerta, nivel_riesgo, descripcion, fecha_registro, estado
                FROM Alerta
                WHERE id_localidad = ? 
                  AND tipo_alerta = ? 
                  AND estado = 'Activa'
                  AND fecha_registro >= DATEADD(hour, -?, SYSDATETIME())
                ORDER BY fecha_registro DESC
            """
            cursor.execute(query, id_localidad, tipo_alerta, horas_ventana)
            row = cursor.fetchone()
            if row:
                return row_to_dict(cursor, row)
            return None

    @staticmethod
    def registrar_alerta(alerta: AlertaCreate) -> int:
        """
        Ejecuta el procedimiento almacenado sp_RegistrarAlerta.
        """
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(
                "{CALL sp_RegistrarAlerta (?, ?, ?, ?)}",
                alerta.id_localidad,
                alerta.tipo_alerta,
                alerta.nivel_riesgo,
                alerta.descripcion
            )
            row = cursor.fetchone()
            new_id = int(row[0]) if row and row[0] is not None else 0
            return new_id

    @staticmethod
    def registrar_recomendacion(rec: RecomendacionCreate) -> int:
        """
        Ejecuta el procedimiento almacenado sp_RegistrarRecomendacion.
        """
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(
                "{CALL sp_RegistrarRecomendacion (?, ?, ?)}",
                rec.id_alerta,
                rec.titulo,
                rec.descripcion
            )
            row = cursor.fetchone()
            new_id = int(row[0]) if row and row[0] is not None else 0
            return new_id

    @staticmethod
    def actualizar_estado_alerta(id_alerta: int, nuevo_estado: str) -> bool:
        """
        Ejecuta el procedimiento almacenado sp_ActualizarEstadoAlerta.
        """
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(
                "{CALL sp_ActualizarEstadoAlerta (?, ?)}",
                id_alerta,
                nuevo_estado
            )
            row = cursor.fetchone()
            registros = int(row[0]) if row and row[0] is not None else 0
            return registros > 0

    @classmethod
    def listar_alertas(
        cls,
        id_localidad: Optional[int] = None,
        estado: Optional[str] = None
    ) -> List[AlertaResponse]:
        """
        Consulta las alertas registradas en la base de datos con filtro opcional.
        """
        with get_db_cursor(commit=False) as cursor:
            query = """
                SELECT 
                    A.id_alerta,
                    A.id_localidad,
                    A.tipo_alerta,
                    A.nivel_riesgo,
                    A.descripcion,
                    A.fecha_registro,
                    A.estado,
                    L.nombre AS localidad_nombre
                FROM Alerta A
                INNER JOIN Localidad L ON A.id_localidad = L.id_localidad
                WHERE 1 = 1
            """
            params: List[Any] = []
            if id_localidad is not None:
                query += " AND A.id_localidad = ?"
                params.append(id_localidad)
            if estado:
                query += " AND A.estado = ?"
                params.append(estado)
                
            query += " ORDER BY A.fecha_registro DESC"
            cursor.execute(query, *params)
            rows = cursor.fetchall()
            data = rows_to_dict_list(cursor, rows)
            return [AlertaResponse(**item) for item in data]

    @classmethod
    async def consultar_clima_y_generar_alertas(cls, id_localidad: int) -> ConsultaClimaResponse:
        """
        Flujo integrado:
        1. Obtiene localidad de BD.
        2. Consulta datos en tiempo real y pronóstico en Open-Meteo vía HTTPX.
        3. Evalúa reglas agroclimáticas.
        4. Evita generación de alertas duplicadas.
        5. Registra alertas y recomendaciones correspondientes con SPs.
        """
        localidad = LocalityService.obtener_por_id(id_localidad)
        if not localidad:
            raise ValueError(f"Localidad con ID {id_localidad} no encontrada.")

        coords = LocalityService.obtener_coordenadas(localidad.nombre)
        lat = coords["lat"]
        lon = coords["lon"]

        datos_meteo = await OpenMeteoService.obtener_pronostico(lat, lon)
        current = datos_meteo.get("current", {})
        daily = datos_meteo.get("daily", {})

        # Parsear clima actual
        clima_actual_dict = {
            "temperatura": float(current.get("temperature_2m", 0.0)),
            "humedad_relativa": int(current.get("relative_humidity_2m", 0)),
            "precipitacion": float(current.get("precipitation", 0.0)),
            "velocidad_viento": float(current.get("wind_speed_10m", 0.0)),
            "codigo_clima": int(current.get("weather_code", 0)),
            "sensacion_termica": float(current.get("apparent_temperature", 0.0)),
            "presion_atmosferica": float(current.get("surface_pressure", 0.0)),
            "hora_registro": str(current.get("time", datetime.now().isoformat())),
        }
        clima_actual_dict["descripcion_clima"] = OpenMeteoService.interpretar_codigo_wmo(
            clima_actual_dict["codigo_clima"]
        )
        clima_actual_obj = ClimaActual(**clima_actual_dict)

        # Parsear pronóstico de 5 días
        pronostico_dias: List[PronosticoDia] = []
        dias_tiempo = daily.get("time", [])
        for i in range(min(5, len(dias_tiempo))):
            codigo = int(daily.get("weather_code", [0])[i])
            dia_item = PronosticoDia(
                fecha=str(dias_tiempo[i]),
                temperatura_min=float(daily.get("temperature_2m_min", [0.0])[i]),
                temperatura_max=float(daily.get("temperature_2m_max", [0.0])[i]),
                precipitacion_total=float(daily.get("precipitation_sum", [0.0])[i]),
                probabilidad_precipitacion=(
                    int(daily.get("precipitation_probability_max", [0])[i])
                    if daily.get("precipitation_probability_max")
                    else None
                ),
                velocidad_viento_max=float(daily.get("wind_speed_10m_max", [0.0])[i]),
                descripcion_clima=OpenMeteoService.interpretar_codigo_wmo(codigo),
            )
            pronostico_dias.append(dia_item)

        # Evaluar reglas meteorológicas
        pronostico_dicts = [p.model_dump() for p in pronostico_dias]
        alertas_detectadas = RulesEngine.evaluar(clima_actual_dict, pronostico_dicts)

        alertas_guardadas_o_vigentes: List[AlertaResponse] = []

        for regla in alertas_detectadas:
            # Comprobar si ya existe una alerta activa reciente (prevenir duplicados)
            existente = cls.existe_alerta_activa_reciente(
                id_localidad=id_localidad,
                tipo_alerta=regla.tipo_alerta,
                horas_ventana=12
            )

            if existente:
                logger.info(
                    f"Alerta duplicada omitida: '{regla.tipo_alerta}' ya activa para localidad {id_localidad} (ID alerta existente: {existente['id_alerta']})."
                )
                alertas_guardadas_o_vigentes.append(AlertaResponse(
                    id_alerta=existente["id_alerta"],
                    id_localidad=existente["id_localidad"],
                    tipo_alerta=existente["tipo_alerta"],
                    nivel_riesgo=existente["nivel_riesgo"],
                    descripcion=existente["descripcion"],
                    fecha_registro=existente["fecha_registro"],
                    estado=existente["estado"],
                    localidad_nombre=localidad.nombre
                ))
            else:
                # Insertar alerta mediante el SP
                alerta_payload = AlertaCreate(
                    id_localidad=id_localidad,
                    tipo_alerta=regla.tipo_alerta,
                    nivel_riesgo=regla.nivel_riesgo,
                    descripcion=regla.descripcion
                )
                new_alerta_id = cls.registrar_alerta(alerta_payload)

                # Insertar recomendación agronómica asociada mediante el SP
                rec_payload = RecomendacionCreate(
                    id_alerta=new_alerta_id,
                    titulo=regla.recomendacion_titulo,
                    descripcion=regla.recomendacion_descripcion
                )
                cls.registrar_recomendacion(rec_payload)

                alertas_guardadas_o_vigentes.append(AlertaResponse(
                    id_alerta=new_alerta_id,
                    id_localidad=id_localidad,
                    tipo_alerta=regla.tipo_alerta,
                    nivel_riesgo=regla.nivel_riesgo,
                    descripcion=regla.descripcion,
                    fecha_registro=datetime.now(),
                    estado="Activa",
                    localidad_nombre=localidad.nombre
                ))

        return ConsultaClimaResponse(
            id_localidad=id_localidad,
            localidad_nombre=localidad.nombre,
            latitud=lat,
            longitud=lon,
            clima_actual=clima_actual_obj,
            pronostico_5_dias=pronostico_dias,
            alertas_detectadas=alertas_guardadas_o_vigentes
        )
