from typing import List, Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class ReglaAlertaResultado:
    tipo_alerta: str
    nivel_riesgo: str
    descripcion: str
    recomendacion_titulo: str
    recomendacion_descripcion: str


class RulesEngine:
    """
    Motor de reglas agronómicas y meteorológicas adaptadas a las condiciones
    del Valle del Mantaro (altitud 3,200 - 3,400 msnm).
    """

    @classmethod
    def evaluar(
        cls,
        clima_actual: Dict[str, Any],
        pronostico_diario: Optional[List[Dict[str, Any]]] = None
    ) -> List[ReglaAlertaResultado]:
        alertas: List[ReglaAlertaResultado] = []

        temp_actual = clima_actual.get("temperatura", 15.0)
        humedad = clima_actual.get("humedad_relativa", 50)
        precipitacion = clima_actual.get("precipitacion", 0.0)
        viento = clima_actual.get("velocidad_viento", 10.0)
        codigo_wmo = clima_actual.get("codigo_clima", 0)

        # Determinar mínimas y máximas de los próximos días si están disponibles
        min_temp_proyectada = temp_actual
        max_precip_proyectada = precipitacion
        
        if pronostico_diario and len(pronostico_diario) > 0:
            temps_min = [dia.get("temperatura_min", temp_actual) for dia in pronostico_diario[:3]]
            precips = [dia.get("precipitacion_total", 0.0) for dia in pronostico_diario[:3]]
            if temps_min:
                min_temp_proyectada = min(temps_min)
            if precips:
                max_precip_proyectada = max(precips)

        # -----------------------------------------------------------
        # 1. Regla de HELADA AGRONÓMICA
        # -----------------------------------------------------------
        eval_temp_helada = min(temp_actual, min_temp_proyectada)
        if eval_temp_helada <= 0.0:
            alertas.append(ReglaAlertaResultado(
                tipo_alerta="Helada",
                nivel_riesgo="Crítico",
                descripcion=f"Descenso térmico severo proyectado hasta {eval_temp_helada:.1f} °C. Alto riesgo de congelamiento celular y necrosis en cultivos sensibles de papa y hortalizas.",
                recomendacion_titulo="Protección térmica urgente de emergencia ante helada negra/blanca",
                recomendacion_descripcion="Activar quemadores o microaspersión antes de la medianoche. Proteger almácigos con manta térmica y aplicar bioestimulantes de reactivación foliar."
            ))
        elif eval_temp_helada <= 2.0:
            alertas.append(ReglaAlertaResultado(
                tipo_alerta="Helada",
                nivel_riesgo="Alto",
                descripcion=f"Temperatura mínima proyectada de {eval_temp_helada:.1f} °C con riesgo elevado de helada blanca matutina en parcelas de la cuenca baja del Mantaro.",
                recomendacion_titulo="Riego ligero y cobertura de parcelas ante heladas",
                recomendacion_descripcion="Efectuar riego por aspersión ligero al atardecer para mantener calor latente. Evitar remoción o deshierbes en el suelo que aceleren el enfriamiento nocturno."
            ))
        elif eval_temp_helada <= 4.0:
            alertas.append(ReglaAlertaResultado(
                tipo_alerta="Helada",
                nivel_riesgo="Moderado",
                descripcion=f"Bajas temperaturas matutinas estimadas en {eval_temp_helada:.1f} °C. Susceptibilidad en brotes tiernos y floración de leguminosas.",
                recomendacion_titulo="Monitoreo térmico preventivo de cultivos",
                recomendacion_descripcion="Monitorear sectores bajos cercanos al río. Verificar coberturas vegetales en parcelas de haba y maíz."
            ))

        # -----------------------------------------------------------
        # 2. Regla de LLUVIA INTENSA Y ANEGAMIENTO
        # -----------------------------------------------------------
        eval_precip = max(precipitacion, max_precip_proyectada)
        if eval_precip >= 25.0:
            alertas.append(ReglaAlertaResultado(
                tipo_alerta="Lluvia intensa",
                nivel_riesgo="Crítico",
                descripcion=f"Precipitaciones torrenciales acumuladas proyectadas de {eval_precip:.1f} mm. Alto riesgo de anegamiento, escorrentía superficial y lavado de nutrientes.",
                recomendacion_titulo="Apertura urgente de zanjas de drenaje",
                recomendacion_descripcion="Abrir zanjas de sangría en partes bajas para evitar asfixia radicular. Suspender fertilizaciones químicas y proteger terraplenes."
            ))
        elif eval_precip >= 15.0 or codigo_wmo in (81, 82, 95, 96, 99):
            alertas.append(ReglaAlertaResultado(
                tipo_alerta="Lluvia intensa",
                nivel_riesgo="Alto",
                descripcion=f"Aviso de precipitaciones intensas ({eval_precip:.1f} mm) con posibilidad de tormenta y granizo puntual en zonas agrícolas.",
                recomendacion_titulo="Manejo preventivo de escorrentía pluvial",
                recomendacion_descripcion="Limpiar canaletas y acequias colectoras. Suspender aplicaciones foliares para evitar pérdida por lavado pluvial."
            ))

        # -----------------------------------------------------------
        # 3. Regla de TEMPERATURA ELEVADA Y RADIACIÓN (Veranillo)
        # -----------------------------------------------------------
        if temp_actual >= 23.0 and humedad < 40:
            alertas.append(ReglaAlertaResultado(
                tipo_alerta="Temperatura elevada",
                nivel_riesgo="Moderado",
                descripcion=f"Temperatura diurna de {temp_actual:.1f} °C con baja humedad relativa ({humedad}%). Aceleración severa de la tasa de evapotranspiración en maíz y hortalizas.",
                recomendacion_titulo="Riego estratégico matutino y conservación de cobertura (mulch)",
                recomendacion_descripcion="Adelantar turnos de riego a primera hora de la mañana (05:00 a 07:00 am). Mantener rastrojos vegetales entre hileras para conservar la humedad edáfica."
            ))

        return alertas
