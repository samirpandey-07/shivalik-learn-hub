-- FIX: Add missing Foreign Key for uploader_id
-- This allows the API to fetch the uploader's name ("Join" relationships)

-- 1. Add Foreign Key for uploader_id (This fixes the error you saw)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_resources_uploader'
    ) THEN
        ALTER TABLE public.resources
        ADD CONSTRAINT fk_resources_uploader
        FOREIGN KEY (uploader_id)
        REFERENCES public.profiles(id);
    END IF;
END $$;

-- 2. Ensure approved_by column exists (For the new feature)
ALTER TABLE public.resources
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.profiles(id);

-- 3. Indexes for speed
CREATE INDEX IF NOT EXISTS idx_resources_uploader_id ON public.resources(uploader_id);
CREATE INDEX IF NOT EXISTS idx_resources_approved_by ON public.resources(approved_by);
