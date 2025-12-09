-- Create enum for user roles
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('student', 'admin', 'superadmin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for resource types
DO $$ BEGIN
    CREATE TYPE public.resource_type AS ENUM ('notes', 'pyq', 'presentation', 'link', 'video', 'important_questions');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for resource status
DO $$ BEGIN
    CREATE TYPE public.resource_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create colleges table
CREATE TABLE IF NOT EXISTS public.colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  established TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  duration TEXT,
  seats INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create years table
CREATE TABLE IF NOT EXISTS public.years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  year_number INTEGER NOT NULL,
  semesters TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  college_id UUID REFERENCES public.colleges(id),
  course_id UUID REFERENCES public.courses(id),
  year_id UUID REFERENCES public.years(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  UNIQUE (user_id, role)
);

-- Create resources table
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type resource_type NOT NULL,
  subject TEXT NOT NULL,
  college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  year_id UUID REFERENCES public.years(id) ON DELETE CASCADE NOT NULL,
  uploader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploader_name TEXT,
  uploader_year TEXT,
  file_url TEXT,
  drive_link TEXT,
  file_size TEXT,
  status resource_status DEFAULT 'pending',
  admin_comments TEXT,
  downloads INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
-- Drop old signature if it exists to avoid ambiguity
DROP FUNCTION IF EXISTS public.has_role(UUID, public.app_role);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role text)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text = _role
  )
$$;

-- Drop existing policies to avoid conflicts if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view colleges" ON public.colleges;
  DROP POLICY IF EXISTS "Superadmins can manage colleges" ON public.colleges;
  DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;
  DROP POLICY IF EXISTS "Superadmins can manage courses" ON public.courses;
  DROP POLICY IF EXISTS "Anyone can view years" ON public.years;
  DROP POLICY IF EXISTS "Superadmins can manage years" ON public.years;
  DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Superadmins can manage roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Anyone can view approved resources" ON public.resources;
  DROP POLICY IF EXISTS "Users can view own resources" ON public.resources;
  DROP POLICY IF EXISTS "Admins can view all resources" ON public.resources;
  DROP POLICY IF EXISTS "Authenticated users can upload resources" ON public.resources;
  DROP POLICY IF EXISTS "Users can update own pending resources" ON public.resources;
  DROP POLICY IF EXISTS "Admins can update any resource" ON public.resources;
  DROP POLICY IF EXISTS "Admins can delete resources" ON public.resources;
  DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
  DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
  DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;


-- Colleges policies (public read)
CREATE POLICY "Anyone can view colleges" ON public.colleges FOR SELECT USING (true);
CREATE POLICY "Superadmins can manage colleges" ON public.colleges FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- Courses policies (public read)
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Superadmins can manage courses" ON public.courses FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- Years policies (public read)
CREATE POLICY "Anyone can view years" ON public.years FOR SELECT USING (true);
CREATE POLICY "Superadmins can manage years" ON public.years FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Superadmins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- Resources policies
CREATE POLICY "Anyone can view approved resources" ON public.resources FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can view own resources" ON public.resources FOR SELECT USING (auth.uid() = uploader_id);
CREATE POLICY "Admins can view all resources" ON public.resources FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Authenticated users can upload resources" ON public.resources FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own pending resources" ON public.resources FOR UPDATE USING (auth.uid() = uploader_id AND status = 'pending');
CREATE POLICY "Admins can update any resource" ON public.resources FOR UPDATE USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Admins can delete resources" ON public.resources FOR DELETE USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_resources_updated_at ON public.resources;
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data for Shivalik College
INSERT INTO public.colleges (id, name, location, established) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Shivalik College', 'Dehradun', '2009')
ON CONFLICT (id) DO NOTHING;

-- Insert courses for Shivalik College
INSERT INTO public.courses (id, college_id, name, duration, seats) VALUES
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'B.Tech Computer Science', '4 Years', 120),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'B.Tech Electronics & Communication', '4 Years', 60),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'B.Tech Mechanical', '4 Years', 80),
  ('22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111111', 'B.Tech Civil', '4 Years', 60),
  ('22222222-2222-2222-2222-222222222225', '11111111-1111-1111-1111-111111111111', 'BCA', '3 Years', 60),
  ('22222222-2222-2222-2222-222222222226', '11111111-1111-1111-1111-111111111111', 'MCA', '2 Years', 40)
