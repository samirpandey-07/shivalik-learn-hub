-- Fix: Add missing columns to notifications table
-- Run this in Supabase SQL Editor

DO $$
BEGIN
    -- 1. Add 'type' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'type') THEN
        ALTER TABLE public.notifications ADD COLUMN type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error'));
    END IF;

    -- 2. Add 'link' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'link') THEN
        ALTER TABLE public.notifications ADD COLUMN link text;
    END IF;

    -- 3. Add 'is_read' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'is_read') THEN
        ALTER TABLE public.notifications ADD COLUMN is_read boolean DEFAULT false;
    END IF;
END $$;
