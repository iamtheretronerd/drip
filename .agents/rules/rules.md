---
trigger: always_on
---

## 1. Project Context


### 1.1 Tech Stack & Versions


| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19.2.4 |
| Language | TypeScript | 5.9.3 |
| Styling | CSS | - |
| Backend | Supabase, Postgres | Latest |
| Auth | Supabase Auth | Latest |
| Storage | Supabase Storage | Latest |
| AI/ML | gemini | gemini 2 flash  |
| Weather API | OpenWeatherMap | API 3.0 |
| Testing (Unit) | Vitest | 4.0.18|
| Testing (E2E) | Playwright | 1.58.2|
| Package Manager | npm | 11.10.0|


### 1.2 Architecture Overview


```
/app
├── (auth)/           # Auth route group (login, signup)
├── (dashboard)/      # Main app route group
│   ├── closet/       # Wardrobe management
│   ├── outfit/       # Outfit suggestions
│   ├── history/      # Wear history calendar
│   └── forecast/     # 7-day planning
├── api/              # API routes
├── layout.tsx        # Root layout
└── page.tsx          # Entry/landing


/components
├── ui/               # shadcn/ui components
├── closet/           # Closet-specific components
├── outfit/           # Outfit suggestion components
├── weather/          # Weather display components
├── upload/           # Image upload components
└── shared/           # Reusable components


/lib
├── supabase/         # Supabase clients & types
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
├── ai/               # AI tagging logic
└── weather/          # Weather API integration


/types
├── database.ts       # Database schema types
├── api.ts            # API response types
└── index.ts          # App types


/tests
├── unit/             # Vitest tests
├── e2e/              # Playwright tests
└── fixtures/         # Test data
```


**Key Patterns:**
- **Server Components by default** - Use async Server Components for data fetching
- **Client Components for interactivity** - Mark with `'use client'` only when needed
- **Route Groups** for layout organization (auth), (dashboard)
- **Parallel Routes** for modal patterns (e.g., @modal for item detail)
- **Server Actions** for mutations (preferred over API routes)
- **TypeScript strict mode** - No `any` types without explicit justification


### 1.3 Naming Conventions & Coding Standards


**Files & Directories:**
- Components: PascalCase (`OutfitCard.tsx`)
- Hooks: camelCase with `use` prefix (`useWeather.ts`)
- Utils: camelCase (`formatDate.ts`)
- Constants: UPPER_SNAKE_CASE or camelCase for exports
- Test files: `[name].test.ts` or `[name].spec.ts`


**Component Structure:**
```tsx
// Props interface first
interface OutfitCardProps {
  outfit: Outfit;
  onSelect?: (id: string) => void;
}


// Named export, not default
export function OutfitCard({ outfit, onSelect }: OutfitCardProps) {
  // Component logic
}
```


**Variable Naming:**
- Boolean props: use `is`, `has`, `should` prefix (`isLoading`, `hasError`)
- Event handlers: `handle` prefix or `on` prefix (`handleSubmit`, `onClick`)
- Async functions: indicate action (`fetchOutfits`, `uploadImage`)


**CSS:**
- Group related classes with consistent ordering: layout → sizing → spacing → colors → effects
- Extract repeated patterns to component variants (shadcn pattern)
- Color System:
**Primary Colors:**
| Color | Hex | Usage |
|-------|-----|-------|
| 🟣 Lavender Purple | #9B8FD6 | Background |
| 🟡 Vibrant Yellow | #F7E24A | Headlines, cards |
| 🔴 Bold Red | #D94242 | Background |


**Secondary Colors:**
| Color | Hex | Usage |
|-------|-----|-------|
| 🟠 Warm Orange | #F5B847 | Background |
| 🩷 Soft Pink | #E8B4A8 | Buttons, accents |
| ⚫ Rich Black | #1A1A1A | Text, illustrations |
| ⚪ Cream White | #FDF8F0 | Text, UI elements |
| 🔵 Deep Blue | #3B4B9E | Icon backgrounds |
| 🟤 Burgundy | #8B3A3A | Card accents |
| 🟢 Olive Green | #4A5C3E | Decorative elements |
| 🩶 Warm Gray | #6B6B6B | Secondary text |
| 🟡 Pale Yellow | #FFFACD | Highlights |
| 🟣 Deep Purple | #5B4B8A | Text shadows |
Typography:
**Display/Headline Fonts:**
- **Cooper Black** - Bold retro serif for headlines ("Let's get dressed")
- **Lobster / Lobster Two** - Script italic for decorative text ("Your wardrobe")
- **Bebas Neue** - Condensed sans for labels ("ONLY THE BEST", category tags)
**UI/System Fonts:**
- **Inter or SF Pro** - Buttons, navigation, body text ("GET STARTED", "MENU")
**Font Loading:** Use `next/font` for self-hosting display fonts, system fallbacks for UI.




