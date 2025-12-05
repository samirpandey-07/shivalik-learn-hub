-- Add coins and last_login columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS coins bigint DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login timestamptz;

-- Create a function to increment coins safely
CREATE OR REPLACE FUNCTION increment_coins(user_id uuid, amount int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET coins = coins + amount
  WHERE id = user_id;
END;
$$;
