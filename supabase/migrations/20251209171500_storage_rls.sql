-- Allow public read access to objects in the 'resources' bucket
-- This is required for the Supabase SDK 'download()' method to work
create policy "Public Access Resources"
on storage.objects for select
using ( bucket_id = 'resources' );

-- Also ensure the bucket is public (redundant but safe)
update storage.buckets
set public = true
where name = 'resources';
