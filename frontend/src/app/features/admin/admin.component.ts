import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalityService } from '../../core/services/locality.service';
import { AlertService } from '../../core/services/alert.service';
import { RecommendationService } from '../../core/services/recommendation.service';
import { CropService } from '../../core/services/crop.service';
import { Locality } from '../../core/models/locality.model';
import { WeatherAlert } from '../../core/models/alert.model';
import { AgriculturalRecommendation } from '../../core/models/recommendation.model';
import { Crop } from '../../core/models/crop.model';
import { RiskBadgeComponent } from '../../shared/components/risk-badge/risk-badge.component';
import { AlertTypeBadgeComponent } from '../../shared/components/alert-type-badge/alert-type-badge.component';
import { getHttpErrorMessage } from '../../core/services/http-error-message';

type AdminTab = 'localidades' | 'alertas' | 'recomendaciones';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RiskBadgeComponent, AlertTypeBadgeComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  private fb = inject(FormBuilder);
  private localityService = inject(LocalityService);
  private alertService = inject(AlertService);
  private recommendationService = inject(RecommendationService);
  private cropService = inject(CropService);

  activeTab: AdminTab = 'localidades';

  // Datos
  localities: Locality[] = [];
  alerts: WeatherAlert[] = [];
  recommendations: AgriculturalRecommendation[] = [];
  crops: Crop[] = [];

  // Formularios Reactivos
  localityForm!: FormGroup;
  alertForm!: FormGroup;
  recommendationForm!: FormGroup;

  // Estados de edición
  editingRecommendationId: string | null = null;

  // Modales de Consulta
  consultLocality: Locality | null = null;
  consultAlert: WeatherAlert | null = null;
  consultRecommendation: AgriculturalRecommendation | null = null;

  // Alerta de confirmación de eliminación
  deleteTarget: { type: AdminTab; id: string; name: string } | null = null;

  // Mensaje Toast / Notificación
  notification: { message: string; type: 'success' | 'danger' } | null = null;
  localityError: string | null = null;
  alertError: string | null = null;
  isLoadingLocalities = false;
  isLoadingAlerts = false;
  isSavingAlert = false;
  updatingAlertIds = new Set<string>();

  ngOnInit(): void {
    this.initForms();
    this.loadAllData();
  }

  setTab(tab: AdminTab): void {
    this.activeTab = tab;
    this.resetAllForms();
  }

  loadAllData(): void {
    this.isLoadingLocalities = true;
    this.localityError = null;
    this.localityService.getLocalities().subscribe({
      next: data => {
        this.localities = data;
        this.isLoadingLocalities = false;
      },
      error: error => {
        this.localityError = getHttpErrorMessage(error);
        this.isLoadingLocalities = false;
      }
    });
    this.isLoadingAlerts = true;
    this.alertError = null;
    this.alertService.getAllAlerts().subscribe({
      next: data => {
        this.alerts = data;
        this.isLoadingAlerts = false;
      },
      error: error => {
        this.alertError = getHttpErrorMessage(error);
        this.isLoadingAlerts = false;
      }
    });
    this.recommendationService.getAllRecommendations().subscribe(data => this.recommendations = data);
    this.cropService.getCrops().subscribe(data => this.crops = data);
  }

  private initForms(): void {
    // 1. Formulario de Localidad
    this.localityForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      province: ['', [Validators.required]],
      altitudeMeters: [null, [Validators.required, Validators.min(0), Validators.max(7000)]]
    });

    // 2. Formulario de Alerta
    this.alertForm = this.fb.group({
      type: ['helada', [Validators.required]],
      riskLevel: ['alto', [Validators.required]],
      localityId: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(5)]]
    });

    // 3. Formulario de Recomendación
    this.recommendationForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      localityId: ['', [Validators.required]],
      cropId: ['papa', [Validators.required]],
      weatherCondition: ['', [Validators.required]],
      priority: ['alta', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(15)]],
      actionSteps: ['', [Validators.required, Validators.minLength(10)]],
      author: ['Estación Experimental Santa Ana - INIA', [Validators.required]],
      isActive: [true]
    });
  }

  showNotification(message: string, type: 'success' | 'danger' = 'success'): void {
    this.notification = { message, type };
    setTimeout(() => {
      this.notification = null;
    }, 4000);
  }

  resetAllForms(): void {
    this.localityForm.reset({
      province: '',
      altitudeMeters: null
    });

    this.alertForm.reset({
      type: 'helada',
      riskLevel: 'alto'
    });

    this.editingRecommendationId = null;
    this.recommendationForm.reset({
      cropId: 'papa',
      priority: 'alta',
      author: 'Estación Experimental Santa Ana - INIA',
      isActive: true
    });
  }

  // ===================== CRUD LOCALIDADES =====================
  saveLocality(): void {
    if (this.localityForm.invalid) {
      this.localityForm.markAllAsTouched();
      return;
    }

    const val = this.localityForm.value;
    this.localityService.createLocality({
      name: val.name,
      province: val.province,
      altitudeMeters: Number(val.altitudeMeters)
    }).subscribe({
      next: created => {
        this.showNotification(`Localidad "${created.name}" creada exitosamente.`);
        this.loadAllData();
        this.resetAllForms();
      },
      error: error => this.showNotification(getHttpErrorMessage(error), 'danger')
    });
  }

  // ===================== CRUD ALERTAS =====================
  saveAlert(): void {
    if (this.alertForm.invalid) {
      this.alertForm.markAllAsTouched();
      return;
    }

    const val = this.alertForm.value;
    this.isSavingAlert = true;
    this.alertService.createAlert({
      type: val.type,
      riskLevel: val.riskLevel,
      localityId: val.localityId,
      description: val.description
    }).subscribe({
      next: created => {
        this.isSavingAlert = false;
        this.showNotification(`Alerta "${created.title}" registrada exitosamente.`);
        this.loadAllData();
        this.resetAllForms();
      },
      error: error => {
        this.isSavingAlert = false;
        this.showNotification(getHttpErrorMessage(error), 'danger');
      }
    });
  }

  toggleAlertStatus(alert: WeatherAlert): void {
    this.updatingAlertIds = new Set(this.updatingAlertIds).add(alert.id);
    this.alertService.updateAlertStatus(alert.id, !alert.isActive).subscribe({
      next: result => {
        this.removeUpdatingAlertId(alert.id);
        this.showNotification(result.mensaje);
        this.loadAllData();
      },
      error: error => {
        this.removeUpdatingAlertId(alert.id);
        this.showNotification(getHttpErrorMessage(error), 'danger');
      }
    });
  }

  private removeUpdatingAlertId(id: string): void {
    const updatingIds = new Set(this.updatingAlertIds);
    updatingIds.delete(id);
    this.updatingAlertIds = updatingIds;
  }

  // ===================== CRUD RECOMENDACIONES =====================
  saveRecommendation(): void {
    if (this.recommendationForm.invalid) {
      this.recommendationForm.markAllAsTouched();
      return;
    }

    const val = this.recommendationForm.value;
    const localityObj = this.localities.find(l => l.id === val.localityId);
    const localityName = localityObj ? localityObj.name : 'Valle del Mantaro';

    const cropObj = this.crops.find(c => c.id === val.cropId);
    const cropName = cropObj ? cropObj.name : 'Cultivo General';

    const stepsArray = typeof val.actionSteps === 'string'
      ? val.actionSteps.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
      : val.actionSteps;

    if (this.editingRecommendationId) {
      this.recommendationService.updateRecommendation(this.editingRecommendationId, {
        title: val.title,
        localityId: val.localityId,
        localityName,
        cropId: val.cropId,
        cropName,
        weatherCondition: val.weatherCondition,
        priority: val.priority,
        description: val.description,
        actionSteps: stepsArray,
        author: val.author,
        isActive: val.isActive
      }).subscribe(() => {
        this.showNotification(`Recomendación "${val.title}" actualizada.`);
        this.loadAllData();
        this.resetAllForms();
      });
    } else {
      this.recommendationService.createRecommendation({
        title: val.title,
        localityId: val.localityId,
        localityName,
        cropId: val.cropId,
        cropName,
        weatherCondition: val.weatherCondition,
        priority: val.priority,
        description: val.description,
        actionSteps: stepsArray,
        createdAt: new Date().toISOString().slice(0, 10),
        author: val.author,
        isActive: val.isActive
      }).subscribe(created => {
        this.showNotification(`Recomendación "${created.title}" registrada.`);
        this.loadAllData();
        this.resetAllForms();
      });
    }
  }

  editRecommendation(rec: AgriculturalRecommendation): void {
    this.editingRecommendationId = rec.id;
    this.recommendationForm.patchValue({
      title: rec.title,
      localityId: rec.localityId,
      cropId: rec.cropId,
      weatherCondition: rec.weatherCondition,
      priority: rec.priority,
      description: rec.description,
      actionSteps: rec.actionSteps.join('\n'),
      author: rec.author,
      isActive: rec.isActive
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ===================== CONFIRMAR Y ELIMINAR =====================
  askDelete(type: AdminTab, id: string, name: string): void {
    this.deleteTarget = { type, id, name };
  }

  cancelDelete(): void {
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;

    const { type, id, name } = this.deleteTarget;
    if (type === 'localidades') {
      this.localityService.deleteLocality(id).subscribe({
        error: error => this.showNotification(getHttpErrorMessage(error), 'danger')
      });
    } else if (type === 'alertas') {
      this.alertService.deleteAlert(id).subscribe({
        error: error => this.showNotification(getHttpErrorMessage(error), 'danger')
      });
    } else if (type === 'recomendaciones') {
      this.recommendationService.deleteRecommendation(id).subscribe({
        next: () => {
          this.showNotification(`Recomendación "${name}" eliminada de la simulación local.`);
          this.loadAllData();
        },
        error: error => this.showNotification(getHttpErrorMessage(error), 'danger')
      });
    }

    this.deleteTarget = null;
  }
}
