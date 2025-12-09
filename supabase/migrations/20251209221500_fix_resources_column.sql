-- Fix for "record new has no field updated_at" error
-- This error happens because the trigger public.update_updated_at_column() tries to set NEW.updated_at,
-- but the column might be missing from the table if the initial migration didn't complete fully.

DO $$ 
BEGIN 
    -- Ensure resources has the column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'updated_at') THEN
        ALTER TABLE public.resources ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;

    -- Ensure profiles has the column (just in case)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;
