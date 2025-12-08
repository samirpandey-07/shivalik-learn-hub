-- Phase 8: Fix Admin Permissions & Saved Resources
-- Run this in your Supabase SQL Editor

-- 1. Enforce Profile Update Policy for Superadmins
-- This ensures 'superadmin' can update ANY profile (needed to dismiss admins)
DROP POLICY IF EXISTS "update_profiles" ON public.profiles;

CREATE POLICY "update_profiles" 
ON public.profiles 
FOR UPDATE
USING (
  auth.uid() = id 
  OR 
  public.has_role('superadmin') -- The crucial part
);

-- 2. Ensure 'saved_resources' table is fully accessible to users
-- Just in case policies were missing or incorrect
ALTER TABLE public.saved_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own saved resources" ON public.saved_resources;
CREATE POLICY "Users can view own saved resources" 
ON public.saved_resources FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved resources" ON public.saved_resources;
CREATE POLICY "Users can insert own saved resources" 
ON public.saved_resources FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved resources" ON public.saved_resources;
CREATE POLICY "Users can delete own saved resources" 
ON public.saved_resources FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Cleanup: Drop 'bookmarks' table if it exists to avoid confusion
-- We have migrated to 'saved_resources'
DROP TABLE IF EXISTS public.bookmarks;
