-- Drip App: Auth Schema Migration
-- Run this SQL in your Supabase SQL Editor

-- ============================================================
-- PROFILES TABLE
-- Extends Supabase auth.users with app-specific user data.
-- A row is auto-created via trigger on new user signup.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  location    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- ONBOARDING RESPONSES TABLE
-- Stores the user's quiz answers from the onboarding flow.
-- Referenced by the outfit suggestion engine.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.onboarding_responses (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  typical_day          TEXT,
  location             TEXT,
  weather_sensitivity  TEXT,
  outfit_priority      TEXT,
  completed_at         TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- All tables are locked down — users can only access their own rows.
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Profiles: users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Onboarding: users can read their own responses
CREATE POLICY "onboarding_select_own"
  ON public.onboarding_responses FOR SELECT
  USING (auth.uid() = user_id);

-- Onboarding: users can insert their own responses
CREATE POLICY "onboarding_insert_own"
  ON public.onboarding_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Onboarding: users can update their own responses (for re-quiz)
CREATE POLICY "onboarding_update_own"
  ON public.onboarding_responses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: Auto-create profile row on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists (idempotent re-runs)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
