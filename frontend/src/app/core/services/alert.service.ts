import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { AlertType, RiskLevel, WeatherAlert } from '../models/alert.model';

interface AlertResponse {
  id_alerta: number;
  id_localidad: number;
  tipo_alerta: string;
  nivel_riesgo: string;
  descripcion: string;
  fecha_registro: string;
  estado: string;
  localidad_nombre: string | null;
}

interface AlertHistoryResponse {
  id_alerta: number;
  localidad: string;
  tipo_alerta: string;
  nivel_riesgo: string;
  detalle_alerta: string;
  fecha_registro: string;
  estado: string;
  recomendacion: string | null;
  detalle_recomendacion: string | null;
}

interface AlertCreateRequest {
  id_localidad: number;
  tipo_alerta: string;
  nivel_riesgo: string;
  descripcion: string;
}

interface AlertCreateResponse {
  id_alerta: number;
}

interface AlertStatusResponse {
  id_alerta: number;
  nuevo_estado: string;
  mensaje: string;
}

export interface NewWeatherAlert {
  localityId: string;
  type: AlertType;
  riskLevel: RiskLevel;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private readonly http = inject(HttpClient);

  getAllAlerts(): Observable<WeatherAlert[]> {
    return this.http.get<AlertResponse[]>(`${API_BASE_URL}/alertas`).pipe(
      map(alerts => alerts.map(alert => this.toWeatherAlert(alert)))
    );
  }

  getActiveAlerts(): Observable<WeatherAlert[]> {
    return this.getAllAlerts().pipe(map(alerts => alerts.filter(alert => alert.isActive)));
  }

  getAlertHistory(): Observable<WeatherAlert[]> {
    return this.http.get<AlertHistoryResponse[]>(`${API_BASE_URL}/bitacora`).pipe(
      map(records => records.map(record => this.toHistoryAlert(record)))
    );
  }

  getAlertById(id: string): Observable<WeatherAlert | undefined> {
    return this.getAllAlerts().pipe(map(alerts => alerts.find(alert => alert.id === id)));
  }

  filterAlerts(filters: {
    localityId?: string;
    type?: AlertType | '';
    riskLevel?: RiskLevel | '';
    query?: string;
  }): Observable<WeatherAlert[]> {
    return this.getAllAlerts().pipe(
      map(alerts => alerts.filter(alert => {
        if (filters.localityId && filters.localityId !== 'all' && alert.localityId !== filters.localityId) {
          return false;
        }
        if (filters.type && alert.type !== filters.type) {
          return false;
        }
        if (filters.riskLevel && alert.riskLevel !== filters.riskLevel) {
          return false;
        }
        if (filters.query?.trim()) {
          const query = filters.query.trim().toLocaleLowerCase('es-PE');
          return [
            alert.title,
            alert.description,
            alert.localityName,
            alert.preventiveRecommendation ?? ''
          ].some(value => value.toLocaleLowerCase('es-PE').includes(query));
        }
        return true;
      }))
    );
  }

  createAlert(alert: NewWeatherAlert): Observable<WeatherAlert> {
    const localityId = Number(alert.localityId);
    if (!Number.isInteger(localityId)) {
      return throwError(() => new Error('La alerta requiere un identificador de localidad válido.'));
    }

    const payload: AlertCreateRequest = {
      id_localidad: localityId,
      tipo_alerta: this.toApiAlertType(alert.type),
      nivel_riesgo: this.toApiRiskLevel(alert.riskLevel),
      descripcion: alert.description
    };

    return this.http.post<AlertCreateResponse>(`${API_BASE_URL}/alertas`, payload).pipe(
      switchMap(created => this.getAllAlerts().pipe(
        map(alerts => alerts.find(item => item.id === String(created.id_alerta))),
        switchMap(result => result
          ? of(result)
          : throwError(() => new Error('La alerta fue registrada, pero no apareció al volver a consultar el listado.')))
      ))
    );
  }

  updateAlertStatus(id: string, isActive: boolean): Observable<AlertStatusResponse> {
    const endpoint = `${API_BASE_URL}/alertas/${id}/estado`;
    return this.http.patch<AlertStatusResponse>(endpoint, {
      estado: isActive ? 'Activa' : 'Atendida'
    });
  }

  deleteAlert(id: string): Observable<boolean> {
    void id;
    return throwError(() => new Error('La API no dispone de un endpoint para eliminar alertas.'));
  }

  private toWeatherAlert(response: AlertResponse): WeatherAlert {
    const type = this.toAlertType(response.tipo_alerta);
    const risk = this.toRiskLevel(response.nivel_riesgo);

    return {
      id: String(response.id_alerta),
      type,
      typeLabel: type === 'otro' ? response.tipo_alerta : undefined,
      title: response.tipo_alerta,
      riskLevel: risk,
      riskLabel: risk === 'otro' ? response.nivel_riesgo : undefined,
      localityId: String(response.id_localidad),
      localityName: response.localidad_nombre ?? '',
      detectedAt: response.fecha_registro,
      description: response.descripcion,
      isActive: response.estado.trim().toLocaleLowerCase('es-PE') === 'activa',
      status: response.estado
    };
  }

  private toHistoryAlert(record: AlertHistoryResponse): WeatherAlert {
    const type = this.toAlertType(record.tipo_alerta);
    const risk = this.toRiskLevel(record.nivel_riesgo);

    return {
      id: String(record.id_alerta),
      type,
      typeLabel: type === 'otro' ? record.tipo_alerta : undefined,
      title: record.tipo_alerta,
      riskLevel: risk,
      riskLabel: risk === 'otro' ? record.nivel_riesgo : undefined,
      localityId: '',
      localityName: record.localidad,
      detectedAt: record.fecha_registro,
      description: record.detalle_alerta,
      recommendationTitle: record.recomendacion ?? undefined,
      preventiveRecommendation: record.detalle_recomendacion ?? undefined,
      isActive: record.estado.trim().toLocaleLowerCase('es-PE') === 'activa',
      status: record.estado
    };
  }

  private toAlertType(value: string): AlertType {
    const normalized = value.trim().toLocaleLowerCase('es-PE');
    if (normalized.includes('helada')) return 'helada';
    if (normalized.includes('lluvia')) return 'lluvia_intensa';
    if (normalized.includes('temperatura') || normalized.includes('calor')) return 'temperatura_elevada';
    return 'otro';
  }

  private toRiskLevel(value: string): RiskLevel {
    const normalized = value.trim().toLocaleLowerCase('es-PE').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalized === 'bajo') return 'bajo';
    if (normalized === 'moderado') return 'moderado';
    if (normalized === 'alto') return 'alto';
    if (normalized === 'critico') return 'critico';
    return 'otro';
  }

  private toApiAlertType(type: AlertType): string {
    switch (type) {
      case 'helada': return 'Helada';
      case 'lluvia_intensa': return 'Lluvia intensa';
      case 'temperatura_elevada': return 'Temperatura elevada';
      default: return 'Otro';
    }
  }

  private toApiRiskLevel(level: RiskLevel): string {
    switch (level) {
      case 'bajo': return 'Bajo';
      case 'moderado': return 'Moderado';
      case 'alto': return 'Alto';
      case 'critico': return 'Crítico';
      default: return 'Otro';
    }
  }
}
