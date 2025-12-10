-- Force Replica Identity Full
-- This ensures that Supabase Realtime has access to ALL columns when applying filters (like community_id=eq...).
-- Without this, sometimes updates/deletes might not trigger filters correctly, or even Inserts if optimization is aggressive.

ALTER TABLE public.community_posts REPLICA IDENTITY FULL;
ALTER TABLE public.community_members REPLICA IDENTITY FULL;

-- Re-verify publication membership (Idempotent check via DO block)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_members;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END;
$$;
