-- Allow admins to update resources (for approval/rejection)
CREATE POLICY "Admins can update any resource"
ON public.resources
FOR UPDATE
USING (
  exists (
    select 1 from public.user_roles
    where user_roles.user_id = auth.uid()
    and user_roles.role in ('admin', 'superadmin')
  )
);

-- Allow admins to delete resources if needed
CREATE POLICY "Admins can delete any resource"
ON public.resources
FOR DELETE
USING (
  exists (
    select 1 from public.user_roles
    where user_roles.user_id = auth.uid()
    and user_roles.role in ('admin', 'superadmin')
  )
);
