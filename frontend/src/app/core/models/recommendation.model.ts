export interface AgriculturalRecommendation {
  id: string;
  title: string;
  localityId: string;
  localityName: string;
  cropId: string;
  cropName: string;
  weatherCondition: string;
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  description: string;
  actionSteps: string[];
  createdAt: string;
  author: string;
  isActive: boolean;
}
