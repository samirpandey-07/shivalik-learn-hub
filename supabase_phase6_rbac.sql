-- Phase 6: Role-Based Access Control (RBAC) Migration
-- Run this in your Supabase SQL Editor

-- 1. Ensure 'role' column exists in profiles (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'student' CHECK (role IN ('student', 'admin', 'superadmin'));
    END IF;
END $$;

-- 2. Create Helper Function to Check Roles
CREATE OR REPLACE FUNCTION public.has_role(required_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = required_role
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_super()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin')
  );
END;
$$;

-- 3. Update RLS Policies for 'resources' table

-- Drop existing policies to avoid conflicts (clean slate for resources permissions)
DROP POLICY IF EXISTS "Public can view approved resources" ON public.resources;
DROP POLICY IF EXISTS "Users can upload resources" ON public.resources;
DROP POLICY IF EXISTS "Admins can update resources" ON public.resources;
DROP POLICY IF EXISTS "Admins can delete resources" ON public.resources;

-- Policy 1: read_all
-- Everyone can read approved resources. Admins/Superadmins can read ALL resources (pending or approved).
CREATE POLICY "read_resources" ON public.resources
FOR SELECT
USING (
  status = 'approved' 
  OR 
  auth.uid() = uploader_id
  OR
  public.is_admin_or_super()
);

-- Policy 2: insert_own
-- Authenticated users (students) can upload resources.
CREATE POLICY "insert_resources" ON public.resources
FOR INSERT
WITH CHECK (
  auth.uid() = uploader_id
);

-- Policy 3: update_own_or_admin
-- Users can update their own resource (e.g. fix typo). Admins can update any (e.g. approve).
CREATE POLICY "update_resources" ON public.resources
FOR UPDATE
USING (
  auth.uid() = uploader_id
  OR
  public.is_admin_or_super()
);

-- Policy 4: delete_own_or_admin
-- Users can delete their own. Admins can delete any.
CREATE POLICY "delete_resources" ON public.resources
FOR DELETE
USING (
  auth.uid() = uploader_id
  OR
  public.is_admin_or_super()
);

-- 4. Update RLS Policies for 'profiles' table
-- We want Superadmins to be able to edit OTHER profiles (to ban/promote).

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "update_profiles" ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id
  OR
  public.has_role('superadmin') -- Superadmin can edit anyone
);

-- 5. Create 'reports' table for the new feature
CREATE TABLE IF NOT EXISTS public.reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    resource_id uuid REFERENCES public.resources(id) ON DELETE CASCADE,
    reason text NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_read_reports" ON public.reports FOR SELECT USING (public.is_admin_or_super());
CREATE POLICY "users_create_reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "admins_update_reports" ON public.reports FOR UPDATE USING (public.is_admin_or_super());

-- End of Migration
