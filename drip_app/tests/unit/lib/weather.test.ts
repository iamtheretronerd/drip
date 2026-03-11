import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getWarmthRange,
  getCurrentSeason,
  shouldIncludeOuterwear,
  hasPrecipitation,
} from '@/lib/weather';
import type { WarmthRange, Season } from '@/types/weather';

describe('getWarmthRange', () => {
  it('returns {min: 1, max: 1} for temperature >= 30°C', () => {
    expect(getWarmthRange(30)).toEqual({ min: 1, max: 1 });
    expect(getWarmthRange(35)).toEqual({ min: 1, max: 1 });
    expect(getWarmthRange(40)).toEqual({ min: 1, max: 1 });
  });

  it('returns {min: 1, max: 2} for temperature >= 24°C and < 30°C', () => {
    expect(getWarmthRange(24)).toEqual({ min: 1, max: 2 });
    expect(getWarmthRange(26)).toEqual({ min: 1, max: 2 });
    expect(getWarmthRange(29)).toEqual({ min: 1, max: 2 });
  });

  it('returns {min: 2, max: 3} for temperature >= 18°C and < 24°C', () => {
    expect(getWarmthRange(18)).toEqual({ min: 2, max: 3 });
    expect(getWarmthRange(20)).toEqual({ min: 2, max: 3 });
    expect(getWarmthRange(23)).toEqual({ min: 2, max: 3 });
  });

  it('returns {min: 3, max: 4} for temperature >= 10°C and < 18°C', () => {
    expect(getWarmthRange(10)).toEqual({ min: 3, max: 4 });
    expect(getWarmthRange(14)).toEqual({ min: 3, max: 4 });
    expect(getWarmthRange(17)).toEqual({ min: 3, max: 4 });
  });

  it('returns {min: 4, max: 5} for temperature >= 0°C and < 10°C', () => {
    expect(getWarmthRange(0)).toEqual({ min: 4, max: 5 });
    expect(getWarmthRange(5)).toEqual({ min: 4, max: 5 });
    expect(getWarmthRange(9)).toEqual({ min: 4, max: 5 });
  });

  it('returns {min: 5, max: 5} for temperature < 0°C', () => {
    expect(getWarmthRange(-1)).toEqual({ min: 5, max: 5 });
    expect(getWarmthRange(-10)).toEqual({ min: 5, max: 5 });
    expect(getWarmthRange(-20)).toEqual({ min: 5, max: 5 });
  });
});

describe('getCurrentSeason', () => {
  let mockDate: Date;

  beforeEach(() => {
    mockDate = new Date(2024, 0, 1); // Default to January
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Northern Hemisphere tests (positive latitude)
  describe('Northern Hemisphere (lat >= 0)', () => {
    it('returns winter for December, January, February', () => {
      vi.setSystemTime(new Date(2024, 0, 15)); // January
      expect(getCurrentSeason(40)).toBe('winter');
      vi.setSystemTime(new Date(2024, 11, 15)); // December
      expect(getCurrentSeason(40)).toBe('winter');
    });

    it('returns spring for March, April, May', () => {
      vi.setSystemTime(new Date(2024, 2, 15)); // March
      expect(getCurrentSeason(40)).toBe('spring');
      vi.setSystemTime(new Date(2024, 3, 15)); // April
      expect(getCurrentSeason(40)).toBe('spring');
      vi.setSystemTime(new Date(2024, 4, 15)); // May
      expect(getCurrentSeason(40)).toBe('spring');
    });

    it('returns summer for June, July, August', () => {
      vi.setSystemTime(new Date(2024, 5, 15)); // June
      expect(getCurrentSeason(40)).toBe('summer');
      vi.setSystemTime(new Date(2024, 6, 15)); // July
      expect(getCurrentSeason(40)).toBe('summer');
      vi.setSystemTime(new Date(2024, 7, 15)); // August
      expect(getCurrentSeason(40)).toBe('summer');
    });

    it('returns fall for September, October, November', () => {
      vi.setSystemTime(new Date(2024, 8, 15)); // September
      expect(getCurrentSeason(40)).toBe('fall');
      vi.setSystemTime(new Date(2024, 9, 15)); // October
      expect(getCurrentSeason(40)).toBe('fall');
      vi.setSystemTime(new Date(2024, 10, 15)); // November
      expect(getCurrentSeason(40)).toBe('fall');
    });
  });

  // Southern Hemisphere tests (negative latitude)
  describe('Southern Hemisphere (lat < 0)', () => {
    it('returns summer for December, January, February', () => {
      vi.setSystemTime(new Date(2024, 0, 15)); // January
      expect(getCurrentSeason(-40)).toBe('summer');
    });

    it('returns fall for March, April, May', () => {
      vi.setSystemTime(new Date(2024, 2, 15)); // March
      expect(getCurrentSeason(-40)).toBe('fall');
    });

    it('returns winter for June, July, August', () => {
      vi.setSystemTime(new Date(2024, 5, 15)); // June
      expect(getCurrentSeason(-40)).toBe('winter');
    });

    it('returns spring for September, October, November', () => {
      vi.setSystemTime(new Date(2024, 8, 15)); // September
      expect(getCurrentSeason(-40)).toBe('spring');
    });
  });

  // Edge case: latitude exactly 0
  it('treats latitude 0 as Northern Hemisphere', () => {
    vi.setSystemTime(new Date(2024, 2, 15)); // March
    expect(getCurrentSeason(0)).toBe('spring');
  });
});

describe('shouldIncludeOuterwear', () => {
  it('returns true when temperature is below 18°C', () => {
    expect(shouldIncludeOuterwear(17)).toBe(true);
    expect(shouldIncludeOuterwear(10)).toBe(true);
    expect(shouldIncludeOuterwear(0)).toBe(true);
    expect(shouldIncludeOuterwear(-5)).toBe(true);
  });

  it('returns false when temperature is 18°C or above', () => {
    expect(shouldIncludeOuterwear(18)).toBe(false);
    expect(shouldIncludeOuterwear(25)).toBe(false);
    expect(shouldIncludeOuterwear(30)).toBe(false);
  });
});

describe('hasPrecipitation', () => {
  it('returns true when precipitation chance is >= 50%', () => {
    expect(hasPrecipitation(50)).toBe(true);
    expect(hasPrecipitation(75)).toBe(true);
    expect(hasPrecipitation(100)).toBe(true);
  });

  it('returns false when precipitation chance is < 50%', () => {
    expect(hasPrecipitation(0)).toBe(false);
    expect(hasPrecipitation(25)).toBe(false);
    expect(hasPrecipitation(49)).toBe(false);
  });
});
