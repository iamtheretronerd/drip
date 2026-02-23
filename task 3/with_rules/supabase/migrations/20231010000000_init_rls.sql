-- Create a table for wardrobe items
CREATE TABLE IF NOT EXISTS public.wardrobe_items (
    id UUID DEFAULT auth.uid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on the table
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

-- 1. Users can only select/read their own wardrobe items
CREATE POLICY "Users can view their own wardrobe items"
    ON public.wardrobe_items 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- 2. Users can only insert their own wardrobe items
CREATE POLICY "Users can insert their own wardrobe items"
    ON public.wardrobe_items 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 3. Users can only update their own wardrobe items
CREATE POLICY "Users can update their own wardrobe items"
    ON public.wardrobe_items 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- 4. Users can only delete their own wardrobe items
CREATE POLICY "Users can delete their own wardrobe items"
    ON public.wardrobe_items 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- (Optional) Example: Profiles Table linked to auth.users
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles 
    FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id);
