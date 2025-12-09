-- Fix handle_new_user function to be more robust and prevent signup errors
-- 1. Ensure profiles are created/updated correctly
-- 2. Handle missing metadata gracefully
-- 3. Prevent failure if user_roles table has issues (legacy support)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert into profiles with safe defaults
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    -- Use name from metadata, or fallback to available name fields
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'user_name'),
    NEW.raw_user_meta_data ->> 'avatar_url',
    'student' -- Default role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = now();

  -- Try to insert into user_roles for compatibility, but don't fail signup if it errors
  -- This protects against cases where user_roles table might be missing or have issues
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but continue
    RAISE WARNING 'Failed to insert into user_roles: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Ensure trigger is correctly set
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
