import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Loader2, AlertCircle, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateQuizFromUrl, QuizQuestion } from "@/lib/ai/gemini";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AIQuizProps {
    fileUrl: string;
}

export function AIQuiz({ fileUrl }: AIQuizProps) {
    const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [showResults, setShowResults] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setQuiz(null);
        setUserAnswers({});
        setShowResults(false);

        try {
            const result = await generateQuizFromUrl(fileUrl);
            setQuiz(result);
            toast.success("Quiz generated successfully!");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to generate quiz");
            toast.error("Failed to generate quiz");
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (qIndex: number, optionIndex: number) => {
        if (showResults) return;
        setUserAnswers(prev => ({
            ...prev,
            [qIndex]: optionIndex
        }));
    };

    const calculateScore = () => {
        if (!quiz) return 0;
        let correct = 0;
        quiz.forEach((q, i) => {
            if (userAnswers[i] === q.correctAnswer) correct++;
        });
        return correct;
    };

    return (
        <Card className="mt-8 border-l-4 border-l-pink-500 shadow-md bg-white/80 dark:bg-black/40 backdrop-blur overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5 pointer-events-none" />

            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-pink-500" />
                    Smart Quiz
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {!quiz && !loading && !error && (
                    <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground mb-4">
                            Test your knowledge with a generated quiz based on this document.
                        </p>
                        <Button
                            onClick={handleGenerate}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 shadow-lg shadow-pink-500/20"
                        >
                            <Brain className="mr-2 h-4 w-4" /> Generate Quiz
                        </Button>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-3">
                        <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
                        <p className="text-sm text-muted-foreground animate-pulse">Generating questions...</p>
                    </div>
                )}

                {error && (
                    <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">Generation Failed</p>
                            <p className="opacity-90">{error}</p>
                            <Button variant="outline" size="sm" onClick={handleGenerate} className="mt-2 text-destructive border-destructive/20 hover:bg-destructive/10">
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}

                {quiz && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        {quiz.map((q, qIndex) => (
                            <div key={qIndex} className="space-y-3">
                                <h3 className="font-medium text-sm md:text-base flex gap-2">
                                    <span className="text-muted-foreground">{qIndex + 1}.</span>
                                    {q.question}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                                    {q.options.map((option, oIndex) => {
                                        const isSelected = userAnswers[qIndex] === oIndex;
                                        const isCorrect = q.correctAnswer === oIndex;
                                        const showCorrectness = showResults;

                                        let variantClass = "border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5";

                                        if (showCorrectness) {
                                            if (isCorrect) variantClass = "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400";
                                            else if (isSelected && !isCorrect) variantClass = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
                                            else if (!isSelected && !isCorrect) variantClass = "opacity-50";
                                        } else if (isSelected) {
                                            variantClass = "border-pink-500 bg-pink-500/5 text-pink-600 dark:text-pink-400 ring-1 ring-pink-500";
                                        }

                                        return (
                                            <div
                                                key={oIndex}
                                                onClick={() => handleOptionSelect(qIndex, oIndex)}
                                                className={cn(
                                                    "p-3 rounded-lg border text-sm cursor-pointer transition-all duration-200 flex items-center justify-between",
                                                    variantClass
                                                )}
                                            >
                                                {option}
                                                {showCorrectness && isCorrect && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                                {showCorrectness && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-500" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
                            {!showResults ? (
                                <Button
                                    onClick={() => setShowResults(true)}
                                    disabled={Object.keys(userAnswers).length < quiz.length}
                                    className="w-full md:w-auto"
                                >
                                    Check Answers
                                </Button>
                            ) : (
                                <div className="flex items-center gap-4 w-full">
                                    <div className="flex-1">
                                        <p className="font-bold text-lg">
                                            Score: {calculateScore()} / {quiz.length}
                                        </p>
                                    </div>
                                    <Button onClick={handleGenerate} variant="outline" className="gap-2">
                                        <RefreshCw className="h-4 w-4" /> New Quiz
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
