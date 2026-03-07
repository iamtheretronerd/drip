-- Drip App: Clothing Items Schema Update
-- Adds detailed classification fields for proper outfit styling
-- Run this SQL in your Supabase SQL Editor

-- ============================================================
-- ADD NEW COLUMNS to clothing_items
-- ============================================================

-- Descriptive name for the item
ALTER TABLE public.clothing_items ADD COLUMN IF NOT EXISTS name TEXT;

-- Primary type: top, bottom, outerwear, one_piece, shoes, accessory
ALTER TABLE public.clothing_items ADD COLUMN IF NOT EXISTS type TEXT;

-- Specific sub-type: hoodie, blazer, sneakers, maxi_dress, jumpsuit, etc.
ALTER TABLE public.clothing_items ADD COLUMN IF NOT EXISTS sub_type TEXT;

-- Secondary color for patterns or two-tone items
ALTER TABLE public.clothing_items ADD COLUMN IF NOT EXISTS secondary_color TEXT;

-- Pattern: solid, striped, plaid, floral, graphic, abstract, camo, polka_dot
ALTER TABLE public.clothing_items ADD COLUMN IF NOT EXISTS pattern TEXT DEFAULT 'solid';

-- Material/fabric: cotton, denim, leather, wool, polyester, silk, linen, knit, fleece, nylon
ALTER TABLE public.clothing_items ADD COLUMN IF NOT EXISTS material TEXT;

-- Formality level: casual, smart_casual, business_casual, formal, athletic
ALTER TABLE public.clothing_items ADD COLUMN IF NOT EXISTS formality TEXT DEFAULT 'casual';

-- Warmth rating 1-5 (1=very light, 5=heavy winter)
ALTER TABLE public.clothing_items ADD COLUMN IF NOT EXISTS warmth_rating INTEGER DEFAULT 3;

-- Seasons the item is suitable for
ALTER TABLE public.clothing_items ADD COLUMN IF NOT EXISTS seasons TEXT[] DEFAULT '{spring,summer,fall,winter}';

-- Layer type: base, mid, outer (critical for outfit assembly)
ALTER TABLE public.clothing_items ADD COLUMN IF NOT EXISTS layer_type TEXT DEFAULT 'base';

-- Fit: slim, regular, loose, oversized
ALTER TABLE public.clothing_items ADD COLUMN IF NOT EXISTS fit TEXT DEFAULT 'regular';

-- Occasion tags: everyday, work, date_night, gym, lounge, outdoor, party, travel
ALTER TABLE public.clothing_items ADD COLUMN IF NOT EXISTS occasion_tags TEXT[] DEFAULT '{everyday}';

-- ============================================================
-- DROP old columns that are no longer used
-- (category is replaced by type, style_tags by occasion_tags,
--  weather_suitability by warmth_rating + seasons)
-- ============================================================
-- Note: Only drop if you haven't stored data in these yet
-- ALTER TABLE public.clothing_items DROP COLUMN IF EXISTS category;
-- ALTER TABLE public.clothing_items DROP COLUMN IF EXISTS style_tags;
-- ALTER TABLE public.clothing_items DROP COLUMN IF EXISTS weather_suitability;
