-- Create badges table
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text not null, -- Lucide icon name or emoji
  category text default 'general',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_badges junction table
create table if not exists public.user_badges (
  user_id uuid references public.profiles(id) on delete cascade not null,
  badge_id uuid references public.badges(id) on delete cascade not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, badge_id)
);

-- Enable RLS
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

-- RLS Policies
create policy "Badges are viewable by everyone" on public.badges
  for select using (true);

create policy "Admins can manage badges" on public.badges
    for all using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'superadmin')
        )
    );

create policy "User badges are viewable by everyone" on public.user_badges
  for select using (true);

create policy "Admins can assign badges" on public.user_badges
    for insert with check (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'superadmin')
        )
    );

-- Seed Initial Badges
insert into public.badges (name, description, icon, category) values
('Early Adopter', 'Joined during the beta phase.', 'Rocket', 'general'),
('First Upload', 'Uploaded your first resource.', 'Upload', 'achievement'),
('Star Contributor', 'Uploaded 5+ resources.', 'Star', 'achievement'),
('Community Voice', 'Posted 10+ comments.', 'MessageCircle', 'community')
on conflict do nothing;
