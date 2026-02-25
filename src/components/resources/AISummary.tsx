import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateSummaryFromUrl } from "@/lib/ai/gemini";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface AISummaryProps {
    fileUrl: string;
}

export function AISummary({ fileUrl }: AISummaryProps) {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await generateSummaryFromUrl(fileUrl);
            setSummary(result);
            toast.success("Summary generated successfully!");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to generate summary");
            toast.error("Failed to generate summary");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-l-4 border-l-[#8A4FFF] shadow-md bg-white/80 dark:bg-black/40 backdrop-blur overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />

            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#8A4FFF]" />
                    Smart Summary
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {!summary && !loading && !error && (
                    <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground mb-4">
                            Get a quick, structured summary of this document.
                        </p>
                        <Button
                            onClick={handleGenerate}
                            className="bg-gradient-to-r from-[#8A4FFF] to-violet-600 hover:from-[#7a40e6] hover:to-violet-700 text-white border-0 shadow-lg shadow-violet-500/20"
                        >
                            <Sparkles className="mr-2 h-4 w-4" /> Generate Summary
                        </Button>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#8A4FFF] blur-xl opacity-20 rounded-full animate-pulse" />
                            <Loader2 className="h-8 w-8 text-[#8A4FFF] animate-spin relative z-10" />
                        </div>
                        <p className="text-sm text-muted-foreground animate-pulse">Analyzing document...</p>
                    </div>
                )}

                {error && (
                    <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                            <p className="font-medium">Generation Failed</p>
                            <p className="opacity-90">{error}</p>
                            <Button variant="outline" size="sm" onClick={handleGenerate} className="mt-2 border-destructive/20 hover:bg-destructive/10">
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}

                {summary && (
                    <div className="prose dark:prose-invert prose-sm max-w-none bg-white/50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                        <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
