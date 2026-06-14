-- Create the interview_experiences table
CREATE TABLE IF NOT EXISTS public.interview_experiences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    role TEXT NOT NULL,
    batch_year INTEGER NOT NULL,
    difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
    status TEXT NOT NULL,
    package TEXT,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.interview_experiences ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read approved experiences
CREATE POLICY "Enable read access for all users on interview_experiences"
    ON public.interview_experiences FOR SELECT
    USING (is_approved = true);

-- Allow authenticated users to insert their own experiences
CREATE POLICY "Enable insert for authenticated users only"
    ON public.interview_experiences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own experiences
CREATE POLICY "Enable update for users based on user_id"
    ON public.interview_experiences FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to delete their own experiences
CREATE POLICY "Enable delete for users based on user_id"
    ON public.interview_experiences FOR DELETE
    USING (auth.uid() = user_id);
    
-- Allow Admins to do everything (Update to fit your admin logic if you use a specific admin flag)
CREATE POLICY "Enable full access for admins"
    ON public.interview_experiences FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
      )
    );
