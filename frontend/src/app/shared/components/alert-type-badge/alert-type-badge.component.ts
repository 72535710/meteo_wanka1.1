import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertType } from '../../../core/models/alert.model';

@Component({
  selector: 'app-alert-type-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge-mw" [ngClass]="getBadgeClass()">
      <i class="bi" [ngClass]="getIconClass()"></i>
      {{ getLabel() }}
    </span>
  `
})
export class AlertTypeBadgeComponent {
  @Input({ required: true }) type!: AlertType;
  @Input() label?: string;

  getBadgeClass(): string {
    switch (this.type) {
      case 'helada': return 'badge-alerta-helada';
      case 'lluvia_intensa': return 'badge-alerta-lluvia';
      case 'temperatura_elevada': return 'badge-alerta-calor';
      default: return 'bg-secondary';
    }
  }

  getIconClass(): string {
    switch (this.type) {
      case 'helada': return 'bi-thermometer-snow';
      case 'lluvia_intensa': return 'bi-cloud-rain-heavy-fill';
      case 'temperatura_elevada': return 'bi-sun-fill';
      default: return 'bi-bell';
    }
  }

  getLabel(): string {
    switch (this.type) {
      case 'helada': return 'Helada';
      case 'lluvia_intensa': return 'Lluvia Intensa';
      case 'temperatura_elevada': return 'Temp. Elevada';
      default: return this.label ?? this.type;
    }
  }
}
