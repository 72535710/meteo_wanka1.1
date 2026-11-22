export interface CropRisk {
  type: string;
  severity: 'moderado' | 'alto' | 'critico';
  criticalStages: string;
  symptoms: string;
  countermeasure: string;
}

export interface CropRecommendation {
  stage: string;
  action: string;
  timing: string;
  details: string;
}

export interface Crop {
  id: string;
  name: string;
  scientificName: string;
  typicalVarieties: string[];
  imageUrl: string;
  altitudeRange: string;
  growthCycleDays: string;
  description: string;
  waterRequirement: string;
  optimalTempRange: string;
  importanceInMantaro: string;
  meteorologicalRisks: CropRisk[];
  preventiveRecommendations: CropRecommendation[];
}
