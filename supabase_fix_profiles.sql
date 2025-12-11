-- MASTER FIX: Profiles & Permissions
-- Run this script in your Supabase SQL Editor to fix "Unknown User" issues.

-- 1. ENABLE PUBLIC READ ACCESS TO PROFILES
-- This allows everyone to see names/avatars in Chat, Forums, and Audit Logs.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- Ensure users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 2. REPAIR NEW USER TRIGGER
-- Ensures every new signup automatically gets a profile.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    'student',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING; -- If exists, do nothing (safe)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. BACKFILL MISSING PROFILES
-- IMPORTANT: This finds any user who exists in Auth but is missing from Profiles and fixes them.
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', 'Restored User'),
  'student'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 4. LOG RESULT
DO $$
DECLARE
    missing_count int;
BEGIN
    SELECT count(*) INTO missing_count FROM auth.users WHERE id NOT IN (SELECT id FROM public.profiles);
    RAISE NOTICE 'Fixed permissions and backfilled profiles. Remaining missing profiles: %', missing_count;
END $$;
