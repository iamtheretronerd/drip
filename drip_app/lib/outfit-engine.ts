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

type Category = 'top' | 'bottom' | 'shoes' | 'outerwear' | 'accessory1' | 'accessory2';

const JACKET_TERMS = ['jacket', 'coat', 'hoodie', 'blazer', 'cardigan', 'outer', 'vest'];

export const isJacketLike = (item: ClothingItem) => {
  const name = (item.name || '').toLowerCase();
  const subType = (item.sub_type || '').toLowerCase();
  return JACKET_TERMS.some(term => name.includes(term) || subType.includes(term));
};

const ONE_PIECE_TERMS = ['dress', 'jumpsuit', 'romper', 'gown', 'bodysuit', 'onesie'];

export const isOnePiece = (item: ClothingItem) => {
  const name = (item.name || '').toLowerCase();
  const subType = (item.sub_type || '').toLowerCase();
  const type = (item.type || '').toLowerCase();
  return ONE_PIECE_TERMS.some(term =>
    name.includes(term) ||
    subType.includes(term) ||
    type === term
  );
};

export const isAccessory = (item: ClothingItem) => {
  const type = (item.type || '').toLowerCase();
  return type === 'accessory' || type === 'accessories';
};

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

  // Move misclassified jackets and handle one-pieces
  const tops = applyFilters(analyzed.filter(i =>
    (i.type === 'top' || isOnePiece(i)) && !isJacketLike(i)
  ));
  const bottoms = applyFilters(analyzed.filter((i) => i.type === 'bottom'));
  const shoes = applyFilters(analyzed.filter((i) => i.type === 'shoes'));

  // Combine all "jackets" into outerwear
  const outerwear = applyFilters(analyzed.filter(i =>
    i.type === 'outerwear' || (i.type === 'top' && isJacketLike(i))
  ));
  const accessories = applyFilters(analyzed.filter(isAccessory));

  return {
    top: Array.from(new Map(tops.map(i => [i.id, i])).values()),
    bottom: bottoms,
    shoes,
    outerwear: Array.from(new Map(outerwear.map(i => [i.id, i])).values()),
    accessory1: accessories,
    accessory2: accessories
  };
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
    accessory1: filtered.accessory1[0] ?? null,
    accessory2: filtered.accessory2[1] ?? null,
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

  const topsRaw = filtered.top;
  const outerwearRaw = filtered.outerwear;

  // Final sanitization for the AI payload
  const tops = topsRaw.filter(i => !isJacketLike(i));
  const outerwear = Array.from(new Map([
    ...outerwearRaw,
    ...topsRaw.filter(isJacketLike)
  ].map(i => [i.id, i])).values());

  return {
    tops: tops.map(toMeta),
    bottoms: filtered.bottom.map(toMeta),
    shoes: filtered.shoes.map(toMeta),
    outerwear: outerwear.map(toMeta),
    accessories: filtered.accessory1.map(toMeta),
  };
}

/**
 * Specifically for the manual 'Piece Swap' feature.
 * Returns ALL items in the category, but with weather-compatible ones first.
 * Also handles category overlap (e.g., jackets tagged as 'top').
 */
export function getSwapAlternatives(
  items: ClothingItem[],
  category: Category,
  ctx: FilterContext
): { item: ClothingItem; isRecommended: boolean }[] {
  const analyzed = items.filter((i) => i.status === 'analyzed');

  // 1. Filter items based on category + smart classification
  let categoryItems: ClothingItem[] = [];

  if (category === 'outerwear') {
    // Outerwear = Everything tagged as 'outerwear' + Any 'top' that looks like a jacket
    categoryItems = analyzed.filter(i =>
      i.type === 'outerwear' ||
      (i.type === 'top' && isJacketLike(i))
    );
  } else if (category === 'top') {
    // Top = Everything tagged as 'top' OR anything that looks like a dress 
    // BUT EXCLUDING items that look like jackets
    categoryItems = analyzed.filter(i =>
      (i.type === 'top' || isOnePiece(i)) && !isJacketLike(i)
    );
  } else if (category === 'accessory1' || category === 'accessory2') {
    // Both 'accessory' and 'accessories' count for both slots
    categoryItems = analyzed.filter(isAccessory);
  } else {
    // Other categories stay strict
    categoryItems = analyzed.filter(i => i.type === category);
  }

  // Deduplicate just in case
  categoryItems = Array.from(new Map(categoryItems.map(i => [i.id, i])).values());

  // 3. Calculate recommendations (using the same logic as the main engine)
  const season = getCurrentSeason(ctx.lat);
  const warmthRange = ctx.weather ? getWarmthRange(ctx.weather.feels_like) : null;
  const precipitating = ctx.weather ? hasPrecipitation(ctx.weather.precipitation_chance) : false;

  return categoryItems.map(item => {
    let isRecommended = true;

    // Accessories are all-weather: skip weather/season filters
    if (category !== 'accessory1' && category !== 'accessory2') {
      // Season Check
      if (item.seasons && !item.seasons.includes(season)) isRecommended = false;

      // Warmth Check
      if (warmthRange && item.warmth_rating != null) {
        if (item.warmth_rating < warmthRange.min || item.warmth_rating > warmthRange.max) {
          isRecommended = false;
        }
      }

      // Rain Check
      if (precipitating && item.material) {
        if (['suede', 'nubuck'].includes(item.material.toLowerCase())) isRecommended = false;
      }
    }

    // Recently worn check applies to everything to keep things fresh
    if (ctx.recentItemIds.includes(item.id)) isRecommended = false;

    return { item, isRecommended };
  }).sort((a, b) => {
    // 1. Sort recommended items to the top
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;

    // 2. Secondary sort: Warmth rating descending (5/5 to 1/5)
    const warmthA = a.item.warmth_rating ?? 0;
    const warmthB = b.item.warmth_rating ?? 0;
    return warmthB - warmthA;
  });
}

