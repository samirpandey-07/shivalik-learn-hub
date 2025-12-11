-- Ensure downloads column exists in resources
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS downloads INTEGER DEFAULT 0;

-- Ensure downloads isn't null for existing rows
UPDATE public.resources SET downloads = 0 WHERE downloads IS NULL;

-- Create an optimized index for approved resources (optional but good for performance)
CREATE INDEX IF NOT EXISTS idx_resources_status_downloads ON public.resources(status) INCLUDE (downloads);

-- Create a secure RPC to delete users if not exists (mentioned in useAdmin.ts)
CREATE OR REPLACE FUNCTION delete_user_account(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete from auth.users (cascade should handle the rest if set up correctly, but strict deletion is safer)
  -- BUT standard RLS/Postgres doesn't allow deleting from auth.users directly via public RPC usually.
  -- Instead, we just delete from public.profiles and let triggers/foreign keys handle it, OR use a service role wrapper.
  -- For now, we will just delete from profiles.
  DELETE FROM public.profiles WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notify schema reload
NOTIFY pgrst, 'reload config';
