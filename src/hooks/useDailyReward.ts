import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/useAuth';
import { toast } from 'sonner';

export function useDailyReward() {
    const { user, refreshProfile } = useAuth();
    const [showDailyReward, setShowDailyReward] = useState(false);
    const [rewardAmount, setRewardAmount] = useState(10);
    const [streak, setStreak] = useState(1);
    const checkingRef = useRef(false);

    useEffect(() => {
        if (!user) return;

        const checkDailyLogin = async () => {
            // Prevent double-firing in Strict Mode
            if (checkingRef.current) return;
            checkingRef.current = true;

            try {
                // Check for up to 30 recent daily login rewards for this user
                const { data: recentRewards, error } = await supabase
                    .from('coin_transactions')
                    .select('created_at')
                    .eq('user_id', user.id)
                    .eq('reason', 'daily_login')
                    .order('created_at', { ascending: false })
                    .limit(30);

                if (error && error.code !== 'PGRST116') {
                    console.error("Error checking daily reward:", error);
                    checkingRef.current = false;
                    return;
                }

                let alreadyClaimed = false;
                let calculatedStreak = 0;

                if (recentRewards && recentRewards.length > 0) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    let currentCheckDate: Date | null = null;

                    for (const reward of recentRewards) {
                        const rewardDate = new Date(reward.created_at);
                        rewardDate.setHours(0, 0, 0, 0);

                        const diffFromToday = Math.round((today.getTime() - rewardDate.getTime()) / (1000 * 3600 * 24));

                        if (currentCheckDate === null) {
                            // First record (most recent)
                            if (diffFromToday === 0) {
                                alreadyClaimed = true;
                                calculatedStreak = 1;
                                currentCheckDate = rewardDate;
                            } else if (diffFromToday === 1) {
                                calculatedStreak = 1;
                                currentCheckDate = rewardDate;
                            } else {
                                // Streak broken (most recent reward was >1 day ago)
                                break;
                            }
                        } else {
                            // Subsequent records
                            const diffFromCurrent = Math.round((currentCheckDate.getTime() - rewardDate.getTime()) / (1000 * 3600 * 24));

                            if (diffFromCurrent === 1) {
                                calculatedStreak++;
                                currentCheckDate = rewardDate;
                            } else if (diffFromCurrent === 0) {
                                // Same day duplicate, ignore
                                continue;
                            } else {
                                // Gap found, streak broken
                                break;
                            }
                        }
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
                        const newStreak = calculatedStreak + 1;
                        setStreak(newStreak);
                        setShowDailyReward(true);
                        setRewardAmount(10); // Or scale reward by streak: e.g. 10 + (streak * 2)

                        // Update profile coins (optimistic or re-fetch)
                        refreshProfile();
                    }
                } else {
                    console.log("Daily reward already claimed for today. Current streak:", calculatedStreak);
                    setStreak(calculatedStreak || 1); // fallback to 1 if something is weird
                }
            } catch (err) {
                console.error("Daily reward check failed:", err);
            } finally {
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
