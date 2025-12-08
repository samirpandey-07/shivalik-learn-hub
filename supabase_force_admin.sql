-- Force Admin Role for specific user
-- Run this in Supabase SQL Editor

UPDATE public.profiles
SET role = 'superadmin'
WHERE email = 'samirjee187@gmail.com';

-- Verify the change (Output will be shown in the query results)
SELECT email, role FROM public.profiles WHERE email = 'samirjee187@gmail.com';
