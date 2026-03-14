# Code Documentation Strategy

Our codebase utilizes significant in-line and structural documentation, generated contextually by our AI IDE assistant.

## General Strategy
- **Self-Documenting Functions:** Rather than lengthy generic block comments, functions (such as `filterWardrobe` or `fallbackOutfit` in `lib/outfit-engine.ts`) rely on explicit strong TypeScript typings (`ClothingItem`, `WeatherData`) so hover states within an IDE instantly provide parameter signatures.
- **AI-Managed Type Generation:** Supabase tools programmatically manage database interfaces inside `types/database.d.ts`.
- **In-Line Rationale:** Intricate data flows or fallback logic, particularly within AI calls like the Gemini prompts inside `/api/analyze-clothing` and `/api/generate-outfit`, contain dense in-line explanations clarifying *why* the AI receives a specific system prompt configuration or fallback routine.

## Folder Directory Strategy
The Next.js App Router enforces an implicit structure, but we documented specific libraries for clarity:
- `lib/actions/`: Segregates all Server Actions.
- `lib/supabase/`: Wrappers for standardizing client and server auth interactions.
- `lib/validations/`: Centralizes Zod schema models to enforce input types.

By coupling well-typed files with clear file paths, the repository functions cohesively as its own structural documentation.
