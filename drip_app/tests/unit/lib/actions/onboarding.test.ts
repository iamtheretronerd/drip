import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  saveStep1,
  saveStep2,
  uploadClothingItem,
  updateClothingItemAnalysis,
  completeOnboarding,
} from '@/lib/actions/onboarding';
import type { ActionResult } from '@/types';

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock supabase
const mockUpdate = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockDelete = vi.fn();
const mockRpc = vi.fn();

const mockFrom = vi.fn(() => ({
  update: mockUpdate,
  select: mockSelect,
  insert: mockInsert,
  delete: mockDelete,
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn(),
  single: vi.fn(),
}));

const mockStorageUpload = vi.fn();
const mockStorageGetPublicUrl = vi.fn();

const mockStorageFrom = vi.fn(() => ({
  upload: mockStorageUpload,
  getPublicUrl: mockStorageGetPublicUrl,
}));

const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createActionClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
    storage: { from: mockStorageFrom },
    rpc: mockRpc,
  })),
}));

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({
    from: mockFrom,
    storage: { from: mockStorageFrom },
  })),
}));

describe('saveStep1', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') });

    const result = await saveStep1({
      lifestyle: 'casual',
      weather_sensitivity: 'moderate',
      priority: 'comfort',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Not authenticated');
  });

  it('returns error when action client not configured', async () => {
    const { createActionClient } = await import('@/lib/supabase/server');
    vi.mocked(createActionClient).mockResolvedValueOnce(null);

    const result = await saveStep1({ lifestyle: '', weather_sensitivity: '', priority: '' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Supabase not configured');
  });

  it('saves step 1 data successfully', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com', user_metadata: { full_name: 'Test User' } } },
      error: null,
    });
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'user-123' }, error: null }),
      }),
    });
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    const result = await saveStep1({
      lifestyle: 'casual',
      weather_sensitivity: 'moderate',
      priority: 'comfort',
    });

    expect(result.success).toBe(true);
  });

  it('creates profile if not exists', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com', user_metadata: { full_name: 'Test User' } } },
      error: null,
    });
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });
    mockInsert.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    await saveStep1({
      lifestyle: 'casual',
      weather_sensitivity: 'moderate',
      priority: 'comfort',
    });

    expect(mockInsert).toHaveBeenCalled();
  });

  it('creates profile with fallback defaults', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: null, user_metadata: null } },
      error: null,
    });
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });
    mockInsert.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    await saveStep1({ lifestyle: '', weather_sensitivity: '', priority: '' });

    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      email: 'unknown@example.com',
      full_name: 'User'
    }));
  });

  it('returns early when service client is missing in ensureProfile', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    const { createServiceClient } = await import('@/lib/supabase/service');
    vi.mocked(createServiceClient).mockReturnValueOnce(null as any);
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    const result = await saveStep1({ lifestyle: '', weather_sensitivity: '', priority: '' });
    expect(result.success).toBe(true);
  });

  it('returns error when update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'user-123' } }),
      }),
    });
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: { message: 'Update error' } }),
    });

    const result = await saveStep1({ lifestyle: '', weather_sensitivity: '', priority: '' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Update error');
  });
});

describe('saveStep2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves step 2 location data', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com', user_metadata: { full_name: 'Test User' } } },
      error: null,
    });
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'user-123' }, error: null }),
      }),
    });
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    const result = await saveStep2({
      lat: 40.7128,
      lon: -74.006,
      city_name: 'New York',
    });

    expect(result.success).toBe(true);
  });

  it('returns error when supabase is not configured', async () => {
    const { createActionClient } = await import('@/lib/supabase/server');
    vi.mocked(createActionClient).mockResolvedValueOnce(null);

    const result = await saveStep2({ lat: 0, lon: 0, city_name: '' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Supabase not configured');
  });

  it('returns error when update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'user-123' } }),
      }),
    });
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: { message: 'Step 2 update error' } }),
    });

    const result = await saveStep2({ lat: 0, lon: 0, city_name: '' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Step 2 update error');
  });
});

