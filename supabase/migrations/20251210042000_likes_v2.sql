-- Create resource_likes_v2 to bypass issues with original table
CREATE TABLE IF NOT EXISTS public.resource_likes_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, resource_id)
);

-- Enable RLS
ALTER TABLE public.resource_likes_v2 ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "v2_likes_read" ON public.resource_likes_v2 FOR SELECT USING (true);
CREATE POLICY "v2_likes_insert" ON public.resource_likes_v2 FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "v2_likes_delete" ON public.resource_likes_v2 FOR DELETE USING (auth.uid() = user_id);
