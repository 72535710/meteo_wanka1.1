import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskLevel } from '../../../core/models/alert.model';

@Component({
  selector: 'app-risk-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge-mw" [ngClass]="getBadgeClass()">
      <i class="bi" [ngClass]="getIconClass()"></i>
      {{ getLabel() }}
    </span>
  `
})
export class RiskBadgeComponent {
  @Input({ required: true }) level!: RiskLevel;
  @Input() label?: string;

  getBadgeClass(): string {
    switch (this.level) {
      case 'bajo': return 'badge-riesgo-bajo';
      case 'moderado': return 'badge-riesgo-moderado';
      case 'alto': return 'badge-riesgo-alto';
      case 'critico': return 'badge-riesgo-critico';
      default: return 'bg-secondary';
    }
  }

  getIconClass(): string {
    switch (this.level) {
      case 'bajo': return 'bi-shield-check';
      case 'moderado': return 'bi-exclamation-triangle';
      case 'alto': return 'bi-exclamation-diamond-fill';
      case 'critico': return 'bi-exclamation-octagon-fill';
      default: return 'bi-shield';
    }
  }

  getLabel(): string {
    switch (this.level) {
      case 'bajo': return 'Riesgo Bajo';
      case 'moderado': return 'Riesgo Moderado';
      case 'alto': return 'Riesgo Alto';
      case 'critico': return 'Riesgo Crítico';
      default: return this.label ?? this.level;
    }
  }
}
