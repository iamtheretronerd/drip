import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: 400 }
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // Determine MIME type from URL or default to image/jpeg
    const mimeType = imageUrl.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    // Prompt for Gemini
    const prompt = `Analyze this clothing item image and return a JSON object with these exact fields:
    {
      "name": "Descriptive name of the item",
      "type": "One of: top, bottom, outerwear, shoes, accessory",
      "color": "Primary color name",
      "warmth_rating": "Number 1-5 where: 1=very light, 2=light, 3=moderate, 4=warm, 5=heavy winter",
      "seasons": ["Array of seasons this item is suitable for: spring, summer, fall, winter"],
      "formality": "One of: casual, smart_casual, formal",
      "sub_type": "Specific sub-type like: hoodie, blazer, sneakers, jeans, t-shirt, etc."
    }
    
    Be accurate and specific. Return ONLY the JSON object, no other text.`;

    // Call Gemini API
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'AI analysis failed' },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    
    // Extract the text response
    const textResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Parse the JSON from the response
    // Gemini might wrap the JSON in markdown code blocks
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Invalid AI response format' },
        { status: 500 }
      );
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate the response has required fields
    const requiredFields = ['name', 'type', 'color', 'warmth_rating', 'seasons'];
    for (const field of requiredFields) {
      if (!(field in analysis)) {
        analysis[field] = field === 'seasons' ? ['spring', 'summer', 'fall', 'winter'] : '';
      }
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing clothing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
