
-- Function to get communities with member counts and user membership status efficiently
create or replace function public.get_communities_with_stats()
returns table (
    id uuid,
    name text,
    description text,
    icon text,
    category text,
    created_at timestamptz,
    members_count bigint,
    is_member boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
    return query
    select 
        c.id,
        c.name,
        c.description,
        c.icon,
        c.category,
        c.created_at,
        count(cm.user_id)::bigint as members_count,
        (exists (
            select 1 
            from community_members my_cm 
            where my_cm.community_id = c.id 
            and my_cm.user_id = auth.uid()
        )) as is_member
    from 
        communities c
    left join 
        community_members cm on c.id = cm.community_id
    group by 
        c.id
    order by 
        c.created_at desc;
end;
$$;
