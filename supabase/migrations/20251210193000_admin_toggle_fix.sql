-- Combined Migration for Admin Controls: Schema Changes & RPCs

-- 1. Add is_hidden column to study_rooms and communities
alter table public.study_rooms 
add column if not exists is_hidden boolean default false;

alter table public.communities 
add column if not exists is_hidden boolean default false;

-- 2. Update get_communities_with_stats to include is_hidden
-- Drop first because return type is changing
drop function if exists get_communities_with_stats();

create or replace function get_communities_with_stats()
returns table (
  id uuid,
  name text,
  description text,
  icon text,
  category text,
  is_hidden boolean,
  members_count bigint,
  is_member boolean
) 
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  
  return query
  select 
    c.id,
    c.name,
    c.description,
    c.icon,
    c.category,
    c.is_hidden,
    count(distinct cm.user_id)::bigint as members_count,
    exists(select 1 from public.community_members cm2 where cm2.community_id = c.id and cm2.user_id = v_user_id) as is_member
  from public.communities c
  left join public.community_members cm on c.id = cm.community_id
  where c.is_hidden = false or exists (
    select 1 from public.profiles p 
    where p.id = v_user_id 
    and (p.role = 'admin' or p.role = 'superadmin' or p.role = 'teacher')
  )
  group by c.id;
end;
$$;

-- 3. RLS Policies for Hiding/Deleting (Admins Only)
-- Note: These RLS policies are useful for direct client-side read/write if we weren't using RPCs, 
-- but kept here for completeness and future robust access control.

-- Study Rooms
create policy "Admins can update study rooms"
  on public.study_rooms for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and (role = 'admin' or role = 'superadmin')
    )
  );

create policy "Admins can delete study rooms"
  on public.study_rooms for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and (role = 'admin' or role = 'superadmin')
    )
  );

-- Communities
create policy "Admins can update communities"
  on public.communities for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and (role = 'admin' or role = 'superadmin')
    )
  );

create policy "Admins can delete communities"
  on public.communities for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and (role = 'admin' or role = 'superadmin')
    )
  );

-- 4. RPCs for Secure Admin Actions (Bypassing some complex RLS for specific actions)

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
