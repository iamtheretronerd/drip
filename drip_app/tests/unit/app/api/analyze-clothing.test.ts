import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/analyze-clothing/route';
import { NextRequest } from 'next/server';

describe('POST /api/analyze-clothing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  const createMockRequest = (body: any) => {
    return {
      json: vi.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  };

  it('returns 400 when imageUrl is missing', async () => {
    const request = createMockRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Image URL is required');
  });

  it('returns 500 when API key is not configured', async () => {
    process.env.GEMINI_API_KEY = '';
    const request = createMockRequest({ imageUrl: 'https://example.com/image.jpg' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Gemini API key not configured');
  });
});
