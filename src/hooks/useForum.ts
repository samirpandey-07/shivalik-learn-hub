
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface ForumQuestion {
    id: string;
    title: string;
    content: string;
    user_id: string;
    college_id?: string;
    course_id?: string;
    tags?: string[];
    upvotes: number;
    views: number;
    created_at: string;
    profile?: {
        full_name: string;
        avatar_url?: string;
    };
    answers_count?: number;
}

export interface ForumAnswer {
    id: string;
    question_id: string;
    user_id: string;
    content: string;
    is_accepted: boolean;
    upvotes: number;
    created_at: string;
    profile?: {
        full_name: string;
        avatar_url?: string;
    };
}

// Helper to fetch keys
async function fetchProfiles(userIds: string[]) {
    if (!userIds.length) return new Map();
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds);

        if (error) {
            console.error('[useForum] Error fetching profiles:', error);
            // Return empty map on error to prevent crash
            return new Map();
        }
        return new Map(data?.map((p: any) => [p.id, p]));
    } catch (err) {
        console.error('[useForum] Exception in fetchProfiles:', err);
        return new Map();
    }
}

export function useForum(params?: { collegeId?: string; courseId?: string }) {
    const [questions, setQuestions] = useState<ForumQuestion[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQuestions = async () => {
        setLoading(true);
        console.log('[useForum] fetchQuestions started', params);
        try {
            // 1. Fetch raw questions with answer count
            let query = supabase
                .from('forum_questions' as any)
                .select(`
          *,
          answers:forum_answers(count)
        `)
                .order('created_at', { ascending: false });

            if (params?.collegeId) {
                query = query.eq('college_id', params.collegeId);
            }
            if (params?.courseId) {
                query = query.eq('course_id', params.courseId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('[useForum] Supabase error:', error);
                // Do not throw, just set empty array and log
                setQuestions([]);
                return;
            }

            if (!data || data.length === 0) {
                console.log('[useForum] No data found');
                setQuestions([]);
                return;
            }

            // 2. Fetch Profiles Separately
            const userIds = Array.from(new Set(data.map((q: any) => q.user_id)));
            const profileMap = await fetchProfiles(userIds);

            // 3. Merge
            const formattedData = data.map((q: any) => ({
                ...q,
                answers_count: q.answers ? q.answers[0]?.count : 0,
                profile: profileMap.get(q.user_id) || { full_name: 'Unknown User', avatar_url: null }
            }));

            setQuestions(formattedData);
        } catch (err) {
            console.error('[useForum] Error fetching questions:', err);
            // Ensure state is clean on error
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [params?.collegeId, params?.courseId]);

    return { questions, loading, refresh: fetchQuestions };
}

export function useQuestionDetail(questionId: string) {
    const [question, setQuestion] = useState<ForumQuestion | null>(null);
    const [answers, setAnswers] = useState<ForumAnswer[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDetail = async () => {
        if (!questionId) return;
        setLoading(true);
        try {
            // 1. Fetch Question (Raw)
            const { data: qData, error: qError } = await supabase
                .from('forum_questions' as any)
                .select('*')
                .eq('id', questionId)
                .single();

            if (qError) throw qError;

            // 2. Fetch Answers (Raw)
            const { data: aData, error: aError } = await supabase
                .from('forum_answers' as any)
                .select('*')
                .eq('question_id', questionId)
                .order('is_accepted', { ascending: false })
                .order('upvotes', { ascending: false });

            if (aError) throw aError;

            // 3. Fetch Profiles for Question Author and Answer Authors
            const userIds = new Set<string>();
            if (qData.user_id) userIds.add(qData.user_id);
            aData?.forEach((a: any) => { if (a.user_id) userIds.add(a.user_id); });

            const profileMap = await fetchProfiles(Array.from(userIds));

            // 4. Merge
            setQuestion({
                ...qData,
                profile: profileMap.get(qData.user_id) || { full_name: 'Unknown User', avatar_url: null }
            });

            setAnswers(aData?.map((a: any) => ({
                ...a,
                profile: profileMap.get(a.user_id) || { full_name: 'Unknown User', avatar_url: null }
            })) || []);

        } catch (err) {
            console.error('Error fetching question detail:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [questionId]);
    return { question, answers, loading, refresh: fetchDetail };
}

export function useTopContributors() {
    const [contributors, setContributors] = useState<{ id: string; full_name: string; avatar_url: string; points: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContributors = async () => {
            setLoading(true);
            try {
                // Query profiles table directly and sort by coins
                // Safe select in case coins column missing
                const { data: topUsers, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, coins')
                    .order('coins', { ascending: false })
                    .limit(5);

                if (error) {
                    console.error("Supabase error fetching contributors:", error);
                    // Do not throw, return empty
                    setContributors([]);
                    return;
                }

                const result = topUsers?.map((user: any) => ({
                    id: user.id || 'unknown',
                    full_name: user.full_name || 'Unknown User',
                    avatar_url: user.avatar_url || null,
                    points: user.coins || 0
                })) || [];

                setContributors(result);
            } catch (err) {
                console.error("Error fetching top contributors:", err);
                setContributors([]);
            } finally {
                setLoading(false);
            }
        };

        fetchContributors();
    }, []);

    return { contributors, loading };
}

export async function voteQuestion(questionId: string) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { error: userError || new Error("Not logged in") };

    // Check if voted
    const { data: existingVote, error: fetchError } = await supabase
        .from('forum_votes' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .maybeSingle();

    if (fetchError) return { error: fetchError };

    if (existingVote) {
        // Remove vote
        const { error } = await supabase
            .from('forum_votes' as any)
            .delete()
            .eq('user_id', user.id)
            .eq('question_id', questionId);
        return { error };
    } else {
        // Add vote
        const { error } = await supabase
            .from('forum_votes' as any)
            .insert({
                user_id: user.id,
                question_id: questionId,
                vote_type: 1
            });
        return { error };
    }
}

export async function deleteQuestion(questionId: string) {
    const { error } = await supabase
        .from('forum_questions')
        .delete()
        .eq('id', questionId);
    return { error };
}
