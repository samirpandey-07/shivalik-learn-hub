-- Fix toggle_ban_user permission check
-- The previous version checked 'user_roles' table, but we have migrated to 'profiles.role'.
-- This update ensures admins can actually ban users.

CREATE OR REPLACE FUNCTION public.toggle_ban_user(target_user_id UUID, ban_status BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with superuser privileges
AS $$
BEGIN
  -- Check if the executor is an admin (or superadmin)
  -- We check the profiles table for the 'role' column
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  ) THEN
    -- Fallback check for legacy user_roles (just in case)
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    ) THEN
      RAISE EXCEPTION 'Access denied. Only admins can ban users.';
    END IF;
  END IF;

  -- 2. Prevent banning Superadmins (Safety Check)
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = target_user_id
    AND role = 'superadmin'
  ) THEN
     RAISE EXCEPTION 'Cannot ban a Superadmin.';
  END IF;

  -- Update the target user's profile
  UPDATE public.profiles
  SET is_banned = ban_status
  WHERE id = target_user_id;
END;
$$;
