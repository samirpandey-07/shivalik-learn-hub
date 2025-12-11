-- FIX V2: Update Empty/Null Profiles (Name & Email Only)
-- This script matches profiles with their auth.users data and populates missing fields.
-- We skipped avatar_url to ensure this runs without column errors.

DO $$
DECLARE
    updated_count int;
BEGIN
    -- Update profiles where email or full_name is missing
    WITH updates AS (
        UPDATE public.profiles
        SET 
            email = u.email,
            full_name = COALESCE(
                public.profiles.full_name, 
                u.raw_user_meta_data->>'full_name', 
                u.raw_user_meta_data->>'name',
                'User ' || substring(u.id::text, 1, 6)
            )
        FROM auth.users u
        WHERE public.profiles.id = u.id
        AND (public.profiles.email IS NULL OR public.profiles.full_name IS NULL OR public.profiles.full_name = '')
        RETURNING public.profiles.id
    )
    SELECT count(*) INTO updated_count FROM updates;

    RAISE NOTICE 'Updated % profiles with missing data.', updated_count;
END $$;
