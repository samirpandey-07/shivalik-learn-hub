import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Coins } from 'lucide-react';

export const useGamification = () => {
    const { user, profile, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);

    // Constants
    const DAILY_LOGIN_REWARD = 10;
    const UPLOAD_REWARD = 50;

    // Check for daily login reward
    useEffect(() => {
        if (!user || !profile) return;

        const checkDailyLogin = async () => {
            // Check session storage first to prevent repeated toasts on refresh
            const sessionKey = `daily_login_checked_${user.id}_${new Date().toDateString()}`;
            if (sessionStorage.getItem(sessionKey)) return;

            const now = new Date();
            const lastLogin = profile.last_login ? new Date(profile.last_login) : null;

            // Check if already logged in today (simple date comparison)
            const isSameDay = lastLogin &&
                lastLogin.getDate() === now.getDate() &&
                lastLogin.getMonth() === now.getMonth() &&
                lastLogin.getFullYear() === now.getFullYear();

            if (!isSameDay) {
                // It's a new day! Award coins.
                await awardCoins(DAILY_LOGIN_REWARD, 'Daily Login Bonus!');

                // Update last_login timestamp
                await supabase
                    .from('profiles')
                    .update({ last_login: now.toISOString() })
                    .eq('id', user.id);
            }

            // Mark as checked for this session/day
            sessionStorage.setItem(sessionKey, 'true');
        };

        checkDailyLogin();
    }, [user, profile?.id]); // Depend on ID to avoid loops, but check logic inside

    const awardCoins = async (amount: number, reason: string) => {
        if (!user) return;
        setLoading(true);

        try {
            // Call the RPC function we created (or update directly if RLS allows)
            // Using RPC is safer for concurrency, but direct update works for simple apps
            // We'll try direct update first as it's simpler to setup without SQL functions if not present

            const { error } = await supabase.rpc('increment_coins', {
                user_id: user.id,
                amount: amount,
                reason: reason
            });

            if (error) {
                // Fallback to direct update if RPC doesn't exist (Legacy fallback, but we should rely on RPC now)
                console.warn("RPC increment_coins failed, trying direct update", error);

                // Note: Direct update won't log history unless we manually insert into coin_transactions too
                // For now, we'll just update the balance if RPC fails
                const currentCoins = profile?.coins || 0;
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ coins: currentCoins + amount })
                    .eq('id', user.id);

                if (updateError) throw updateError;
            }

            // Show celebration toast
            toast.success(reason, {
                description: `+${amount} Coins`,
                icon: <Coins className="h-5 w-5 text-yellow-500" />,
                duration: 4000,
            });

            // Refresh profile to update UI
            refreshProfile();

        } catch (error) {
            console.error('Error awarding coins:', error);
            toast.error('Could not award coins');
        } finally {
            setLoading(false);
        }
    };

    return {
        awardCoins,
        loading,
        DAILY_LOGIN_REWARD,
        UPLOAD_REWARD
    };
};
