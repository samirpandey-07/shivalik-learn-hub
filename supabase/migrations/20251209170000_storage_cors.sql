-- Enable public access for the 'resources' bucket
-- (CORS should be handled automatically for public buckets)
update storage.buckets
set public = true
where name = 'resources';

-- Ensure it exists just in case
insert into storage.buckets (id, name, public)
select 'resources', 'resources', true
where not exists (
    select 1 from storage.buckets where name = 'resources'
);
