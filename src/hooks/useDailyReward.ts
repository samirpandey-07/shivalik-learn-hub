import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/useAuth';
import { toast } from 'sonner';

export function useDailyReward() {
    const { user, refreshProfile } = useAuth();
    const [showDailyReward, setShowDailyReward] = useState(false);
    const [rewardAmount, setRewardAmount] = useState(10);
    const [streak, setStreak] = useState(1); // Future implementation
    const checkingRef = useRef(false);

    useEffect(() => {
        if (!user) return;

        const checkDailyLogin = async () => {
            // Prevent double-firing in Strict Mode
            if (checkingRef.current) return;
            checkingRef.current = true;

            try {
                // Use local date string for robust "one time per day" check
                const todayDate = new Date().toDateString();

                // Check for ANY daily login reward for this user, ordered by most recent
                const { data: lastReward, error } = await supabase
                    .from('coin_transactions')
                    .select('created_at')
                    .eq('user_id', user.id)
                    .eq('reason', 'daily_login')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error && error.code !== 'PGRST116') {
                    console.error("Error checking daily reward:", error);
                    checkingRef.current = false;
                    return;
                }

                let alreadyClaimed = false;
                if (lastReward) {
                    const lastRewardDate = new Date(lastReward.created_at).toDateString();
                    if (lastRewardDate === todayDate) {
                        alreadyClaimed = true;
                    }
                }

                if (!alreadyClaimed) {
                    console.log("Granting daily reward...");

                    // Use RPC to ensure balance is updated AND transaction is logged
                    const { error: rpcError } = await supabase.rpc('increment_coins', {
                        user_id: user.id,
                        amount: 10,
                        reason: 'daily_login'
                    });

                    if (rpcError) {
                        console.error("Error granting daily reward:", rpcError);
                        toast.error("Failed to claim daily reward");
                    } else {
                        // Success! Show popup
                        console.log("Daily reward granted!");
                        setShowDailyReward(true);
                        setRewardAmount(10);

                        // Update profile coins (optimistic or re-fetch)
                        refreshProfile();
                    }
                } else {
                    console.log("Daily reward already claimed for", todayDate);
                }
            } catch (err) {
                console.error("Daily reward check failed:", err);
                checkingRef.current = false;
            }
        };

        checkDailyLogin();
    }, [user]);

    return {
        showDailyReward,
        setShowDailyReward,
        rewardAmount,
        streak
    };
}
