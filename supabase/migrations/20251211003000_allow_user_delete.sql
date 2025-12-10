-- Allow users to delete their own resources
CREATE POLICY "Users can delete their own resources"
ON public.resources
FOR DELETE
USING (auth.uid() = uploader_id);
