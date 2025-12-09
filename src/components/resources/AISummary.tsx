
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, FileText, AlertCircle } from "lucide-react";
import { extractTextFromPDF } from '@/lib/utils/pdfUtils';
import { generateSummary } from '@/lib/ai/gemini';

interface AISummaryProps {
    fileUrl: string;
}

export function AISummary({ fileUrl }: AISummaryProps) {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiKeyMissing, setApiKeyMissing] = useState(!import.meta.env.VITE_GEMINI_API_KEY);

    const handleSummarize = async () => {
        if (apiKeyMissing) return;
        setLoading(true);
        setError(null);
        try {
            // 1. Extract Text
            const text = await extractTextFromPDF(fileUrl);
            if (!text || text.length < 50) throw new Error("Could not extract sufficient text from this PDF.");

            // 2. Generate Summary
            const result = await generateSummary(text);
            setSummary(result);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to generate summary.");
        } finally {
            setLoading(false);
        }
    };

    if (apiKeyMissing) {
        return (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    AI features require a Gemini API Key. Please configure `VITE_GEMINI_API_KEY`.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {!summary && (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5">
                    <Sparkles className="h-8 w-8 text-[#8A4FFF] mb-3" />
                    <h3 className="text-lg font-semibold mb-1">AI Smart Summary</h3>
                    <p className="text-sm text-slate-500 mb-4 text-center max-w-sm">
                        Get a quick AI-generated summary of this resource to save time.
                    </p>
                    <Button
                        onClick={handleSummarize}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-opacity"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? "Analyzing PDF..." : "Generate Summary"}
                    </Button>
                    {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
                </div>
            )}

            {summary && (
                <Card className="border-l-4 border-l-[#8A4FFF] shadow-md bg-white/80 dark:bg-black/40 backdrop-blur">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-[#8A4FFF]" />
                            <h3 className="font-bold text-lg">AI Summary</h3>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-line">
                            {summary}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
