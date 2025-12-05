-- Add admin_comments column to resources table
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS admin_comments text;

-- Ensure admins can update this column
-- (The existing policy "Admins can update any resource" should cover this if it allows all columns)
