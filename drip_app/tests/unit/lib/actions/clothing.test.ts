import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteClothingItem, updateClothingItem } from '@/lib/actions/clothing';
import type { ActionResult } from '@/types';
import type { ClothingAnalysis } from '@/components/clothing/ClothingAnalysisModal';

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock supabase
const mockStorageRemove = vi.fn();
const mockStorageFrom = vi.fn(() => ({
  remove: mockStorageRemove,
}));

const mockDelete = vi.fn();
const mockUpdate = vi.fn();
const mockFrom = vi.fn(() => ({
  delete: mockDelete,
  update: mockUpdate,
}));

const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createActionClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    storage: { from: mockStorageFrom },
  })),
}));

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({
    from: mockFrom,
    storage: { from: mockStorageFrom },
  })),
}));

describe('deleteClothingItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') });

    const result = await deleteClothingItem('item-123', 'https://example.com/image.jpg');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Not authenticated');
  });

  it('deletes storage image when URL is valid', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    mockStorageRemove.mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) });

    await deleteClothingItem(
      'item-123',
      'https://xyz.supabase.co/storage/v1/object/public/wardrobe-raw/user-123/image.jpg'
    );

    expect(mockStorageFrom).toHaveBeenCalledWith('wardrobe-raw');
  });

  it('handles malformed storage URL gracefully', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    mockDelete.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    // Invalid URL - no wardrobe-raw path
    const result = await deleteClothingItem('item-123', 'invalid-url');

    expect(result.success).toBe(true);
  });

  it('deletes item from database', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    mockDelete.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    const result = await deleteClothingItem(
      'item-123',
      'https://example.com/image.jpg'
    );

    expect(result.success).toBe(true);
  });

  it('returns error when database delete fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    mockDelete.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'Database error' } }),
      }),
    });

    const result = await deleteClothingItem('item-123', 'https://example.com/image.jpg');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Database error');
  });

  it('revalidates multiple paths after deletion', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    mockDelete.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    await deleteClothingItem('item-123', 'https://example.com/image.jpg');

    const { revalidatePath } = await import('next/cache');
    expect(revalidatePath).toHaveBeenCalledWith('/wardrobe');
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(revalidatePath).toHaveBeenCalledWith('/onboarding');
  });
});

describe('updateClothingItem', () => {
  const mockAnalysis: Partial<ClothingAnalysis> = {
    name: 'Blue T-Shirt',
    type: 'top',
    color: 'blue',
    warmth_rating: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') });

    const result = await updateClothingItem('item-123', mockAnalysis);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Not authenticated');
  });

  it('updates item with analysis data', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    const result = await updateClothingItem('item-123', mockAnalysis);

    expect(result.success).toBe(true);
  });

  it('handles null values for optional fields', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    const analysisWithNulls: Partial<ClothingAnalysis> = {
      name: 'Item',
      sub_type: undefined,
      secondary_color: undefined,
      material: undefined,
    };

    await updateClothingItem('item-123', analysisWithNulls);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        sub_type: null,
        secondary_color: null,
        material: null,
      })
    );
  });

  it('returns error when update fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
      }),
    });

    const result = await updateClothingItem('item-123', mockAnalysis);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Update failed');
  });
});
