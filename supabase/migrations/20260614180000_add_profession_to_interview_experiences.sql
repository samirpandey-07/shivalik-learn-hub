-- Add profession column to interview_experiences
ALTER TABLE public.interview_experiences ADD COLUMN IF NOT EXISTS profession TEXT;

-- Seed mock data if table is empty
INSERT INTO public.interview_experiences (company_name, role, profession, batch_year, difficulty, status, package, content, upvotes, is_approved)
SELECT 'Google', 'Associate Software Engineer', 'Software Engineering', 2024, 4, 'Offer Selected', '32 LPA', 'Round 1 (Coding): 2 LeetCode Medium questions on Trees and Graphs (DFS/BFS traversal). Round 2 (System Design): Design a URL shortener focusing on scalability, caching, and database partitioning. Round 3 (Behavioral): Googley-ness questions about teamwork, dealing with conflict, and career goals. Advice: Practice writing clean code on Google Docs and explaining your thought process out loud.', 18, true
WHERE NOT EXISTS (SELECT 1 FROM public.interview_experiences LIMIT 1);

INSERT INTO public.interview_experiences (company_name, role, profession, batch_year, difficulty, status, package, content, upvotes, is_approved)
SELECT 'Adobe', 'Product Designer Intern', 'UI/UX Design', 2025, 3, 'Offer Selected', '60k/month', 'Round 1 (Portfolio Review): I walked through two design case studies, explaining user research, wireframes, usability testing, and visual design. Round 2 (Design Challenge): 45-minute whiteboard exercise to design a pet adoption app for college students. Round 3 (HR): Team fitment and behavioral questions. Advice: Focus on your design process, user empathy, and why you made specific design decisions.', 12, true
WHERE (SELECT COUNT(*) FROM public.interview_experiences) = 1;

INSERT INTO public.interview_experiences (company_name, role, profession, batch_year, difficulty, status, package, content, upvotes, is_approved)
SELECT 'Microsoft', 'Data Scientist', 'Data Science & Analytics', 2024, 5, 'Offer Selected', '26 LPA', 'Round 1 (Math & Stats): In-depth questions on probability distributions, linear algebra, and hypothesis testing. Round 2 (ML Coding): Implement K-Means clustering from scratch and discuss regularization techniques (L1 vs L2). Round 3 (Product & SQL): SQL queries involving complex joins and window functions. Advice: Master ML fundamentals and SQL.', 15, true
WHERE (SELECT COUNT(*) FROM public.interview_experiences) = 2;

INSERT INTO public.interview_experiences (company_name, role, profession, batch_year, difficulty, status, package, content, upvotes, is_approved)
SELECT 'Uber', 'Associate Product Manager Intern', 'Product Management', 2026, 4, 'Offer Selected', '80k/month', 'Round 1 (Product Sense): How would you improve Uber Eats for college students? Round 2 (Analytical): Estimate the number of trips taken in Delhi on a Friday. Round 3 (Behavioral): Standard leadership questions. Advice: Read ''Decode and Conquer'' and practice estimation.', 6, true
WHERE (SELECT COUNT(*) FROM public.interview_experiences) = 3;


-- Create the jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    role TEXT NOT NULL,
    profession TEXT NOT NULL,
    job_type TEXT NOT NULL,
    location TEXT NOT NULL,
    link TEXT,
    description TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users on jobs" ON public.jobs;
DROP POLICY IF EXISTS "Enable insert for authenticated users only on jobs" ON public.jobs;
DROP POLICY IF EXISTS "Enable update/delete for owners and admins on jobs" ON public.jobs;

-- Policies for jobs
CREATE POLICY "Enable read access for all users on jobs"
    ON public.jobs FOR SELECT
    USING (is_approved = true OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
    ));

CREATE POLICY "Enable insert for authenticated users only on jobs"
    ON public.jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update/delete for owners and admins on jobs"
    ON public.jobs FOR ALL
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
    ));


-- Create the hackathons table
CREATE TABLE IF NOT EXISTS public.hackathons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    organizer TEXT NOT NULL,
    event_date TEXT NOT NULL,
    registration_link TEXT,
    prize_pool TEXT,
    description TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users on hackathons" ON public.hackathons;
