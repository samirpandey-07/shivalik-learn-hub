-- Debug RPC to inspect posts
CREATE OR REPLACE FUNCTION public.debug_inspect_posts()
RETURNS TABLE (
  id uuid,
  content text,
  community_id uuid,
  user_id uuid,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id, 
    cp.content, 
    cp.community_id, 
    cp.user_id, 
    cp.created_at
  FROM public.community_posts cp
  ORDER BY cp.created_at DESC
  LIMIT 10;
END $$;
