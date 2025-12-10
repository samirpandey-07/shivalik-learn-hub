-- Fix Realtime for Communities
-- 1. Add community_members to publication so member count updates work.
-- 2. Simplify SELECT policy for community_posts to avoid complex RLS joins blocking Realtime events.

-- Add Tables to Realtime Publication using DO blocks for safe execution
DO $$
BEGIN
  -- Check and add community_members
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_members;
  EXCEPTION WHEN duplicate_object THEN
    NULL; -- already exists
  END;
END;
$$;

DO $$
BEGIN
  -- Ensure community_posts is there
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END;
$$;

-- Simplify RLS for Reliable Realtime Delivery
DROP POLICY IF EXISTS "Members can view posts" ON public.community_posts;

-- Re-create policy efficiently
-- First check if it exists (implicit via Drop If Exists, but good to be clean)
CREATE POLICY "Authenticated users can view posts" ON public.community_posts
    FOR SELECT USING (auth.role() = 'authenticated');