DROP POLICY IF EXISTS "Enable insert for authenticated users only on hackathons" ON public.hackathons;
DROP POLICY IF EXISTS "Enable update/delete for owners and admins on hackathons" ON public.hackathons;

-- Policies for hackathons
CREATE POLICY "Enable read access for all users on hackathons"
    ON public.hackathons FOR SELECT
    USING (is_approved = true OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
    ));

CREATE POLICY "Enable insert for authenticated users only on hackathons"
    ON public.hackathons FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update/delete for owners and admins on hackathons"
    ON public.hackathons FOR ALL
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
    ));


-- Seed jobs mock data if table is empty
INSERT INTO public.jobs (company_name, role, profession, job_type, location, link, description, is_approved)
SELECT 'Google', 'STEP Intern 2026', 'Software Engineering', 'Internship', 'Remote / Bengaluru', 'https://careers.google.com', 'Google STEP (Student Training in Engineering Program) is a 12-week internship for first- and second-year undergraduate computer science students. Focuses on practical projects, technical training, and professional development. Requirements: Basic coding skills in C++, Java, or Python.', true
WHERE NOT EXISTS (SELECT 1 FROM public.jobs LIMIT 1);

INSERT INTO public.jobs (company_name, role, profession, job_type, location, link, description, is_approved)
SELECT 'Adobe', 'Product Designer Intern', 'UI/UX Design', 'Internship', 'Noida (Hybrid)', 'https://adobe.com/careers', 'Looking for a passionate product designer intern to work with our creative cloud teams. Help create intuitive, beautiful interfaces. Requirements: Portfolio demonstrating visual design skills, wireframing, and user research projects.', true
WHERE (SELECT COUNT(*) FROM public.jobs) = 1;

INSERT INTO public.jobs (company_name, role, profession, job_type, location, link, description, is_approved)
SELECT 'Microsoft', 'Software Engineer (Full Time)', 'Software Engineering', 'Full-time', 'Hyderabad', 'https://careers.microsoft.com', 'Join the Azure Cloud Infrastructure team. Build scalable distributed systems, optimize databases, and write production-grade services. Requirements: 2025/2026 graduate, strong understanding of DSA, networks, and operating systems.', true
WHERE (SELECT COUNT(*) FROM public.jobs) = 2;


-- Seed hackathons mock data if table is empty
INSERT INTO public.hackathons (title, organizer, event_date, registration_link, prize_pool, description, is_approved)
SELECT 'Smart India Hackathon 2026', 'Govt of India', '2026-11-15', 'https://sih.gov.in', 'Rs. 10 Lakhs', 'SIH is a nationwide initiative to provide students with a platform to solve some of the pressing problems we face in our daily lives, and thus inculcate a product innovation mindset. Team size: 6 students (at least 1 female team member is mandatory).', true
WHERE NOT EXISTS (SELECT 1 FROM public.hackathons LIMIT 1);

INSERT INTO public.hackathons (title, organizer, event_date, registration_link, prize_pool, description, is_approved)
SELECT 'Google Developer Solution Challenge', 'Google GDSC', '2026-03-30', 'https://developers.google.com/community/gdsc', 'Global Mentorship & Travel', 'Build a solution for one or more of the United Nations 17 Sustainable Development Goals using Google technologies. Open to all students who are members of GDSC chapters. Team size: 1-4 members.', true
WHERE (SELECT COUNT(*) FROM public.hackathons) = 1;

INSERT INTO public.hackathons (title, organizer, event_date, registration_link, prize_pool, description, is_approved)
SELECT 'HackMIT 2026', 'MIT (Massachusetts Institute of Technology)', '2026-09-20', 'https://hackmit.org', '$15,000 USD', 'HackMIT is MIT''s annual student-run hackathon. Every fall, we bring together over 1,000 hackers from around the world to build tech solutions and explore new technologies. Travel reimbursements available for international students.', true
WHERE (SELECT COUNT(*) FROM public.hackathons) = 2;
