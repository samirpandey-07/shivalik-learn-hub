-- 1. Coin Transactions Table
CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount int NOT NULL,
    reason text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for coin_transactions
CREATE POLICY "Users can view their own coin history" 
ON public.coin_transactions FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Saved Resources (Bookmarks) Table
CREATE TABLE IF NOT EXISTS public.saved_resources (
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    resource_id uuid REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, resource_id)
);

-- Enable RLS
ALTER TABLE public.saved_resources ENABLE ROW LEVEL SECURITY;

-- Policies for saved_resources
CREATE POLICY "Users can view their saved resources" 
ON public.saved_resources FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save resources" 
ON public.saved_resources FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave resources" 
ON public.saved_resources FOR DELETE 
USING (auth.uid() = user_id);

-- 3. User Activity (Recent History) Table
CREATE TABLE IF NOT EXISTS public.user_activity (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    resource_id uuid REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
    action text NOT NULL, -- 'view', 'download'
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Policies for user_activity
CREATE POLICY "Users can view their own activity" 
ON public.user_activity FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity" 
ON public.user_activity FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Update increment_coins function to log transaction
CREATE OR REPLACE FUNCTION increment_coins(user_id uuid, amount int, reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update balance
  UPDATE public.profiles
  SET coins = coins + amount
  WHERE id = user_id;
  
  -- Log transaction
  INSERT INTO public.coin_transactions (user_id, amount, reason)
  VALUES (user_id, amount, reason);
END;
$$;
