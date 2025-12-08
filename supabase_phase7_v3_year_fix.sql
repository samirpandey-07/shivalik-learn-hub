-- Phase 7 V3: Year-Specific Notifications
-- Run this in Supabase SQL Editor

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

        -- B. Notify Students in the same Course AND Year (excluding uploader)
        -- This ensures 1st years only get 1st year notifications
        IF NEW.course_id IS NOT NULL THEN
            FOR student_id IN 
                SELECT id FROM public.profiles 
                WHERE course_id = NEW.course_id 
                AND year_id = NEW.year_id  -- Added Year Filter
                AND id != NEW.uploader_id 
            LOOP
                INSERT INTO public.notifications (user_id, title, message, type, link)
                VALUES (
                    student_id, 
                    'New Resource for Your Class', 
                    'A new resource "' || NEW.title || '" was added to your course year.', 
                    'info', 
                    '/resource/' || NEW.id
                );
            END LOOP;
        END IF;

    END IF;

    RETURN NEW;
END;
$$;
