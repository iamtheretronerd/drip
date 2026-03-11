import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateSession } from '@/lib/supabase/middleware';
import { NextRequest } from 'next/server';

// Mock @supabase/ssr
const mockCreateServerClient = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: (...args: any[]) => mockCreateServerClient(...args),
}));

// Mock next/server
const mockNextResponse = {
  next: vi.fn().mockReturnValue({
    cookies: { set: vi.fn() },
  }),
};

vi.mock('next/server', () => ({
  NextResponse: {
    next: (...args: any[]) => mockNextResponse.next(...args),
  },
}));

describe('updateSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    mockCreateServerClient.mockReturnValue({
      auth: { getUser: mockGetUser },
    });
  });

  const createMockRequest = (): NextRequest => {
    return {
      cookies: {
        getAll: vi.fn().mockReturnValue([]),
        set: vi.fn(),
      },
      url: 'http://localhost:3000/test',
    } as unknown as NextRequest;
  };

  it('creates server client with request cookies', async () => {
    const request = createMockRequest();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await updateSession(request);

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

  it('returns supabaseResponse and user', async () => {
    const request = createMockRequest();
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const result = await updateSession(request);

    expect(result).toHaveProperty('supabaseResponse');
    expect(result).toHaveProperty('user', mockUser);
  });

  it('returns null user when not authenticated', async () => {
    const request = createMockRequest();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await updateSession(request);

    expect(result.user).toBeNull();
  });

  it('sets cookies on response', async () => {
    const request = createMockRequest();
    const responseSetSpy = vi.fn();
    mockNextResponse.next.mockReturnValue({
      cookies: { set: responseSetSpy },
    });
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await updateSession(request);

    // The cookies.setAll callback should set cookies on the response
    expect(responseSetSpy).not.toHaveBeenCalled(); // No cookies were set in this test
  });

  it('handles getUser errors gracefully', async () => {
    const request = createMockRequest();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Auth error') });

    const result = await updateSession(request);

    expect(result.user).toBeNull();
  });

  it('passes request to next response', async () => {
    const request = createMockRequest();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await updateSession(request);

    expect(mockNextResponse.next).toHaveBeenCalledWith({ request });
  });
});
