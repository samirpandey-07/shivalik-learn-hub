import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/useAuth';

export function useUserActivity() {
    const { user } = useAuth();
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchRecentActivity();
    }, [user]);

    const fetchRecentActivity = async () => {
        try {
            const { data, error } = await supabase
                .from('user_activity')
                .select(`
          *,
          resource:resources(*)
        `)
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            // Filter out activities where resource might have been deleted
            const validActivity = data?.filter(item => item.resource) || [];
            setRecentActivity(validActivity);
        } catch (error) {
            console.error('Error fetching recent activity:', error);
        } finally {
            setLoading(false);
        }
    };

    const logActivity = async (resourceId: string, action: 'view' | 'download') => {
        if (!user) return;

        try {
            await supabase.from('user_activity').insert({
                user_id: user.id,
                resource_id: resourceId,
                action
            });

            // Refresh list silently
            fetchRecentActivity();
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    };

    return {
        recentActivity,
        loading,
        logActivity
    };
}
