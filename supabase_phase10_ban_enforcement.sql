-- Function to check if the current user is banned
CREATE OR REPLACE FUNCTION public.check_if_banned()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_banned = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Comments Policy (Insert)
DROP POLICY IF EXISTS "Users can insert their own comments" ON public.comments;
CREATE POLICY "Users can insert their own comments" 
ON public.comments FOR INSERT 
WITH CHECK (auth.uid() = user_id AND NOT public.check_if_banned());

-- Update Comments Policy (Update)
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
CREATE POLICY "Users can update their own comments" 
ON public.comments FOR UPDATE 
USING (auth.uid() = user_id AND NOT public.check_if_banned());

-- Update Resources Policy (Insert)
-- Assuming a policy "Users can upload their own resources" or similar exists, or creating a new one if it was generic.
-- I'll drop common potential names and create a robust standard one.
DROP POLICY IF EXISTS "Authenticated users can upload resources" ON public.resources;
DROP POLICY IF EXISTS "Users can upload resources" ON public.resources;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.resources;

CREATE POLICY "Users can upload resources" 
ON public.resources FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND NOT public.check_if_banned());

-- Update Resources Policy (Update)
DROP POLICY IF EXISTS "Users can update their own resources" ON public.resources;
CREATE POLICY "Users can update their own resources" 
ON public.resources FOR UPDATE 
USING (auth.uid() = uploader_id AND NOT public.check_if_banned());
