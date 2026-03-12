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

  it('returns current weather data', async () => {
    const mockCurrent = {
      main: { temp: 25, feels_like: 26, humidity: 60 },
      weather: [{ description: 'sunny', icon: '01d' }],
      wind: { speed: 5 },
      name: 'Test City',
    };

    const mockForecast = {
      list: [
        { dt_txt: '2024-01-15 12:00:00', main: { temp_max: 26, temp_min: 20 }, weather: [{ icon: '01d', description: 'sunny' }], pop: 0 },
        { dt_txt: '2024-01-16 12:00:00', main: { temp_max: 27, temp_min: 21 }, weather: [{ icon: '02d', description: 'cloudy' }], pop: 0.2 },
      ],
    };

    const mockOM = {
      daily: {
        time: ['2024-01-17', '2024-01-18'],
        weather_code: [1, 2],
        temperature_2m_max: [28, 29],
        temperature_2m_min: [22, 23],
        precipitation_probability_max: [10, 20],
      },
    };

    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockCurrent })
      .mockResolvedValueOnce({ ok: true, json: async () => mockForecast })
      .mockResolvedValueOnce({ ok: true, json: async () => mockOM });

    const request = createMockRequest({ lat: '40', lon: '-74' });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.temp).toBe(25);
    expect(data.feels_like).toBe(26);
    expect(data.city).toBe('Test City');
    expect(Array.isArray(data.forecast)).toBe(true);
  });

  it('returns 502 when current weather fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });

    const request = createMockRequest({ lat: '40', lon: '-74' });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toContain('Failed to fetch');
  });

  it('handles forecast API failures gracefully', async () => {
    const mockCurrent = {
      main: { temp: 25, feels_like: 26, humidity: 60 },
      weather: [{ description: 'sunny', icon: '01d' }],
      wind: { speed: 5 },
      name: 'Test City',
    };

    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockCurrent })
      .mockResolvedValueOnce({ ok: false }) // owm fails
      .mockResolvedValueOnce({ ok: false }); // om fails

    const request = createMockRequest({ lat: '40', lon: '-74' });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.forecast).toHaveLength(0);
  });

  it('returns historical weather when dt parameter is provided', async () => {
    const mockHistorical = {
      daily: {
        weather_code: [61],
        temperature_2m_max: [25],
        temperature_2m_min: [20],
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockHistorical,
    });

    const request = createMockRequest({ lat: '40', lon: '-74', dt: '1705276800' });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.temp).toBe(23);
    expect(data.description).toBe('Slight rain');
    expect(data.icon).toBe('10d');
    expect(data.city).toBe('Historical Record');
  });

  it('returns 502 when historical fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });

    const request = createMockRequest({ lat: '40', lon: '-74', dt: '1705276800' });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toContain('historical');
  });

  it('includes cache headers', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ main: { temp: 20 }, weather: [{ description: 'cloudy', icon: '03d' }], wind: { speed: 5 }, name: 'City' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ list: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ daily: { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_probability_max: [] } }) });

    const request = createMockRequest({ lat: '40', lon: '-74' });
    const response = await GET(request);

    const cacheHeader = response.headers.get('cache-control');
    expect(cacheHeader).toContain('s-maxage=1800');
    expect(cacheHeader).toContain('public');
  });

  it('maps WMO weather codes correctly', async () => {
    const mockHistorical = {
      daily: {
        weather_code: [95],
        temperature_2m_max: [30],
        temperature_2m_min: [25],
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockHistorical,
    });

    const request = createMockRequest({ lat: '40', lon: '-74', dt: '1705276800' });
    const response = await GET(request);
    const data = await response.json();

    expect(data.icon).toBe('11d');
    expect(data.description).toBe('Thunderstorm');
  });

  it('handles unknown WMO codes gracefully', async () => {
    const mockHistorical = {
      daily: {
        weather_code: [999],
        temperature_2m_max: [25],
        temperature_2m_min: [20],
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockHistorical,
    });

    const request = createMockRequest({ lat: '40', lon: '-74', dt: '1705276800' });
    const response = await GET(request);
    const data = await response.json();

    expect(data.description).toBe('Fair');
    expect(data.icon).toBe('01d');
  });

  it('returns 500 on internal error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const request = createMockRequest({ lat: '40', lon: '-74' });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('handles Open-Meteo response for current weather', async () => {
    const mockCurrent = {
      main: { temp: 22, feels_like: 23, humidity: 55 },
      weather: [{ description: 'cloudy', icon: '03d' }],
      wind: { speed: 8 },
      name: 'Test City',
    };

    const mockForecast = { list: [] };
    const mockOM = {
      daily: {
        time: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-20', '2024-01-21'],
        weather_code: [1, 2, 3, 45, 51, 61, 71],
        temperature_2m_max: [20, 21, 22, 23, 24, 25, 26],
        temperature_2m_min: [15, 16, 17, 18, 19, 20, 21],
        precipitation_probability_max: [0, 10, 20, 30, 40, 50, 60],
      },
    };

    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockCurrent })
      .mockResolvedValueOnce({ ok: true, json: async () => mockForecast })
      .mockResolvedValueOnce({ ok: true, json: async () => mockOM });

    const request = createMockRequest({ lat: '40', lon: '-74' });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.forecast).toHaveLength(7);
  });

  it('handles missing data in forecast responses to cover fallback branches', async () => {
    const mockCurrent = {
      main: { temp: 22, feels_like: 23, humidity: 55 },
      weather: [{ description: 'cloudy', icon: '03d' }],
      wind: { speed: 8 },
      name: 'Test City',
    };

    const mockForecast = {
      list: [
        { 
          dt_txt: '2025-01-15 12:00:00', 
          main: { temp_max: 20, temp_min: 15 }, 
          weather: [{ icon: '', description: '' }] 
          // pop is intentionally omitted
        }
      ]
    };
    const mockOM = {
      daily: {
        time: ['2025-01-16'],
        weather_code: [999], // unknown code
        temperature_2m_max: [20],
        temperature_2m_min: [15],
        precipitation_probability_max: [null], // null to fallback to 0
      },
    };

    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockCurrent })
      .mockResolvedValueOnce({ ok: true, json: async () => mockForecast })
      .mockResolvedValueOnce({ ok: true, json: async () => mockOM });

    const request = createMockRequest({ lat: '40', lon: '-74' });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.forecast[0].precipChance).toBe(0); // OWM pop fallback
    expect(data.forecast[1].description).toBe('Fair'); // OM desc fallback
    expect(data.forecast[1].icon).toBe('01d'); // OM icon fallback
    expect(data.forecast[1].precipChance).toBe(0); // OM pop fallback
  });

  it('handles today branches and multiple entries per day', async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const mockCurrent = {
      main: { temp: 22, feels_like: 23, humidity: 55 },
      weather: [{ description: 'cloudy', icon: '03d' }],
      wind: { speed: 8 },
      name: 'Test City',
    };

    const mockForecast = {
      list: [
        { 
          dt_txt: `${todayStr} 09:00:00`, 
          main: { temp_max: 20, temp_min: 15 }, 
          weather: [{ icon: '01d', description: 'sunny' }],
          pop: 0.1
        },
        { 
          dt_txt: `${todayStr} 12:00:00`, // Duplicate date to hit byDate.has(dateStr)
          main: { temp_max: 22, temp_min: 16 }, 
          weather: [{ icon: '02d', description: 'cloudy' }],
          pop: 0.5
        }
      ]
    };
    const mockOM = {
      daily: {
        time: [todayStr],
        weather_code: [1],
        temperature_2m_max: [20],
        temperature_2m_min: [15],
        precipitation_probability_max: [10],
      },
    };

    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockCurrent })
      .mockResolvedValueOnce({ ok: true, json: async () => mockForecast })
      .mockResolvedValueOnce({ ok: true, json: async () => mockOM });

    const request = createMockRequest({ lat: '40', lon: '-74' });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.forecast[0].isToday).toBe(true);
    expect(data.forecast[0].day).toBe('Today');
    expect(data.precipitation_chance).toBe(50); // Max pop of today
  });
});
