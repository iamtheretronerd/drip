import type { ClothingItem } from '@/types/database';
import type { WeatherData } from '@/types/weather';
import type { OutfitSuggestion } from '@/types/outfit';
import { getWarmthRange, getCurrentSeason, shouldIncludeOuterwear, hasPrecipitation } from './weather';

interface FilterContext {
  weather: WeatherData | null;
  lifestyle: string | null;
  recentItemIds: string[];
  lat: number;
}

type Category = 'top' | 'bottom' | 'shoes' | 'outerwear';

/**
 * Rule-based filtering: narrows wardrobe to weather/season/rotation-appropriate items.
 * Returns items grouped by category.
 */
export function filterWardrobe(
  items: ClothingItem[],
  ctx: FilterContext
): Record<Category, ClothingItem[]> {
  const analyzed = items.filter((i) => i.status === 'analyzed' && i.type);

  const season = getCurrentSeason(ctx.lat);
  const warmthRange = ctx.weather ? getWarmthRange(ctx.weather.feels_like) : null;
  const precipitating = ctx.weather ? hasPrecipitation(ctx.weather.precipitation_chance) : false;
  const needsOuterwear = ctx.weather ? shouldIncludeOuterwear(ctx.weather.feels_like) : false;

  function applyFilters(categoryItems: ClothingItem[]): ClothingItem[] {
    let filtered = categoryItems;

    // Season filter
    filtered = relaxFilter(filtered, categoryItems, (i) =>
      i.seasons ? i.seasons.includes(season) : true
    );

    // Warmth filter
    if (warmthRange) {
      filtered = relaxFilter(filtered, categoryItems, (i) =>
        i.warmth_rating != null
          ? i.warmth_rating >= warmthRange.min && i.warmth_rating <= warmthRange.max
          : true
      );
    }

    // Precipitation filter: exclude suede/nubuck if rain likely
    if (precipitating) {
      filtered = relaxFilter(filtered, categoryItems, (i) =>
        i.material ? !['suede', 'nubuck'].includes(i.material.toLowerCase()) : true
      );
    }

    // Formality filter
    if (ctx.lifestyle) {
      const formalityMap: Record<string, string[]> = {
        corporate: ['formal', 'business_casual', 'smart_casual'],
        creative: ['casual', 'smart_casual', 'business_casual'],
        casual: ['casual', 'smart_casual'],
        active: ['casual', 'athletic'],
      };
      const allowed = formalityMap[ctx.lifestyle] ?? ['casual', 'smart_casual', 'business_casual'];
      filtered = relaxFilter(filtered, categoryItems, (i) =>
        i.formality ? allowed.includes(i.formality) : true
      );
    }

    // Rotation filter: exclude recently worn items
    if (ctx.recentItemIds.length > 0) {
      filtered = relaxFilter(filtered, categoryItems, (i) =>
        !ctx.recentItemIds.includes(i.id)
      );
    }

    return filtered;
  }

  const tops = applyFilters(analyzed.filter((i) => i.type === 'top'));
  const bottoms = applyFilters(analyzed.filter((i) => i.type === 'bottom'));
  const shoes = applyFilters(analyzed.filter((i) => i.type === 'shoes'));
  const outerwear = needsOuterwear
    ? applyFilters(analyzed.filter((i) => i.type === 'outerwear'))
    : [];

  return { top: tops, bottom: bottoms, shoes, outerwear };
}

/**
 * Graceful degradation: if filter results in empty set, fall back to unfiltered.
 */
function relaxFilter(
  current: ClothingItem[],
  fallback: ClothingItem[],
  predicate: (i: ClothingItem) => boolean
): ClothingItem[] {
  const result = current.filter(predicate);
  return result.length > 0 ? result : current.length > 0 ? current : fallback;
}

/**
 * Fallback outfit selection: picks first item from each category.
 * Used when AI is unavailable.
 */
export function fallbackOutfit(
  filtered: Record<Category, ClothingItem[]>
): OutfitSuggestion {
  return {
    top: filtered.top[0] ?? null,
    bottom: filtered.bottom[0] ?? null,
    shoes: filtered.shoes[0] ?? null,
    outerwear: filtered.outerwear[0] ?? null,
    reasoning: 'Selected based on weather and wardrobe rules.',
  };
}

/**
 * Builds the metadata payload to send to Gemini (no image data).
 */
export function buildGeminiPayload(filtered: Record<Category, ClothingItem[]>) {
  const toMeta = (item: ClothingItem) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    color: item.color,
    secondary_color: item.secondary_color,
    pattern: item.pattern,
    material: item.material,
    formality: item.formality,
    layer_type: item.layer_type,
    fit: item.fit,
    occasion_tags: item.occasion_tags,
    warmth_rating: item.warmth_rating,
  });

  return {
    tops: filtered.top.map(toMeta),
    bottoms: filtered.bottom.map(toMeta),
    shoes: filtered.shoes.map(toMeta),
    outerwear: filtered.outerwear.map(toMeta),
  };
}
