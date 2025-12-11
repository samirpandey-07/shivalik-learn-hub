-- 1. Create Audit Logs Table (Safe if exists)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name text NOT NULL,
    operation text NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    changed_at timestamptz DEFAULT now(),
    changed_by uuid REFERENCES auth.users(id), -- potentially null if system action
    old_data jsonb,
    new_data jsonb
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow Admins to view logs (Safe if exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Admins can view audit logs'
    ) THEN
        CREATE POLICY "Admins can view audit logs" ON public.audit_logs
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid()
                    AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
                )
            );
    END IF;
END $$;

-- 2. Create Audit Trigger Function (Updates if exists)
CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (table_name, operation, changed_by, old_data)
        VALUES (
            TG_TABLE_NAME,
            'DELETE',
            auth.uid(), -- The user who performed the delete
            to_jsonb(OLD)
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (table_name, operation, changed_by, old_data, new_data)
        VALUES (
            TG_TABLE_NAME,
            'UPDATE',
            auth.uid(),
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (table_name, operation, changed_by, new_data)
        VALUES (
            TG_TABLE_NAME,
            'INSERT',
            auth.uid(),
            to_jsonb(NEW)
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Apply Trigger to Communities Table
DROP TRIGGER IF EXISTS audit_communities_trigger ON public.communities;
CREATE TRIGGER audit_communities_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.communities
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

-- 4. Apply Trigger to Study Rooms Table (NEW)
DROP TRIGGER IF EXISTS audit_study_rooms_trigger ON public.study_rooms;
CREATE TRIGGER audit_study_rooms_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.study_rooms
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();
