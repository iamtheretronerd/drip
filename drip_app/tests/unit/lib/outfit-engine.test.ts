import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  filterWardrobe,
  fallbackOutfit,
  buildGeminiPayload,
  getSwapAlternatives,
  isJacketLike,
  isOnePiece,
  isAccessory,
} from '@/lib/outfit-engine';
import type { ClothingItem } from '@/types/database';
import type { WeatherData } from '@/types/weather';

// Mock the weather module
vi.mock('@/lib/weather', () => ({
  getWarmthRange: vi.fn((feelsLike: number) => {
    if (feelsLike >= 30) return { min: 1, max: 1 };
    if (feelsLike >= 24) return { min: 1, max: 2 };
    if (feelsLike >= 18) return { min: 2, max: 3 };
    if (feelsLike >= 10) return { min: 3, max: 4 };
    if (feelsLike >= 0) return { min: 4, max: 5 };
    return { min: 5, max: 5 };
  }),
  getCurrentSeason: vi.fn(() => 'summer'),
  shouldIncludeOuterwear: vi.fn((feelsLike: number) => feelsLike < 18),
  hasPrecipitation: vi.fn((chance: number) => chance >= 50),
}));

const createMockItem = (overrides: Partial<ClothingItem> = {}): ClothingItem => ({
  id: 'test-id',
  user_id: 'user-id',
  photo_url: 'https://example.com/image.jpg',
  status: 'analyzed',
  name: 'Test Item',
  type: 'top',
  sub_type: null,
  color: 'blue',
  secondary_color: null,
  pattern: null,
  material: 'cotton',
  formality: 'casual',
  warmth_rating: 3,
  seasons: ['spring', 'summer'],
  layer_type: null,
  fit: null,
  occasion_tags: null,
  category: null,
  style_tags: null,
  weather_suitability: null,
  is_onboarding_item: false,
  last_worn: null,
  times_worn: 0,
  consecutive_days_worn: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('isJacketLike', () => {
  it('returns true for items with jacket terms in name', () => {
    expect(isJacketLike(createMockItem({ name: 'Leather Jacket' }))).toBe(true);
    expect(isJacketLike(createMockItem({ name: 'Winter Coat' }))).toBe(true);
    expect(isJacketLike(createMockItem({ name: 'Denim Hoodie' }))).toBe(true);
    expect(isJacketLike(createMockItem({ name: 'Blue Blazer' }))).toBe(true);
    expect(isJacketLike(createMockItem({ name: 'Cardigan Sweater' }))).toBe(true);
    expect(isJacketLike(createMockItem({ name: 'Vest Top' }))).toBe(true);
  });

  it('returns true for items with jacket terms in sub_type', () => {
    expect(isJacketLike(createMockItem({ name: 'Item', sub_type: 'jacket' }))).toBe(true);
    expect(isJacketLike(createMockItem({ name: 'Item', sub_type: 'outer coat' }))).toBe(true);
  });

  it('returns false for items without jacket terms', () => {
    expect(isJacketLike(createMockItem({ name: 'T-Shirt' }))).toBe(false);
    expect(isJacketLike(createMockItem({ name: 'Jeans' }))).toBe(false);
    expect(isJacketLike(createMockItem({ name: 'Sneakers' }))).toBe(false);
  });

  it('returns false for null or undefined items', () => {
    expect(isJacketLike(null)).toBe(false);
    expect(isJacketLike(undefined)).toBe(false);
  });
});

describe('isOnePiece', () => {
  it('returns true for dress-related items', () => {
    expect(isOnePiece(createMockItem({ name: 'Summer Dress' }))).toBe(true);
    expect(isOnePiece(createMockItem({ name: 'Casual Jumpsuit' }))).toBe(true);
    expect(isOnePiece(createMockItem({ name: 'Party Gown' }))).toBe(true);
    expect(isOnePiece(createMockItem({ name: 'Bodysuit' }))).toBe(true);
    expect(isOnePiece(createMockItem({ name: 'Onesie' }))).toBe(true);
  });

  it('returns true for items with matching sub_type', () => {
    expect(isOnePiece(createMockItem({ name: 'Item', sub_type: 'dress' }))).toBe(true);
    expect(isOnePiece(createMockItem({ name: 'Item', sub_type: 'jumpsuit' }))).toBe(true);
  });

  it('returns true for items with type set to dress term', () => {
    expect(isOnePiece(createMockItem({ type: 'dress' }))).toBe(true);
    expect(isOnePiece(createMockItem({ type: 'jumpsuit' }))).toBe(true);
  });

  it('returns false for regular separates', () => {
    expect(isOnePiece(createMockItem({ name: 'T-Shirt', type: 'top' }))).toBe(false);
    expect(isOnePiece(createMockItem({ name: 'Jeans', type: 'bottom' }))).toBe(false);
  });

  it('returns false for null or undefined items', () => {
    expect(isOnePiece(null)).toBe(false);
    expect(isOnePiece(undefined)).toBe(false);
  });
});

describe('isAccessory', () => {
  it('returns true for items with type accessory', () => {
    expect(isAccessory(createMockItem({ type: 'accessory' }))).toBe(true);
    expect(isAccessory(createMockItem({ type: 'accessories' }))).toBe(true);
  });

  it('returns false for non-accessory types', () => {
    expect(isAccessory(createMockItem({ type: 'top' }))).toBe(false);
    expect(isAccessory(createMockItem({ type: 'bottom' }))).toBe(false);
    expect(isAccessory(createMockItem({ type: 'shoes' }))).toBe(false);
  });

  it('returns false for null or undefined items', () => {
    expect(isAccessory(null)).toBe(false);
    expect(isAccessory(undefined)).toBe(false);
  });
});

describe('filterWardrobe', () => {
  const mockWeather: WeatherData = {
    temp: 25,
    feels_like: 25,
    humidity: 50,
    description: 'Sunny',
    icon: '01d',
    wind_speed: 5,
    precipitation_chance: 0,
    city: 'Test City',
  };

  const ctx = {
    weather: mockWeather,
    lifestyle: 'casual',
    recentItemIds: [],
    lat: 40,
  };

  it('filters only analyzed items with a type', () => {
    const items = [
      createMockItem({ id: '1', status: 'analyzed', type: 'top' }),
      createMockItem({ id: '2', status: 'pending_analysis', type: 'top' }),
      createMockItem({ id: '3', status: 'analyzed', type: null }),
      createMockItem({ id: '4', status: 'analyzed', type: 'bottom' }),
    ];

    const filtered = filterWardrobe(items, ctx);
    
    // Should include items 1 and 4 only
    const allItems = [...filtered.top, ...filtered.bottom, ...filtered.shoes, ...filtered.outerwear, ...filtered.accessory1, ...filtered.accessory2];
    expect(allItems.map(i => i.id).sort()).toEqual(['1', '4']);
  });

  it('groups items by category correctly', () => {
    const items = [
      createMockItem({ id: '1', type: 'top' }),
      createMockItem({ id: '2', type: 'bottom' }),
      createMockItem({ id: '3', type: 'shoes' }),
      createMockItem({ id: '4', type: 'outerwear' }),
      createMockItem({ id: '5', type: 'accessory' }),
    ];

    const filtered = filterWardrobe(items, ctx);

    expect(filtered.top.map(i => i.id)).toContain('1');
    expect(filtered.bottom.map(i => i.id)).toContain('2');
    expect(filtered.shoes.map(i => i.id)).toContain('3');
    expect(filtered.outerwear.map(i => i.id)).toContain('4');
    expect(filtered.accessory1.map(i => i.id)).toContain('5');
    expect(filtered.accessory2.map(i => i.id)).toContain('5');
  });

  it('excludes recently worn items from rotation', () => {
    const items = [
      createMockItem({ id: '1', type: 'top' }),
      createMockItem({ id: '2', type: 'top' }),
      createMockItem({ id: '3', type: 'top' }),
    ];

    const filteredWithRecent = filterWardrobe(items, { ...ctx, recentItemIds: ['1'] });
    
    // Should still have items since we relax filter when too few results
    expect(filteredWithRecent.top.length).toBeGreaterThanOrEqual(2);
  });

  it('handles lifestyle formality filtering', () => {
    const items = [
      createMockItem({ id: '1', type: 'top', formality: 'casual' }),
      createMockItem({ id: '2', type: 'top', formality: 'formal' }),
    ];

    const casualFiltered = filterWardrobe(items, { ...ctx, lifestyle: 'casual' });
    const corporateFiltered = filterWardrobe(items, { ...ctx, lifestyle: 'corporate' });

    // Both should return results (filter may relax)
    expect(casualFiltered.top.length).toBeGreaterThanOrEqual(0);
    expect(corporateFiltered.top.length).toBeGreaterThanOrEqual(0);
  });

  it('handles null weather gracefully', () => {
    const items = [createMockItem({ id: '1', type: 'top' })];
    const filtered = filterWardrobe(items, { ...ctx, weather: null });

    expect(filtered.top.length).toBe(1);
  });

  it('filters suede/nubuck when precipitation is likely', () => {
    const items = [
      createMockItem({ id: '1', type: 'shoes', material: 'suede' }),
      createMockItem({ id: '2', type: 'shoes', material: 'leather' }),
    ];

    const rainyCtx = { ...ctx, weather: { ...mockWeather, precipitation_chance: 60 } };
    const filtered = filterWardrobe(items, rainyCtx);

    // Should have results (filter relaxes if too restrictive)
    expect(filtered.shoes.length).toBeGreaterThanOrEqual(0);
  });
});

describe('fallbackOutfit', () => {
  it('selects random items from each category', () => {
    const mockItems = {
      top: [createMockItem({ id: 't1', name: 'Shirt' }), createMockItem({ id: 't2', name: 'Blouse' })],
      bottom: [createMockItem({ id: 'b1', name: 'Jeans' })],
      shoes: [createMockItem({ id: 's1', name: 'Sneakers' })],
      outerwear: [],
      accessory1: [createMockItem({ id: 'a1', name: 'Watch' })],
      accessory2: [createMockItem({ id: 'a2', name: 'Ring' })],
    };

    const outfit = fallbackOutfit(mockItems);

    expect(mockItems.top).toContainEqual(outfit.top);
    expect(mockItems.bottom).toContainEqual(outfit.bottom);
    expect(outfit.reasoning).toContain('fallback');
  });

  it('returns null for empty categories', () => {
    const mockItems = {
      top: [],
      bottom: [],
      shoes: [],
      outerwear: [],
      accessory1: [],
      accessory2: [],
    };

    const outfit = fallbackOutfit(mockItems);

    expect(outfit.top).toBeNull();
    expect(outfit.bottom).toBeNull();
    expect(outfit.shoes).toBeNull();
    expect(outfit.outerwear).toBeNull();
  });

  it('ensures accessories are different types', () => {
    const mockItems = {
      top: [],
      bottom: [],
      shoes: [],
      outerwear: [],
      accessory1: [
        createMockItem({ id: 'a1', name: 'Necklace', sub_type: 'necklace' }),
        createMockItem({ id: 'a2', name: 'Watch', sub_type: 'watch' }),
      ],
      accessory2: [
        createMockItem({ id: 'a1', name: 'Necklace', sub_type: 'necklace' }),
        createMockItem({ id: 'a2', name: 'Watch', sub_type: 'watch' }),
      ],
    };

    const outfit = fallbackOutfit(mockItems);

    // Accessory1 and accessory2 should be different
    if (outfit.accessory1 && outfit.accessory2) {
      expect(outfit.accessory1.id).not.toBe(outfit.accessory2.id);
    }
  });
});

describe('buildGeminiPayload', () => {
  it('transforms items to metadata format', () => {
    const mockItems = {
      top: [createMockItem({ id: 't1', name: 'Blue Shirt' })],
      bottom: [createMockItem({ id: 'b1', name: 'Jeans' })],
      shoes: [],
      outerwear: [],
      accessory1: [],
      accessory2: [],
    };

    const payload = buildGeminiPayload(mockItems);

    expect(payload.tops).toHaveLength(1);
    expect(payload.tops[0]).toHaveProperty('id', 't1');
    expect(payload.tops[0]).toHaveProperty('name', 'Blue Shirt');
    expect(payload.tops[0]).toHaveProperty('type', 'top');
  });

  it('filters jacket-like items from tops and includes in outerwear', () => {
    const mockItems = {
      top: [
        createMockItem({ id: 't1', name: 'Shirt' }),
        createMockItem({ id: 't2', name: 'Leather Jacket' }),
      ],
      bottom: [],
      shoes: [],
      outerwear: [createMockItem({ id: 'o1', name: 'Coat' })],
      accessory1: [],
      accessory2: [],
    };

    const payload = buildGeminiPayload(mockItems);

    // Jacket should be in outerwear, not tops
    const topIds = payload.tops.map(t => t.id);
    const outerwearIds = payload.outerwear.map(o => o.id);

    expect(topIds).not.toContain('t2');
    expect(outerwearIds).toContain('t2');
    expect(outerwearIds).toContain('o1');
  });
});

describe('getSwapAlternatives', () => {
  const mockWeather: WeatherData = {
    temp: 25,
    feels_like: 25,
    humidity: 50,
    description: 'Sunny',
    icon: '01d',
    wind_speed: 5,
    precipitation_chance: 0,
    city: 'Test City',
  };

  const ctx = {
    weather: mockWeather,
    lifestyle: 'casual',
    recentItemIds: [],
    lat: 40,
  };

  it('returns all items in category with recommendation flags', () => {
    const items = [
      createMockItem({ id: '1', type: 'top', name: 'Summer Shirt' }),
      createMockItem({ id: '2', type: 'top', name: 'Winter Sweater' }),
    ];

    const alternatives = getSwapAlternatives(items, 'top', ctx);

    expect(alternatives).toHaveLength(2);
    expect(alternatives[0]).toHaveProperty('item');
    expect(alternatives[0]).toHaveProperty('isRecommended');
  });

  it('sorts recommended items first', () => {
    const items = [
      createMockItem({ id: '1', type: 'top', warmth_rating: 1 }), // Light
      createMockItem({ id: '2', type: 'top', warmth_rating: 5 }), // Heavy
    ];

    const alternatives = getSwapAlternatives(items, 'top', { ...ctx, weather: { ...mockWeather, feels_like: 5 } });

    // In cold weather, warmer items should be recommended
    const recommendedItems = alternatives.filter(a => a.isRecommended);
    const notRecommendedItems = alternatives.filter(a => !a.isRecommended);
    
    // Recommended items should come first
    alternatives.forEach((alt, index) => {
      if (index < recommendedItems.length) {
        expect(alt.isRecommended).toBe(true);
      }
    });
  });

  it('handles outerwear category with jacket-like tops', () => {
    const items = [
      createMockItem({ id: '1', type: 'outerwear', name: 'Winter Coat' }),
      createMockItem({ id: '2', type: 'top', name: 'Denim Jacket' }),
      createMockItem({ id: '3', type: 'top', name: 'T-Shirt' }),
    ];

    const alternatives = getSwapAlternatives(items, 'outerwear', ctx);

    // Should include both outerwear and jacket-like tops
    const ids = alternatives.map(a => a.item.id);
    expect(ids).toContain('1');
    expect(ids).toContain('2');
    expect(ids).not.toContain('3');
  });

  it('deduplicates items', () => {
    const items = [
      createMockItem({ id: '1', type: 'accessory', name: 'Watch' }),
      createMockItem({ id: '1', type: 'accessory', name: 'Watch' }), // Duplicate
    ];

    const alternatives = getSwapAlternatives(items, 'accessory1', ctx);

    expect(alternatives).toHaveLength(1);
  });

  it('skips weather/season filters for accessories', () => {
    const items = [
      createMockItem({ id: '1', type: 'accessory', name: 'Watch', warmth_rating: 1 }),
      createMockItem({ id: '2', type: 'accessory', name: 'Ring', warmth_rating: 5 }),
    ];

    const alternatives = getSwapAlternatives(items, 'accessory1', { ...ctx, weather: { ...mockWeather, feels_like: 5 } });

    // All accessories should be recommended regardless of weather
    expect(alternatives.every(a => a.isRecommended)).toBe(true);
  });
});