ON CONFLICT (id) DO NOTHING;

-- Insert years for B.Tech CSE
INSERT INTO public.years (id, course_id, year_number, semesters) VALUES
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222221', 1, ARRAY['Semester 1', 'Semester 2']),
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222221', 2, ARRAY['Semester 3', 'Semester 4']),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222221', 3, ARRAY['Semester 5', 'Semester 6']),
  ('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222221', 4, ARRAY['Semester 7', 'Semester 8'])
ON CONFLICT (id) DO NOTHING;

-- Insert years for other courses (B.Tech ECE)
-- Note: Simplified to avoid conflicts if IDs are missing, relying on course_id match would be complex in pure SQL without IDs.
-- Assuming these might run multiple times, we should check existence or use upsert if we had IDs.
-- For now, adding basic ON CONFLICT DO NOTHING for explicit inserts.
-- The ones below don't have explicit IDs in original file, which is risky for idempotency without unique constraints.
-- Adding a rudimentary check if possible, or accepting potential duplicates if constraints aren't enforce (but they are tables so duplicates are possible if no unique key hit).
-- Years table has (id) unique. If we insert without ID, it generates one.
-- To be safe, we should probably SKIP the non-ID inserts if we can't guarantee uniqueness, OR assume the previous blocks covered the main structure.
-- Given the "demo" nature, I will leave the non-ID inserts as is but warn they might duplicate if re-run, UNLESS we assume this migration runs once on fresh DB.
-- BUT, since this FAILED on "type already exists", it implies partial application.
-- The safest bet for the non-ID inserts is to NOT run them if data exists, but that's hard to strict.
-- However, since the user is likely stuck at the BEGINNING (types), the tables might not exist yet.
-- If tables exist, we'll assume data might too.
-- Let's wrap the data inserts in a block or just leave them, focusing on the types/tables which cause the HARD errors.

INSERT INTO public.years (course_id, year_number, semesters) 
SELECT '22222222-2222-2222-2222-222222222222', 1, ARRAY['Semester 1', 'Semester 2']
WHERE NOT EXISTS (SELECT 1 FROM public.years WHERE course_id = '22222222-2222-2222-2222-222222222222' AND year_number = 1);

INSERT INTO public.years (course_id, year_number, semesters) 
SELECT '22222222-2222-2222-2222-222222222222', 2, ARRAY['Semester 3', 'Semester 4']
WHERE NOT EXISTS (SELECT 1 FROM public.years WHERE course_id = '22222222-2222-2222-2222-222222222222' AND year_number = 2);

INSERT INTO public.years (course_id, year_number, semesters) 
SELECT '22222222-2222-2222-2222-222222222222', 3, ARRAY['Semester 5', 'Semester 6']
WHERE NOT EXISTS (SELECT 1 FROM public.years WHERE course_id = '22222222-2222-2222-2222-222222222222' AND year_number = 3);

INSERT INTO public.years (course_id, year_number, semesters) 
SELECT '22222222-2222-2222-2222-222222222222', 4, ARRAY['Semester 7', 'Semester 8']
WHERE NOT EXISTS (SELECT 1 FROM public.years WHERE course_id = '22222222-2222-2222-2222-222222222222' AND year_number = 4);


-- Insert years for B.Tech Mechanical
INSERT INTO public.years (course_id, year_number, semesters) 
SELECT '22222222-2222-2222-2222-222222222223', 1, ARRAY['Semester 1', 'Semester 2']
WHERE NOT EXISTS (SELECT 1 FROM public.years WHERE course_id = '22222222-2222-2222-2222-222222222223' AND year_number = 1);

