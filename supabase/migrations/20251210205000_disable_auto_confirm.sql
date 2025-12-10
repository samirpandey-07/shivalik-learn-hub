-- Disable Auto-Confirm Users
-- This migration updates the handle_new_user trigger to REMOVE the auto-confirmation logic.
-- Users will now be required to click the verification link sent to their email.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  -- 1. Try to insert profile (Soft Fail Logic)
  -- We wrap this in a block to ensure we can debug if it fails, 
  -- although failing here usually means the user can't be created properly.
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role, coins, is_banned, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(
        NEW.raw_user_meta_data ->> 'full_name', 
        NEW.raw_user_meta_data ->> 'name', 
        NEW.raw_user_meta_data ->> 'user_name',
        NEW.email
      ),
      NEW.raw_user_meta_data ->> 'avatar_url',
      'student',
      0,
      false,
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
      updated_at = now();

    -- Legacy user_roles insert (Optional)
    BEGIN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'student')
      ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
       -- Ignore user_roles error
       NULL;
    END;

  EXCEPTION WHEN OTHERS THEN
    -- Log warning but do NOT fail, allowing the user account to exist
    RAISE WARNING 'handle_new_user failed to create profile: %. Proceeding.', SQLERRM;
  END;

  -- REMOVED: Auto-confirm block
  -- Users must now verify email via link.

  RETURN NEW;
END;
$$;
