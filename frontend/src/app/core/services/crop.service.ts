import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Crop } from '../models/crop.model';

@Injectable({
  providedIn: 'root'
})
export class CropService {
  /**
   * Fichas agroclimáticas completas para los 4 cultivos priorizados
   * en el Valle del Mantaro, Junín: Papa, Maíz, Trigo y Haba.
   */
  private crops: Crop[] = [
    {
      id: 'papa',
      name: 'Papa',
      scientificName: 'Solanum tuberosum',
      typicalVarieties: ['Canchán', 'Amarilla Tumbay', 'Yungay', 'Huayro', 'Peruanita'],
      // Fotografía representativa de cultivo de papa en los Andes
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=80',
      altitudeRange: '3,000 a 3,850 msnm',
      growthCycleDays: '120 a 160 días',
      description: 'El cultivo insignia de la agricultura andina en el Valle del Mantaro. Base de la seguridad alimentaria y sustento de miles de familias campesinas. Requiere suelos francos, bien mullidos y con drenaje eficiente.',
      waterRequirement: '500 - 700 mm durante todo el ciclo (crítico en tuberización)',
      optimalTempRange: '12 °C a 18 °C (muy vulnerable a temperaturas menores a 0 °C)',
      importanceInMantaro: 'Más de 14,000 hectáreas sembradas anualmente en las provincias de Concepción, Huancayo y Jauja.',
      meteorologicalRisks: [
        {
          type: 'Helada Blanca y Helada Negra',
          severity: 'critico',
          criticalStages: 'Brotación inicial, emergencia y floración / inicio de tuberización',
          symptoms: 'Marchitamiento fulminante, ennegrecimiento foliar por lisis celular y pudrición de brotes tiernos.',
          countermeasure: 'Riegos por aspersión preventivos al atardecer, zanjas perimetrales y aplicación foliar de bioestimulantes antiestrés térmico.'
        },
        {
          type: 'Lluvias Intensas y Exceso Hídrico',
          severity: 'alto',
          criticalStages: 'Llenado de tubérculos y preconcepción de cosecha',
          symptoms: 'Asfixia de raíces estoloníferas, lenticelosis y proliferación violenta de Tizón Tardío (Rancha / Phytophthora infestans).',
          countermeasure: 'Aporque alto (40-50 cm), desmalezado constante y mantenimiento continuo de canales de drenaje.'
        },
        {
          type: 'Granizadas Estacionales',
          severity: 'alto',
          criticalStages: 'Desarrollo foliar y floración',
          symptoms: 'Defoliación mecánica severa, rotura de tallos y heridas abiertas que facilitan ingreso de bacterias como Erwinia.',
          countermeasure: 'Aplicar fungicidas cicatrizantes preventivos cúpricos en las 24 horas posteriores al evento.'
        }
      ],
      preventiveRecommendations: [
        {
          stage: 'Siembra y Emergencia',
          action: 'Selección de semilla certificada y desinfección preventiva',
          timing: 'Octubre - Noviembre',
          details: 'Utilizar tubérculos-semilla con brotes vigorosos de 1.5 cm. Sembrar a profundidad uniforme de 12 cm.'
        },
        {
          stage: 'Aporque y Desarrollo Foliar',
          action: 'Aporque pronunciado y monitoreo de humedad edáfica',
          timing: 'Diciembre - Enero',
          details: 'Realizar el aporque antes de que el follaje cierre el surco para dar anclaje y proteger los estolones del frío superficial.'
        },
        {
          stage: 'Floración y Tuberización',
          action: 'Supervisión agroclimática diaria ante heladas y rancha',
          timing: 'Enero - Febrero',
          details: 'Consultar las alertas meteorológicas nocturnas de METEO WANKA. Disponer de agua para riego térmico de emergencia.'
        },
        {
          stage: 'Maduración y Cosecha',
          action: 'Corte de follaje previo y cosecha con suelo oreado',
          timing: 'Marzo - Mayo',
          details: 'Cortar el follaje 10 a 15 días antes de escarbar para asegurar el endurecimiento de la piel del tubérculo.'
        }
      ]
    },
    {
      id: 'maiz',
      name: 'Maíz',
      scientificName: 'Zea mays L.',
      typicalVarieties: ['Blanco Gigante del Mantaro', 'Maíz Choclo', 'San Jerónimo', 'Morocho'],
      // Fotografía representativa de maizal andino
      imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=1200&q=80',
      altitudeRange: '3,100 a 3,350 msnm',
      growthCycleDays: '180 a 220 días',
      description: 'El Maíz Blanco Gigante del Mantaro cuenta con reconocimiento por su calibre extraordinario y calidad gastronómica. Prospera en el piso de valle templado con buena insolación y suelos profundos y fértiles.',
      waterRequirement: '600 - 800 mm (sensible a déficit en panoja y espigado)',
      optimalTempRange: '14 °C a 22 °C (se detiene con temperaturas inferiores a 8 °C)',
      importanceInMantaro: 'Cultivo tradicional de las vegas de Sicaya, Orcotuna, Concepción, Chupaca y San Jerónimo de Tunán.',
      meteorologicalRisks: [
        {
          type: 'Heladas Tempranas y Tardías',
          severity: 'critico',
          criticalStages: 'Plántula (2 a 4 hojas) y floración masculina/femenina',
          symptoms: 'Quemaduras blanquecinas en láminas foliares, muerte del punto de crecimiento y secado prematuro de estigmas (pelos de choclo).',
          countermeasure: 'Fechas de siembra calibradas evitando el pico de heladas de invierno; siembras asociadas con frijol o haba.'
        },
        {
          type: 'Vientos Fuertes Andinos',
          severity: 'alto',
          criticalStages: 'Llenado de mazorca y senescencia',
          symptoms: 'Acame (tumbado) de tallos por palanca del peso de la mazorca, dificultando la cosecha y favoreciendo pudrición por contacto.',
          countermeasure: 'Aporque robusto para estimular el desarrollo de raíces adventicias de sostén en los primeros nudos.'
        },
        {
          type: 'Veranillo y Estrés Hídrico',
          severity: 'moderado',
          criticalStages: 'Emisión de estigmas y cuajado del grano',
          symptoms: 'Falta de fecundación en la punta de la mazorca (choclo granado imperfecto) y hojas enroscadas en espiral.',
          countermeasure: 'Programar riegos por gravedad oportunos durante la emisión de la panoja y estigmas.'
        }
      ],
      preventiveRecommendations: [
        {
          stage: 'Preparación y Siembra',
          action: 'Arado profundo e incorporación de materia orgánica descompuesta',
          timing: 'Septiembre - Octubre',
          details: 'Sembrar a golpe (3 semillas por golpe) a distanciamiento de 80 cm entre surcos para ventilación óptima.'
        },
        {
          stage: 'Desahije y Primer Aporque',
          action: 'Selección de plantas vigorosas y aporque de sujeción',
          timing: 'Noviembre - Diciembre',
          details: 'Eliminar plantas raquíticas dejando 2 por golpe. Elevar el camellón para proteger el cuello de la raíz.'
        },
        {
          stage: 'Panoja y Fecundación',
          action: 'Monitoreo de estrés térmico y suministro hídrico',
          timing: 'Enero - Febrero',
          details: 'Garantizar humedad de suelo para asegurar una polinización uniforme y mazorcas completas.'
        },
        {
          stage: 'Maduración y Cosecha',
          action: 'Cosecha de choclo verde o doblado de caña para secado de grano',
          timing: 'Marzo - Mayo',
          details: 'Doblar la caña por debajo de la mazorca para evitar ingreso de agua de lluvia durante el secado.'
        }
      ]
    },
    {
      id: 'trigo',
      name: 'Trigo',
      scientificName: 'Triticum aestivum L.',
      typicalVarieties: ['Centenario', 'Gavilán', 'Andino', 'Molle'],
      // Fotografía de campos de trigo dorado
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
      altitudeRange: '3,150 a 3,650 msnm',
      growthCycleDays: '140 a 170 días',
      description: 'Cereal de grano seco de gran rusticidad y adaptación a las laderas y planicies del valle. Excelente componente en planes de rotación de cultivos para romper ciclos de plagas y recuperar estructura de suelo.',
      waterRequirement: '400 - 550 mm de precipitación o riego distribuido',
      optimalTempRange: '10 °C a 19 °C (tolera bajas temperaturas en fase vegetativa)',
      importanceInMantaro: 'Cultivo estratégico en Jauja (Yanamarca, Ataura) y Concepción (Matahuasi, Santa Rosa de Ocopa).',
      meteorologicalRisks: [
        {
          type: 'Exceso de Lluvia en Maduración',
          severity: 'alto',
          criticalStages: 'Madurez fisiológica y secado de espigas',
          symptoms: 'Germinado en espiga (pre-harvest sprouting), pérdida dramática del valor molinero y manchado fúngico del grano.',
          countermeasure: 'Seguimiento de pronósticos a 5 días para programar la siega en ventanas de tiempo seco continuo.'
        },
        {
          type: 'Roya Amarilla por Niebla Persistente',
          severity: 'alto',
          criticalStages: 'Macollaje hasta llenado de grano',
          symptoms: 'Pústulas amarillentas alargadas en las nervaduras foliares que reducen drásticamente la capacidad fotosintética.',
          countermeasure: 'Uso de densidades de siembra moderadas (100-120 kg/ha) y variedades tolerantes certificadas.'
        },
        {
          type: 'Heladas en Antesis',
          severity: 'moderado',
          criticalStages: 'Floración y formación del embrión',
          symptoms: 'Esterilidad en espiguillas intermedias y espigas vacías o blancas.',
          countermeasure: 'Siembras oportunas para que la floración coincida con los meses de menor incidencia de heladas (febrero).'
        }
      ],
      preventiveRecommendations: [
        {
          stage: 'Siembra al Voleo o en Líneas',
          action: 'Siembra uniforme sobre cama de siembra fina',
          timing: 'Noviembre - Diciembre',
          details: 'Calibrar la profundidad a 3-4 cm para facilitar una germinación homogénea aprovechando las primeras lluvias.'
        },
        {
          stage: 'Macollaje y Fertilización',
          action: 'Abonamiento nitrogenado fraccionado',
          timing: 'Enero',
          details: 'Aplicar abono en suelo húmedo tras el inicio del macollaje para multiplicar el número de espigas efectivas.'
        },
        {
          stage: 'Espigado y Llenado',
          action: 'Vigilancia fitosanitaria tras nieblas y lloviznas',
          timing: 'Febrero - Marzo',
          details: 'Revisar haz y envés de las hojas bandera para detectar tempranamente indicios de roya o carbón.'
        },
        {
          stage: 'Siega y Trilla',
          action: 'Siega con grano duro (humedad < 14 %)',
          timing: 'Abril - Junio',
          details: 'Emparvar en gavillas bien ventiladas si amenaza lluvia para prevenir fermentación de espigas.'
        }
      ]
    },
    {
      id: 'haba',
      name: 'Haba',
      scientificName: 'Vicia faba L.',
      typicalVarieties: ['Haba Criolla', 'Haba Verde Mantaro', 'Pacae', 'Sevillana'],
      // Fotografía de cultivo de leguminosas andinas
      imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=1200&q=80',
      altitudeRange: '3,100 a 3,750 msnm',
      growthCycleDays: '150 a 190 días',
      description: 'Leguminosa andina de doble propósito (grano verde y grano seco) y fijadora biológica natural de nitrógeno en el suelo. Muy apreciada en la gastronomía huancaína y fundamental en la rotación de parcelas.',
      waterRequirement: '450 - 650 mm (muy sensible al anegamiento de raíces)',
      optimalTempRange: '11 °C a 18 °C (requiere frescor, sufre con calor extremo)',
      importanceInMantaro: 'Sembrada ampliamente en Chupaca, Huancayo, Sicaya y las faldas templadas de Concepción.',
      meteorologicalRisks: [
        {
          type: 'Helada en Floración y Cuajado',
          severity: 'critico',
          criticalStages: 'Apertura floral y vainas tiernas',
          symptoms: 'Aborto masivo de flores, caída de vainas tiernas y ennegrecimiento de ápices terminales.',
          countermeasure: 'Orientación de surcos este-oeste para máxima captación solar y riegos de atenuación térmica.'
        },
        {
          type: 'Mancha Chocolate (Botrytis fabae)',
          severity: 'alto',
          criticalStages: 'Ramificación y formación de vainas',
          symptoms: 'Puntos rojizos circulares que coalescen formando manchas color chocolate oscuras, provocando defoliación acelerada en días nublados y húmedos.',
          countermeasure: 'Manejo de densidades amplias entre plantas para permitir el libre flujo de aire y evitar microclimas húmedos en el follaje.'
        },
        {
          type: 'Anegamiento y Pudrición Radicular',
          severity: 'alto',
          criticalStages: 'Cualquier etapa con suelo saturado',
          symptoms: 'Amarillamiento repentino de hojas inferiores, marchitez y muerte de la raíz principal por falta de oxígeno.',
          countermeasure: 'Nivelación de parcelas y drenajes activos en la cabecera y pie de la chacra.'
        }
      ],
      preventiveRecommendations: [
        {
          stage: 'Siembra en Húmedo',
          action: 'Siembra sobre surco oreante con semilla sana seleccionada',
          timing: 'Octubre - Noviembre',
          details: 'Descartar semillas atacadas por gorgojo. Sembrar a 25 cm entre golpes con 2 semillas por postura.'
        },
        {
          stage: 'Primer Cultivo y Deshierbe',
          action: 'Aflojamiento del suelo y control de malezas hospederas',
          timing: 'Diciembre',
          details: 'Aflojar la tierra alrededor del tallo para estimular la nodulación de Rhizobium y fijación de nitrógeno.'
        },
        {
          stage: 'Floración y Vaina Verde',
          action: 'Monitoreo de alertas de helada y ventilación',
          timing: 'Enero - Marzo',
          details: 'Cosechar oportunamente para venta en vaina verde (choclo de haba) antes de que las heladas dañen la calidad comercial.'
        },
        {
          stage: 'Secado y Cosecha de Grano Seco',
          action: 'Arranque de matas y secado en parvas elevadas',
          timing: 'Abril - Mayo',
          details: 'Secar las matas en parvas apoyadas en soportes de madera para que no toquen el suelo húmedo.'
        }
      ]
    }
  ];

  getCrops(): Observable<Crop[]> {
    return of([...this.crops]);
  }

  getCropById(id: string): Observable<Crop | undefined> {
    const crop = this.crops.find(c => c.id === id);
    return of(crop ? { ...crop } : undefined);
  }
}
