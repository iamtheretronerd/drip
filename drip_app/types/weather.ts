export interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
  precipitation_chance: number;
  city: string;
}

export type WarmthRange = { min: number; max: number };

export type Season = 'spring' | 'summer' | 'fall' | 'winter';
