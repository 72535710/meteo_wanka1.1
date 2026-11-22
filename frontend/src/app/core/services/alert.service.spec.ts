import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../config/api.config';
import { WeatherAlert } from '../models/alert.model';
import { AlertService } from './alert.service';

describe('AlertService', () => {
  let service: AlertService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AlertService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AlertService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('preserves recommendation title and detail from the bitacora response', () => {
    let alerts: WeatherAlert[] = [];
    service.getAlertHistory().subscribe(result => alerts = result);

    const request = httpTestingController.expectOne(`${API_BASE_URL}/bitacora`);
    request.flush([{
      id_alerta: 42,
      localidad: 'Huancayo',
      tipo_alerta: 'Helada',
      nivel_riesgo: 'Alto',
      detalle_alerta: 'Temperatura mínima baja.',
      fecha_registro: '2026-11-22T05:30:00',
      estado: 'Activa',
      recomendacion: 'Protección ante heladas',
      detalle_recomendacion: 'Cubrir los cultivos sensibles.'
    }]);

    expect(alerts[0]?.recommendationTitle).toBe('Protección ante heladas');
    expect(alerts[0]?.preventiveRecommendation).toBe('Cubrir los cultivos sensibles.');
  });
});
