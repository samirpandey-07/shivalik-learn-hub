-- Add comment support to resource ratings
ALTER TABLE IF EXISTS public.resource_ratings 
ADD COLUMN IF NOT EXISTS comment TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Enable Realtime for ratings
alter publication supabase_realtime add table resource_ratings;
