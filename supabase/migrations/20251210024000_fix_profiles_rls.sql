-- Fix Profiles Privacy for Chat
-- Users see "Unknown User" because they cannot Query other users' profiles to get their names.
-- We must allow authenticated users to SELECT from public.profiles.

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a permissive policy for reading profiles (needed for Chat, Leaderboards, etc.)
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- Ensure updates remain private (unchanged usually, but good to be safe)
-- (Existing update policies are likely fine, we only touched SELECT)
