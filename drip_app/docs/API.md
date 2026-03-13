# REST API Documentation

This document describes the public and internal REST API endpoints available in the application.

## Base URL
`/api`

## Authentication
All protected routes require an active Supabase session. The session is managed via cookies and validated on the server for each request.

---

## Endpoints

### 1. Weather API
Fetches real-time, forecasting, and historical weather data.

**URL:** `/api/weather`
**Method:** `GET`
**Auth Required:** No

#### Query Parameters:
- `lat` (required): Latitude of the location.
- `lon` (required): Longitude of the location.
- `dt` (optional): Unix timestamp for historical weather.

#### Response:
```json
{
  "temp": 24,
  "feels_like": 25,
  "humidity": 50,
  "description": "clear sky",
  "icon": "01d",
  "wind_speed": 4,
  "precipitation_chance": 0,
  "city": "New York",
  "forecast": [
    {
      "date": "2026-03-12",
      "day": "Today",
      "isToday": true,
      "tempMax": 26,
      "tempMin": 18,
      "icon": "01d",
      "description": "clear sky",
      "precipChance": 10
    }
  ]
}
```

---

### 2. Analyze Clothing API
Analyzes an image URL of a clothing item using Google Gemini Vision API to extract metadata properties automatically.

**URL:** `/api/analyze-clothing`
**Method:** `POST`
**Auth Required:** Yes

#### Request Body:
```json
{
  "imageUrl": "https://example.com/image.png"
}
```

#### Response:
```json
{
  "name": "Blue Denim Jacket",
  "type": "outerwear",
  "color": "blue",
  "warmth_rating": 3,
  "seasons": ["spring", "fall"],
  "formality": "casual",
  "sub_type": "jacket"
}
```

---

### 3. Generate Outfit API
Generates a recommended outfit using AI based on user wardrobe, profile preferences, current weather, and mood.

**URL:** `/api/generate-outfit`
**Method:** `POST`
**Auth Required:** Yes

#### Request Body:
```json
{
  "weather": {
    "temp": 15,
    "feels_like": 14,
    "description": "Partly cloudy",
    "precipitation_chance": 10
  },
  "mood": "Feeling confident today",
  "seed": 12345
}
```

#### Response:
```json
{
  "top": {
    "id": "uuid-top",
    "name": "White T-Shirt",
    "type": "top"
  },
  "bottom": {
    "id": "uuid-bottom",
    "name": "Black Jeans",
    "type": "bottom"
  },
  "shoes": {
    "id": "uuid-shoes",
    "name": "Sneakers",
    "type": "shoes"
  },
  "outerwear": {
    "id": "uuid-outerwear",
    "name": "Denim Jacket",
    "type": "outerwear"
  },
  "accessory1": null,
  "accessory2": null,
  "reasoning": "A comfortable and casual outfit perfect for partly cloudy, crisp weather. The white t-shirt and dark jeans provide a versatile base."
}
```
