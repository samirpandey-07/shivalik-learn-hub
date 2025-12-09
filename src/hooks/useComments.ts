
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface Comment {
    id: string;
    resource_id: string;
    user_id: string;
    content: string;
    created_at: string;
    // Optional joined fields if we were joining
    profiles?: {
        full_name: string;
    }
}

export function useComments(resourceId: string | undefined) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchComments = async () => {
        if (!resourceId) return;
        setLoading(true);

        try {
            // 1. Fetch comments raw
            const { data: commentsData, error: commentsError } = await supabase
                .from('comments' as any)
                .select('*')
                .eq('resource_id', resourceId)
                .order('created_at', { ascending: false });

            if (commentsError) throw commentsError;

            // 2. Fetch profiles for these comments manually
            if (commentsData && commentsData.length > 0) {
                const userIds = Array.from(new Set(commentsData.map((c: any) => c.user_id)));

                // Fetch profiles individually to avoid 400 error with .in() or avatar_url missing
                const profilesPromises = userIds.map(uid =>
                    supabase
                        .from('profiles')
                        .select('id, full_name')
                        .eq('id', uid)
                        .single()
                );

                const results = await Promise.all(profilesPromises);
                const profilesData = results.map(r => r.data).filter(Boolean);

                const profilesMap = new Map(profilesData.map((p: any) => [p.id, p]));

                // 3. Merge data
                const enrichedComments = commentsData.map((comment: any) => ({
                    ...comment,
                    profiles: profilesMap.get(comment.user_id) || { full_name: 'Unknown User' }
                }));

                setComments(enrichedComments);
            } else {
                setComments([]);
            }
        } catch (err) {
            console.error("Error fetching comments:", err);
            // Don't set error state that blocks UI, just log it. Use empty comments fallback.
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();

        // Realtime subscription
        const channel = supabase
            .channel(`comments-${resourceId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'comments',
                    filter: `resource_id=eq.${resourceId}`
                },
                () => {
                    fetchComments();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [resourceId]);

    const addComment = async (userId: string, content: string) => {
        if (!resourceId) return { error: 'No resource ID' };

        const { error } = await supabase
            .from('comments' as any)
            .insert([
                {
                    resource_id: resourceId,
                    user_id: userId,
                    content
                }
            ]);

        return { error };
    };

    const deleteComment = async (commentId: string) => {
        const { error } = await supabase
            .from('comments' as any)
            .delete()
            .eq('id', commentId);
        return { error };
    };

    return { comments, loading, addComment, deleteComment };
}
