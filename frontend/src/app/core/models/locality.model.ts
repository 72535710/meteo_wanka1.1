export interface Locality {
  id: string;
  name: string;
  province: string;
  altitudeMeters: number | null;
  latitude?: number;
  longitude?: number;
  mainCrops?: string[];
  active?: boolean;
}
