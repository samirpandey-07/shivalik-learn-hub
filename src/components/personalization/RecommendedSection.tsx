
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase/client";
import { getEmbedding } from "@/lib/ai/gemini";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, ArrowRight, BookOpen, Clock } from "lucide-react";
import { toast } from "sonner";

interface Resource {
    id: string;
    title: string;
    description: string;
    similarity: number;
    type: string;
    subject: string;
}

export function RecommendedSection() {
    const { profile } = useAuth();
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchRecommendations() {
            if (!profile?.study_preferences) {
                setLoading(false);
                return;
            }

            const { weak_areas, goal } = profile.study_preferences;

            if (!weak_areas || weak_areas.length === 0) {
                setLoading(false);
                return;
            }

            try {
                // Construct a query prompt from preferences
                // e.g. "Calculus high yield notes for exam prep"
                const prompt = `${weak_areas.join(" ")} ${goal?.replace('_', ' ')} study material`;

                // 1. Generate Embedding
                const embedding = await getEmbedding(prompt);

                if (!embedding) {
                    console.error("Failed to generate embedding for recommendations");
                    setLoading(false);
                    return;
                }

                // 2. Call RPC
                const { data, error } = await supabase.rpc('match_resources', {
                    query_embedding: embedding,
                    match_threshold: 0.5, // 50% similarity
                    match_count: 4
                });

                if (error) throw error;

                // 3. Fetch full details for these IDs (since RPC returns minimal)
                if (data && data.length > 0) {
                    const ids = data.map((d: any) => d.id);
                    const { data: fullData } = await supabase
                        .from('resources')
                        .select('id, title, description, type, subject')
                        .in('id', ids);

                    if (fullData) {
                        const merged = fullData.map(r => ({
                            ...r,
                            similarity: data.find((d: any) => d.id === r.id)?.similarity || 0
                        }));
                        setResources(merged);
                    }
                }

            } catch (error) {
                console.error("Recommendation Error:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchRecommendations();
    }, [profile]);

    if (!profile?.study_preferences || (!loading && resources.length === 0)) {
        return null;
    }

    return (
        <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                        Picked for You
                    </h2>
                </div>
                {/* <Button variant="ghost" className="text-sm">See Why</Button> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                        <Card key={i} className="bg-white/5 border-white/10">
                            <CardContent className="p-4 space-y-3">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    resources.map(res => (
                        <Card
                            key={res.id}
                            onClick={() => navigate(`/resource/${res.id}`)}
                            className="group cursor-pointer bg-white/50 dark:bg-zinc-900/50 border-white/20 dark:border-white/5 hover:border-indigo-500/50 hover:shadow-lg transition-all overflow-hidden relative"
                        >
                            {/* Similarity Score Badge */}
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-[10px] text-white px-2 py-0.5 rounded-full z-10 border border-white/10">
                                {Math.round(res.similarity * 100)}% Match
                            </div>

                            <CardContent className="p-4 flex flex-col h-full gap-3">
                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                    <BookOpen className="h-5 w-5" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex gap-2 mb-2">
                                        <Badge variant="outline" className="text-[10px] h-5 border-indigo-500/20 text-indigo-500">
                                            {res.subject}
                                        </Badge>
                                    </div>
                                    <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-indigo-500 transition-colors">
                                        {res.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {res.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
