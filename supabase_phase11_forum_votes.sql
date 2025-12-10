-- Create a table to track user votes on forum questions
create table if not exists public.forum_votes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id uuid references public.forum_questions(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, question_id)
);

-- Add RLS policies
alter table public.forum_votes enable row level security;

create policy "Users can vote once"
  on public.forum_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own vote"
  on public.forum_votes for delete
  using (auth.uid() = user_id);

create policy "Anyone can view votes"
  on public.forum_votes for select
  using (true);

-- Function to handle voting toggle efficiently
create or replace function toggle_poll_vote(p_question_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_exists boolean;
begin
  v_user_id := auth.uid();
  
  -- Check if vote exists
  select exists(
    select 1 from public.forum_votes 
    where user_id = v_user_id and question_id = p_question_id
  ) into v_exists;

  if v_exists then
    -- Remove vote
    delete from public.forum_votes 
    where user_id = v_user_id and question_id = p_question_id;
    
    -- Decrement count
    update public.forum_questions
    set upvotes = upvotes - 1
    where id = p_question_id;
  else
    -- Add vote
    insert into public.forum_votes (user_id, question_id)
    values (v_user_id, p_question_id);
    
    -- Increment count
    update public.forum_questions
    set upvotes = upvotes + 1
    where id = p_question_id;
  end if;
end;
$$;
