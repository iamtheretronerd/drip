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

  it('returns 400 when image fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    const request = createMockRequest({ imageUrl: 'https://example.com/image.jpg' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Failed to fetch image');
  });

  it('returns 500 when Gemini API fails', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(Buffer.from('fake-image')),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: 'API Error' }),
      });

    const request = createMockRequest({ imageUrl: 'https://example.com/image.jpg' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('AI analysis failed');
  });

  it('returns 500 when Gemini response has no text', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(Buffer.from('fake-image')),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ candidates: [] }),
      });

    const request = createMockRequest({ imageUrl: 'https://example.com/image.jpg' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('No response from AI');
  });

  it('returns 500 when response cannot be parsed as JSON', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(Buffer.from('fake-image')),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          candidates: [{
            content: {
              parts: [{ text: 'Not valid JSON' }],
            },
          }],
        }),
      });

    const request = createMockRequest({ imageUrl: 'https://example.com/image.jpg' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Invalid AI response format');
  });

  it('returns parsed analysis with defaults for missing fields', async () => {
    const mockAnalysis = {
      name: 'Blue T-Shirt',
      type: 'top',
      color: 'blue',
    };

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(Buffer.from('fake-image')),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          candidates: [{
            content: {
              parts: [{ text: JSON.stringify(mockAnalysis) }],
            },
          }],
        }),
      });

    const request = createMockRequest({ imageUrl: 'https://example.com/image.jpg' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe('Blue T-Shirt');
    expect(data.type).toBe('top');
    expect(data.color).toBe('blue');
    expect(data.seasons).toBeDefined();
  });

  it('uses image/png for .png files', async () => {
    let capturedBody: string | null = null;

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(Buffer.from('fake-png')),
      })
      .mockImplementationOnce((url, options) => {
        capturedBody = options?.body as string;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{ text: '{}' }],
              },
            }],
          }),
        });
      });

    const request = createMockRequest({ imageUrl: 'https://example.com/image.png' });
    await POST(request);

    expect(capturedBody).toBeTruthy();
    expect(capturedBody).toContain('image/png');
  });

  it('uses image/jpeg for non-png files', async () => {
    let capturedBody: string | null = null;

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(Buffer.from('fake-jpg')),
      })
      .mockImplementationOnce((url, options) => {
        capturedBody = options?.body as string;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{ text: '{}' }],
              },
            }],
          }),
        });
      });

    const request = createMockRequest({ imageUrl: 'https://example.com/image.jpg' });
    await POST(request);

    expect(capturedBody).toBeTruthy();
    expect(capturedBody).toContain('image/jpeg');
  });

  it('returns 500 on internal error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const request = createMockRequest({ imageUrl: 'https://example.com/image.jpg' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
