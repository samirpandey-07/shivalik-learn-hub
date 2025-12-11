-- Ensure resource_ratings table exists
CREATE TABLE IF NOT EXISTS public.resource_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    resource_id UUID REFERENCES public.resources(id) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, resource_id)
);

-- Enable RLS
ALTER TABLE public.resource_ratings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view all ratings" ON public.resource_ratings;
CREATE POLICY "Users can view all ratings"
    ON public.resource_ratings
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own ratings" ON public.resource_ratings;
CREATE POLICY "Users can insert their own ratings"
    ON public.resource_ratings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own ratings" ON public.resource_ratings;
CREATE POLICY "Users can update their own ratings"
    ON public.resource_ratings
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own ratings" ON public.resource_ratings;
CREATE POLICY "Users can delete their own ratings"
    ON public.resource_ratings
    FOR DELETE
    USING (auth.uid() = user_id);
