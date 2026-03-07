-- Drip App: Clothing Items & Storage Migration
-- Run this SQL in your Supabase SQL Editor

-- ============================================================
-- CLOTHING_ITEMS TABLE
-- Stores wardrobe items with AI analysis status
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clothing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_analysis' CHECK (status IN ('pending_analysis', 'analyzing', 'analyzed', 'error')),
  category TEXT,
  color TEXT,
  style_tags TEXT[],
  weather_suitability TEXT[],
  is_onboarding_item BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- PROFILES TABLE ADDITIONS
-- Adding onboarding fields
-- ============================================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS lifestyle TEXT,
ADD COLUMN IF NOT EXISTS weather_sensitivity TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT,
ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS lon DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS city_name TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;

-- Clothing items: users can read their own items
CREATE POLICY "clothing_items_select_own"
ON public.clothing_items FOR SELECT
USING (auth.uid() = user_id);

-- Clothing items: users can insert their own items
CREATE POLICY "clothing_items_insert_own"
ON public.clothing_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Clothing items: users can update their own items
CREATE POLICY "clothing_items_update_own"
ON public.clothing_items FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Clothing items: users can delete their own items
CREATE POLICY "clothing_items_delete_own"
ON public.clothing_items FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET: wardrobe-raw
-- Stores raw uploaded images before AI processing
-- ============================================================
-- Note: Create bucket via Supabase Dashboard or use Storage API
-- Bucket policy: Authenticated users can upload to their own folder
