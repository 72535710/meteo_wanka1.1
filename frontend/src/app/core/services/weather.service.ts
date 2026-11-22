import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { DailyForecast, LocalityWeather } from '../models/weather.model';

interface WeatherConsultationResponse {
  id_localidad: number;
  localidad_nombre: string;
  clima_actual: {
    temperatura: number;
    humedad_relativa: number;
    precipitacion: number;
    velocidad_viento: number;
    codigo_clima: number;
    descripcion_clima: string;
    sensacion_termica: number | null;
    presion_atmosferica: number | null;
    hora_registro: string;
  };
  pronostico_5_dias: Array<{
    fecha: string;
    temperatura_min: number;
    temperatura_max: number;
    precipitacion_total: number;
    probabilidad_precipitacion: number | null;
    velocidad_viento_max: number;
    descripcion_clima: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly http = inject(HttpClient);

  getWeatherForLocality(localityId: string): Observable<LocalityWeather> {
    return this.http.get<WeatherConsultationResponse>(
      `${API_BASE_URL}/clima/consultar/${localityId}`
    ).pipe(
      map(response => ({
        current: {
          localityId: String(response.id_localidad),
          localityName: response.localidad_nombre,
          temperature: response.clima_actual.temperatura,
          humidity: response.clima_actual.humedad_relativa,
          precipitation: response.clima_actual.precipitacion,
          windSpeed: response.clima_actual.velocidad_viento,
          thermalSensation: response.clima_actual.sensacion_termica ?? undefined,
          atmosphericPressure: response.clima_actual.presion_atmosferica ?? undefined,
          condition: response.clima_actual.descripcion_clima,
          icon: this.getWeatherIcon(response.clima_actual.codigo_clima),
          recordedAt: response.clima_actual.hora_registro
        },
        forecast: response.pronostico_5_dias.map(day => this.toForecast(day))
      }))
    );
  }

  private toForecast(day: WeatherConsultationResponse['pronostico_5_dias'][number]): DailyForecast {
    const date = new Date(`${day.fecha}T12:00:00`);
    return {
      date: day.fecha,
      dayName: date.toLocaleDateString('es-PE', { weekday: 'long' }),
      minTemp: day.temperatura_min,
      maxTemp: day.temperatura_max,
      precipitationTotal: day.precipitacion_total,
      precipitationProb: day.probabilidad_precipitacion,
      condition: day.descripcion_clima,
      icon: this.getWeatherIconForDescription(day.descripcion_clima),
      windSpeed: day.velocidad_viento_max
    };
  }

  private getWeatherIcon(code: number): string {
    if (code === 0 || code === 1) return 'bi-sun';
    if (code === 2 || code === 3) return 'bi-cloud-sun';
    if (code === 45 || code === 48) return 'bi-cloud-fog';
    if (code >= 51 && code <= 67) return 'bi-cloud-rain';
    if (code >= 71 && code <= 86) return 'bi-cloud-snow';
    if (code >= 95) return 'bi-cloud-lightning-rain';
    return 'bi-cloud';
  }

  private getWeatherIconForDescription(description: string): string {
    const normalized = description.toLocaleLowerCase('es-PE');
    if (normalized.includes('lluvia') || normalized.includes('llovizna')) return 'bi-cloud-rain';
    if (normalized.includes('nieve')) return 'bi-cloud-snow';
    if (normalized.includes('tormenta')) return 'bi-cloud-lightning-rain';
    if (normalized.includes('niebla')) return 'bi-cloud-fog';
    if (normalized.includes('despejado')) return 'bi-sun';
    if (normalized.includes('nublado')) return 'bi-clouds';
    return 'bi-cloud';
  }
}
