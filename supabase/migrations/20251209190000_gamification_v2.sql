-- Add XP and Level to profiles
alter table public.profiles 
add column if not exists xp integer default 0,
add column if not exists level integer default 1;

-- Create Missions Table (Definitions)
create table if not exists public.missions (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    xp_reward integer default 10,
    coin_reward integer default 5,
    type text check (type in ('daily', 'weekly', 'season')), 
    condition text not null, -- 'login', 'upload', 'like', 'comment', 'study'
    target_value integer default 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create User Missions Table (Tracking)
create table if not exists public.user_missions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    mission_id uuid references public.missions(id) on delete cascade not null,
    progress integer default 0,
    is_claimed boolean default false,
    reset_at timestamp with time zone, -- When this specific instance expires
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, mission_id, reset_at)
);

-- Enable RLS
alter table public.missions enable row level security;
alter table public.user_missions enable row level security;

-- Policies for Missions (Public Read)
create policy "Missions are viewable by everyone" on public.missions
    for select using (true);

-- Policies for User Missions (User Own Data)
create policy "Users can view own mission progress" on public.user_missions
    for select using (auth.uid() = user_id);

create policy "Users can update own mission progress" on public.user_missions
    for update using (auth.uid() = user_id);

create policy "System can insert user missions" on public.user_missions
    for insert with check (auth.uid() = user_id);

-- Realtime
alter publication supabase_realtime add table user_missions;
alter publication supabase_realtime add table profiles;

-- Seed Initial Daily Missions
insert into public.missions (title, description, xp_reward, coin_reward, type, condition, target_value)
values 
    ('Daily Login', 'Log in to Shivalik Learn Hub', 10, 5, 'daily', 'login', 1),
    ('Knowledge Sharer', 'Upload 1 study resource', 50, 20, 'daily', 'upload', 1),
    ('Curious Mind', 'View 3 different resources', 15, 5, 'daily', 'view', 3),
    ('Community Helper', 'Like 5 resources', 20, 10, 'daily', 'like', 5)
on conflict do nothing;
