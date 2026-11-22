import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { WeatherAlert } from '../../core/models/alert.model';
import { AlertService } from '../../core/services/alert.service';
import { LocalityService } from '../../core/services/locality.service';
import { AlertasComponent } from './alertas.component';

describe('AlertasComponent', () => {
  it('updates loading, totals, and type counters when alerts arrive asynchronously', async () => {
    const alertResponse = new Subject<WeatherAlert[]>();
    const alerts: WeatherAlert[] = [
      {
        id: '1',
        type: 'helada',
        title: 'Helada',
        riskLevel: 'alto',
        localityId: '1',
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
        localityId: '2',
        localityName: 'Chupaca',
        detectedAt: '2026-11-22T06:30:00',
        description: 'Precipitación elevada.',
        isActive: true,
        status: 'Activa'
      },
      {
        id: '3',
        type: 'temperatura_elevada',
        title: 'Temperatura elevada',
        riskLevel: 'moderado',
        localityId: '4',
        localityName: 'Chupaca',
        detectedAt: '2026-11-22T07:30:00',
        description: 'Temperatura diurna elevada.',
        isActive: true,
        status: 'Activa'
      }
    ];

    await TestBed.configureTestingModule({
      imports: [AlertasComponent],
      providers: [
        { provide: AlertService, useValue: { getAllAlerts: () => alertResponse.asObservable() } },
        { provide: LocalityService, useValue: { getLocalities: () => of([]) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(AlertasComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Cargando alertas...');

    alertResponse.next([]);
    await fixture.whenStable();

    expect(fixture.componentInstance.isLoading).toBe(false);
    expect(fixture.componentInstance.allAlerts).toEqual([]);
    expect(fixture.nativeElement.textContent).not.toContain('Cargando alertas...');

    alertResponse.next(alerts);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.isLoading).toBe(false);
    expect(component.allAlerts.length).toBe(3);
    expect(component.countByType('helada')).toBe(1);
    expect(component.countByType('lluvia_intensa')).toBe(1);
    expect(component.countByType('temperatura_elevada')).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('3 alertas registradas');
    expect(fixture.nativeElement.textContent).not.toContain('Cargando alertas...');
  });
});
