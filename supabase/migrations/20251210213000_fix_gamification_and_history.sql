-- Gamification System Fixes
-- 1. Create coin_transactions table (if not exists)
-- 2. Add RPC for safe mission claiming (prevents race conditions)

-- 1. Coin Transactions Table
CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for coin_transactions
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own coin history" ON public.coin_transactions;

CREATE POLICY "Users can view their own coin history"
    ON public.coin_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- 2. Safe Claim Mission RPC
CREATE OR REPLACE FUNCTION public.claim_mission(
    p_mission_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_mission RECORD;
    v_user_mission RECORD;
    v_new_coins INTEGER;
    v_new_xp INTEGER;
BEGIN
    -- Check if mission exists and is not claimed
    SELECT * INTO v_user_mission
    FROM public.user_missions
    WHERE id = p_mission_id AND user_id = p_user_id
    FOR UPDATE; -- Lock row to prevent race condition

    IF v_user_mission IS NULL THEN
        RAISE EXCEPTION 'Mission not found for user';
    END IF;

    IF v_user_mission.is_claimed THEN
        RAISE EXCEPTION 'Mission already claimed';
    END IF;

    -- Get mission rewards
    SELECT * INTO v_mission
    FROM public.missions
    WHERE id = v_user_mission.mission_id;

    -- Mark as claimed
    UPDATE public.user_missions
    SET is_claimed = true
    WHERE id = p_mission_id;

    -- Update Profile
    UPDATE public.profiles
    SET 
        coins = coins + v_mission.coin_reward,
        xp = xp + v_mission.xp_reward
    WHERE id = p_user_id
    RETURNING coins, xp INTO v_new_coins, v_new_xp;

    -- Record Transaction
    INSERT INTO public.coin_transactions (user_id, amount, reason)
    VALUES (p_user_id, v_mission.coin_reward, 'Mission: ' || v_mission.title);

    RETURN jsonb_build_object(
        'success', true,
        'coins', v_new_coins,
        'xp', v_new_xp,
        'message', 'Mission claimed successfully'
    );
END;
$$;
