-- Create a function to allow admins to delete users
-- This functionality attempts to delete from auth.users, which typically requires superuser privileges.
-- In Supabase, 'security definer' functions run with the privileges of the creator (postgres).

create or replace function public.delete_user_account(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
begin
  -- 1. Check if the caller is an admin
  select role into caller_role
  from public.profiles
  where id = auth.uid();

  if caller_role not in ('admin', 'superadmin') then
    raise exception 'Unauthorized: Only admins can delete users.';
  end if;

  -- 2. Prevent self-deletion
  if target_user_id = auth.uid() then
    raise exception 'Cannot delete your own account.';
  end if;

  -- 3. Delete the user
  -- Note: We delete from auth.users. The foreign key constraint on public.profiles
  -- should be set to 'ON DELETE CASCADE' for this to clean up the profile automatically.
  -- If not, we might need to delete profile first.
  -- Typically profiles references auth.users(id).
  
  -- We'll try to delete from auth.users directly.
  -- If this fails due to permissions (unlikely if owner is postgres), we catch it.
  
  delete from auth.users where id = target_user_id;
  
  -- Use a fallback just in case auth.users delete doesn't cascade or fails silently (though it should throw)
  if found then
    return;
  end if;
  
  -- If we are here, maybe the user doesn't exist in auth.users but exists in profiles?
  delete from public.profiles where id = target_user_id;

exception when others then
  raise exception 'Failed to delete user: %', sqlerrm;
end;
$$;
