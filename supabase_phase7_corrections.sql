-- Phase 7 Corrections: Missing Tables & Policies
-- Run this in your Supabase SQL Editor

-- 1. Create 'saved_resources' Table
CREATE TABLE IF NOT EXISTS public.saved_resources (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    resource_id uuid REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, resource_id) -- Prevent duplicate saves
);

ALTER TABLE public.saved_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved resources" 
ON public.saved_resources FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved resources" 
ON public.saved_resources FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved resources" 
ON public.saved_resources FOR DELETE 
USING (auth.uid() = user_id);


-- 2. Create 'user_activity' Table (for History/Recents)
CREATE TABLE IF NOT EXISTS public.user_activity (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    resource_id uuid REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    action text NOT NULL, -- 'view', 'download', etc.
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity" 
ON public.user_activity FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" 
ON public.user_activity FOR INSERT 
WITH CHECK (auth.uid() = user_id);


-- 3. Fix 'profiles' RLS (Ensure users can read their own profile to see their role)
-- Just in case it was missing or restrictive
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow Admins/Superadmins to view ALL profiles (needed for Admin Dashboard)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  public.is_admin_or_super()
);
