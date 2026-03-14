# Agile Process Documentation

This document summarizes our team's Agile workflow, including sprint planning, retrospectives, and user stories, fulfilling the Agile Process requirements for the submission. Both Hemang Murugan and Feng Hua Tan participated in sprint planning and execution.

---

## Sprint 1: Foundation & Auth
**Dates:** Feb 15, 2026 – Feb 28, 2026  
**Goal:** Establish the foundation of the app, configure Supabase, and build the initial wardrobe management.

### Planning Document
- **Focus:** Authentication, UI foundation, Database schemas.
- **Story Points:** 24 pts allocated.
- **Key Tasks:** Create `profiles`, `clothing_items` tables, build the onboarding flow, login/signup pages, and basic CRUD for the user's wardrobe.

### Retrospective
- **What went well:** Next.js Server Actions allowed us to handle form submissions and database updates seamlessly. Supabase RLS policies successfully secured user data.
- **What needs improvement:** We initially struggled with caching and revalidation across different pages when a user added a new item.
- **Action Items for next sprint:** Standardize cache revalidation using `revalidatePath` to prevent stale UI states. Start using Claude IDE for parallel task execution.

---

## Sprint 2: Core AI Features & Logging
**Dates:** Mar 1, 2026 – Mar 14, 2026  
**Goal:** Implement Gemini AI integrations for automatic clothing analysis and outfit generation.

### Planning Document
- **Focus:** The AI "brain" of the app, dynamic outfit logic, weather integrations.
- **Story Points:** 34 pts allocated.
- **Key Tasks:** Create `/api/analyze-clothing` to parse uploaded images. Build `/api/generate-outfit` using Gemini for intelligent outfit composition. Add outfit logs and history tracking. Add OpenWeather API integration. 

### Retrospective
- **What went well:** Gemini Vision accurately picked up clothing attributes (color, type, warmth) from user uploads, minimizing manual data entry.
- **What needs improvement:** The outfit generation prompt initially returned inconsistent JSON or suggested outerwear in warm weather. We spent significant time tweaking the prompt.
- **Action Items:** Refined the system prompt for rigorous rule compliance. Implement fallback rule-based suggestions if the AI service fails or hits rate limits. 

---

## User Stories & Acceptance Criteria

### Story 1: Smart Wardrobe Entry
**As a user**, I want to upload a photo of my clothing item so that its properties are automatically categorized without manual typing.
- **Acceptance Criteria:**
  - When an image is uploaded, the app successfully calls the `/api/analyze-clothing` endpoint.
  - The AI correctly identifies fields: `name`, `type`, `color`, `warmth_rating`, `seasons`, `formality`.
  - The UI accurately pre-fills a form so the user can review before saving.

### Story 2: Weather & Mood Based Outfit Generation
**As a user**, I want the app to recommend an outfit based on my current location's weather and my daily mood.
- **Acceptance Criteria:**
  - The `/api/weather` endpoint fetches the current forecast using `lat` and `lon`.
  - The `/api/generate-outfit` uses the current profile preferences, mood input, and weather payload to fetch a Gemini suggestion.
  - The resulting outfit does not recommend hot-weather clothing on a freezing day, and honors the user's mood.

### Story 3: Logging Outfits
**As a user**, I want to easily record what I wore today so I can track my outfit history.
- **Acceptance Criteria:**
  - A user can select previously submitted items to log for the current date.
  - The log is successfully saved to the `outfit_logs` table in Supabase.
  - The user's dashboard accurately displays recent logs chronologically.
