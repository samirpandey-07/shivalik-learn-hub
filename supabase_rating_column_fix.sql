-- Add rating column to resources table
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS rating decimal(3,1) DEFAULT 0;

-- Ensure resource_ratings table exists (just in case)
CREATE TABLE IF NOT EXISTS public.resource_ratings (
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    resource_id uuid REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, resource_id)
);

-- Re-apply the trigger function to be safe
CREATE OR REPLACE FUNCTION update_resource_rating()
RETURNS TRIGGER AS $$
DECLARE
    new_avg decimal;
BEGIN
    -- Calculate new average for the resource
    SELECT AVG(rating)::decimal(3,1)
    INTO new_avg
    FROM public.resource_ratings
    WHERE resource_id = COALESCE(NEW.resource_id, OLD.resource_id);

    -- Update the resource table
    UPDATE public.resources
    SET rating = COALESCE(new_avg, 0)
    WHERE id = COALESCE(NEW.resource_id, OLD.resource_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger
DROP TRIGGER IF EXISTS on_rating_change ON public.resource_ratings;
CREATE TRIGGER on_rating_change
AFTER INSERT OR UPDATE OR DELETE ON public.resource_ratings
FOR EACH ROW EXECUTE FUNCTION update_resource_rating();