INSERT INTO public.years (course_id, year_number, semesters) 
SELECT '22222222-2222-2222-2222-222222222223', 2, ARRAY['Semester 3', 'Semester 4']
WHERE NOT EXISTS (SELECT 1 FROM public.years WHERE course_id = '22222222-2222-2222-2222-222222222223' AND year_number = 2);

INSERT INTO public.years (course_id, year_number, semesters) 
SELECT '22222222-2222-2222-2222-222222222223', 3, ARRAY['Semester 5', 'Semester 6']
WHERE NOT EXISTS (SELECT 1 FROM public.years WHERE course_id = '22222222-2222-2222-2222-222222222223' AND year_number = 3);

INSERT INTO public.years (course_id, year_number, semesters) 
SELECT '22222222-2222-2222-2222-222222222223', 4, ARRAY['Semester 7', 'Semester 8']
WHERE NOT EXISTS (SELECT 1 FROM public.years WHERE course_id = '22222222-2222-2222-2222-222222222223' AND year_number = 4);

-- Insert sample approved resources (Using conditional insert to avoid dupes)
-- Since title + uploader isn't unique, we just hope for the best or skip if ANY resource exists to avoid duplicate seed data.
-- A simple check: if 0 resources exist, insert.
INSERT INTO public.resources (title, description, type, subject, college_id, course_id, year_id, uploader_name, uploader_year, drive_link, file_size, status, rating, downloads)
SELECT 'Data Structures and Algorithms - Complete Notes', 'Comprehensive notes covering all DSA topics including arrays, linked lists, trees, graphs, and dynamic programming.', 'notes', 'DSA', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333332', 'Prof. Sarah Wilson', 'Faculty', 'https://drive.google.com/file/d/example1', '2.3 MB', 'approved', 4.8, 245
WHERE NOT EXISTS (SELECT 1 FROM public.resources LIMIT 1);

INSERT INTO public.resources (title, description, type, subject, college_id, course_id, year_id, uploader_name, uploader_year, drive_link, file_size, status, rating, downloads)
SELECT 'Database Management Systems - PYQ 2019-2023', 'Collection of previous year questions from 2019-2023 with detailed solutions.', 'pyq', 'DBMS', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333332', 'Dr. Michael Chen', 'Faculty', 'https://drive.google.com/file/d/example2', '1.8 MB', 'approved', 4.6, 189
WHERE NOT EXISTS (SELECT 1 FROM public.resources WHERE title = 'Database Management Systems - PYQ 2019-2023');

INSERT INTO public.resources (title, description, type, subject, college_id, course_id, year_id, uploader_name, uploader_year, drive_link, file_size, status, rating, downloads)
SELECT 'OOP Concepts Presentation', 'Interactive presentation covering OOP principles, inheritance, polymorphism, and design patterns.', 'presentation', 'OOP', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333331', 'Prof. Emily Rodriguez', 'Faculty', 'https://drive.google.com/file/d/example3', '5.2 MB', 'approved', 4.7, 156
WHERE NOT EXISTS (SELECT 1 FROM public.resources WHERE title = 'OOP Concepts Presentation');

INSERT INTO public.resources (title, description, type, subject, college_id, course_id, year_id, uploader_name, uploader_year, drive_link, file_size, status, rating, downloads)
SELECT 'Machine Learning Tutorial Series', 'Complete video series on machine learning fundamentals.', 'video', 'ML', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333334', 'Dr. Alex Thompson', 'Faculty', 'https://youtube.com/playlist?list=example', NULL, 'approved', 4.9, 312
WHERE NOT EXISTS (SELECT 1 FROM public.resources WHERE title = 'Machine Learning Tutorial Series');

INSERT INTO public.resources (title, description, type, subject, college_id, course_id, year_id, uploader_name, uploader_year, drive_link, file_size, status, rating, downloads)
SELECT 'Important Questions - C Programming', 'Most important questions for C Programming exam preparation.', 'important_questions', 'C Programming', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333331', 'Rahul Sharma', '4th Year', 'https://drive.google.com/file/d/example4', '1.2 MB', 'approved', 4.5, 98
WHERE NOT EXISTS (SELECT 1 FROM public.resources WHERE title = 'Important Questions - C Programming');