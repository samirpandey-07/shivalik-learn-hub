-- RPC to increment downloads atomically
CREATE OR REPLACE FUNCTION increment_downloads(resource_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.resources
  SET downloads = COALESCE(downloads, 0) + 1
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Limit access (optional, public is usually fine for this if logic is simple)
GRANT EXECUTE ON FUNCTION increment_downloads TO authenticated, anon;

-- Notify schema reload
NOTIFY pgrst, 'reload config';
