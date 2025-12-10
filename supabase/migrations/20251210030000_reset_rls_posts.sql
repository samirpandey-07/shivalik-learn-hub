-- Aggressive RLS Reset for Community Posts
-- Ensure NO legacy policies conflict.

DO $$
BEGIN
  -- Drop known potential policies
  DROP POLICY IF EXISTS "Members can view posts" ON public.community_posts;
  DROP POLICY IF EXISTS "Authenticated users can view posts" ON public.community_posts;
  -- Add any other names I might have used
  DROP POLICY IF EXISTS "Users can view posts" ON public.community_posts;
END $$;

-- Re-create the single permissive policy
CREATE POLICY "Authenticated users can view posts" ON public.community_posts
    FOR SELECT USING (auth.role() = 'authenticated');

-- Verify INSERT policy (keep strict)
-- If it doesn't exist, create it. If it does, leave it.
-- Actually, let's just make it permissive for invalidation debugging? 
-- No, user said posting works. Don't break it.