**TypeScript:**
- Prefer `interface` over `type` for object shapes
- Use explicit return types on public functions
- No implicit `any` - enable strict mode
- Use satisfies operator where appropriate


### 1.4 Testing Strategy


**Unit Tests (Vitest):**
- Coverage goal: **≥ 80%** (enforced in CI)
- Test utilities, hooks, and pure functions
- Mock external APIs (Supabase, OpenWeatherMap)
- Location: `tests/unit/` or co-located as `*.test.ts`


**E2E Tests (Playwright):**
- Critical user flows only (auth, upload, outfit generation)
- Test file naming: `[feature].e2e.ts`
- Location: `tests/e2e/`


**Test Patterns:**
```ts
// Arrange - Act - Assert structure
// Descriptive test names: "should [action] when [condition]"
// Use factories for test data, not hardcoded values
```


---


## 2. PRD & Design References


### 2.1 PRD Document
**Location**: `project_memory/PRD.md` or GitHub Issues as source of truth


### 2.2 Core Features (from GitHub Issues)


| Issue | Feature | Priority | Sprint |
|-------|---------|----------|--------|
| #1 | Weather-Based Outfit Suggestion | High | 1 |
| #2 | Mood-Based Outfit Suggestion | High | 1 |
| #3 | Weather-Aware Piece Exclusion | High | 2 |
| #4 | Clothing Upload with AI Tagging | High | 1 |
| #5 | Outfit History Calendar | Medium | 2 |
| #6 | Individual Piece Swap | Medium | 2 |
| #7 | Onboarding Quiz Flow | High | 1 |
| #8 | User Authentication (Supabase) | High | 1 |
| #9 | Closet Grid with Filters | Medium | 2 |
| #10 | 7-Day Forecast Planning | Medium | 2 |
| #11 | Outfit Logging/Tracking | Medium | 2 |


### 2.3 Key UI Components


**ClosetItemCard:**
- Display: Thumbnail, name, category, color, warmth rating
- Actions: Edit, delete, quick-add to outfit
- State: Selected (for multi-select), hover, loading


**OutfitSuggestion:**
- Display: 3-4 items (top, bottom, shoes, optional outerwear)
- Weather badge: Current temp, conditions
- Actions: Accept, regenerate single piece, save, log worn
- Animation: Smooth transitions on piece swap


**WeatherWidget:**
- Display: Current temp, feels-like, high/low
- Icons: Dynamic based on conditions
- Forecast: Expandable 7-day view


**UploadFlow:**
- Steps: Image select → AI processing → Review tags → Save
- Progress: Step indicator, loading states
- AI tags: Editable before saving


### 2.4 User Flows


**Onboarding Flow:**
1. Welcome screen → 2. Quiz (style preferences, climate) → 3. Account creation → 4. First upload wardrobe.


**Daily Outfit Flow:**
1. Dashboard loads → 2. Fetch weather → 3. Generate outfit → 4. Display with options → 5. User accepts/logs/saves


**Upload Flow:**
1. Tap upload → 2. Select image → 3. AI analyzes → 4. Review/edit tags → 5. Save to closet


---


## 3. Scrum & Workflow Instructions


### 3.1 Branch Naming Convention


```
feature/#<issue-number>-<short-description>
bugfix/#<issue-number>-<short-description>
hotfix/<description>
chore/<description>
docs/<description>
```


**Examples:**
- `feature/#1-weather-outfit-suggestion`
- `bugfix/#4-upload-image-orientation`
- `chore/update-dependencies`


### 3.2 Commit Message Format


```
<type>(<scope>): <short summary>


<body - optional, for explaining why not what>


Refs: #<issue-number>
```


