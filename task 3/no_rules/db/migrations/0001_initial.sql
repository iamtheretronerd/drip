-- Create wardrobe_items table
CREATE TABLE wardrobe_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;

-- Create policies ensuring users can only read, insert, update, and delete their own rows
CREATE POLICY "Users can insert their own items"
ON wardrobe_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own items"
ON wardrobe_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
ON wardrobe_items FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
ON wardrobe_items FOR DELETE
USING (auth.uid() = user_id);
