-- Force add comment column to resource_ratings
-- This handles the case where previous migrations might have been skipped or the table state is inconsistent.

ALTER TABLE public.resource_ratings 
ADD COLUMN IF NOT EXISTS comment TEXT;

-- Explicitly notify PostgREST to reload schema cache (just in case)
NOTIFY pgrst, 'reload config';
