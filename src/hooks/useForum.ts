
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
    const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);
    return new Map(data?.map((p: any) => [p.id, p]));
}

export function useForum(params?: { collegeId?: string; courseId?: string }) {
    const [questions, setQuestions] = useState<ForumQuestion[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQuestions = async () => {
        setLoading(true);
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

            if (error) throw error;

            if (!data || data.length === 0) {
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
            console.error('Error fetching questions:', err);
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
