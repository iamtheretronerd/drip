import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { filterWardrobe, fallbackOutfit, buildGeminiPayload } from '@/lib/outfit-engine';
import type { ClothingItem, Profile } from '@/types/database';
import type { WeatherData } from '@/types/weather';
import type { GeminiOutfitResponse, OutfitSuggestion } from '@/types/outfit';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(request: NextRequest) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { mood, weather, seed } = body as { mood?: string; weather?: WeatherData; seed?: number };

    // Fetch profile, clothing items, and recent outfit logs in parallel
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [profileRes, itemsRes, logsRes] = await Promise.all([
      (supabase.from('profiles') as any)
        .select('lifestyle, weather_sensitivity, priority, lat, lon, city_name')
        .eq('id', user.id)
        .single(),
      (supabase.from('clothing_items') as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'analyzed'),
      (supabase.from('outfit_logs') as any)
        .select('item_ids')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(3),
    ]);

    const profile = profileRes.data as Profile | null;
    const items = (itemsRes.data ?? []) as ClothingItem[];
    const recentLogs = (logsRes.data ?? []) as { item_ids: string[] }[];

    if (items.length === 0) {
      return NextResponse.json({ error: 'No clothing items found', empty: true }, { status: 404 });
    }

    // Flatten recent item IDs for rotation filtering
    const recentItemIds = recentLogs.flatMap((log) => log.item_ids);

    // Run rule-based filtering
    const filtered = filterWardrobe(items, {
      weather: weather ?? null,
      lifestyle: profile?.lifestyle ?? null,
      recentItemIds,
      lat: profile?.lat ?? 40,
    });

    // Try AI-powered selection, fall back to rule-based
    let suggestion: OutfitSuggestion;

    if (GEMINI_API_KEY) {
      try {
        suggestion = await callGemini(filtered, items, weather ?? null, mood ?? null, profile, seed, GEMINI_API_KEY);
      } catch (err) {
        console.error('Gemini outfit generation failed, using fallback:', err);
        suggestion = fallbackOutfit(filtered);
      }
    } else {
      suggestion = fallbackOutfit(filtered);
    }

    return NextResponse.json(suggestion);
  } catch (error) {
    console.error('Generate outfit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function callGemini(
  filtered: ReturnType<typeof filterWardrobe>,
  allItems: ClothingItem[],
  weather: WeatherData | null,
  mood: string | null,
  profile: Profile | null,
  seed?: number,
  geminiApiKey?: string
): Promise<OutfitSuggestion> {
  const wardrobe = buildGeminiPayload(filtered);

  const systemPrompt = `You are a personal stylist AI. Select the best item from each category to create a cohesive outfit.

IMPORTANT:
- If a category has no suitable items for the current weather/mood, return null for that slot. It is better to leave a slot empty than to suggest something inappropriate.
- Do NOT suggest outerwear when it's hot.
- Do NOT force an item that would be uncomfortable.
- Pay close attention to the user's mood input. If they express dislike for a type of clothing (e.g. "I don't like jackets"), do NOT suggest items of that type. Respect their preferences.

Style rules:
- Maximum 3 distinct colors in the outfit
- Match formality levels across pieces
- Balance proportions (slim top + loose bottom or vice versa)
- Consider layering compatibility
- Weather appropriateness is the top priority — never suggest warm layers in hot weather or vice versa
- The two accessories MUST be different items AND different types. Never return two necklaces, two hats, or two earrings. Aim for variety (e.g., necklace + ring, or hat + earrings).

User preferences:
- Lifestyle: ${profile?.lifestyle ?? 'casual'}
- Weather sensitivity: ${profile?.weather_sensitivity ?? 'moderate'}
- Priority: ${profile?.priority ?? 'comfort'}

Return ONLY a JSON object with these fields:
{
  "top_id": "uuid or null",
  "bottom_id": "uuid or null",
  "shoes_id": "uuid or null",
  "outerwear_id": "uuid or null",
  "accessory1_id": "uuid or null",
  "accessory2_id": "uuid or null",
  "reasoning": "Brief explanation of why this outfit works"
}`;

  const userPrompt = `${weather ? `Weather: ${weather.temp}°C (feels like ${weather.feels_like}°C), ${weather.description}, ${weather.precipitation_chance}% precipitation chance` : 'Weather: unknown'}
${mood ? `Mood: ${mood}` : ''}

Available wardrobe:
${JSON.stringify(wardrobe, null, 2)}

${seed ? `Variety Seed: ${seed}. If this is a regeneration, provide a DIFFERENT combination than your previous suggestion while still following all rules.` : ''}

Pick the best outfit combination. Return ONLY the JSON.`;

  const response = await fetch(`${GEMINI_API_URL}?key=${geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in Gemini response');

  const result = JSON.parse(jsonMatch[0]) as GeminiOutfitResponse;

  // Map IDs back to full item objects
  const itemMap = new Map(allItems.map((i) => [i.id, i]));

  return {
    top: result.top_id ? itemMap.get(result.top_id) ?? null : null,
    bottom: result.bottom_id ? itemMap.get(result.bottom_id) ?? null : null,
    shoes: result.shoes_id ? itemMap.get(result.shoes_id) ?? null : null,
    outerwear: result.outerwear_id ? itemMap.get(result.outerwear_id) ?? null : null,
    accessory1: result.accessory1_id ? itemMap.get(result.accessory1_id) ?? null : null,
    accessory2: result.accessory2_id ? itemMap.get(result.accessory2_id) ?? null : null,
    reasoning: result.reasoning ?? 'AI-selected outfit based on your style and weather.',
  };
}
