-- Fix: Ensure onboarding_completed column exists on profiles
-- and reload PostgREST schema cache so it recognizes the column.
--
-- Run this in Supabase SQL Editor.

-- Add column if it doesn't already exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Also ensure all other profile columns added outside migrations exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lifestyle TEXT,
  ADD COLUMN IF NOT EXISTS weather_sensitivity TEXT,
  ADD COLUMN IF NOT EXISTS priority TEXT,
  ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lon DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS city_name TEXT;

-- RPC function to mark onboarding complete (bypasses PostgREST column cache)
CREATE OR REPLACE FUNCTION public.complete_onboarding()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET onboarding_completed = true
  WHERE id = auth.uid();
END;
$$;

-- RPC function to check onboarding status (bypasses PostgREST column cache)
CREATE OR REPLACE FUNCTION public.is_onboarding_completed()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  result boolean;
BEGIN
  SELECT onboarding_completed INTO result
  FROM public.profiles
  WHERE id = auth.uid();
  RETURN COALESCE(result, false);
END;
$$;

-- CRITICAL: Reload PostgREST schema cache so it picks up new columns + function
NOTIFY pgrst, 'reload schema';
