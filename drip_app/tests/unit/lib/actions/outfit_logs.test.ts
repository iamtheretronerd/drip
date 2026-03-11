import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logOutfit, unlogOutfit } from '@/lib/actions/outfit_logs';
import type { WeatherSnapshot } from '@/types/database';

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock supabase
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createActionClient: vi.fn(() => Promise.resolve({
    auth: { getUser: mockGetUser },
  })),
}));

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

describe('logOutfit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockWeather: WeatherSnapshot = {
    temp: 25,
    feels_like: 25,
    description: 'Sunny',
    icon: '01d',
    precipitation_chance: 0,
  };

  it('returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') });

    const result = await logOutfit(['item-1'], mockWeather, 'happy', false);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Not authenticated');
  });
});

describe('unlogOutfit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') });

    const result = await unlogOutfit();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Not authenticated');
  });
});
