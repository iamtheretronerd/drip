export interface ForecastDay {
  date: string;         // YYYY-MM-DD
  day: string;          // "Today", "Mon", "Tue" …
  isToday: boolean;
  tempMax: number;
  tempMin: number;
  icon: string;
  description: string;
  precipChance: number;
}

export interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
  precipitation_chance: number;
  city: string;
  forecast?: ForecastDay[];
}

export type WarmthRange = { min: number; max: number };

export type Season = 'spring' | 'summer' | 'fall' | 'winter';
