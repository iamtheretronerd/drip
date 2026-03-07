import { NextRequest, NextResponse } from 'next/server';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const CACHE_DURATION = 30 * 60; // 30 minutes in seconds

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

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
