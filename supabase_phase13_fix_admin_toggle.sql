-- RPC for Toggling Study Room Visibility
create or replace function toggle_room_visibility(p_room_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  v_is_admin boolean;
begin
  -- Check if user is admin
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and (role = 'admin' or role = 'superadmin')
  ) into v_is_admin;

  if not v_is_admin then
    raise exception 'Access denied';
  end if;

  -- Toggle is_hidden
  update public.study_rooms
  set is_hidden = not is_hidden
  where id = p_room_id;

  return true;
end;
$$;

-- RPC for Toggling Community Visibility
create or replace function toggle_community_visibility(p_community_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  v_is_admin boolean;
begin
  -- Check if user is admin
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and (role = 'admin' or role = 'superadmin')
  ) into v_is_admin;

  if not v_is_admin then
    raise exception 'Access denied';
  end if;

  -- Toggle is_hidden
  update public.communities
  set is_hidden = not is_hidden
  where id = p_community_id;

  return true;
end;
$$;

-- RPC for Deleting Study Room securely
create or replace function delete_room_secure(p_room_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  v_is_admin boolean;
begin
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and (role = 'admin' or role = 'superadmin')
  ) into v_is_admin;

  if not v_is_admin then
    raise exception 'Access denied';
  end if;

  delete from public.study_rooms where id = p_room_id;
  return true;
end;
$$;

-- RPC for Deleting Community securely
create or replace function delete_community_secure(p_community_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  v_is_admin boolean;
begin
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and (role = 'admin' or role = 'superadmin')
  ) into v_is_admin;

  if not v_is_admin then
    raise exception 'Access denied';
  end if;

  delete from public.communities where id = p_community_id;
  return true;
end;
$$;