describe('uploadClothingItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') });

    const formData = new FormData();
    formData.append('file', new Blob(['test']), 'test.jpg');

    const result = await uploadClothingItem(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Not authenticated');
  });

  it('returns error when no file provided', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const formData = new FormData();

    const result = await uploadClothingItem(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('No file provided');
  });

  it('uploads file and creates database entry', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    mockStorageUpload.mockResolvedValue({ error: null });
    mockStorageGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/image.jpg' } });
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'item-123' },
          error: null,
        }),
      }),
    });

    const formData = new FormData();
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    formData.append('file', file);

    const result = await uploadClothingItem(formData);

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('id', 'item-123');
    expect(result.data).toHaveProperty('url', 'https://example.com/image.jpg');
  });

  it('returns error when upload fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    mockStorageUpload.mockResolvedValue({ error: { message: 'Upload failed' } });

    const formData = new FormData();
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    formData.append('file', file);

    const result = await uploadClothingItem(formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Upload failed');
  });

  it('returns error when action client not configured', async () => {
    const { createActionClient } = await import('@/lib/supabase/server');
    vi.mocked(createActionClient).mockResolvedValueOnce(null);

    const formData = new FormData();
    const result = await uploadClothingItem(formData);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Supabase not configured');
  });

  it('returns error when service client not configured', async () => {
    const { createServiceClient } = await import('@/lib/supabase/service');
    vi.mocked(createServiceClient).mockReturnValueOnce(null as any);

    const formData = new FormData();
    const result = await uploadClothingItem(formData);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Service client not configured');
  });

  it('returns error when inserting to database fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockStorageUpload.mockResolvedValue({ error: null });
    mockStorageGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/image.jpg' } });
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } }),
      }),
    });

    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.jpg'));

    const result = await uploadClothingItem(formData);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Database: Insert failed');
  });
});

describe('updateClothingItemAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') });

    const result = await updateClothingItemAnalysis('item-123', { name: 'Blue Shirt' });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Not authenticated');
  });

  it('updates analysis with null fallback for optional fields', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    const analysis = {
      name: 'Blue Shirt',
      type: 'top',
      sub_type: undefined,
      secondary_color: undefined,
      material: undefined,
    };

    const result = await updateClothingItemAnalysis('item-123', analysis);

    expect(result.success).toBe(true);
  });

  it('returns error when supabase not configured', async () => {
    const { createActionClient } = await import('@/lib/supabase/server');
    vi.mocked(createActionClient).mockResolvedValueOnce(null);

    const result = await updateClothingItemAnalysis('item-123', {});
    expect(result.success).toBe(false);
    expect(result.error).toBe('Supabase not configured');
  });

  it('returns error when update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'Analysis update failed' } }),
      }),
    });

    const result = await updateClothingItemAnalysis('item-123', {});
    expect(result.success).toBe(false);
    expect(result.error).toBe('Analysis update failed');
  });
});

describe('completeOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') });

    const result = await completeOnboarding();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Not authenticated');
  });

  it('deletes existing responses and inserts new one', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com', user_metadata: { full_name: 'Test User' } } },
      error: null,
    });
    mockDelete.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    mockInsert.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    mockRpc.mockResolvedValue({ error: null });

    const result = await completeOnboarding();

    expect(result.success).toBe(true);
    expect(mockDelete).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalled();
  });

  it('calls RPC as backup', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com', user_metadata: { full_name: 'Test User' } } },
      error: null,
    });
    mockDelete.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    mockInsert.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    mockRpc.mockResolvedValue({ error: null });

    await completeOnboarding();

    expect(mockRpc).toHaveBeenCalledWith('complete_onboarding');
  });

  it('returns error when service client update fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com', user_metadata: { full_name: 'Test User' } } },
      error: null,
    });
    mockDelete.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    mockInsert.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } }) });

    const result = await completeOnboarding();

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to update profile');
  });

  it('handles missing service client bypass', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    const { createServiceClient } = await import('@/lib/supabase/service');
    vi.mocked(createServiceClient).mockReturnValue(null as any);
    mockRpc.mockResolvedValue({ error: null });

    const result = await completeOnboarding();
    
    expect(result.success).toBe(true);
    // Should still call RPC as fallback
    expect(mockRpc).toHaveBeenCalledWith('complete_onboarding');
  });

  it('returns error when action client not configured', async () => {
    const { createActionClient } = await import('@/lib/supabase/server');
    vi.mocked(createActionClient).mockResolvedValueOnce(null);

    const result = await completeOnboarding();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Supabase not configured');
  });
});
