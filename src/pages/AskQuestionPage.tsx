
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { useSelection } from "@/contexts/SelectionContext";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VoiceRecorder } from "@/components/ai/VoiceRecorder";
import { toast } from "sonner";

export default function AskQuestionPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { selectedCollege, selectedCourse } = useSelection();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            setError("Please fill in all fields");
            return;
        }
        if (!user) return;

        setSubmitting(true);
        setError("");

        try {
            const { data, error } = await supabase.from('forum_questions' as any).insert({
                title,
                content,
                user_id: user.id,
                college_id: selectedCollege?.id,
                course_id: selectedCourse?.id,
                tags: [] // Todo: Add tag input
            }).select();

            if (error) throw error;

            navigate('/forum');
        } catch (err: any) {
            console.error("Error creating question:", err);
            toast.error(err.message || "Failed to post question. Please try again.");
            setError(err.message || "Failed to post question");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4 lg:p-8">
            <Button variant="ghost" onClick={() => navigate('/forum')} className="mb-6 text-slate-500">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Forum
            </Button>

            <Card className="glass-card bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10">
                <CardHeader>
                    <CardTitle className="text-2xl">Ask a Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            placeholder="e.g. How to solve Integration by Parts?"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="bg-white dark:bg-black/20"
                        />
                        <p className="text-xs text-slate-500">Be specific and imagine you're asking a question to another person.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Details</Label>
                        <div className="relative">
                            <Textarea
                                placeholder="Describe your problem in detail..."
                                className="min-h-[200px] bg-white dark:bg-black/20 pr-10"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                            />
                            <div className="absolute bottom-2 right-2">
                                <VoiceRecorder onTranscript={(text) => setContent(prev => prev + " " + text)} variant="icon" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                        <p>Posting in:</p>
                        <ul className="list-disc list-inside mt-2 font-medium">
                            <li>College: {selectedCollege?.name || "Global"}</li>
                            <li>Course: {selectedCourse?.name || "Global"}</li>
                        </ul>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
                        <p className="text-xs text-muted-foreground italic">
                            Note: Your question will be posted publicly to the {selectedCollege?.name || "community"} forum.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => navigate('/forum')}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={submitting} className="bg-[#8A4FFF] text-white hover:bg-[#7a46e0]">
                                {submitting ? 'Publishing...' : 'Publish Question'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
