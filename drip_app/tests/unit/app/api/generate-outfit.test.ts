import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/generate-outfit/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/outfit-engine', () => ({
  filterWardrobe: vi.fn(() => ({
    top: [],
    bottom: [],
    shoes: [],
    outerwear: [],
    accessory1: [],
    accessory2: [],
  })),
  fallbackOutfit: vi.fn(() => ({
    top: null,
    bottom: null,
    shoes: null,
    outerwear: null,
    accessory1: null,
    accessory2: null,
    reasoning: 'Fallback outfit',
  })),
  buildGeminiPayload: vi.fn(() => ({ tops: [], bottoms: [], shoes: [], outerwear: [], accessories: [] })),
}));

const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

describe('POST /api/generate-outfit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  const createMockRequest = (body: any) => {
    return {
      json: vi.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  };

  it('returns 500 when supabase is not configured', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValueOnce(null);

    const request = createMockRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Supabase not configured');
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const request = createMockRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Not authenticated');
  });

  it('returns 404 when no clothing items found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({ data: { lifestyle: 'casual' }, error: null });
    
    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return { select: mockSelect, eq: mockEq, single: mockSingle };
      }
      if (table === 'clothing_items') {
        return { select: () => ({ eq: () => ({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }) }) };
      }
      return { select: () => ({ eq: () => ({ order: () => ({ limit: vi.fn().mockResolvedValue({ data: [], error: null }) }) }) }) };
    });

    const request = createMockRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('No clothing items found');
    expect(data.empty).toBe(true);
  });

  it('returns outfit suggestion with filtered wardrobe', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

    const { filterWardrobe, fallbackOutfit } = await import('@/lib/outfit-engine');
    vi.mocked(filterWardrobe).mockReturnValue({
      top: [],
      bottom: [],
      shoes: [],
      outerwear: [],
      accessory1: [],
      accessory2: [],
    });
    vi.mocked(fallbackOutfit).mockReturnValue({
      top: null,
      bottom: null,
      shoes: null,
      outerwear: null,
      accessory1: null,
      accessory2: null,
      reasoning: 'Test outfit',
    });

    const mockItems = [
      { id: 'item-1', name: 'T-Shirt', type: 'top', color: 'blue' },
      { id: 'item-2', name: 'Jeans', type: 'bottom', color: 'blue' },
    ];

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { lifestyle: 'casual', lat: 40 }, error: null }),
        };
      }
      if (table === 'clothing_items') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: mockItems, error: null }),
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      };
    });

    const request = createMockRequest({
      mood: 'happy',
      weather: { temp: 25, feels_like: 25 },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reasoning).toBe('Test outfit');
  });

  it('returns fallback when Gemini API key is not set', async () => {
    process.env.GEMINI_API_KEY = '';
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

    const { fallbackOutfit } = await import('@/lib/outfit-engine');
    vi.mocked(fallbackOutfit).mockReturnValue({
      top: null,
      bottom: null,
      shoes: null,
      outerwear: null,
      accessory1: null,
      accessory2: null,
      reasoning: 'Fallback outfit',
    });

    const mockItems = [{ id: 'item-1', name: 'T-Shirt', type: 'top' }];

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { lifestyle: 'casual' }, error: null }),
        };
      }
      if (table === 'clothing_items') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: mockItems, error: null }),
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      };
    });

    const request = createMockRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(fallbackOutfit).toHaveBeenCalled();
  });

  it('returns 500 on internal error', async () => {
    mockGetUser.mockRejectedValue(new Error('Auth error'));

    const request = createMockRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
