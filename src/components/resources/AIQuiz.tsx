
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, CheckCircle2, XCircle, RefreshCw, Trophy } from "lucide-react";
import { extractTextFromPDF } from '@/lib/utils/pdfUtils';
import { generateQuiz, QuizQuestion } from '@/lib/ai/gemini';
import { cn } from "@/lib/utils";

interface AIQuizProps {
    fileUrl: string;
}

export function AIQuiz({ fileUrl }: AIQuizProps) {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiKeyMissing] = useState(!import.meta.env.VITE_GEMINI_API_KEY);

    // Quiz State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);

    const handleGenerateQuiz = async () => {
        if (apiKeyMissing) return;
        setLoading(true);
        setError(null);
        setQuizCompleted(false);
        setScore(0);
        setCurrentQuestionIndex(0);
        setQuestions([]);

        try {
            const text = await extractTextFromPDF(fileUrl);
            if (!text || text.length < 50) throw new Error("Could not extract text.");

            const quizData = await generateQuiz(text);
            if (quizData.length === 0) throw new Error("No questions generated.");

            setQuestions(quizData);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to generate quiz.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (optionIndex: number) => {
        if (selectedAnswer !== null) return; // Prevent changing answer
        setSelectedAnswer(optionIndex);

        if (optionIndex === questions[currentQuestionIndex].correctAnswer) {
            setScore(prev => prev + 1);
        }

        // Delay to show result then move next
        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
            } else {
                setQuizCompleted(true);
            }
        }, 1500);
    };

    if (apiKeyMissing) return null; // Summary component already shows the warning

    // Initial State
    if (questions.length === 0 && !quizCompleted) {
        return (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5 mt-4">
                <Brain className="h-8 w-8 text-pink-500 mb-3" />
                <h3 className="text-lg font-semibold mb-1">Test Your Knowledge</h3>
                <p className="text-sm text-slate-500 mb-4 text-center max-w-sm">
                    Generate an instant 5-question quiz based on this document.
                </p>
                <Button
                    onClick={handleGenerateQuiz}
                    disabled={loading}
                    variant="outline"
                    className="border-pink-500 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                >
                    {loading ? "Generating Quiz..." : "Create AI Quiz"}
                </Button>
                {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            </div>
        );
    }

    // Results State
    if (quizCompleted) {
        return (
            <Card className="mt-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-none shadow-lg">
                <CardContent className="p-8 flex flex-col items-center text-center">
                    <Trophy className="h-16 w-16 text-yellow-500 mb-4 animate-bounce" />
                    <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">You scored</p>
                    <div className="text-5xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                        {score} / {questions.length}
                    </div>
                    <Button onClick={handleGenerateQuiz} className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Question State
    const currentQ = questions[currentQuestionIndex];
    return (
        <Card className="mt-4 border-slate-200 dark:border-white/10">
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Question {currentQuestionIndex + 1} / {questions.length}
                    </span>
                    <span className="text-xs font-bold text-pink-500">Score: {score}</span>
                </div>

                <h3 className="text-lg font-medium mb-6 leading-relaxed">
                    {currentQ.question}
                </h3>

                <div className="space-y-3">
                    {currentQ.options.map((option, idx) => {
                        const isSelected = selectedAnswer === idx;
                        const isCorrect = idx === currentQ.correctAnswer;
                        const showResult = selectedAnswer !== null;

                        let btnClass = "w-full justify-start text-left h-auto py-3 px-4 white-space-normal";
                        if (showResult) {
                            if (isCorrect) btnClass += " bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300";
                            else if (isSelected) btnClass += " bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300";
                            else btnClass += " opacity-50";
                        }

                        return (
                            <Button
                                key={idx}
                                variant="outline"
                                className={btnClass}
                                onClick={() => handleAnswer(idx)}
                                disabled={selectedAnswer !== null}
                            >
                                <div className="flex items-center w-full">
                                    <span className="mr-3 flex-shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold opacity-70">
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="flex-1">{option}</span>
                                    {showResult && isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600 ml-2" />}
                                    {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600 ml-2" />}
                                </div>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
