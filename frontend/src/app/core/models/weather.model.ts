export interface CurrentWeather {
  localityId: string;
  localityName: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  thermalSensation?: number;
  atmosphericPressure?: number;
  condition: string;
  icon: string;
  recordedAt: string;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  minTemp: number;
  maxTemp: number;
  precipitationTotal: number;
  precipitationProb?: number | null;
  condition: string;
  icon: string;
  windSpeed: number;
}

export interface LocalityWeather {
  current: CurrentWeather;
  forecast: DailyForecast[];
}
