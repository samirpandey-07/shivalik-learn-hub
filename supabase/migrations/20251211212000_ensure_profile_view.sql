-- Force RLS to allow admins to see everything in profiles
-- This is redundant if "public" can see everything, but good for safety if public policy was reverted

CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.user_roles 
            WHERE role IN ('admin', 'superadmin')
        )
    );

-- Also ensuring the column isn't hidden by specific column grants (Postgres doesn't usually do this by default but good to know)

-- Let's also update the "public read" policy just in case
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

-- Notify schema reload
NOTIFY pgrst, 'reload config';
