-- Fix RLS for Resource Ratings (Reviews)
-- Allows meaningful interaction with the review system.

ALTER TABLE public.resource_ratings ENABLE ROW LEVEL SECURITY;

-- 1. DROP RESTRICTIVE POLICIES
DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON public.resource_ratings;
DROP POLICY IF EXISTS "Users can insert ratings" ON public.resource_ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON public.resource_ratings;
DROP POLICY IF EXISTS "Users can delete own ratings" ON public.resource_ratings;

-- 2. CREATE PERMISSIVE POLICIES

-- Everyone can read reviews
CREATE POLICY "Ratings are viewable by everyone"
ON public.resource_ratings FOR SELECT
USING (true);

-- Authenticated users can write reviews
CREATE POLICY "Users can insert ratings"
ON public.resource_ratings FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Review authors can update their own reviews
CREATE POLICY "Users can update own ratings"
ON public.resource_ratings FOR UPDATE
USING (auth.uid() = user_id);

-- Review authors can delete their own reviews
CREATE POLICY "Users can delete own ratings"
ON public.resource_ratings FOR DELETE
USING (auth.uid() = user_id);
