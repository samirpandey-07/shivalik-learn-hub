-- Fix RLS for Study Rooms causing "No Data" issue in Lobby
-- Allows everyone to see rooms, but only authenticated users to create/delete.

ALTER TABLE public.study_rooms ENABLE ROW LEVEL SECURITY;

-- 1. DROP RESTRICTIVE POLICIES
DROP POLICY IF EXISTS "Study rooms are viewable by everyone" ON public.study_rooms;
DROP POLICY IF EXISTS "Users can create study rooms" ON public.study_rooms;
DROP POLICY IF EXISTS "Users can delete own study rooms" ON public.study_rooms;
DROP POLICY IF EXISTS "Public view" ON public.study_rooms;

-- 2. CREATE PERMISSIVE POLICIES

-- Everyone can see rooms (even if not logged in, though app requires login usually)
CREATE POLICY "Study rooms are viewable by everyone"
ON public.study_rooms FOR SELECT
USING (true);

-- Authenticated users can create rooms
CREATE POLICY "Users can create study rooms"
ON public.study_rooms FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Creators can delete their own rooms
CREATE POLICY "Users can delete own study rooms"
ON public.study_rooms FOR DELETE
USING (auth.uid() = created_by);

-- Also allow update (to hide/unhide) for creators or admins
-- Note: Admin logic usually handled by Service Role or specialized functions, but simple owner RLS here:
CREATE POLICY "Users can update own study rooms"
ON public.study_rooms FOR UPDATE
USING (auth.uid() = created_by);
