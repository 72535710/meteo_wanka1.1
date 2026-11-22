export type AlertType = 'helada' | 'lluvia_intensa' | 'temperatura_elevada' | 'otro';

export type RiskLevel = 'bajo' | 'moderado' | 'alto' | 'critico' | 'otro';

export interface WeatherAlert {
  id: string;
  type: AlertType;
  typeLabel?: string;
  title: string;
  riskLevel: RiskLevel;
  riskLabel?: string;
  localityId: string;
  localityName: string;
  detectedAt: string;
  validUntil?: string;
  description: string;
  recommendationTitle?: string;
  preventiveRecommendation?: string;
  affectedCrops?: string[];
  isActive: boolean;
  status?: string;
}
