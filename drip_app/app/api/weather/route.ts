import { NextRequest, NextResponse } from 'next/server';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const CACHE_DURATION = 30 * 60; // 30 minutes in seconds

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const dt = searchParams.get('dt'); // Optional timestamp for historical weather

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'lat and lon query parameters are required' },
      { status: 400 }
    );
  }

  if (!OPENWEATHER_API_KEY) {
    return NextResponse.json(
      { error: 'OpenWeather API key not configured' },
      { status: 500 }
    );
  }

  try {
    if (dt) {
      // Use Open-Meteo for reliable, key-free historical data
      const dateObj = new Date(parseInt(dt) * 1000);
      const dateStr = dateObj.toISOString().split('T')[0];

      const historicalRes = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${dateStr}&end_date=${dateStr}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );

      if (!historicalRes.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch historical weather data' },
          { status: 502 }
        );
      }

      const historical = await historicalRes.json();
      const daily = historical.daily;
      const code = daily.weather_code[0];
      const maxTemp = daily.temperature_2m_max[0];
      const minTemp = daily.temperature_2m_min[0];
      const avgTemp = (maxTemp + minTemp) / 2;

      // Map WMO codes to OWM descriptions and icons
      const wmoMap: Record<number, { desc: string, icon: string }> = {
        0: { desc: 'Clear sky', icon: '01d' },
        1: { desc: 'Mainly clear', icon: '02d' },
        2: { desc: 'Partly cloudy', icon: '03d' },
        3: { desc: 'Overcast', icon: '04d' },
        45: { desc: 'Foggy', icon: '50d' },
        48: { desc: 'Rime fog', icon: '50d' },
        51: { desc: 'Light drizzle', icon: '09d' },
        53: { desc: 'Drizzle', icon: '09d' },
        55: { desc: 'Dense drizzle', icon: '09d' },
        61: { desc: 'Slight rain', icon: '10d' },
        63: { desc: 'Moderate rain', icon: '10d' },
        65: { desc: 'Heavy rain', icon: '10d' },
        71: { desc: 'Slight snow fall', icon: '13d' },
        73: { desc: 'Moderate snow fall', icon: '13d' },
        75: { desc: 'Heavy snow fall', icon: '13d' },
        80: { desc: 'Slight rain showers', icon: '09d' },
        81: { desc: 'Moderate rain showers', icon: '09d' },
        82: { desc: 'Violent rain showers', icon: '09d' },
        95: { desc: 'Thunderstorm', icon: '11d' },
      };

      const weatherMatch = wmoMap[code] || { desc: 'Fair', icon: '01d' };

      const weatherData = {
        temp: Math.round(avgTemp),
        feels_like: Math.round(avgTemp),
        humidity: 50,
        description: weatherMatch.desc,
        icon: weatherMatch.icon,
        wind_speed: 10,
        precipitation_chance: 0,
        city: "Historical Record",
      };

      return NextResponse.json(weatherData);
    }

    // Fetch current weather and forecast in parallel
    const [currentRes, forecastRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`,
        { next: { revalidate: CACHE_DURATION } }
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=8&appid=${OPENWEATHER_API_KEY}`,
        { next: { revalidate: CACHE_DURATION } }
      ),
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch weather data' },
        { status: 502 }
      );
    }

    const [current, forecast] = await Promise.all([
      currentRes.json(),
      forecastRes.json(),
    ]);

    // Calculate max precipitation probability from forecast
    const precipitationChance = Math.max(
      0,
      ...forecast.list.map((item: { pop?: number }) => Math.round((item.pop ?? 0) * 100))
    );

    const weatherData = {
      temp: Math.round(current.main.temp),
      feels_like: Math.round(current.main.feels_like),
      humidity: current.main.humidity,
      description: current.weather[0].description,
      icon: current.weather[0].icon,
      wind_speed: Math.round(current.wind.speed),
      precipitation_chance: precipitationChance,
      city: current.name,
    };

    return NextResponse.json(weatherData, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
      },
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
