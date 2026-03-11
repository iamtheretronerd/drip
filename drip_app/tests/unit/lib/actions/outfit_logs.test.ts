import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logOutfit, unlogOutfit } from '@/lib/actions/outfit_logs';
import type { WeatherSnapshot } from '@/types/database';

const mockRevalidatePath = vi.fn();
vi.mock('next/cache', () => ({
  revalidatePath: (...args: any[]) => mockRevalidatePath(...args),
}));

const mockGetUser = vi.fn();
const mockUpsert = vi.fn();
const mockSelect = vi.fn();
const mockDelete = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockIn = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockSingle = vi.fn();

const createMockChain = (overrides = {}) => ({
  eq: mockEq.mockReturnThis(),
  in: mockIn.mockReturnThis(),
  order: mockOrder.mockReturnThis(),
  limit: mockLimit.mockReturnThis(),
  single: mockSingle,
  update: mockUpdate.mockReturnThis(),
  delete: mockDelete.mockReturnThis(),
  ...overrides,
});

const mockFrom = vi.fn(() => createMockChain());

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
    mockEq.mockReturnThis();
    mockIn.mockReturnThis();
    mockOrder.mockReturnThis();
    mockLimit.mockReturnThis();
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

  it('returns error when supabase not configured', async () => {
    const { createActionClient } = await import('@/lib/supabase/server');
    vi.mocked(createActionClient).mockResolvedValueOnce(null);

    const result = await logOutfit(['item-1'], mockWeather, 'happy', false);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Supabase not configured');
  });

  it('logs outfit successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockUpsert.mockResolvedValue({ error: null });
    mockIn.mockReturnValue({
      data: [{ id: 'item-1', times_worn: 0, last_worn: null, consecutive_days_worn: 0 }],
      error: null,
    });
    mockEq.mockResolvedValue({ error: null });

    const result = await logOutfit(['item-1'], mockWeather, 'happy', false);

    expect(result.success).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        item_ids: ['item-1'],
        mood_input: 'happy',
        weather_snapshot: mockWeather,
        was_modified: false,
      }),
      expect.any(Object)
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/history');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/wardrobe');
  });

  it('uses custom date when provided', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockUpsert.mockResolvedValue({ error: null });
    mockIn.mockReturnValue({ data: [], error: null });
    mockEq.mockResolvedValue({ error: null });

    await logOutfit(['item-1'], null, null, false, '2024-03-15');

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ date: '2024-03-15' }),
      expect.any(Object)
    );
  });

  it('handles consecutive days when last worn was yesterday', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockUpsert.mockResolvedValue({ error: null });
    mockIn.mockReturnValue({
      data: [{ 
        id: 'item-1', 
        times_worn: 5, 
        last_worn: `${yesterdayStr}T12:00:00Z`, 
        consecutive_days_worn: 2 
      }],
      error: null,
    });
    mockEq.mockResolvedValue({ error: null });

    const result = await logOutfit(['item-1'], null, null, false);

    expect(result.success).toBe(true);
  });

  it('handles same day re-log without incrementing consecutive', async () => {
    const today = new Date().toISOString().split('T')[0];

    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockUpsert.mockResolvedValue({ error: null });
    mockIn.mockReturnValue({
      data: [{ 
        id: 'item-1', 
        times_worn: 5, 
        last_worn: `${today}T10:00:00Z`, 
        consecutive_days_worn: 3 
      }],
      error: null,
    });
    mockEq.mockResolvedValue({ error: null });

    const result = await logOutfit(['item-1'], null, null, false);

    expect(result.success).toBe(true);
  });

  it('returns error when upsert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockUpsert.mockResolvedValue({ error: { message: 'Database error' } });

    const result = await logOutfit(['item-1'], null, null, false);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Database error');
  });

  it('returns error when fetch fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockUpsert.mockResolvedValue({ error: null });
    mockIn.mockReturnValue({ data: null, error: { message: 'Fetch error' } });

    const result = await logOutfit(['item-1'], null, null, false);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Fetch error');
  });

  it('handles empty items array', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockUpsert.mockResolvedValue({ error: null });
    mockIn.mockReturnValue({ data: [], error: null });

    const result = await logOutfit([], null, null, false);

    expect(result.success).toBe(true);
  });

  it('handles update error gracefully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockUpsert.mockResolvedValue({ error: null });
    mockIn.mockReturnValue({
      data: [{ id: 'item-1', times_worn: 0, last_worn: null, consecutive_days_worn: 0 }],
      error: null,
    });
    mockEq.mockRejectedValue(new Error('Update failed'));

    const result = await logOutfit(['item-1'], null, null, false);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Update failed');
  });
});

describe('unlogOutfit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEq.mockReturnThis();
    mockIn.mockReturnThis();
    mockOrder.mockReturnThis();
    mockLimit.mockReturnThis();
  });

  it('returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') });

    const result = await unlogOutfit();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Not authenticated');
  });

  it('returns error when supabase not configured', async () => {
    const { createActionClient } = await import('@/lib/supabase/server');
    vi.mocked(createActionClient).mockResolvedValueOnce(null);

    const result = await unlogOutfit();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Supabase not configured');
  });

  it('returns error when no log found for today', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockSingle.mockResolvedValue({ data: null, error: { message: 'No data' } });

    const result = await unlogOutfit();

    expect(result.success).toBe(false);
    expect(result.error).toContain('No log found');
  });

  it('deletes outfit log and reverts item stats', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockSingle.mockResolvedValueOnce({ data: { id: 'log-123', item_ids: ['item-1'] }, error: null });
    mockDelete.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    mockIn.mockReturnValue({
      data: [{ id: 'item-1', times_worn: 5 }],
      error: null,
    });
    mockEq.mockResolvedValue({ error: null });

    const result = await unlogOutfit();

    expect(result.success).toBe(true);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');
  });

  it('handles delete error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockSingle.mockResolvedValueOnce({ data: { id: 'log-123', item_ids: ['item-1'] }, error: null });
    mockDelete.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } }) });

    const result = await unlogOutfit();

    expect(result.success).toBe(false);
    expect(result.error).toContain('Delete failed');
  });

  it('handles items revert with times_worn at 0', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockSingle.mockResolvedValueOnce({ data: { id: 'log-123', item_ids: ['item-1'] }, error: null });
    mockDelete.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    mockIn.mockReturnValue({
      data: [{ id: 'item-1', times_worn: 0 }],
      error: null,
    });
    mockEq.mockResolvedValue({ error: null });

    const result = await unlogOutfit();

    expect(result.success).toBe(true);
  });

  it('handles no items to revert', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockSingle.mockResolvedValueOnce({ data: { id: 'log-123', item_ids: [] }, error: null });
    mockDelete.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });

    const result = await unlogOutfit();

    expect(result.success).toBe(true);
  });

  it('handles undefined times_worn in revert', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockSingle.mockResolvedValueOnce({ data: { id: 'log-123', item_ids: ['item-1'] }, error: null });
    mockDelete.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    mockIn.mockReturnValue({
      data: [{ id: 'item-1' }],
      error: null,
    });
    mockEq.mockResolvedValue({ error: null });

    const result = await unlogOutfit();

    expect(result.success).toBe(true);
  });
});
