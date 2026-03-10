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

    // Hybrid: OWM for days 1-5 (better accuracy), Open-Meteo for days 6-7 (free extension)
    const [currentRes, owmForecastRes, omForecastRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`,
        { next: { revalidate: CACHE_DURATION } }
      ),
      // OWM 5-day / 3-hour forecast (40 entries = 5 days)
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=40&appid=${OPENWEATHER_API_KEY}`,
        { next: { revalidate: CACHE_DURATION } }
      ),
      // Open-Meteo 8-day (to guarantee we don't drop the 7th/8th day due to timezone shift)
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=8`,
        { next: { revalidate: CACHE_DURATION } }
      ),
    ]);

    if (!currentRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 502 });
    }

    const current = await currentRes.json();

    // ── OWM days 1-5 ──────────────────────────────────────────────────────
    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayStr = new Date().toISOString().split('T')[0];

    interface OWMEntry { dt_txt: string; main: { temp_max: number; temp_min: number }; weather: { icon: string; description: string }[]; pop?: number }
    let owmDays: { date: string; day: string; isToday: boolean; tempMax: number; tempMin: number; icon: string; description: string; precipChance: number }[] = [];

    if (owmForecastRes.ok) {
      const owmRaw = await owmForecastRes.json();
      const byDate = new Map<string, { temps: number[]; icons: string[]; descs: string[]; pops: number[] }>();

      for (const entry of owmRaw.list as OWMEntry[]) {
        const dateStr = entry.dt_txt.split(' ')[0];
        if (!byDate.has(dateStr)) byDate.set(dateStr, { temps: [], icons: [], descs: [], pops: [] });
        const d = byDate.get(dateStr)!;
        d.temps.push(entry.main.temp_max, entry.main.temp_min);
        d.icons.push(entry.weather[0].icon);
        d.descs.push(entry.weather[0].description);
        d.pops.push(Math.round((entry.pop ?? 0) * 100));
      }

      owmDays = Array.from(byDate.entries()).map(([dateStr, d]) => {
        const dayIndex = new Date(dateStr + 'T12:00:00').getDay();
        return {
          date: dateStr,
          day: dateStr === todayStr ? 'Today' : DAY_LABELS[dayIndex],
          isToday: dateStr === todayStr,
          tempMax: Math.round(Math.max(...d.temps)),
          tempMin: Math.round(Math.min(...d.temps)),
          icon: d.icons[Math.floor(d.icons.length / 2)] || d.icons[0],
          description: d.descs[Math.floor(d.descs.length / 2)] || d.descs[0],
          precipChance: Math.max(...d.pops),
        };
      });
    }

    // ── Open-Meteo days 6-7 ─────────────────────────────────────────────
    const wmoIconMap: Record<number, string> = {
      0: '01d', 1: '02d', 2: '03d', 3: '04d',
      45: '50d', 48: '50d',
      51: '09d', 53: '09d', 55: '09d',
      61: '10d', 63: '10d', 65: '10d',
      71: '13d', 73: '13d', 75: '13d',
      80: '09d', 81: '09d', 82: '09d',
      95: '11d', 96: '11d', 99: '11d',
    };

    const wmoDescMap: Record<number, string> = {
      0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Foggy', 48: 'Rime fog',
      51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle',
      61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
      71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
      80: 'Rain showers', 81: 'Moderate showers', 82: 'Violent showers',
      95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Heavy thunderstorm',
    };

    let omExtras: typeof owmDays = [];
    if (omForecastRes.ok) {
      const omRaw = await omForecastRes.json();
      const owmDates = new Set(owmDays.map(d => d.date));

      omExtras = (omRaw.daily.time as string[])
        .map((dateStr: string, i: number) => {
          const code: number = omRaw.daily.weather_code[i];
          const dayIndex = new Date(dateStr + 'T12:00:00').getDay();
          return {
            date: dateStr,
            day: dateStr === todayStr ? 'Today' : DAY_LABELS[dayIndex],
            isToday: dateStr === todayStr,
            tempMax: Math.round(omRaw.daily.temperature_2m_max[i]),
            tempMin: Math.round(omRaw.daily.temperature_2m_min[i]),
            icon: wmoIconMap[code] ?? '01d',
            description: wmoDescMap[code] ?? 'Fair',
            precipChance: omRaw.daily.precipitation_probability_max[i] ?? 0,
          };
        })
        .filter(d => !owmDates.has(d.date)); // Only keep days OWM didn't cover
    }

    // Merge: OWM first (days 1-5), then Open-Meteo extras (days 6-7)
    const forecast7 = [...owmDays, ...omExtras].slice(0, 7);

    // Today's precipitation from OWM data (or first forecast day)
    const precipitationChance = owmDays.length > 0 && owmDays[0].isToday
      ? owmDays[0].precipChance
      : 0;

    const weatherData = {
      temp: Math.round(current.main.temp),
      feels_like: Math.round(current.main.feels_like),
      humidity: current.main.humidity,
      description: current.weather[0].description,
      icon: current.weather[0].icon,
      wind_speed: Math.round(current.wind.speed),
      precipitation_chance: precipitationChance,
      city: current.name,
      forecast: forecast7,
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
