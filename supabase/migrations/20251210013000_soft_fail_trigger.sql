-- Soft Fail Trigger Fix
-- This migration wraps the entire handle_new_user logic in a try-catch block.
-- If ANY error occurs during profile creation, we catch it, log a warning,
-- and allow the auth.users insertion to proceed.
-- The frontend (AuthProvider) has fallback logic to create the profile if it's missing on login.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions -- explicitly include extensions for uuid functions
AS $$
BEGIN
  BEGIN
    -- 1. Try to insert profile
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

    -- 2. Try to insert user_role (legacy)
    BEGIN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'student')
      ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
       -- Ignore user_roles error
    END;

  EXCEPTION WHEN OTHERS THEN
    -- KEY FIX: Catch ALL errors in profile creation.
    -- Log the error for admin debug, but RETURN NEW so auth user is still created.
    RAISE WARNING 'handle_new_user failed to create profile: %. Proceeding with auth user creation.', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Ensure trigger is correctly attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
