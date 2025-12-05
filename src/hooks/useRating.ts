import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/useAuth';
import { toast } from 'sonner';

export function useRating(resourceId: string) {
    const { user } = useAuth();
    const [userRating, setUserRating] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !resourceId) return;
        fetchUserRating();
    }, [user, resourceId]);

    const fetchUserRating = async () => {
        try {
            const { data, error } = await supabase
                .from('resource_ratings')
                .select('rating')
                .eq('user_id', user?.id)
                .eq('resource_id', resourceId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                console.error('Error fetching rating:', error);
            }

            if (data) {
                setUserRating(data.rating);
            }
        } catch (error) {
            console.error('Error fetching rating:', error);
        } finally {
            setLoading(false);
        }
    };

    const submitRating = async (rating: number) => {
        if (!user) {
            toast.error("Please login to rate resources");
            return;
        }

        try {
            // Upsert rating (insert or update)
            const { error } = await supabase
                .from('resource_ratings')
                .upsert({
                    user_id: user.id,
                    resource_id: resourceId,
                    rating: rating
                }, {
                    onConflict: 'user_id,resource_id'
                });

            if (error) throw error;

            setUserRating(rating);
            toast.success("Rating submitted!");

        } catch (error: any) {
            console.error('Error submitting rating:', error);
            toast.error(`Failed to submit rating: ${error.message || error.details || "Unknown error"}`);
        }
    };

    return {
        userRating,
        loading,
        submitRating
    };
}
