import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AgriculturalRecommendation } from '../models/recommendation.model';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  // Lista de recomendaciones técnicas agroclimáticas simuladas
  private recommendations: AgriculturalRecommendation[] = [
    {
      id: 'rec-001',
      title: 'Protección Térmica de Parcelas de Papa frente a Heladas',
      localityId: 'concepcion',
      localityName: 'Concepción',
      cropId: 'papa',
      cropName: 'Papa (Canchán / Yungay)',
      weatherCondition: 'Helada matutina (0.5 °C proyectada)',
      priority: 'urgente',
      description: 'El descenso térmico nocturno puede causar necrosis foliar en parcelas que se encuentran en plena floración. Se recomienda activar el protocolo preventivo antes de la medianoche.',
      actionSteps: [
        'Realizar un riego por aspersión ligero al atardecer para saturar la capa superficial y aumentar la retención calórica.',
        'No desmalezar ni remover el suelo en las horas previas al evento para no acelerar la pérdida de calor.',
        'Cubrir camas de almácigos o parcelas semillero con mantas térmicas agril o paja seca de cebada.',
        'Al amanecer, aplicar aminoácidos foliares (200 ml/mochila) para catalizar la reactivación celular en caso de daño leve.'
      ],
      createdAt: '2026-11-21',
      author: 'Ing. Agrónomo - Estación Agroclimática Mantaro',
      isActive: true
    },
    {
      id: 'rec-002',
      title: 'Drenaje de Emergencia y Manejo de Encharcamiento',
      localityId: 'huancayo',
      localityName: 'Huancayo',
      cropId: 'haba',
      cropName: 'Haba Verde',
      weatherCondition: 'Lluvias intensas acumuladas (>25 mm)',
      priority: 'alta',
      description: 'El exceso hídrico genera asfixia radicular en leguminosas en menos de 24 horas y dispara el desarrollo de mancha chocolate (Botrytis).',
      actionSteps: [
        'Abrir zanjas de desagüe sangraderas en los puntos más bajos de la chacra orientadas hacia acequias colectoras.',
        'Evitar el ingreso de ganado o maquinaria mientras el terreno permanezca pastoso.',
        'Programar pulverización preventiva con sales de cobre en cuanto cese la lluvia y haya oreo foliar.'
      ],
      createdAt: '2026-11-21',
      author: 'Especialista en Suelos y Riego - Junín',
      isActive: true
    },
    {
      id: 'rec-003',
      title: 'Riego Estratégico y Cobertura Vegetal en Maíz',
      localityId: 'sicaya',
      localityName: 'Sicaya',
      cropId: 'maiz',
      cropName: 'Maíz Blanco Gigante',
      weatherCondition: 'Temperatura elevada y baja humedad relativa (veranillo)',
      priority: 'media',
      description: 'La combinación de alta insolación y viento seco acelera la tasa de evapotranspiración en el cultivo de maíz durante la fase de elongación de caña.',
      actionSteps: [
        'Aprovechar los turnos de agua para regar en horas tempranas (05:00 a 07:30 am).',
        'Conservar rastrojos de la campaña anterior entre los surcos para formar un colchón vegetal que mitigue la evaporación directa.',
        'Revisar las hojas superiores para descartar presencia de gusano cogollero favorecido por el calor seco.'
      ],
      createdAt: '2026-11-20',
      author: 'Técnico Agropecuario - Valle del Mantaro',
      isActive: true
    },
    {
      id: 'rec-004',
      title: 'Preparación de Siega Oportuna y Ventana Climatológica Seca',
      localityId: 'jauja',
      localityName: 'Jauja',
      cropId: 'trigo',
      cropName: 'Trigo Centenario',
      weatherCondition: 'Tiempo variable con ventanas de sol',
      priority: 'media',
      description: 'El trigo próximo a madurez fisiológica corre riesgo de manchado de grano y prebrotado si es alcanzado por lluvias continuas.',
      actionSteps: [
        'Evaluar la humedad del grano quebrando la semilla con la uña o usando higrómetro portátil (humedad meta < 14 %).',
        'Coordinar con la cuadrilla de siega para cosechar en la ventana seca pronosticada para los próximos dos días.',
        'Apilar en gavillas cónicas para que el agua escurra libremente en caso de garúa imprevista.'
      ],
      createdAt: '2026-11-19',
      author: 'Comité de Productores de Granos Andinos',
      isActive: true
    }
  ];

  getAllRecommendations(): Observable<AgriculturalRecommendation[]> {
    return of([...this.recommendations]);
  }

  getFeaturedRecommendation(localityId?: string): Observable<AgriculturalRecommendation | undefined> {
    if (localityId) {
      const match = this.recommendations.find(r => r.localityId === localityId && r.isActive);
      if (match) return of({ ...match });
    }
    const urgent = this.recommendations.find(r => r.priority === 'urgente' && r.isActive);
    return of(urgent ? { ...urgent } : { ...this.recommendations[0] });
  }

  getRecommendationById(id: string): Observable<AgriculturalRecommendation | undefined> {
    const rec = this.recommendations.find(r => r.id === id);
    return of(rec ? { ...rec } : undefined);
  }

  // CRUD Administrativo
  createRecommendation(rec: Omit<AgriculturalRecommendation, 'id'>): Observable<AgriculturalRecommendation> {
    const newRec: AgriculturalRecommendation = {
      ...rec,
      id: `rec-${Date.now().toString().slice(-4)}`
    };
    this.recommendations = [newRec, ...this.recommendations];
    return of(newRec);
  }

  updateRecommendation(id: string, updated: Partial<AgriculturalRecommendation>): Observable<AgriculturalRecommendation | null> {
    const index = this.recommendations.findIndex(r => r.id === id);
    if (index === -1) return of(null);

    const merged = { ...this.recommendations[index], ...updated, id };
    this.recommendations[index] = merged;
    this.recommendations = [...this.recommendations];
    return of(merged);
  }

  deleteRecommendation(id: string): Observable<boolean> {
    const prev = this.recommendations.length;
    this.recommendations = this.recommendations.filter(r => r.id !== id);
    return of(this.recommendations.length < prev);
  }
}
