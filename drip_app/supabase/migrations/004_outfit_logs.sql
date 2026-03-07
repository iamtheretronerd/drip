-- Drip App: Outfit Logs & Rotation Tracking
-- Run this SQL in your Supabase SQL Editor

-- ============================================================
-- OUTFIT LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.outfit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  item_ids UUID[] NOT NULL,
  mood_input TEXT,
  weather_snapshot JSONB,
  was_modified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.outfit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own outfit logs
CREATE POLICY "Users can view own outfit logs"
  ON public.outfit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outfit logs"
  ON public.outfit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outfit logs"
  ON public.outfit_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own outfit logs"
  ON public.outfit_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- ROTATION COLUMNS on clothing_items
-- ============================================================
ALTER TABLE public.clothing_items
  ADD COLUMN IF NOT EXISTS last_worn DATE,
  ADD COLUMN IF NOT EXISTS times_worn INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS consecutive_days_worn INTEGER DEFAULT 0;
