import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createServiceClient } from '@/lib/supabase/service';

// Mock @supabase/supabase-js
const mockCreateClient = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

describe('createServiceClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  });

  it('creates service client with service role key', () => {
    mockCreateClient.mockReturnValue({});

    createServiceClient();

    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-service-key',
      expect.objectContaining({
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    );
  });

  it('returns null when service role key is missing', () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = '';

    const client = createServiceClient();

    expect(client).toBeNull();
  });

  it('returns null when URL is missing', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';

    const client = createServiceClient();

    expect(client).toBeNull();
  });

  it('returns null when both are missing', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.SUPABASE_SERVICE_ROLE_KEY = '';

    const client = createServiceClient();

    expect(client).toBeNull();
  });

  it('configures auth options correctly', () => {
    mockCreateClient.mockReturnValue({});

    createServiceClient();

    expect(mockCreateClient).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    );
  });
});
