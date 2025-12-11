-- RPC to get total downloads count efficiently
CREATE OR REPLACE FUNCTION get_total_downloads()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COALESCE(SUM(downloads), 0)::INTEGER FROM public.resources WHERE status = 'approved');
END;
$$ LANGUAGE plpgsql STABLE;

-- Notify schema reload
NOTIFY pgrst, 'reload config';
