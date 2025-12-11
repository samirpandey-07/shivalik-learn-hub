-- Fix RLS to allow reading of Profile data (Names, Avatars)
-- This is necessary for Audit Logs, Chat, and Forums to display user names instead of "Unknown"

-- 1. Drop potentially restrictive policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 2. Create a permissive Select policy
-- This allows any user (authenticated or anon if public access is desired, usually auth) to read profile info.
-- We use 'true' to allow everyone to see names/avatars.
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);
