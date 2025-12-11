-- Add avatar_url to profiles table
-- This handles the case where the column is missing in the production DB despite being in types.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Notify schema reload
NOTIFY pgrst, 'reload config';
