import { Component, OnInit, inject } from '@angular/core';
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
  selector: 'app-bitacora',
  standalone: true,
  imports: [CommonModule, FormsModule, RiskBadgeComponent, AlertTypeBadgeComponent],
  templateUrl: './bitacora.component.html',
  styleUrls: ['./bitacora.component.css']
})
export class BitacoraComponent implements OnInit {
  private alertService = inject(AlertService);
  private localityService = inject(LocalityService);

  allAlerts: WeatherAlert[] = [];
  filteredAlerts: WeatherAlert[] = [];
  localities: Locality[] = [];

  // Filtros
  selectedLocality: string = 'all';
  selectedType: AlertType | '' = '';
  selectedStatus = '';
  searchQuery: string = '';
  availableStatuses: string[] = [];

  // Modal de Detalle
  selectedRecord: WeatherAlert | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.localityService.getLocalities().subscribe({
      next: list => this.localities = list,
      error: error => this.errorMessage = getHttpErrorMessage(error)
    });

    this.alertService.getAlertHistory().subscribe({
      next: data => {
        this.allAlerts = data;
        this.availableStatuses = [...new Set(data
          .map(item => item.status)
          .filter((status): status is string => Boolean(status)))]
          .sort((a, b) => a.localeCompare(b, 'es-PE'));
        this.applyFilters();
        this.isLoading = false;
      },
      error: error => {
        this.errorMessage = getHttpErrorMessage(error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let list = [...this.allAlerts];

    if (this.selectedLocality && this.selectedLocality !== 'all') {
      const selectedLocality = this.localities.find(locality => locality.id === this.selectedLocality);
      list = list.filter(item =>
        item.localityId === this.selectedLocality ||
        (!item.localityId && item.localityName === selectedLocality?.name)
      );
    }

    if (this.selectedType) {
      list = list.filter(item => item.type === this.selectedType);
    }

    if (this.selectedStatus) {
      list = list.filter(item => item.status === this.selectedStatus);
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.localityName.toLowerCase().includes(q) ||
        (item.preventiveRecommendation ?? '').toLowerCase().includes(q)
      );
    }

    this.filteredAlerts = list;
  }

  resetFilters(): void {
    this.selectedLocality = 'all';
    this.selectedType = '';
    this.selectedStatus = '';
    this.searchQuery = '';
    this.applyFilters();
  }

  openRecordModal(record: WeatherAlert): void {
    this.selectedRecord = record;
  }

  closeRecordModal(): void {
    this.selectedRecord = null;
  }
}
