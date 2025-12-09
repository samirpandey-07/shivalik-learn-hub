
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

export function useForum(params?: { collegeId?: string; courseId?: string }) {
    const [questions, setQuestions] = useState<ForumQuestion[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('forum_questions' as any)
                .select(`
          *,
          profile:profiles(full_name, avatar_url),
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

            // Transform data to include answers_count check
            const formattedData = data?.map((q: any) => ({
                ...q,
                answers_count: q.answers ? q.answers[0]?.count : 0
            }));

            setQuestions(formattedData || []);
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
            // Fetch Question
            const { data: qData, error: qError } = await supabase
                .from('forum_questions' as any)
                .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
                .eq('id', questionId)
                .single();

            if (qError) throw qError;
            setQuestion(qData);

            // Fetch Answers
            const { data: aData, error: aError } = await supabase
                .from('forum_answers' as any)
                .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
                .eq('question_id', questionId)
                .order('is_accepted', { ascending: false }) // Accepted first
                .order('upvotes', { ascending: false });

            if (aError) throw aError;
            setAnswers(aData || []);

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
