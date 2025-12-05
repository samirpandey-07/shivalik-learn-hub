-- 1. Create Ratings Table
CREATE TABLE IF NOT EXISTS public.resource_ratings (
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    resource_id uuid REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, resource_id)
);

-- Enable RLS
ALTER TABLE public.resource_ratings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all ratings" 
ON public.resource_ratings FOR SELECT 
USING (true);

CREATE POLICY "Users can rate resources" 
ON public.resource_ratings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rating" 
ON public.resource_ratings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rating" 
ON public.resource_ratings FOR DELETE 
USING (auth.uid() = user_id);

-- 2. Create Function to Calculate Average Rating
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

-- 3. Create Trigger
DROP TRIGGER IF EXISTS on_rating_change ON public.resource_ratings;
CREATE TRIGGER on_rating_change
AFTER INSERT OR UPDATE OR DELETE ON public.resource_ratings
FOR EACH ROW EXECUTE FUNCTION update_resource_rating();
