-- Enable pgcrypto for UUIDs if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create an example wardrobe_items table
CREATE TABLE public.wardrobe_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row-Level Security on the table
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- Row Level Security (RLS) Policies
-- ----------------------------------------------------

-- Allow users to SELECT only their own rows
CREATE POLICY "Users can read own wardrobe items" 
ON public.wardrobe_items 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to INSERT rows, restricted to their own user_id
CREATE POLICY "Users can insert own wardrobe items" 
ON public.wardrobe_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE only their own rows
CREATE POLICY "Users can update own wardrobe items" 
ON public.wardrobe_items 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to DELETE only their own rows
CREATE POLICY "Users can delete own wardrobe items" 
ON public.wardrobe_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Optional: Create an updated_at trigger if needed for future rows
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wardrobe_items_updated_at
BEFORE UPDATE ON public.wardrobe_items
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
