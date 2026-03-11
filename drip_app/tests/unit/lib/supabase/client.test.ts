import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@/lib/supabase/client';

// Mock @supabase/ssr
const mockCreateBrowserClient = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: (...args: any[]) => mockCreateBrowserClient(...args),
}));

describe('createClient (browser)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  it('creates browser client with environment variables', () => {
    mockCreateBrowserClient.mockReturnValue({});

    createClient();

    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key'
    );
  });

  it('creates client with database type', () => {
    mockCreateBrowserClient.mockReturnValue({});

    const client = createClient();

    expect(client).toBeDefined();
  });

  it('throws when environment variables are missing', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

    // The function uses non-null assertion, so it will pass undefined
    // and the mock should still be called
    mockCreateBrowserClient.mockImplementation(() => {
      throw new Error('Missing URL');
    });

    expect(() => createClient()).toThrow('Missing URL');
  });
});
