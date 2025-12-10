-- Comprehensive RLS Reset for Community & Profiles
-- We are permissive on SELECT to ensure UI works (Auth Users can Read All).
-- We keep WRITE policies strict (logic handled elsewhere or existing policies).

-- 1. PROFILES: Public Read
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true); -- Strictly speaking 'true' allows Anon too, which is fine for avatars usually. 'authenticated' is safer if worried about scraping, but let's go with 'true' to be unblockable.

-- 2. COMMUNITY MEMBERS: Public Read
DROP POLICY IF EXISTS "Members list is viewable by everyone" ON public.community_members;

CREATE POLICY "Authenticated users can view members" 
ON public.community_members FOR SELECT 
USING (auth.role() = 'authenticated');

-- 3. COMMUNITY POSTS: Public Read (Re-apply to be sure)
DROP POLICY IF EXISTS "Members can view posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authenticated users can view posts" ON public.community_posts;

CREATE POLICY "Authenticated users can view posts" 
ON public.community_posts FOR SELECT 
USING (auth.role() = 'authenticated');
