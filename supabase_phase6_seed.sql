-- Phase 6: Data Seeding Script
-- Run this in your Supabase SQL Editor AFTER the RBAC script

-- Use a DO block to define variables and logic
DO $$
DECLARE
    college_id uuid;
    course_cse_id uuid;
    course_me_id uuid;
    course_bba_id uuid;
    course_bpharma_id uuid;
    year_ids uuid[];
    user_id uuid; -- Valid user ID to assign uploads to
BEGIN
    -- 0. Get a valid user ID for uploads (fallback to first user found, or create a dummy if empty)
    SELECT id INTO user_id FROM public.profiles LIMIT 1;
    
    -- If no user exists, we can't link resources easily in a strict FK env, 
    -- but usually there is at least the current logged in user.
    -- If NULL, we skip resource creation to avoid errors.

    -- 1. Seed Colleges
    -- Try to find existing or insert
    INSERT INTO public.colleges (name, location)
    VALUES ('Shivalik College of Engineering', 'Dehradun')
    ON CONFLICT (name) DO UPDATE SET location = EXCLUDED.location
    RETURNING id INTO college_id;

    -- 2. Seed Courses
    INSERT INTO public.courses (name, department, college_id)
    VALUES ('B.Tech CSE', 'Engineering', college_id)
    ON CONFLICT (name, college_id) DO NOTHING;
    
    SELECT id INTO course_cse_id FROM public.courses WHERE name = 'B.Tech CSE' AND college_id = college_id;

    INSERT INTO public.courses (name, department, college_id)
    VALUES ('B.Tech Mechanical', 'Engineering', college_id)
    ON CONFLICT (name, college_id) DO NOTHING;

    INSERT INTO public.courses (name, department, college_id)
    VALUES ('BBA', 'Management', college_id)
    ON CONFLICT (name, college_id) DO NOTHING;
    
    INSERT INTO public.courses (name, department, college_id)
    VALUES ('B.Pharma', 'Pharmacy', college_id)
    ON CONFLICT (name, college_id) DO NOTHING;

    -- 3. Seed Years (if not exists)
    -- Assuming years table has (id, year_number, name)
    -- We'll clean table or ensure 1-4 exists
    INSERT INTO public.years (year_number, name) VALUES (1, '1st Year') ON CONFLICT DO NOTHING;
    INSERT INTO public.years (year_number, name) VALUES (2, '2nd Year') ON CONFLICT DO NOTHING;
    INSERT INTO public.years (year_number, name) VALUES (3, '3rd Year') ON CONFLICT DO NOTHING;
    INSERT INTO public.years (year_number, name) VALUES (4, '4th Year') ON CONFLICT DO NOTHING;

    -- 4. Seed Dummy Resources (Only if we have a user)
    IF user_id IS NOT NULL THEN
        -- CSE Resources
        INSERT INTO public.resources (title, description, type, file_url, status, rating, uploader_id, college_id, course_id, year_id, created_at)
        VALUES 
        ('Data Structures - Unit 1 Notes', 'Complete handwritten notes for Linked Lists and Arrays.', 'notes', 'https://example.com/ds-notes.pdf', 'approved', 4.5, user_id, college_id, course_cse_id, (SELECT id FROM years WHERE year_number=2 LIMIT 1), NOW()),
        ('Operating Systems - Process Scheduling', 'Lecture slides on CPU scheduling algorithms.', 'slides', 'https://example.com/os.pdf', 'approved', 4.2, user_id, college_id, course_cse_id, (SELECT id FROM years WHERE year_number=2 LIMIT 1), NOW()),
        ('Web Development - React Crash Course', 'Video tutorial link for React JS basics.', 'video', 'https://youtube.com', 'approved', 4.8, user_id, college_id, course_cse_id, (SELECT id FROM years WHERE year_number=3 LIMIT 1), NOW()),
        ('Engineering Mathematics - Calculus PYQ', 'Previous Year Questions for Calculus 2023.', 'paper', 'https://example.com/math.pdf', 'approved', 3.9, user_id, college_id, course_cse_id, (SELECT id FROM years WHERE year_number=1 LIMIT 1), NOW()),
        ('Introduction to AI - Lab Manual', 'Python lab experiments for AI course.', 'lab', 'https://example.com/ai-lab.pdf', 'approved', 4.7, user_id, college_id, course_cse_id, (SELECT id FROM years WHERE year_number=3 LIMIT 1), NOW()),
        -- BBA Resources
        ('Principles of Management', 'Core concepts of management and organizational behavior.', 'notes', 'https://example.com/pom.pdf', 'approved', 4.1, user_id, college_id, (SELECT id FROM courses WHERE name='BBA' LIMIT 1), (SELECT id FROM years WHERE year_number=1 LIMIT 1), NOW()),
        -- Pending Resource (for admin to test)
        ('Pending: Compiler Design Draft', 'Draft notes waiting for approval.', 'notes', 'https://example.com/draft.pdf', 'pending', 0, user_id, college_id, course_cse_id, (SELECT id FROM years WHERE year_number=3 LIMIT 1), NOW());
        
    END IF;

END $$;
