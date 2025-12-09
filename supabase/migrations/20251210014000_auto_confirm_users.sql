-- Auto-Confirm Users Fix
-- This migration updates the handle_new_user trigger to AUTOMATICALLY confirm new users.
-- This bypasses the need for email verification, which is failing for the user.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  -- 1. Try to insert profile (Soft Fail Logic from previous fix)
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
      avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
      updated_at = now();
    
    -- Legacy user_roles insert
    BEGIN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'student')
      ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
       NULL;
    END;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed to create profile: %. Proceeding.', SQLERRM;
  END;

  -- 2. AUTO-CONFIRM USER
  -- This updates the auth.users table to set email_confirmed_at
  -- We do this inside a separate block to ensure it doesn't crash the trigger if permission fails
  BEGIN
    UPDATE auth.users
    SET email_confirmed_at = now()
    WHERE id = NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to auto-confirm user: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Ensure trigger is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
