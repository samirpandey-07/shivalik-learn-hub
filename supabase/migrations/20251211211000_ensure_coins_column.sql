-- Ensure coins column exists in profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;

-- Notify schema reload
NOTIFY pgrst, 'reload config';
