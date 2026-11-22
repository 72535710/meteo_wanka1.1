import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../core/services/alert.service';
import { LocalityService } from '../../core/services/locality.service';
import { WeatherAlert, AlertType, RiskLevel } from '../../core/models/alert.model';
import { Locality } from '../../core/models/locality.model';
import { RiskBadgeComponent } from '../../shared/components/risk-badge/risk-badge.component';
import { AlertTypeBadgeComponent } from '../../shared/components/alert-type-badge/alert-type-badge.component';
import { getHttpErrorMessage } from '../../core/services/http-error-message';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, FormsModule, RiskBadgeComponent, AlertTypeBadgeComponent],
  templateUrl: './alertas.component.html',
  styleUrls: ['./alertas.component.css']
})
export class AlertasComponent implements OnInit {
  private alertService = inject(AlertService);
  private localityService = inject(LocalityService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  allAlerts: WeatherAlert[] = [];
  filteredAlerts: WeatherAlert[] = [];
  localities: Locality[] = [];

  // Filtros
  selectedType: AlertType | '' = '';
  selectedRisk: RiskLevel | '' = '';
  selectedLocalityId: string = 'all';

  // Modal para ver detalles completos
  selectedAlertDetail: WeatherAlert | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.localityService.getLocalities().subscribe({
      next: locs => {
        this.localities = locs;
        this.changeDetectorRef.markForCheck();
      },
      error: error => {
        this.errorMessage = getHttpErrorMessage(error);
        this.changeDetectorRef.markForCheck();
      }
    });

    this.loadAlerts();
  }

  loadAlerts(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.alertService.getAllAlerts().subscribe({
      next: alerts => {
        this.allAlerts = alerts;
        this.applyFilters();
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: error => {
        this.errorMessage = getHttpErrorMessage(error);
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  applyFilters(): void {
    let result = [...this.allAlerts];

    if (this.selectedType) {
      result = result.filter(a => a.type === this.selectedType);
    }
    if (this.selectedRisk) {
      result = result.filter(a => a.riskLevel === this.selectedRisk);
    }
    if (this.selectedLocalityId && this.selectedLocalityId !== 'all') {
      result = result.filter(a => a.localityId === this.selectedLocalityId);
    }

    this.filteredAlerts = result;
  }

  resetFilters(): void {
    this.selectedType = '';
    this.selectedRisk = '';
    this.selectedLocalityId = 'all';
    this.applyFilters();
  }

  openAlertModal(alert: WeatherAlert): void {
    this.selectedAlertDetail = alert;
  }

  closeAlertModal(): void {
    this.selectedAlertDetail = null;
  }

  // Contadores para métricas de resumen
  countByType(type: AlertType): number {
    return this.allAlerts.filter(a => a.type === type).length;
  }

  countByRisk(risk: RiskLevel): number {
    return this.allAlerts.filter(a => a.riskLevel === risk).length;
  }
}
