-- Create Debug RPC
CREATE OR REPLACE FUNCTION public.debug_get_realtime_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_in_pub BOOLEAN;
  policy_list TEXT;
  replica_ident TEXT;
BEGIN
  -- 1. Check if table is in 'supabase_realtime' publication
  SELECT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'community_posts'
  ) INTO is_in_pub;

  -- 2. Get list of active policies on community_posts
  SELECT COALESCE(string_agg(policyname, ' | '), 'NONE') 
  INTO policy_list 
  FROM pg_policies 
  WHERE tablename = 'community_posts';

  -- 3. Check Replica Identity
  SELECT CASE relreplident
    WHEN 'd' THEN 'default'
    WHEN 'n' THEN 'nothing'
    WHEN 'f' THEN 'full'
    WHEN 'i' THEN 'index'
    ELSE 'unknown'
  END INTO replica_ident
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'community_posts';

  RETURN jsonb_build_object(
    'in_realtime_pub', is_in_pub,
    'replica_identity', replica_ident,
    'policies', policy_list
  );
END $$;
