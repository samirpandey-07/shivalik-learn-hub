-- FIX: Update Empty/Null Profiles
-- This script matches profiles with their auth.users data and populates missing fields.

DO $$
DECLARE
    updated_count int;
BEGIN
    -- Update profiles where email or full_name is missing
    WITH updates AS (
        UPDATE public.profiles p
        SET 
            email = u.email,
            full_name = COALESCE(
                p.full_name, 
                u.raw_user_meta_data->>'full_name', 
                u.raw_user_meta_data->>'name',
                'User ' || substring(u.id::text, 1, 6)
            ),
            avatar_url = COALESCE(
                p.avatar_url,
                u.raw_user_meta_data->>'avatar_url'
            )
        FROM auth.users u
        WHERE p.id = u.id
        AND (p.email IS NULL OR p.full_name IS NULL OR p.full_name = '')
        RETURNING p.id
    )
    SELECT count(*) INTO updated_count FROM updates;

    RAISE NOTICE 'Updated % profiles with missing data.', updated_count;
END $$;
