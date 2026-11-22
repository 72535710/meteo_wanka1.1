import { Component, OnInit, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocalityService } from '../../core/services/locality.service';
import { WeatherService } from '../../core/services/weather.service';
import { AlertService } from '../../core/services/alert.service';
import { RecommendationService } from '../../core/services/recommendation.service';
import { CurrentWeather, DailyForecast } from '../../core/models/weather.model';
import { WeatherAlert } from '../../core/models/alert.model';
import { AgriculturalRecommendation } from '../../core/models/recommendation.model';
import { getHttpErrorMessage } from '../../core/services/http-error-message';
import { RiskBadgeComponent } from '../../shared/components/risk-badge/risk-badge.component';
import { AlertTypeBadgeComponent } from '../../shared/components/alert-type-badge/alert-type-badge.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, RiskBadgeComponent, AlertTypeBadgeComponent],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  protected localityService = inject(LocalityService);
  protected weatherService = inject(WeatherService);
  protected alertService = inject(AlertService);
  protected recommendationService = inject(RecommendationService);

  readonly currentWeather = signal<CurrentWeather | null>(null);
  readonly forecast = signal<DailyForecast[]>([]);
  activeAlerts: WeatherAlert[] = [];
  featuredRecommendation: AgriculturalRecommendation | null = null;
  readonly isLoading = signal(false);
  isLoadingAlerts = true;
  readonly weatherError = signal<string | null>(null);
  alertsError: string | null = null;
  localityError: string | null = null;

  constructor() {
    // Sincronizar reactivamente cuando el usuario cambie la localidad
    effect(() => {
      const loc = this.localityService.selectedLocality();
      if (loc) {
        this.loadWeatherData(loc.id);
        this.loadAlertsAndRecommendations(loc.id);
      }
    });
  }

  ngOnInit(): void {
    this.localityService.getLocalities().subscribe({
      error: error => this.localityError = getHttpErrorMessage(error)
    });
  }

  loadWeatherData(localityId: string): void {
    this.isLoading.set(true);
    this.weatherError.set(null);
    this.currentWeather.set(null);
    this.forecast.set([]);
    this.weatherService.getWeatherForLocality(localityId).subscribe({
      next: data => {
        this.currentWeather.set(data.current);
        this.forecast.set(data.forecast);
        this.isLoading.set(false);
      },
      error: error => {
        this.weatherError.set(getHttpErrorMessage(error));
        this.isLoading.set(false);
      }
    });
  }

  loadAlertsAndRecommendations(localityId: string): void {
    this.isLoadingAlerts = true;
    this.alertsError = null;
    this.alertService.getActiveAlerts().subscribe({
      next: alerts => {
        this.activeAlerts = alerts;
        this.isLoadingAlerts = false;
      },
      error: error => {
        this.alertsError = getHttpErrorMessage(error);
        this.isLoadingAlerts = false;
      }
    });

    this.recommendationService.getFeaturedRecommendation(localityId).subscribe(rec => {
      this.featuredRecommendation = rec ?? null;
    });
  }

  onLocalitySelect(localityId: string): void {
    this.localityService.setSelectedLocalityById(localityId);
  }
}
