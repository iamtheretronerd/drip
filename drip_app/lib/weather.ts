import type { WarmthRange, Season } from '@/types/weather';

/**
 * Maps feels_like temperature (Celsius) to a warmth rating range (1-5).
 * Items with warmth_rating in this range are suitable.
 */
export function getWarmthRange(feelsLike: number): WarmthRange {
  if (feelsLike >= 30) return { min: 1, max: 1 };
  if (feelsLike >= 24) return { min: 1, max: 2 };
  if (feelsLike >= 18) return { min: 2, max: 3 };
  if (feelsLike >= 10) return { min: 3, max: 4 };
  if (feelsLike >= 0) return { min: 4, max: 5 };
  return { min: 5, max: 5 };
}

/**
 * Determines current season based on month and hemisphere.
 */
export function getCurrentSeason(lat: number): Season {
  const month = new Date().getMonth(); // 0-11
  const isNorthern = lat >= 0;

  if (isNorthern) {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  } else {
    if (month >= 2 && month <= 4) return 'fall';
    if (month >= 5 && month <= 7) return 'winter';
    if (month >= 8 && month <= 10) return 'spring';
    return 'summer';
  }
}

export function shouldIncludeOuterwear(feelsLike: number): boolean {
  return feelsLike < 18;
}

export function hasPrecipitation(precipitationChance: number): boolean {
  return precipitationChance >= 50;
}
