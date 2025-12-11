-- Update the award function to give 50 coins
CREATE OR REPLACE FUNCTION award_coins_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the status changed from anything to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    -- Increment the uploader's coin balance by 50 (Updated from 10)
    UPDATE profiles
    SET coins = coins + 50
    WHERE id = NEW.uploader_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure last_login column exists for daily rewards
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
