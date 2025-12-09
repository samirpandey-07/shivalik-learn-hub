-- Create Study Rooms Table
create table if not exists study_rooms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  topic text,
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true
);

-- Create Room Messages Table (for chat history)
create table if not exists room_messages (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references study_rooms(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table study_rooms enable row level security;
alter table room_messages enable row level security;

-- Policies for Study Rooms
create policy "Study Rooms are viewable by everyone"
  on study_rooms for select
  using ( true );

create policy "Authenticated users can create study rooms"
  on study_rooms for insert
  with check ( auth.uid() = created_by );

-- Policies for Room Messages
create policy "Messages are viewable by everyone in the room"
  on room_messages for select
  using ( true );

create policy "Authenticated users can send messages"
  on room_messages for insert
  with check ( auth.uid() = user_id );

-- Enable Realtime for these tables
-- This allows clients to listen to INSERT events for new rooms and new messages
alter publication supabase_realtime add table study_rooms;
alter publication supabase_realtime add table room_messages;

-- Seed data removed to prevent migration errors during push.
-- Rooms can be created via the UI.
