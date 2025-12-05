import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/useAuth';
import { toast } from 'sonner';

interface AdminStats {
    pendingReviews: number;
    totalResources: number;
    totalUsers: number;
    totalDownloads: number;
}

interface AdminRealtimeContextType {
    stats: AdminStats;
    loading: boolean;
}

const AdminRealtimeContext = createContext<AdminRealtimeContextType | undefined>(undefined);

export function AdminRealtimeProvider({ children }: { children: React.ReactNode }) {
    const { user, roles } = useAuth();
    const isAdmin = roles.includes('admin');

    const [stats, setStats] = useState<AdminStats>({
        pendingReviews: 0,
        totalResources: 0,
        totalUsers: 0,
        totalDownloads: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Only fetch and subscribe if user is admin
        if (!user || !isAdmin) {
            setLoading(false);
            return;
        }

        fetchInitialStats();

        // Subscribe to changes
        const resourcesChannel = supabase
            .channel('admin-resources-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'resources' },
                (payload) => {
                    console.log('Resource change detected:', payload);
                    // Simple strategy: refetch all stats to be accurate
                    // Optimization: increment/decrement based on payload event type
                    fetchInitialStats();

                    if (payload.eventType === 'INSERT') {
                        toast.info("New resource uploaded!");
                    }
                }
            )
            .subscribe();

        const profilesChannel = supabase
            .channel('admin-profiles-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'profiles' },
                () => {
                    fetchInitialStats();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(resourcesChannel);
            supabase.removeChannel(profilesChannel);
        };
    }, [user, isAdmin]);

    const fetchInitialStats = async () => {
        try {
            // 1. Pending Reviews
            const { count: pendingCount } = await supabase
                .from('resources')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // 2. Total Resources
            const { count: resourcesCount } = await supabase
                .from('resources')
                .select('*', { count: 'exact', head: true });

            // 3. Total Users
            const { count: usersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // 4. Total Downloads (Sum of downloads column)
            // Note: This might be heavy if table is huge, but fine for now
            const { data: downloadsData } = await supabase
                .from('resources')
                .select('downloads');

            const totalDownloads = downloadsData?.reduce((sum, r) => sum + (r.downloads || 0), 0) || 0;

            setStats({
                pendingReviews: pendingCount || 0,
                totalResources: resourcesCount || 0,
                totalUsers: usersCount || 0,
                totalDownloads: totalDownloads
            });
        } catch (error) {
            console.error("Error fetching admin stats:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminRealtimeContext.Provider value={{ stats, loading }}>
            {children}
        </AdminRealtimeContext.Provider>
    );
}

export function useAdminRealtime() {
    const context = useContext(AdminRealtimeContext);
    if (context === undefined) {
        throw new Error('useAdminRealtime must be used within a AdminRealtimeProvider');
    }
    return context;
}
