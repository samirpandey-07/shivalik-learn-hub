-- Phase 8: Fix Schema Mismatch
-- Run this in your Supabase SQL Editor to add missing columns

DO $$
BEGIN
    -- Add file_url if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'file_url') THEN
        ALTER TABLE public.resources ADD COLUMN file_url text;
    END IF;

    -- Add drive_link if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'drive_link') THEN
        ALTER TABLE public.resources ADD COLUMN drive_link text;
    END IF;

    -- Add file_size if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'file_size') THEN
        ALTER TABLE public.resources ADD COLUMN file_size text;
    END IF;
END $$;
