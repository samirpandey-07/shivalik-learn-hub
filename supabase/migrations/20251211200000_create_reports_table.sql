-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES public.profiles(id) NOT NULL,
    resource_id UUID REFERENCES public.resources(id) NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policies

-- Authenticated users can insert reports (anyone can report)
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
CREATE POLICY "Users can create reports"
    ON public.reports
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Only admins/superadmins can view reports
-- Note: schema cache might need reload if has_role is new, but it should be there.
DROP POLICY IF EXISTS "Admins can view reports" ON public.reports;
CREATE POLICY "Admins can view reports"
    ON public.reports
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.user_roles 
            WHERE role IN ('admin', 'superadmin')
        )
    );

-- Only admins/superadmins can update reports (to resolve/dismiss)
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
CREATE POLICY "Admins can update reports"
    ON public.reports
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.user_roles 
            WHERE role IN ('admin', 'superadmin')
        )
    );

-- Enable Realtime
alter publication supabase_realtime add table reports;

-- Notify schema reload
NOTIFY pgrst, 'reload config';
