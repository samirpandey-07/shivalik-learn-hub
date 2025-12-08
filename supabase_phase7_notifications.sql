-- Phase 7: Notifications & Triggers
-- Run this in your Supabase SQL Editor

-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    link text, -- Support navigation (e.g., /resource/123)
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update (mark read) their own notifications" 
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- 2. Trigger Function: Notify Admins on New Upload
CREATE OR REPLACE FUNCTION public.notify_admins_on_upload()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_id uuid;
BEGIN
    -- Only trigger on new insert
    
    -- Loop through all admins/superadmins
    FOR admin_id IN 
        SELECT id FROM public.profiles WHERE role IN ('admin', 'superadmin')
    LOOP
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
            admin_id, 
            'New Resource Uploaded', 
            'A new resource "' || NEW.title || '" is pending approval.', 
            'info', 
            '/admin' -- Link to admin dashboard
        );
    END LOOP;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_resource_upload ON public.resources;
CREATE TRIGGER on_resource_upload
AFTER INSERT ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_on_upload();

-- 3. Trigger Function: Notify on Approval (Uploader + Classmates)
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
        
        -- A. Notify the Uploader
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
            NEW.uploader_id, 
            'Resource Approved!', 
            'Your resource "' || NEW.title || '" has been approved and is now live.', 
            'success', 
            '/resource/' || NEW.id
        );

        -- B. Notify Students in the same Course (excluding uploader)
        -- We only do this if course_id is set
        IF NEW.course_id IS NOT NULL THEN
            FOR student_id IN 
                SELECT id FROM public.profiles 
                WHERE course_id = NEW.course_id 
                AND id != NEW.uploader_id -- Don't notify uploader twice
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

DROP TRIGGER IF EXISTS on_resource_approval ON public.resources;
CREATE TRIGGER on_resource_approval
AFTER UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_approval();
