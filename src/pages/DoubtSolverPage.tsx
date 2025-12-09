
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/useAuth";
import { solveWithImage } from "@/lib/ai/gemini";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, Camera, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function DoubtSolverPage() {
    const { user } = useAuth();
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState("");
    const [answer, setAnswer] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setAnswer(null); // Reset previous answer
        }
    };

    const handleSolve = async () => {
        if (!image) return;

        setLoading(true);
        setAnswer(null);
        try {
            const result = await solveWithImage(image, prompt || "Solve this problem step-by-step.");
            setAnswer(result);
            toast.success("Solution generated!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to solve doubt. Try a clearer image.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 flex items-center justify-center gap-3">
                    <Sparkles className="h-8 w-8 text-purple-400" />
                    AI Doubt Solver
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Stuck on a problem? Snap a photo and let AI explain it step-by-step.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <Card className="bg-white/5 border-white/10 hover:border-purple-500/30 transition-all">
                        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-white/10 rounded-xl relative group cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}>

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />

                            {preview ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img src={preview} alt="Preview" className="max-h-64 rounded-lg object-contain shadow-lg" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                                        <p className="text-white font-medium flex items-center gap-2">
                                            <Camera className="h-5 w-5" /> Change Image
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="h-20 w-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-purple-500/20 transition-colors">
                                        <Upload className="h-10 w-10 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg">Click to Upload</p>
                                        <p className="text-sm text-muted-foreground">or drag and drop an image here</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground/50 uppercase tracking-widest">Supports JPG, PNG, WEBP</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <Input
                            placeholder="Add specific instructions (optional)... e.g. 'Explain using calculus'"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="bg-white/5 border-white/10 h-12"
                        />

                        <Button
                            className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-purple-900/20"
                            onClick={handleSolve}
                            disabled={!image || loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Analyzing Image...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5 mr-2" /> Solve Doubt
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Output Section */}
                <div className="relative">
                    {answer ? (
                        <Card className="bg-black/20 border-white/10 h-full min-h-[500px] backdrop-blur-xl">
                            <CardContent className="p-6 h-full overflow-y-auto max-h-[600px] prose prose-invert max-w-none">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400">
                                    <Sparkles className="h-5 w-5" /> Detailed Solution
                                </h3>
                                <ReactMarkdown>{answer}</ReactMarkdown>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-muted-foreground border border-white/5 rounded-xl bg-white/5 p-8 text-center space-y-4">
                            <Sparkles className="h-16 w-16 opacity-20" />
                            <div>
                                <h3 className="font-semibold text-lg">Ready to Solve</h3>
                                <p className="max-w-xs mx-auto mt-2">Upload an image and click solve to see the magic happen.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
