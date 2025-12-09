-- Create Communities Table
create table if not exists public.communities (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    icon text, -- Emoji or URL
    category text default 'General', -- 'Academic', 'Club', 'Official'
    created_by uuid references public.profiles(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Members Table
create table if not exists public.community_members (
    community_id uuid references public.communities(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    role text default 'member', -- 'admin', 'moderator', 'member'
    joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (community_id, user_id)
);

-- Create Posts Table
create table if not exists public.community_posts (
    id uuid default gen_random_uuid() primary key,
    community_id uuid references public.communities(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.community_posts enable row level security;

-- Policies: Communities
create policy "Communities are viewable by everyone" on public.communities
    for select using (true);

create policy "Authenticated users can create communities" on public.communities
    for insert with check (auth.role() = 'authenticated');

-- Policies: Members
create policy "Members list is viewable by everyone" on public.community_members
    for select using (true);

create policy "Users can join communities" on public.community_members
    for insert with check (auth.uid() = user_id);

create policy "Users can leave communities" on public.community_members
    for delete using (auth.uid() = user_id);

-- Policies: Posts
create policy "Members can view posts" on public.community_posts
    for select using (
        exists (
            select 1 from public.community_members
            where community_id = public.community_posts.community_id
            and user_id = auth.uid()
        )
    );

create policy "Members can create posts" on public.community_posts
    for insert with check (
        exists (
            select 1 from public.community_members
            where community_id = public.community_posts.community_id
            and user_id = auth.uid()
        )
    );

-- Realtime
alter publication supabase_realtime add table community_posts;

-- Seed Initial Communities
insert into public.communities (name, description, icon, category)
values 
    ('Python Developers', 'Official club for Python enthusiasts.', '🐍', 'Club'),
    ('Class of 2026', 'General discussion for the 2026 batch.', '🎓', 'Academic'),
    ('Exam Prep Squad', 'Late night study group.', '📚', 'General'),
    ('Music Society', 'Jam sessions and events.', '🎵', 'Hobby')
on conflict do nothing;
