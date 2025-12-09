-- Enable Vector Extension for AI Embeddings
create extension if not exists vector;

-- Add AI fields to Resources
alter table public.resources 
add column if not exists embedding vector(768), -- Gemini 1.5 embedding dimension
add column if not exists ai_tags text[];

-- Add Onboarding fields to Profiles
alter table public.profiles
add column if not exists onboarding_completed boolean default false,
add column if not exists study_preferences jsonb default '{}'::jsonb;

-- Create Similarity Search Function
create or replace function match_resources (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  title text,
  description text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    resources.id,
    resources.title,
    resources.description,
    1 - (resources.embedding <=> query_embedding) as similarity
  from resources
  where 1 - (resources.embedding <=> query_embedding) > match_threshold
  order by resources.embedding <=> query_embedding
  limit match_count;
end;
$$;
