# Supabase Cloud Functions - Deployment Guide

## Overview

This document contains instructions for deploying Supabase Edge Functions for the Drip wardrobe assistant app.

## Prerequisites

- Supabase project created
- Gemini API key from Google AI Studio

---

## Why Deno?

Supabase Edge Functions run on **Deno**, not Node.js. Here's why:

| Feature | Deno | Node.js |
|---------|------|---------|
| **Security** | Sandboxed by default, no file/network access without permissions | Full system access |
| **Permissions** | Explicit grants required | Implicit full access |
| **Import URLs** | Direct from URLs (`https://deno.land/std/...`) | npm packages only |
| **Cold Start** | Faster (~10ms) | Slower (~100ms+) |
| **TypeScript** | Native support | Requires transpilation |

**For Supabase Edge Functions, Deno is required** - it's the runtime Supabase chose for its security model and fast cold starts.

---

## Function 1: analyze-clothing

Analyzes clothing images using Gemini Vision API and returns structured metadata.

### Step 1: Create Function in Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Edge Functions** in the left sidebar
4. Click **New Function**
5. Enter function name: `analyze-clothing`
6. Click **Create Function**

### Step 2: Paste the Code

In the code editor, paste this:

```typescript
// Supabase Edge Function - analyze-clothing
// Analyzes clothing images using Gemini Vision API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Image URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch image from Supabase Storage
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch image" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert to base64
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    const mimeType = imageUrl.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";

    // Prompt for Gemini
    const prompt = `Analyze this clothing item image and return a JSON object with these exact fields:
{
  "name": "Descriptive name of the item",
  "type": "One of: top, bottom, outerwear, shoes, accessory",
  "color": "Primary color name",
  "warmth_rating": "Number 1-5 where: 1=very light, 2=light, 3=moderate, 4=warm, 5=heavy winter",
  "seasons": ["Array of seasons this item is suitable for: spring, summer, fall, winter"],
  "formality": "One of: casual, smart_casual, formal",
  "sub_type": "Specific sub-type like: hoodie, blazer, sneakers, jeans, t-shirt, suede, etc."
}

Return ONLY the JSON object, no other text.`;

    // Call Gemini API
    const geminiResponse = await fetch(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64Image } }
            ]
          }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error("Gemini API error:", errorData);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiResponse.json();
    const textResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      return new Response(
        JSON.stringify({ error: "No response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse JSON from response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate required fields
    const requiredFields = ["name", "type", "color", "warmth_rating", "seasons"];
    for (const field of requiredFields) {
      if (!(field in analysis)) {
        analysis[field] = field === "seasons" ? ["spring", "summer", "fall", "winter"] : "";
      }
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error analyzing clothing:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### Step 3: Set Environment Variable

1. In the same Edge Functions page, click **Secrets** tab
2. Click **New Secret**
3. Name: `GEMINI_API_KEY`
4. Value: Your Gemini API key from Google AI Studio
5. Click **Save**

### Step 4: Deploy

1. Click **Deploy** button in the top right
2. Wait for deployment to complete (usually ~10 seconds)
3. The function is now live at: `https://your-project.supabase.co/functions/v1/analyze-clothing`

---

## Frontend Usage

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const analyzeClothing = async (imageUrl: string) => {
  const { data, error } = await supabase.functions.invoke('analyze-clothing', {
    body: { imageUrl },
  });

  if (error) throw error;
  return data; // { name, type, color, warmth_rating, seasons, formality, sub_type }
};
```

---

## API Response Format

### Success Response (200)

```json
{
  "name": "Blue Denim Jacket",
  "type": "outerwear",
  "color": "Blue",
  "warmth_rating": 3,
  "seasons": ["spring", "fall"],
  "formality": "casual",
  "sub_type": "denim jacket"
}
```

### Error Response (400/500)

```json
{
  "error": "Image URL is required"
}
```

---

## Database Schema

The analysis fields map to the `clothing_items` table:

| Field | Type | Notes |
|-------|------|-------|
| name | String | User-defined label |
| type | Enum | top, bottom, outerwear, shoes, accessory |
| color | String | Primary color |
| warmth_rating | Integer | 1-5 scale |
| seasons | Array | spring, summer, fall, winter |
| formality | Enum | casual, smart_casual, formal |
| sub_type | String | e.g., hoodie, blazer, sneakers |

---

## Testing

### Test in Supabase Dashboard

1. Go to **Edge Functions** → **analyze-clothing**
2. Click **Invoke** tab
3. Paste test body:
   ```json
   {
     "imageUrl": "https://your-storage-url.com/image.jpg"
   }
   ```
4. Click **Send Request**

### Test with cURL

```bash
curl -X POST https://your-project.supabase.co/functions/v1/analyze-clothing \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://your-storage-url.com/image.jpg"}'
```

---

## Troubleshooting

### Function not found
- Check Edge Functions list in Dashboard
- Ensure deployment succeeded (green checkmark)

### CORS errors
- Function includes CORS headers for all origins
- For production, update `Access-Control-Allow-Origin` to your domain

### Gemini API errors
- Verify `GEMINI_API_KEY` secret is set correctly
- Check API quota in Google AI Studio

### Image fetch fails
- Ensure image URL is publicly accessible
- Check Supabase Storage bucket permissions

---

## Next Steps

1. Deploy the function via Dashboard
2. Test with sample images
3. Monitor logs in Dashboard → Edge Functions → Logs
