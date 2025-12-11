
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    created_at: string;
}

export interface UserBadge {
    user_id: string;
    badge_id: string;
    earned_at: string;
    badge: Badge;
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    xp_reward: number;
    coin_reward: number;
    type: 'daily' | 'weekly' | 'season';
    condition: string;
    target_value: number;
}

export interface UserMission {
    id: string;
    user_id: string;
    mission_id: string;
    progress: number;
    is_claimed: boolean;
    reset_at: string;
    mission: Mission;
}

export interface LeaderboardEntry {
    user_id: string;
    full_name: string;
    avatar_url?: string;
    coins: number;
    rank: number;
}

export function useGamification(userId?: string) {
    const [badges, setBadges] = useState<UserBadge[]>([]);
    const [allBadges, setAllBadges] = useState<Badge[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [missions, setMissions] = useState<UserMission[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch User Badges
    const fetchUserBadges = async () => {
        if (!userId) return;
        try {
            const { data, error } = await supabase
                .from('user_badges' as any)
                .select(`
          *,
          badge:badges(*)
        `)
                .eq('user_id', userId);

            if (error) throw error;
            setBadges(data as any);
        } catch (err) {
            console.error('Error fetching user badges:', err);
        }
    };

    // Fetch All Badges (System)
    const fetchAllBadges = async () => {
        try {
            const { data, error } = await supabase
                .from('badges' as any)
                .select('*')
                .order('name');

            if (error) throw error;
            setAllBadges(data as any);
        } catch (err) {
            console.error('Error fetching all badges:', err);
        }
    };

    // Init Daily Missions (Assign if missing)
    const checkAndAssignMissions = async () => {
        if (!userId) return;

        // 1. Get all definitions
        const { data: missionDefs } = await supabase.from('missions' as any).select('*');
        if (!missionDefs) return;

        // 2. Get today's active missions for user
        // Logic: For daily missions, reset_at should be TOMORROW midnight
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        // Simple check: Do we have active records?
        const { data: existing } = await supabase
            .from('user_missions' as any)
            .select('*')
            .eq('user_id', userId)
            .gt('reset_at', new Date().toISOString());

        if (existing && existing.length > 0) {
            // Already assigned
            return;
        }

        // 3. Assign new missions
        // For simple demo, we assign ALL daily missions
        const newMissions = (missionDefs as any[]).map(m => ({
            user_id: userId,
            mission_id: m.id,
            progress: 0,
            is_claimed: false,
            reset_at: tomorrow.toISOString() // Expires next day
        }));

        const { error } = await supabase.from('user_missions' as any).insert(newMissions);
        if (error && error.code !== '23505') { // Ignore duplicate key
            console.error("Error assigning missions", error);
        }
    };

    const fetchMissions = async () => {
        if (!userId) return;
        // Assign first
        await checkAndAssignMissions();

        // Then Fetch
        const { data, error } = await supabase
            .from('user_missions' as any)
            .select('*, mission:missions(*)')
            .eq('user_id', userId)
            .gt('reset_at', new Date().toISOString()) // Only active ones
            .order('is_claimed', { ascending: true }); // Unclaimed first

        if (error) console.error(error);
        else setMissions(data as any || []);
    };

    const claimMission = async (userMissionId: string, coinReward: number, xpReward: number) => {
        try {
            if (!userId) return;

            const { data, error } = await (supabase.rpc as any)('claim_mission', {
                p_mission_id: userMissionId,
                p_user_id: userId
            });

            if (error) throw error;

            toast.success(`Claimed! +${coinReward} Coins, +${xpReward} XP`);

            // Refresh
            fetchMissions();
            fetchLeaderboard(); // Update rank

        } catch (error) {
            toast.error("Failed to claim mission");
            console.error(error);
        }
    };

    // Fetch Leaderboard (Top 5 by Coins)
    const fetchLeaderboard = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, coins')
                .order('coins', { ascending: false })
                .limit(5);

            if (error) throw error;

            const rankedData = data.map((user, index) => ({
                user_id: user.id,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
                coins: user.coins || 0,
                rank: index + 1
            }));

            setLeaderboard(rankedData);
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
        }
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([
            userId ? fetchUserBadges() : Promise.resolve(),
            userId ? fetchMissions() : Promise.resolve(),
            fetchAllBadges(),
            fetchLeaderboard()
        ]).finally(() => setLoading(false));

        if (!userId) return;

        // Realtime Subscription
        const channel = supabase.channel('gamification-updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'user_missions', filter: `user_id=eq.${userId}` },
                () => { fetchMissions(); }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'user_badges', filter: `user_id=eq.${userId}` },
                () => { fetchUserBadges(); }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
                () => { fetchLeaderboard(); } // Refresh leaderboard if my coins change
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return {
        badges,
        allBadges,
        leaderboard,
        missions,
        claimMission,
        loading,
        refresh: fetchLeaderboard
    };
}
