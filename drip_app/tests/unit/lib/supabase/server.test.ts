import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient, createActionClient } from '@/lib/supabase/server';

// Mock @supabase/ssr
const mockCreateServerClient = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: (...args: any[]) => mockCreateServerClient(...args),
}));

// Mock next/headers
const mockCookieStore = {
  getAll: vi.fn().mockReturnValue([]),
  set: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

describe('createClient (server)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  it('creates server client with environment variables', async () => {
    mockCreateServerClient.mockReturnValue({});

    await createClient();

    expect(mockCreateServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key',
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      })
    );
  });

  it('returns null when supabase is not configured', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'your-project-url';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'your-anon-key';

    const client = await createClient();

    expect(client).toBeNull();
  });

  it('returns null when environment variables are missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

    const client = await createClient();

    expect(client).toBeNull();
  });

  it('handles cookie setting errors gracefully', async () => {
    mockCreateServerClient.mockReturnValue({});
    mockCookieStore.set.mockImplementation(() => {
      throw new Error('Cookie error');
    });

    const client = await createClient();

    expect(client).toBeDefined();
  });
});

describe('createActionClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  it('creates action client with setAll as no-op', async () => {
    mockCreateServerClient.mockReturnValue({});

    await createActionClient();

    expect(mockCreateServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key',
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      })
    );
  });

  it('returns null when supabase is not configured', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

    const client = await createActionClient();

    expect(client).toBeNull();
  });

  it('setAll is a no-op function', async () => {
    let capturedSetAll: Function | null = null;

    mockCreateServerClient.mockImplementation((url, key, options) => {
      capturedSetAll = options.cookies.setAll;
      return {};
    });

    await createActionClient();

    // The setAll function should not throw when called
    expect(() => capturedSetAll!([])).not.toThrow();
  });
});
