-- Add is_banned column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- Create policy to prevent banned users from inserting/updating data
-- (Note: Preventing SELECT might break the UI entirely for them, better to show a "Banned" screen)

-- Create a function to ban/unban users (secure way for admins to call)
CREATE OR REPLACE FUNCTION public.toggle_ban_user(target_user_id UUID, ban_status BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with superuser privileges
AS $$
BEGIN
  -- Check if the executor is an admin (or superadmin)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Access denied. Only admins can ban users.';
  END IF;

  -- Update the target user's profile
  UPDATE public.profiles
  SET is_banned = ban_status
  WHERE id = target_user_id;
END;
$$;
