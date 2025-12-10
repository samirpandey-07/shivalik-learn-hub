-- Add is_hidden column to study_rooms and communities
alter table public.study_rooms 
add column if not exists is_hidden boolean default false;

alter table public.communities 
add column if not exists is_hidden boolean default false;

-- Update get_communities_with_stats to include is_hidden
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

-- RLS Policies for Hiding/Deleting (Admins Only)

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