**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Formatting, no code change
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance tasks


**Examples:**
```
feat(outfit): implement weather-based filtering


Integrate OpenWeatherMap API to filter items by warmth rating
based on current temperature.


Refs: #1
```


### 3.3 PR Workflow


1. **Branch from `main`** - Keep updated: `git pull origin main`
2. **Reference issue** - PR title: `feat: Weather outfit suggestion (#1)`
3. **Include in PR description:**
   - What changed
   - How to test
   - Screenshots (for UI changes)
   - Refs: #<issue-number>
4. **Required checks:**
   - Unit tests pass (≥80% coverage)
   - E2E tests pass
   - TypeScript type check
   - Linting (ESLint + Prettier)
5. **Review requirements:**
   - At least 1 approval before merge
   - Address all review comments
   - Resolve conflicts before requesting review
6. **Merge method:** Squash and merge (clean history)


### 3.4 GitHub Issues Reference


**In Code:**
```ts
// TODO(#3): Implement precipitation-based exclusion
// FIXME(#6): Handle missing image gracefully
```


**In Commits/PRs:**
```
Refs: #1
Fixes: #1
Closes: #1
Related to: #3
```


---


## 4. Do's and Don'ts


### 4.1 Patterns to Follow


**DO:**
- Use Server Components for data fetching when possible
- Implement loading.tsx and error.tsx for each route
- Use `revalidatePath()` after mutations
- Implement proper error boundaries
- Use React Suspense for async components
- Follow Supabase RLS policies for security
- Validate all user inputs (Zod schemas)
- Use optimistic updates for better UX
- Implement proper image optimization (next/image)
- Use environment variables for all secrets/API keys
- Write accessible components (ARIA labels, keyboard nav)


### 4.2 Patterns to Avoid


**DON'T:**
- Don't use `'use client'` unnecessarily (start with Server Component)
- Don't fetch data in useEffect (use Server Components or SWR/React Query)
- Don't commit `.env` files (use `.env.example`)
- Don't use `any` types without explicit comment explaining why
- Don't nest ternaries beyond 2 levels (use early returns or switch)
- Don't store sensitive data in client-side state
- Don't make direct Supabase calls from client without RLS
- Don't use magic numbers (extract to named constants)
- Don't write tests that depend on external API calls (always mock)


### 4.3 Preferred Dependencies


**UI/Styling:**
- ✅ Framer Motion (animations - only when needed)
- ❌ Avoid: Bootstrap, Material-UI (inconsistent with design)


**Forms:**
- ✅ React Hook Form + Zod
- ❌ Avoid: Formik (heavier)


**Data Fetching:**
- ✅ Server Actions (Next.js)
- ✅ SWR or TanStack Query (client caching)
- ❌ Avoid: Axios (use native fetch)


**Date/Time:**
- ✅ date-fns (tree-shakeable)
- ❌ Avoid: Moment.js (bloated)


**Icons:**
- ✅ Lucide React (shadcn default)
- ❌ Avoid: FontAwesome (extra bundle size)


### 4.4 Security & Accessibility


**Security:**
- All Supabase queries must respect RLS policies
- Validate file types before upload (images only: jpg, png, webp)
- Sanitize user-generated content
- Never expose API keys in client code (only public keys)
- Use `next/headers` for auth in Server Components


**Accessibility (a11y):**
- Minimum contrast ratio: 4.5:1
- All interactive elements keyboard accessible
- Focus visible states on all buttons/links
- Alt text for all clothing item images
- Use semantic HTML (button vs div)
- ARIA labels for icon-only buttons
- Test with screen reader before marking complete


---


## 5. Quick Reference


**Run Tests:**
```bash
npm test:unit        # Vitest
npm test:e2e         # Playwright
npm test:coverage    # Coverage report
```


**Database:**
```bash
npm supabase:types   # Generate TypeScript types
```


**Linting:**
```bash
npm lint             # ESLint
npm lint:fix         # Auto-fix
npm format           # Prettier
npm typecheck        # TypeScript
```


**Useful Links:**
- PRD: `/project_memory/`
- Issues: https://github.com/iamtheretronerd/drip/issues
- Supabase Dashboard: (check .env.local)
- OpenWeatherMap Docs: https://openweathermap.org/api


