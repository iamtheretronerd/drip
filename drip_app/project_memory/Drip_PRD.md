# DRIP — Weather-Smart Wardrobe Assistant

### Product Requirements Document

**Version:** 1.0  
**Last Updated:** February 2026  
**Status:** Draft  
**Platform:** Web Application (responsive)  
**Classification:** Internal

---

## Table of Contents

1. [Document Overview](#1-document-overview)
2. [User Personas](#2-user-personas)
3. [User Stories & Acceptance Criteria](#3-user-stories--acceptance-criteria)
4. [Feature Specification (MVP)](#4-feature-specification-mvp)
5. [User Flows](#5-user-flows)
6. [Page Breakdown](#6-page-breakdown)
7. [API Specification](#7-api-specification)
8. [Technical Architecture](#8-technical-architecture)
9. [UI / UX Requirements](#9-ui--ux-requirements)
10. [Error Handling & Edge Cases](#10-error-handling--edge-cases)
11. [Engineering Requirements](#11-engineering-requirements)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [MoSCoW Priority Matrix](#13-moscow-priority-matrix)
14. [Dependencies & Blockers](#14-dependencies--blockers)
15. [Future Phases (Post-MVP)](#15-future-phases-post-mvp)
16. [Success Metrics](#16-success-metrics)
17. [Risks & Mitigations](#17-risks--mitigations)
18. [Assumptions & Constraints](#18-assumptions--constraints)
19. [Glossary](#19-glossary)

---

## 1. Document Overview

### 1.1 Purpose

This document defines the product requirements for Drip, a smart wardrobe assistant web application. Drip helps users decide what to wear each day by combining real-time weather data, personal wardrobe inventory, and mood-based input to generate practical, stylish outfit suggestions.

### 1.2 Product Vision

Drip eliminates the daily decision fatigue of choosing what to wear. Users upload items from their closet, tag them by type, warmth, and season, and Drip combines them into weather-appropriate, mood-matching outfits. The app encourages full wardrobe rotation so users rediscover forgotten pieces and stop defaulting to the same three outfits.

### 1.3 Scope

**MVP Focus:** This PRD primarily defines the Minimum Viable Product. Future phases are outlined in Section 15 but are not detailed specifications. The MoSCoW priority matrix in Section 13 defines what is essential for launch versus what can be deferred.

---

## 2. User Personas

### 2.1 Alex — The Efficient Professional

| Attribute | Description |
|-----------|-------------|
| Profile | Late 20s–30s. Packed schedule, commutes daily. Needs to look polished without spending time on outfit decisions. |
| Pain Point | No mental energy for wardrobe decisions. Weather surprises (rain, cold snaps) during commute cause discomfort or wardrobe malfunctions. |
| Goal | Open the app, see one good outfit for today, get dressed, leave. Entire interaction under 30 seconds. |

### 2.2 Jordan — The Trend-Conscious Student

| Attribute | Description |
|-----------|-------------|
| Profile | Late teens–20s. Wants to express personality through outfits. Owns many pieces but defaults to the same few. |
| Pain Point | Forgets what they own. Wants variety and style but ends up repeating outfits out of habit. |
| Goal | Type in a mood or vibe and get an outfit that feels expressive and intentional. Rediscover forgotten pieces. |

### 2.3 Riley — The Minimalist Organizer

| Attribute | Description |
|-----------|-------------|
| Profile | Mid 20s–40s. Values efficiency, sustainability, and a curated wardrobe. Wants to maximize every piece. |
| Pain Point | Tends to over-buy basics and under-use accent pieces. No system for tracking what gets worn and what gathers dust. |
| Goal | Rotate items evenly, identify wardrobe gaps, avoid duplicate purchases. See data on what they actually wear. |

---

## 3. User Stories & Acceptance Criteria

### US-01: Weather-Based Outfit Suggestion

**Persona:** Alex  
**Story:** As a busy professional, I want to see a complete outfit suggestion based on today's weather so I can get dressed faster.

**Acceptance Criteria:**
- Given the user has at least 3 clothing items in their closet and a valid location set, when they open the dashboard, then an outfit suggestion is displayed within 2 seconds of page load.
- The suggestion includes at minimum a top, bottom, and shoes. Outerwear is included if the temperature is below 55°F / 13°C.
- The outfit items have warmth ratings appropriate for the current feels-like temperature (see Glossary: Warmth Rating).
- If the user has no items in their closet, the outfit engine is not shown and an empty state with an upload CTA is displayed instead.

### US-02: Mood-Based Outfit Suggestion

**Persona:** Jordan  
**Story:** As a fashionista, I want to type in how I'm feeling (e.g., "lazy yet sharp") so the app suggests outfits that match my mood and personal style.

**Acceptance Criteria:**
- Given the dashboard is loaded, a text input field for mood/context is visible.
- When the user types a mood (e.g., "coffee date", "main character energy", "just going to the gym") and submits, the outfit engine regenerates with the mood as an additional parameter.
- The regenerated outfit visibly differs from the previous suggestion (at least 1 item must change, unless the closet is too small).
- The mood text is stored in the outfit log if the outfit is accepted.

### US-03: Weather-Aware Piece Exclusion

**Persona:** Alex  
**Story:** As a daily commuter, I want the outfit suggestion to account for rain in the forecast so I'm not wearing suede shoes in a downpour.

**Acceptance Criteria:**
- When the day's forecast includes precipitation probability >= 50%, the dashboard displays a visible rain/snow indicator.
- The outfit engine excludes items that the user has tagged as weather-vulnerable (e.g., suede sub-type) when precipitation is in the forecast.
- If rain is forecasted and the user owns waterproof outerwear, it is prioritized in the suggestion.

### US-04: Upload Clothing Items

**Persona:** All  
**Story:** As a user, I want to upload clothing items with photos and tags so the app knows what I own.

**Acceptance Criteria:**
- The user can upload a photo (JPEG, PNG, or WebP, max 5MB) for each item.
- - The user must provide: name.
- The AI will analyze: type (top/bottom/outerwear/dress/shoes/accessory), primary color, warmth rating (1–5), and season suitability (multi-options).
- Optional fields: formality level, sub-type.
- The item appears in the closet grid immediately after saving.
- Validation errors are shown inline (e.g., "Photo is required", "Please select a warmth rating").
- The user can edit or delete any item from the closet view.

### US-05: Outfit History Calendar

**Persona:** Riley  
**Story:** As a minimalist, I want to see an outfit history calendar so I can track rotation and avoid repeating the same outfit too often.

**Acceptance Criteria:**
- A date picker is accessible from the main navigation.
- Tapping/clicking a day with a logged outfit expands to show the full outfit details (individual item photos, names, and tags).
- Days without logged outfits appear empty (no placeholder or error).

### US-06: Individual Piece Swap

**Persona:** Jordan  
**Story:** As a user, I want to swap individual pieces in a suggested outfit without regenerating the entire look.

**Acceptance Criteria:**
- Each item card in the outfit suggestion is tappable/clickable.
- Tapping an item opens a drawer/modal showing alternative items from the user's closet in the same category (e.g., other tops).
- The alternatives are filtered for weather compatibility (warmth, precipitation).
- Selecting an alternative replaces that item in the outfit card without changing any other pieces.
- The user can swap multiple pieces independently in the same session.

### US-08: Onboarding Quiz

**Persona:** All  
**Story:** As a new user, I want a short onboarding quiz (4–5 questions) so the app understands my style and lifestyle from day one.

**Acceptance Criteria:**
- After account creation, the user is directed to a stepped quiz flow (one question at a time) with a progress indicator.
- The quiz contains 4–5 questions covering: typical day/lifestyle, location, weather sensitivity, and outfit priority.
- All questions must be answered to proceed (no skipping).
- Answers are saved to the user profile and are used by the outfit engine for suggestions.
- The user can edit their quiz answers later from the Profile/Settings page.
- After the quiz, the user is prompted to upload their first outfit (3–5 items).

---

## 4. Feature Specification (MVP)

### 4.1 Onboarding Flow

New users complete a brief onboarding sequence after account creation. The quiz directly influences outfit suggestions and is not optional filler.

#### 4.1.1 Authentication

- Email and password registration with supabase authentication (session managed).
- Password requirements: minimum 8 characters, at least one uppercase letter, one lowercase letter, and one number.
#### 4.1.2 Onboarding Quiz (4–5 Questions)

Questions are presented one at a time in a stepped progress flow. Answers are stored in the user profile and feed into the outfit suggestion engine.

1. **Typical day:** Multiple choice (e.g., Office/corporate, Campus/school, Remote/WFH, Mixed/varies).
2. **Location:** Auto-detect via browser geolocation API with manual city entry fallback.
4. **Weather sensitivity:** Slider or choice (e.g., I run hot / neutral / I get cold easily).
5. **Outfit priority:** Rank or select (Comfort first, Style first, Weather protection first).

#### 4.1.3 First Outfit Upload

After the quiz, users are prompted to upload their first outfit (3–5 items: shirt, pants, shoes, and optionally accessories). This prevents an empty closet state and gives the engine something to work with immediately.

### 4.2 Dashboard / Home Page

The dashboard is the primary screen users see upon opening the app. It must deliver value within seconds.

#### 4.2.1 Weather Display

- Default view: Today's weather — current temperature, feels-like temperature, weather condition icon, and precipitation probability.
- Toggleable 7-day forecast bar: Users can tap any future day to view its forecast and generate an on-demand outfit suggestion for that day.
- Weather data source: OpenWeatherMap free tier (1,000 API calls/day included; free for students).
- Visual weather indicators: Rain, snow, sun, clouds, and wind displayed as icons on the dashboard. If rain is in the forecast for any part of the current day, a rain indicator is prominently visible.

#### 4.2.2 Outfit Suggestion Card

The outfit suggestion is displayed as a visual card layout showing each clothing item (photo thumbnail from the user's closet) arranged by category: top, bottom, shoes, outerwear (if applicable), and accessories (if applicable).

- Each item card is tappable to trigger an individual piece swap.
- A "Regenerate" button below the outfit card re-runs the full outfit engine for a completely new suggestion.
- Outfit suggestions factor in: current weather (or selected future day), full-day forecast (e.g., afternoon rain), user mood/context input, onboarding preferences, and outfit history (to promote rotation).

#### 4.2.3 Mood / Context Input

A text input field below the weather display allows users to type a natural language mood or context. Examples: "coffee date," "outdoor meeting," "I feel like a main character today," "just going to the gym." Submitting a mood re-triggers the outfit engine with the mood as an additional parameter.

#### 4.2.4 Piece Swap Flow

When a user taps an individual item in the outfit card, a drawer or modal appears showing alternative items from their closet in that same category (e.g., other tops). The alternatives are filtered for weather compatibility. The user selects a replacement and the outfit card updates in place.

### 4.3 Closet Management

The closet is the user's wardrobe inventory. All outfit suggestions are sourced from this data.

#### 4.3.1 Adding Items

- Users upload a photo of each clothing item individually.
- Manual tagging required for each item: type (top, bottom, outerwear, shoes, accessory), color (primary color), warmth rating (1–5 scale), season suitability (spring, summer, fall, winter — multi-select), and name/label (user's own name for the item) - All these data will be generated by AI and will be editable by the user.
- Optional tags: formality level (casual, smart casual, formal), sub-type (e.g., hoodie, blazer, sneakers, boots).

#### 4.3.2 Closet View

Grid layout of all uploaded items. Each item displays as a card with the photo, item name, and key tags. Filter by: type, season, color, and warmth rating. Search by item name. Edit and delete functionality per item.

#### 4.3.3 Data Model — Clothing Item

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Auto | Primary key |
| user_id | UUID (FK) | Yes | References users table |
| photo_url | String | Yes | Cloud storage URL |
| name | String | Yes | User-defined label |
| type | Enum | Yes | top, bottom, outerwear, shoes, accessory |
| color | String | Yes | Primary color |
| warmth_rating | Integer (1–5) | Yes | 1 = very light, 5 = heavy winter (see Glossary) |
| seasons | Array\<Enum\> | Yes | Multi-select: spring, summer, fall, winter |
| formality | Enum | No | casual, smart_casual, formal |
| sub_type | String | No | e.g., hoodie, blazer, sneakers, suede |
| created_at | Timestamp | Auto | |
| last_worn | Date | No | Updated when outfit is logged |
| times_worn | Integer | Auto (0) | Incremented on outfit log |
| consecutive_days_worn | Integer | Auto (0) | Reset when not worn; used for rotation logic |

### 4.4 Outfit Suggestion Engine

The engine uses a hybrid approach: rule-based filtering to narrow candidates, then an LLM (AI) layer for mood interpretation, style coherence, and final selection.

#### 4.4.1 Rule-Based Filtering Layer

Before any AI involvement, the system applies hard filters to the user's closet:

1. **Season filter:** Only include items tagged for the current season.
2. **Warmth filter:** Match item warmth ratings to the current feels-like temperature range (see Glossary: Warmth Rating for temperature-to-rating mapping). The user can adjust the warmth scale in their profile settings.
3. **Precipitation filter:** If rain or snow is in the day's forecast (>= 50% probability), exclude vulnerable items (e.g., suede sub-type) and prioritize waterproof outerwear.
4. **Formality filter:** If the user's onboarding indicates a professional lifestyle, default to smart casual or above unless mood input overrides.
5. **Rotation filter:** Apply category-specific rotation rules (see Section 4.4.3).

#### 4.4.2 AI Styling Layer

The filtered candidate pool is passed to an LLM via API with a structured prompt. The AI is responsible for:

- Interpreting the user's mood/context input into styling direction.
- Selecting a cohesive outfit from the filtered candidates (color coordination, style coherence, formality matching).
- Applying style rules provided in the system prompt: no more than 3 colors in one outfit, match formality levels across pieces, balance proportions (e.g., loose top with fitted bottom or vice versa).

#### 4.4.3 Rotation Rules by Category

| Category | Rule | Details |
|----------|------|---------|
| Tops | 3-day cooldown | Exclude if worn in the last 3 days. Boost priority if not worn in 14+ days. |
| Bottoms (neutral colors) | 3 consecutive days max | Can repeat up to 3 consecutive days, then must rotate out. Neutral is inferred from the color tag (black, navy, gray, khaki, white, denim/blue jeans). |
| Bottoms (bold/bright colors) | No consecutive repeats | Bright or patterned bottoms should not repeat on consecutive days. System infers "bold" from the color tag — any color not in the neutral list above. |
| Shoes | No constraint | Can repeat daily. |
| Outerwear | No constraint | Can repeat daily. |
| Accessories / Jewelry | No constraint | Can repeat daily. |

When the closet is too small to satisfy rotation rules, the engine relaxes constraints and uses what's available rather than showing no suggestion.

#### 4.4.4 Prompt Structure

The LLM receives a system prompt containing hardcoded style rules, the user's onboarding preferences, and the filtered wardrobe items (as structured JSON with item metadata). The user message contains the weather data and optional mood input. The LLM returns a structured JSON response specifying the selected item IDs for each outfit slot.

#### 4.4.5 Fallback Behavior

If the user's closet has insufficient items for a complete outfit (e.g., no outerwear when it's cold), the engine returns a partial suggestion with a clear message indicating the gap (e.g., "You might want to add a warm jacket to your closet").

### 4.5 Outfit History / Calendar

#### 4.5.1 Calendar View

A monthly calendar view where each day that has a logged outfit displays a small thumbnail of the outfit. Tapping/clicking a day expands to show the full outfit details.

#### 4.5.2 Outfit Logging

When a user accepts a suggested outfit (or customizes and confirms it), it is logged against that date. The system auto-logs the suggestion, but the user can edit what they actually wore. This data feeds back into the rotation algorithm and updates each item's `last_worn`, `times_worn`, and `consecutive_days_worn` fields.

#### 4.5.3 Data Model — Outfit Log

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| user_id | UUID (FK) | References users table |
| date | Date | One outfit per day per user |
| item_ids | Array\<UUID\> | References clothing items in the outfit |
| mood_input | String | The mood/context text used (nullable) |
| weather_snapshot | JSON | Temp, conditions, precipitation at time of generation |
| was_modified | Boolean | True if user swapped any pieces |
| created_at | Timestamp | Auto-generated |

### 4.6 Profile & Settings

- **Location:** Change city/location (updates weather source).
- **Style preferences:** Edit onboarding quiz answers at any time.
- **Warmth scale adjustment:** User can customize the temperature ranges mapped to each warmth rating (1–5) from the defaults defined in the Glossary.
- **Weather units:** Toggle between Fahrenheit and Celsius.
- **Account management:** Change email, change password, delete account.

---

## 5. User Flows

### 5.1 First-Time User Flow

1. User visits the site and clicks "Sign Up."
2. User creates an account with email and password.
3. User completes the 4–5 question onboarding quiz.
4. User is prompted to upload their first outfit (3–5 items with photos and tags).
5. User lands on the dashboard with today's weather and their first outfit suggestion.

### 5.2 Returning User Flow (Daily Use)

1. User opens the app.
2. Dashboard loads immediately with today's weather and an outfit suggestion.
3. User optionally types a mood/context (e.g., "coffee date").
4. App regenerates or adjusts the suggestion based on mood input.
5. User accepts the outfit, swaps individual pieces, or taps "Regenerate" for a new option.
6. Accepted outfit is logged to the calendar. Item wear counts, `last_worn`, and `consecutive_days_worn` are updated.

### 5.3 Future Day Planning Flow

1. User taps a future day on the 7-day forecast bar.
2. Dashboard updates to show that day's forecasted weather.
3. Outfit engine generates a suggestion on demand for that day's weather.
4. User can accept, swap, or regenerate as normal.
5. Outfit is logged against the future date (can be edited later).

---

## 6. Page Breakdown

| Page | Primary Purpose | Key Components |
|------|----------------|----------------|
| Dashboard / Home | Show weather + outfit suggestion. Primary daily interaction point. | Weather card, outfit card, mood input, regenerate button, 7-day toggle |
| Closet | Manage wardrobe inventory. Add, edit, remove, filter items. | Item grid, filters (type, season, color, warmth), add item form, item detail modal |
| Outfit History | Calendar view of past outfits. Track rotation and wearing patterns. | Monthly calendar, daily thumbnails, outfit detail expansion |
| Profile / Settings | Account and preference management. | Location, style prefs, warmth scale adjustment, units toggle, account settings |
| Auth Pages | Sign up, log in, password reset. | Email/password forms, error handling |
| Onboarding | Style quiz and first outfit upload. | Stepped quiz, progress indicator, upload prompt |

---


## 7. Technical Architecture

### 7.1 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React|
| Backend / API | Supabase|
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Weather API | OpenWeatherMap Free Tier (1,000 calls/day) |
| AI / LLM | Gemini|
| Image Storage | Cloud object storage (TBD — see Dependencies) |
| Hosting | Vercel|

### 8.2 API Rate Limit Management

OpenWeatherMap's free tier provides 1,000 API calls per day. To stay within this limit:

- Cache weather data per location with a 30-minute TTL. Multiple users in the same city share cached results.
- The 7-day forecast is a single API call (One Call API), not 7 separate calls.
- Monitor daily usage with a counter; gracefully degrade (show cached/stale data) if limit is approached.

### 8.3 Database Schema Overview

Core tables: `users`, `clothing_items`, `outfit_logs`, `onboarding_responses`. The `clothing_items` table stores wardrobe inventory (see Section 4.3.3). The `outfit_logs` table stores daily outfit history (see Section 4.5.3). Relationships are user-centric: a user has many clothing items and many outfit logs.

---

## 9. UI / UX Requirements

### 9.1 Design Direction

Modern, clean, and minimal with a gamified, interactive feel. The app should feel fun and satisfying to use without being childish. Design should be gender-neutral and broadly appealing.

#### 9.1.1 Key Principles

- **Speed to value:** Dashboard must deliver a useful outfit suggestion within 2 seconds of page load.
- **Micro-interactions:** Satisfying animations on actions — regenerate spin, piece swap slide, outfit accept confirmation.
- **Gamification elements:** Streak counter for daily outfit logging, wardrobe completion progress bar, "new combo" badge when wearing a never-before-tried combination.
- **Neutral aesthetic:** No gendered color palettes. Use bold, clean accent colors. Think modern productivity app, not fashion magazine.

#### 9.1.2 Responsive Design

The web app must be fully responsive. Primary breakpoints: mobile (< 768px), tablet (768–1024px), desktop (> 1024px). The dashboard layout should stack vertically on mobile and use a two-column layout on desktop (weather + mood on one side, outfit card on the other, matching the wireframe inspiration).

### 9.2 Accessibility

- WCAG 2.1 AA compliance minimum.
- Keyboard navigable. Screen reader compatible.
- Sufficient color contrast on all text and interactive elements.
- Alt text on all uploaded clothing item images.

---

## 10. Error Handling & Edge Cases

### 10.1 Empty Closet State

The outfit suggestion engine is not displayed. Instead, show a friendly empty state screen with a clear call-to-action: "Add your first outfit to get started." This is an expected state for new users, not an error.

### 10.2 Weather API Unavailable

Show cached/stale weather data with a subtle indicator: "Weather last updated [time ago]." If no cached data exists (new user, API never succeeded), display the outfit engine without weather filtering and show a message: "Weather unavailable — suggestion based on your preferences only."

### 10.3 LLM API Timeout or Failure

Set a 10-second timeout on LLM calls. On failure, fall back to the rule-based engine only (weather + rotation logic, no mood/styling). Display the outfit with a note: "Quick suggestion — try regenerating for a styled pick." The user always receives a suggestion.

### 10.4 Invalid Image Upload

Reject immediately with a specific inline validation message. Accepted formats: JPEG, PNG, WebP. Maximum file size: 5MB. Server-side validation runs in addition to client-side checks.

### 10.5 Insufficient Wardrobe for Complete Outfit

Return a partial suggestion with whatever items are available, plus a clear gap message (e.g., "You might want to add a warm jacket to your closet"). Do not block the user from seeing a suggestion.

### 10.6 Closet Too Small for Rotation Rules

Relax rotation constraints when the closet doesn't have enough items to satisfy them. Prefer showing a repeated item over showing no suggestion. The rotation algorithm should degrade gracefully: first relax cooldown periods, then allow consecutive repeats if necessary.

### 10.7 Rate Limiting on Auth Endpoints

If a user exceeds 5 failed login attempts within 15 minutes, temporarily lock the account for 15 minutes. Return a clear error message with remaining lockout time.

---

## 11. Engineering Requirements

### 11.1 Testing

Minimum 80% test coverage across the codebase, measured by line coverage. This threshold applies to the entire project, not individual files.

- **Unit tests:** All utility functions, engine logic (filtering, rotation scoring), API route handlers, and data validation.
- **End-to-end tests:** Critical user flows — sign up, onboarding quiz, upload first item, receive outfit suggestion, swap a piece, regenerate, log outfit. Use a framework such as Playwright or Cypress.

### 11.2 CI/CD Pipeline

Multi-stage pipeline with the following stages:

1. **Lint & Format:** ESLint + Prettier. Fail the build on lint errors.
2. **Build:** Next.js production build. Fail on build errors or TypeScript type errors.
3. **Test:** Run full test suite. Fail if coverage drops below 80%.
4. **Security Scan:** Dependency vulnerability scanning (e.g., npm audit, Snyk, or Trivy). Fail on critical/high vulnerabilities.
5. **Deploy Preview:** Every pull request gets a preview deployment (Vercel preview deployments). Reviewers can test changes in a live environment before merging.
6. **Production Deploy:** Auto-deploy to production on merge to main, only if all prior stages pass.

### 11.3 Quality Metrics

- **Code coverage:** >= 80% (enforced in CI).
- **Lighthouse scores:** Performance >= 90, Accessibility >= 90, Best Practices >= 90.
- **Core Web Vitals:** LCP < 2.5s, FID < 100ms, CLS < 0.1.
- **API response times:** P95 < 500ms for all endpoints except outfit generation (P95 < 3s, as it involves an LLM call).

### 11.4 Security

- Row Level Security from Supabase
- Input sanitization on all user inputs (mood text, item tags, quiz answers).
- Image upload validation: file type whitelist (JPEG, PNG, WebP), max file size (5MB), server-side validation.
- Environment variables for all secrets (JWT secret, API keys, database URL). Never committed to version control.
- HTTPS enforced in production.
- User data should not be leaked or exposed. Ensure users can only access their own data.

---

## 12. Non-Functional Requirements

### 12.1 Performance

- Dashboard page load: < 2 seconds (P95).
- Outfit generation (with LLM): < 3 seconds (P95).
- Image upload processing: < 5 seconds per item.
- Weather API response (cached): < 200ms. Weather API response (uncached): < 1 second.

### 12.2 Availability

This is a prototype with an expected user base of 10–15 users. No formal SLA is required, but the application should remain available during normal usage. Vercel's default uptime guarantees are sufficient.

### 12.3 Data Security & Privacy

- All user data (photos, wardrobe, location) must be accessible only by the owning user. Row-level authorization checks on every database query.
- Passwords hashed with bcrypt (minimum 10 salt rounds).
- No sensitive data logged (passwords, JWTs, full API keys).
- User account deletion must remove all associated data (clothing items, outfit logs, onboarding responses, uploaded images).
- HTTPS enforced on all endpoints in production.

### 12.4 Data Retention

- User data is retained indefinitely while the account is active.
- On account deletion, all data is permanently removed within 30 days.
- Weather cache entries expire after 30 minutes and are not stored permanently.

---

## 13. MoSCoW Priority Matrix

### Must Have (launch blockers — app does not ship without these)

| Feature | Rationale |
|---------|-----------|
| Email/password auth with JWT | Users must be able to create accounts and log in. |
| Onboarding quiz (4–5 questions) | Engine depends on user preferences to generate relevant suggestions. |
| Upload clothing items with photo + manual tags | The entire app depends on having wardrobe data. |
| Dashboard with today's weather display | Core value proposition — weather-aware outfit suggestions. |
| Outfit suggestion engine (hybrid: rules + AI) | Core feature. Without this, the app has no purpose. |
| Regenerate full outfit | Users need a way to reject a suggestion and get a new one. |
| Closet grid view with filters | Users need to see and manage what they've uploaded. |

### Should Have (important — app is usable without them but significantly worse)

| Feature | Rationale |
|---------|-----------|
| Mood/context text input | Key differentiator from a simple weather app. Directly tied to Persona Jordan. |
| Individual piece swap | Major UX improvement over regenerate-only. Prevents frustration. |
| 7-day forecast toggle with on-demand outfit generation | Enables future planning, a frequently requested feature pattern. |
| Outfit history calendar with daily thumbnails | Required for rotation data and Persona Riley. Feeds back into engine quality. |

### Could Have (nice to have — cut if timeline is tight)

| Feature | Rationale |
|---------|-----------|
| Gamification elements (streak counter, new combo badge, progress bar) | Increases engagement but not core functionality. |
| Outfit logging with edit capability (actual wear vs. suggested) | Improves rotation accuracy but auto-logging is sufficient for MVP. |
| Wardrobe gap messaging ("You might need a warm jacket") | Helpful but the app functions without it. |
| Warmth scale customization in settings | Defaults are reasonable; customization is a refinement. |

---

## 14. Dependencies & Blockers

The following must be set up before engineering can begin. These are listed as prerequisites and are not assigned to any individual. The team should convert these into tickets during sprint planning.

### 14.1 Accounts & API Keys

- [ ] OpenWeatherMap account created and free-tier API key obtained.
- [ ] LLM API provider selected (Claude / OpenAI / other) and API key obtained.
- [ ] Cloud storage provider selected (AWS S3 / Cloudflare R2 / Vercel Blob) and bucket/container created.

### 14.2 Infrastructure

- [ ] PostgreSQL database instance provisioned (Supabase / Neon / Railway / other).
- [ ] Vercel project created and linked to the repository.
- [ ] Domain name registered (if applicable).
- [ ] Environment variables configured in Vercel for all secrets (JWT secret, API keys, database URL, storage credentials).

### 14.3 Repository & CI/CD

- [ ] Git repository created (GitHub recommended for Vercel integration).
- [ ] CI/CD pipeline configured (GitHub Actions or Vercel built-in).
- [ ] Branch protection rules set (require PR reviews, passing CI before merge).

### 14.4 Design

- [ ] Final UI mockups or design system established (colors, typography, component library) before frontend development begins.

---

## 15. Future Phases (Post-MVP)

The following features are out of scope for the MVP but are planned for future iterations. They are listed here for context and to inform architectural decisions that should accommodate them.

### Phase 2 — Smart Features

- **OAuth sign-in:** Google, Apple, GitHub. Reduces sign-up friction.
- **AI auto-tagging:** Upload a clothing photo and the system auto-detects type, color, and suggests warmth/season tags. User confirms or edits.
- **Outfit rating:** After wearing an outfit, users rate it (thumbs up/down or 1–5 stars). Ratings train the engine over time.
- **Smart rotation alerts:** Notifications when certain items haven't been worn in 30+ days.

### Phase 3 — Social & Advanced

- **Mobile app:** Native iOS and Android apps (or React Native).
- **Wardrobe analytics:** Dashboard showing most/least worn items, cost-per-wear estimates, seasonal usage patterns.
- **Outfit sharing:** Share outfit cards to social media or with friends.
- **Push notifications:** Morning outfit reminders and weather alerts.
- **Multi-outfit days:** Support for users who change outfits (e.g., gym clothes vs. work clothes).

---

## 16. Success Metrics

| Metric | Target (MVP) | Measurement |
|--------|-------------|-------------|
| Onboarding completion rate | >= 70% of sign-ups complete quiz + first upload | Analytics event tracking |
| Daily active usage | >= 40% of registered users return daily in first week | Login + outfit view events |
| Outfit acceptance rate | >= 50% of suggestions accepted without regeneration | Accept vs. regenerate ratio |
| Closet size growth | Average 10+ items within first 2 weeks | Items per user over time |
| Page load time | Dashboard loads in < 2 seconds (P95) | Lighthouse / RUM monitoring |

---

## 17. Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Onboarding drop-off (uploading items is tedious) | High | Require only 1 outfit (3–5 items) at onboarding. Allow incremental closet building over time. |
| AI outfit suggestions look bad | High | Hardcoded style rules in prompt (color limits, formality matching). Rule-based pre-filtering reduces AI error surface. User can always regenerate or swap. |
| OpenWeatherMap rate limit hit | Medium | 30-minute cache per location. Monitor usage. Upgrade to paid tier if user base grows. |
| Small wardrobe limits suggestion quality | Medium | Graceful fallback: show partial outfits with wardrobe gap messaging. Encourage uploads via gamification. |
| LLM API cost at scale | Medium | Cache outfit suggestions. Limit regenerations per day if needed. Use smaller/cheaper models for simple weather-only suggestions. |
| LLM API timeout/downtime | Medium | 10-second timeout with rule-based fallback. User always gets a suggestion. |
| Image storage costs | Low | Compress and resize images on upload. Use cost-effective storage (Cloudflare R2 has free egress). |

---

## 18. Assumptions & Constraints

### 18.1 Assumptions

- Users are willing to manually upload and tag 3–5 items during onboarding to get started.
- Users have access to a device with a camera or existing photos of their clothing.
- The free tier of OpenWeatherMap (1,000 calls/day) is sufficient for MVP user volumes (10–15 users).
- An LLM can produce acceptable outfit styling when given structured wardrobe data and explicit style rules.

### 18.2 Constraints

- No external authentication dependencies in MVP (email/password only).
- Weather data limited to OpenWeatherMap free tier.
- AI auto-tagging is deferred to Phase 2; MVP requires manual tagging.
- Web-only for MVP; no native mobile app.
- Prototype scale: expected 10–15 concurrent users. No horizontal scaling required.

---

## 19. Glossary

### Warmth Rating

A 1–5 integer scale assigned to each clothing item indicating how warm it is. This scale determines which items are suggested for a given temperature. Users can customize these ranges in their profile settings.

| Rating | Label | Item Examples | Default Temperature Range |
|--------|-------|---------------|--------------------------|
| 1 | Very light | Tank tops, linen shorts, sandals | 85°F+ / 30°C+ |
| 2 | Light | T-shirts, light dresses, canvas sneakers | 70–85°F / 21–30°C |
| 3 | Moderate | Long sleeves, jeans, light jackets | 55–70°F / 13–21°C |
| 4 | Warm | Sweaters, hoodies, boots, heavier jackets | 35–55°F / 2–13°C |
| 5 | Heavy winter | Parkas, insulated boots, heavy knits, thermals | Below 35°F / below 2°C |

### Rotation Bias

The outfit engine's logic for distributing wear across the wardrobe to prevent repetitive outfits. Rotation rules vary by clothing category (see Section 4.4.3 for the full rule table). The system tracks `last_worn`, `times_worn`, and `consecutive_days_worn` per item and uses these to filter and prioritize candidates during outfit generation.

### Feels-Like Temperature

The apparent temperature accounting for wind chill and humidity, as reported by the OpenWeatherMap API. The outfit engine uses feels-like temperature (not actual temperature) for warmth rating matching, as it more accurately reflects what the user will experience outdoors.

### Outfit Suggestion

A complete set of clothing items (at minimum: top, bottom, shoes; optionally outerwear and accessories) selected from the user's closet by the hybrid engine based on weather, mood, preferences, and rotation history.

### Hybrid Engine

The combination of rule-based filtering (weather, season, rotation, formality) and AI-powered styling (mood interpretation, color coordination, style coherence) used to generate outfit suggestions. The rule layer runs first to narrow candidates; the AI layer selects the final outfit from the filtered pool.

### Neutral Colors (Bottoms)

For rotation rule purposes, bottoms in the following colors are classified as "neutral" and may be worn up to 3 consecutive days: black, navy, gray, khaki, white, and denim/blue. All other bottom colors are classified as "bold" and should not repeat on consecutive days.

---

*End of Document*
