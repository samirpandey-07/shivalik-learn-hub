-- Emergency Schema Repair & robust handle_new_user
-- This migration ensures that recent schema changes are definitely applied
-- and updates the trigger to be maximally permissive to prevent signup blocking.

-- 1. Ensure profiles has 'role' column (text)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'student';
    END IF;
END $$;

-- 2. Ensure profiles has 'coins' column (bigint)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'coins') THEN
        ALTER TABLE public.profiles ADD COLUMN coins bigint DEFAULT 0;
    END IF;
END $$;

-- 3. Ensure profiles has 'is_banned' column (boolean)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_banned') THEN
        ALTER TABLE public.profiles ADD COLUMN is_banned boolean DEFAULT false;
    END IF;
END $$;

-- 4. Ensure profiles has 'updated_at' column (timestamptz)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- 5. Redefine handle_new_user with maximum safety
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- 1. Insert into profiles (Minimal required fields + safe defaults)
  -- We wrap this in a block to ensure we can debug if it fails, 
  -- although failing here usually means the user can't be created properly.
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    -- Safely extraction of metadata
    COALESCE(
      (NEW.raw_user_meta_data ->> 'full_name'), 
      (NEW.raw_user_meta_data ->> 'name'), 
      (NEW.raw_user_meta_data ->> 'user_name'),
      NEW.email -- Fallback to email if name is missing
    ),
    (NEW.raw_user_meta_data ->> 'avatar_url'),
    'student' -- Explicit default
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = now();

  -- 2. Legacy User Roles Table (Optional / Deprecated)
  -- We prioritize the 'role' column in profiles, but keep this for backward compatibility.
  -- We swallow errors here to ensure signup never fails due to legacy table issues.
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Just log warning, do not fail transaction
    RAISE WARNING 'Legacy user_roles insert failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 6. Ensure trigger is enabled
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
