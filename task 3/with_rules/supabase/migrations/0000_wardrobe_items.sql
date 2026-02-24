-- Create the wardrobe_items table
CREATE TABLE IF NOT EXISTS public.wardrobe_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

-- Create policies

-- 1. Users can ONLY read their own wardrobe items
CREATE POLICY "Users can view their own wardrobe items"
ON public.wardrobe_items
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Users can ONLY insert their own wardrobe items
CREATE POLICY "Users can insert their own wardrobe items"
ON public.wardrobe_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Users can ONLY update their own wardrobe items
CREATE POLICY "Users can update their own wardrobe items"
ON public.wardrobe_items
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Users can ONLY delete their own wardrobe items
CREATE POLICY "Users can delete their own wardrobe items"
ON public.wardrobe_items
FOR DELETE
USING (auth.uid() = user_id);
