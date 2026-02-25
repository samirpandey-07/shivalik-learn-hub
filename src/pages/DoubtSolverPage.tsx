import { useState, useRef } from "react";
import { solveWithImage } from "@/lib/ai/gemini";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Upload, Image as ImageIcon, Send, X, AlertTriangle, Coins, CheckCircle, Play } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/useAuth";
import { useGamification } from "@/hooks/useGamification"; // Import hook
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";
import { VoiceRecorder } from "@/components/ai/VoiceRecorder";
import { AILoadingState } from "@/components/ui/AILoadingState";

const SOLVE_COST = 50;

export default function DoubtSolverPage() {
    const { profile, updateProfile } = useAuth();
    const { updateMissionProgress } = useGamification(profile?.id); // Init hook
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith("image/")) {
                setImageFile(file);
                setPreviewUrl(URL.createObjectURL(file));
                setError(null);
                setAnswer(""); // Clear previous answer
            } else {
                toast.error("Please upload a valid image file");
            }
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const loadDemoData = async () => {
        try {
            // Create a dummy image file (1x1 pixel transparent GIF)
            const response = await fetch("https://placehold.co/600x400/png?text=Math+Problem:+Integrate+x^2");
            const blob = await response.blob();
            const file = new File([blob], "demo-problem.png", { type: "image/png" });

            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setQuestion("Solve this integration problem step-by-step.");
            toast.success("Demo data loaded!");
        } catch (e) {
            toast.error("Failed to load demo data.");
        }
    };

    const triggerConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const handleSolve = async () => {
        if (!imageFile && !question.trim()) {
            toast.error("Please upload an image OR ask a question");
            return;
        }

        const currentCoins = profile?.coins || 0;
        if (currentCoins < SOLVE_COST) {
            toast.error("Not enough coins!", {
                description: `You need ${SOLVE_COST} coins. You have ${currentCoins}. Upload notes to earn more!`
            });
            return;
        }

        setLoading(true);
        setError(null);
        setAnswer("");

        try {
            await updateProfile({ coins: currentCoins - SOLVE_COST });
        } catch (e) {
            console.error("Failed to deduct coins (Offline?)", e);
            // Handle offline or error scenario gracefully
            toast.message("Offline Mode Active", { description: "Proceeding without coin deduction." });
        }

        try {
            const { solveDoubt } = await import("@/lib/ai/gemini");
            const prompt = question.trim() || "Solve this problem step-by-step.";

            const response = await solveDoubt(prompt, imageFile);

            setAnswer(response);
            toast.success("Solution generated!");
            triggerConfetti(); // 🎉 Trigger success animation

            // Update Mission: Solve Doubt
            updateMissionProgress('solve_doubt', 1);

        } catch (err: any) {
            console.error(err);
            const errorMessage = err.message || "Failed to analyze. Please try again.";
            setError(errorMessage);
            toast.error("Failed to solve doubt. Coins refunded.");

            // Refund
            await updateProfile({ coins: (profile?.coins || 0) + SOLVE_COST });

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-5xl space-y-6">
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Doubt Solver</h1>
                        <p className="text-muted-foreground">
                            Upload a photo of your question and get an instant step-by-step solution.
                        </p>
                    </div>
                    {/* Coin Balance Display */}
                    <div className="flex flex-col items-end gap-2">
                        <Badge variant="secondary" className="text-lg px-4 py-1 gap-2 border-yellow-500/20 bg-yellow-500/10">
                            <Coins className="h-5 w-5 text-yellow-500" />
                            <span className="text-yellow-700 dark:text-yellow-400 font-bold">{profile?.coins || 0}</span>
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={loadDemoData} className="text-xs text-muted-foreground hover:text-primary">
                            <Play className="h-3 w-3 mr-1" /> Load Demo Data
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <Card className="h-fit border-l-4 border-l-primary shadow-md">
                    <CardHeader>
                        <CardTitle>Upload Question</CardTitle>
                        <CardDescription>Snap a photo or upload an image of the problem.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Image Upload Area */}
                        <div
                            className={`
                                border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300
                                ${previewUrl ? 'border-primary/50 bg-secondary/20' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-secondary/10 hover:shadow-inner'}
                            `}
                            onClick={() => !previewUrl && fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />

                            {previewUrl ? (
                                <div className="relative w-full max-h-[300px] flex justify-center group">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="max-h-[300px] w-auto object-contain rounded-md shadow-sm group-hover:opacity-90 transition-opacity"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveImage();
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="py-8 space-y-2">
                                    <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-2 text-primary">
                                        <Upload className="h-8 w-8" />
                                    </div>
                                    <h3 className="font-semibold text-lg">Click to upload image</h3>
                                    <p className="text-sm text-muted-foreground">Supported: JPG, PNG, WEBP</p>
                                </div>
                            )}
                        </div>

                        {/* Optional Text Context + Voice Input */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Specific Question (Optional)
                                </label>
                                <VoiceRecorder onTranscript={(text) => setQuestion(prev => prev + " " + text)} variant="minimal" />
                            </div>
                            <div className="relative">
                                <Textarea
                                    placeholder="Type or use voice input..."
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    className="resize-none pr-12 min-h-[80px]"
                                />
                                <div className="absolute bottom-2 right-2">
                                    <VoiceRecorder onTranscript={(text) => setQuestion(prev => prev + " " + text)} variant="icon" />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleSolve}
                            disabled={(!imageFile && !question.trim()) || loading}
                            className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-700 shadow-lg shadow-primary/20 transition-all duration-300 transform hover:scale-[1.02]"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <span className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Solve Doubt
                                    </span>
                                    <span className="ml-auto text-xs bg-black/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Coins className="h-3 w-3 text-yellow-500" />
                                        {SOLVE_COST}
                                    </span>
                                </>
                            )}
                        </Button>

                        {error && (
                            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Output Section */}
                <Card className="min-h-[500px] flex flex-col shadow-md border-t-4 border-t-green-500/50">
                    <CardHeader className="border-b bg-secondary/10">
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                            Detailed Solution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-6 overflow-y-auto max-h-[700px] scroll-smooth">
                        {loading ? (
                            <AILoadingState />
                        ) : answer ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none animate-in fade-in slide-in-from-bottom-5 duration-500">
                                <ReactMarkdown
                                    components={{
                                        // Custom styling for code blocks if needed
                                        code({ node, inline, className, children, ...props }: any) {
                                            return (
                                                <code
                                                    className={`${className} ${inline ? 'bg-secondary px-1 py-0.5 rounded font-mono text-primary' : 'block bg-slate-950 text-slate-50 p-4 rounded-lg my-4 overflow-x-auto shadow-inner'}`}
                                                    {...props}
                                                >
                                                    {children}
                                                </code>
                                            )
                                        }
                                    }}
                                >
                                    {answer}
                                </ReactMarkdown>
                                <div className="mt-8 pt-4 border-t text-center">
                                    <p className="text-xs text-muted-foreground"></p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground min-h-[300px] opacity-60">
                                <div className="p-6 bg-secondary/30 rounded-full mb-4">
                                    <Send className="h-10 w-10 opacity-40" />
                                </div>
                                <p className="text-lg font-medium">Ready to Solve</p>
                                <p className="text-sm">Upload an image to get started</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
