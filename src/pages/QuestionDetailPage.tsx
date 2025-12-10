
import { useParams, useNavigate } from "react-router-dom";
import { useQuestionDetail } from "@/hooks/useForum";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, CheckCircle, ThumbsUp } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/useAuth";

export default function QuestionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { question, answers, loading, refresh } = useQuestionDetail(id || "");
    const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
    const [newAnswer, setNewAnswer] = useState("");
    const [submitting, setSubmitting] = useState(false);


    // Fetch user votes when answers load
    useEffect(() => {
        if (!user || loading) return;

        const fetchVotes = async () => {
            const { data } = await supabase
                .from('forum_votes' as any)
                .select('question_id, answer_id')
                .eq('user_id', user.id);

            if (data) {
                const votedIds = new Set<string>();
                data.forEach((v: any) => {
                    if (v.question_id) votedIds.add(v.question_id);
                    if (v.answer_id) votedIds.add(v.answer_id);
                });
                setUserVotes(votedIds);
            }
        };

        fetchVotes();
    }, [user, loading, id]);

    const handleVote = async (itemId: string, type: 'question' | 'answer') => {
        if (!user) {
            // Show toast or alert
            return;
        }

        const isVoted = userVotes.has(itemId);

        // Optimistic Update
        const newVotes = new Set(userVotes);
        if (isVoted) newVotes.delete(itemId);
        else newVotes.add(itemId);
        setUserVotes(newVotes);

        // Update count visually
        // Note: For deep updates we'd need to update local state more complexly or just refresh.
        // Let's force a refresh for now or just trust the user sees the color change.
        // Better: Update the 'answers' state locally.

        /* 
           This part is tricky because 'answers' comes from useQuestionDetail hook. 
           We can modify it locally if we had a setAnswers exposed? 
           We don't have setAnswers exposed from the hook.
           We can call refresh() but it might be slow.
           Let's just rely on visual feedback (Color) and refresh().
        */
        refresh(); // Refresh to catch new counts from DB trigger

        try {
            if (isVoted) {
                // Remove vote
                await supabase.from('forum_votes' as any).delete()
                    .eq('user_id', user.id)
                    .eq(type === 'question' ? 'question_id' : 'answer_id', itemId);
            } else {
                // Add vote
                await supabase.from('forum_votes' as any).insert({
                    user_id: user.id,
                    [type === 'question' ? 'question_id' : 'answer_id']: itemId,
                    vote_type: 1
                });
            }
        } catch (err) {
            console.error("Error voting:", err);
            // Revert on error?
            refresh();
        }
    };

    const handlePostAnswer = async () => {
        if (!newAnswer.trim() || !user || !id) return;
        setSubmitting(true);
        try {
            const { error } = await supabase.from('forum_answers' as any).insert({
                question_id: id,
                user_id: user.id,
                content: newAnswer,
            });

            if (error) throw error;
            setNewAnswer("");
            refresh();
        } catch (err) {
            console.error("Error posting answer:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!question) return <div className="p-8 text-center">Question not found</div>;

    return (
        <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-8 pb-20">
            <Button variant="ghost" onClick={() => navigate('/forum')} className="text-slate-500">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Forum
            </Button>

            {/* Question Header */}
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{question.title}</h1>
                <div className="flex gap-2">
                    {question.tags?.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={question.profile?.avatar_url} />
                        <AvatarFallback>{question.profile?.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-slate-900 dark:text-slate-300">{question.profile?.full_name}</span>
                    <span>asked on {new Date(question.created_at).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Question Content */}
            <Card className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10">
                <CardContent className="p-6 prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{question.content}</p>
                </CardContent>
            </Card>

            {/* Answers Section */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">{answers.length} Answers</h2>

                {answers.map(ans => {
                    const isVoted = userVotes.has(ans.id);
                    return (
                        <div key={ans.id} className={`flex gap-4 p-6 rounded-xl border ${ans.is_accepted ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10'}`}>
                            {/* Vote Column */}
                            <div className="flex flex-col items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-white/10 ${isVoted ? 'text-primary' : ''}`}
                                    onClick={() => handleVote(ans.id, 'answer')}
                                >
                                    <ThumbsUp className={`h-4 w-4 ${isVoted ? 'fill-current' : ''}`} />
                                </Button>
                                <span className="font-bold">{ans.upvotes}</span>
                                {ans.is_accepted && <CheckCircle className="h-6 w-6 text-green-500 mt-2" />}
                            </div>

                            {/* Body */}
                            <div className="flex-1 space-y-2">
                                <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-200">{ans.content}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-4">
                                    <Avatar className="h-5 w-5">
                                        <AvatarImage src={ans.profile?.avatar_url} />
                                        <AvatarFallback>{ans.profile?.full_name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <span>{ans.profile?.full_name}</span>
                                    <span>answered {new Date(ans.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Your Answer Input */}
            <div className="space-y-4 pt-8 border-t border-slate-200 dark:border-white/10">
                <h3 className="text-xl font-bold">Your Answer</h3>
                <Textarea
                    placeholder="Write your solution here..."
                    className="min-h-[150px] bg-white dark:bg-white/5"
                    value={newAnswer}
                    onChange={e => setNewAnswer(e.target.value)}
                />
                <Button onClick={handlePostAnswer} disabled={submitting || !newAnswer.trim()} className="bg-[#4CC9F0] text-slate-900 hover:bg-[#3db5da]">
                    {submitting ? 'Posting...' : 'Post Answer'} <Send className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
