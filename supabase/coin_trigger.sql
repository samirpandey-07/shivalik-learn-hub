-- Create a function to award coins when a resource is approved
CREATE OR REPLACE FUNCTION award_coins_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the status changed from anything to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    -- Increment the uploader's coin balance by 10 (or whatever value)
    -- Assuming profiles table has a coins column and id matches uploader_id
    UPDATE profiles
    SET coins = coins + 10
    WHERE id = NEW.uploader_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS on_resource_approval ON resources;
CREATE TRIGGER on_resource_approval
AFTER UPDATE ON resources
FOR EACH ROW
EXECUTE FUNCTION award_coins_on_approval();
