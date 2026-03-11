import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/weather/route';
import { NextRequest } from 'next/server';

describe('GET /api/weather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENWEATHER_API_KEY = 'test-api-key';
  });

  const createMockRequest = (searchParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    return {
      url: `http://localhost:3000/api/weather?${params.toString()}`,
    } as unknown as NextRequest;
  };

  it('returns 400 when lat and lon are missing', async () => {
    const request = createMockRequest({});
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('lat and lon');
  });

  it('returns 500 when API key is not configured', async () => {
    process.env.OPENWEATHER_API_KEY = '';
    const request = createMockRequest({ lat: '40', lon: '-74' });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('API key not configured');
  });
});
