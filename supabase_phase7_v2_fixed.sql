-- Phase 7 V2: FIXED Universal Notification Script
-- Run this in your Supabase SQL Editor. It handles all dependencies.

-- 1. Dependency Check: Ensure 'profiles' has 'role' column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'student' CHECK (role IN ('student', 'admin', 'superadmin'));
    END IF;
END $$;

-- 2. Dependency Check: Ensure 'resources' has needed columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'file_url') THEN
        ALTER TABLE public.resources ADD COLUMN file_url text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'drive_link') THEN
        ALTER TABLE public.resources ADD COLUMN drive_link text;
    END IF;
END $$;

-- 3. Create Notifications Table (if not exists)
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    link text, 
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS (Idempotent: works even if already enabled)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Safely Create Policies (Drop first to avoid "policy already exists" error)
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update (mark read) their own notifications" ON public.notifications;
CREATE POLICY "Users can update (mark read) their own notifications" 
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Create/Replace Trigger Functions (Safe operation)
CREATE OR REPLACE FUNCTION public.notify_admins_on_upload()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_id uuid;
BEGIN
    -- Loop through all admins/superadmins and notify
    FOR admin_id IN 
        SELECT id FROM public.profiles WHERE role IN ('admin', 'superadmin')
    LOOP
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
            admin_id, 
            'New Resource Uploaded', 
            'A new resource "' || NEW.title || '" is pending approval.', 
            'info', 
            '/admin'
        );
    END LOOP;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_on_approval()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    student_id uuid;
BEGIN
    -- Only trigger if status changed to 'approved'
    IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
        
        -- Notify Uploader
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
            NEW.uploader_id, 
            'Resource Approved!', 
            'Your resource "' || NEW.title || '" has been approved and is now live.', 
            'success', 
            '/resource/' || NEW.id
        );

        -- Notify Students in same Course
        IF NEW.course_id IS NOT NULL THEN
            FOR student_id IN 
                SELECT id FROM public.profiles 
                WHERE course_id = NEW.course_id 
                AND id != NEW.uploader_id 
            LOOP
                INSERT INTO public.notifications (user_id, title, message, type, link)
                VALUES (
                    student_id, 
                    'New Resource in your Course', 
                    'A new resource "' || NEW.title || '" was just added to your course.', 
                    'info', 
                    '/resource/' || NEW.id
                );
            END LOOP;
        END IF;

    END IF;
    RETURN NEW;
END;
$$;

-- 5. Re-create Triggers (Clean slate)
DROP TRIGGER IF EXISTS on_resource_upload ON public.resources;
CREATE TRIGGER on_resource_upload
AFTER INSERT ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_on_upload();

DROP TRIGGER IF EXISTS on_resource_approval ON public.resources;
CREATE TRIGGER on_resource_approval
AFTER UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_approval();
