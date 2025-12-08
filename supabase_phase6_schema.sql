-- Phase 6: Schema Creation (Run this BEFORE seeding)

-- 1. Create Colleges Table
CREATE TABLE IF NOT EXISTS public.colleges (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    location text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read colleges" ON public.colleges FOR SELECT USING (true);

-- 2. Create Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    department text,
    college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(name, college_id)
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);

-- 3. Create Years Table
CREATE TABLE IF NOT EXISTS public.years (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    year_number int NOT NULL, -- 1, 2, 3, 4
    name text NOT NULL, -- "1st Year"
    created_at timestamptz DEFAULT now(),
    UNIQUE(year_number)
);

ALTER TABLE public.years ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read years" ON public.years FOR SELECT USING (true);

-- 4. Ensure Resources Table has correct columns (Idempotent)
-- We assume resources table exists (from previous phases), but we need to ensure it links to these new tables.
-- If columns don't exist, add them.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'college_id') THEN
        ALTER TABLE public.resources ADD COLUMN college_id uuid REFERENCES public.colleges(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'course_id') THEN
        ALTER TABLE public.resources ADD COLUMN course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'year_id') THEN
        ALTER TABLE public.resources ADD COLUMN year_id uuid REFERENCES public.years(id) ON DELETE SET NULL;
    END IF;
END $$;
