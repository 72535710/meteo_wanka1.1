import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AlertService } from '../../core/services/alert.service';
import { LocalityService } from '../../core/services/locality.service';
import { WeatherAlert } from '../../core/models/alert.model';
import { BitacoraComponent } from './bitacora.component';

describe('BitacoraComponent', () => {
  it('filters records by the status values returned from the API', async () => {
    const history: WeatherAlert[] = [
      {
        id: '1',
        type: 'helada',
        title: 'Helada',
        riskLevel: 'alto',
        localityId: '',
        localityName: 'Huancayo',
        detectedAt: '2026-11-22T05:30:00',
        description: 'Temperatura mínima baja.',
        isActive: true,
        status: 'Activa'
      },
      {
        id: '2',
        type: 'lluvia_intensa',
        title: 'Lluvia intensa',
        riskLevel: 'moderado',
        localityId: '',
        localityName: 'Chupaca',
        detectedAt: '2026-11-22T06:30:00',
        description: 'Precipitación elevada.',
        isActive: false,
        status: 'Atendida'
      }
    ];

    await TestBed.configureTestingModule({
      imports: [BitacoraComponent],
      providers: [
        { provide: AlertService, useValue: { getAlertHistory: () => of(history) } },
        { provide: LocalityService, useValue: { getLocalities: () => of([]) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(BitacoraComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.selectedStatus = 'Atendida';
    component.applyFilters();

    expect(component.availableStatuses).toEqual(['Activa', 'Atendida']);
    expect(component.filteredAlerts.map(alert => alert.id)).toEqual(['2']);
  });
});
