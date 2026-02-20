
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase/client";
import { getEmbedding } from "@/lib/ai/gemini";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Sparkles,
    ArrowRight,
    BookOpen,
    Video,
    FileText,
    Link as LinkIcon,
    Presentation,
    Download,
    Star,
    Calendar,
    Crown
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Resource {
    id: string;
    title: string;
    description: string;
    similarity: number;
    type: string;
    subject: string;
    downloads: number;
    rating: number;
    file_size: string;
    created_at: string;
    uploader_name: string;
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
                        .select('id, title, description, type, subject, downloads, rating, file_size, created_at, uploader_name')
                        .in('id', ids);

                    if (fullData) {
                        const merged = fullData.map(r => ({
                            ...r,
                            similarity: data.find((d: any) => d.id === r.id)?.similarity || 0,
                            downloads: r.downloads || 0,
                            rating: r.rating || 0
                        }));
                        // Sort by similarity descending
                        merged.sort((a, b) => b.similarity - a.similarity);
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

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="h-5 w-5" />;
            case 'note':
            case 'notes': return <FileText className="h-5 w-5" />;
            case 'link': return <LinkIcon className="h-5 w-5" />;
            case 'presentation': return <Presentation className="h-5 w-5" />;
            default: return <BookOpen className="h-5 w-5" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'video': return "text-red-500 bg-red-500/10 border-red-500/20";
            case 'note':
            case 'notes': return "text-blue-500 bg-blue-500/10 border-blue-500/20";
            case 'link': return "text-green-500 bg-green-500/10 border-green-500/20";
            case 'presentation': return "text-orange-500 bg-orange-500/10 border-orange-500/20";
            default: return "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
        }
    };

    if (!profile?.study_preferences || (!loading && resources.length === 0)) {
        return null;
    }

    return (
        <div className="space-y-6 mb-12">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                            Picked for You
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Personalized resources based on your goals and weak areas.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                        <Card key={i} className="bg-white/5 border-white/10 overflow-hidden">
                            <CardContent className="p-0">
                                <Skeleton className="h-32 w-full rounded-none" />
                                <div className="p-4 space-y-3">
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    resources.map((res, index) => (
                        <Card
                            key={res.id}
                            onClick={() => navigate(`/resource/${res.id}`)}
                            className="group cursor-pointer bg-white/50 dark:bg-zinc-900/40 backdrop-blur-sm border-white/20 dark:border-white/5 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden relative flex flex-col"
                        >
                            {/* Top Match Badge */}
                            {index === 0 && (
                                <div className="absolute top-0 left-0 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg z-10 flex items-center gap-1 shadow-lg">
                                    <Crown className="h-3 w-3 fill-white" /> TOP PICK
                                </div>
                            )}

                            {/* Match % */}
                            <div className="absolute top-3 right-3 z-10">
                                <div className="bg-black/70 backdrop-blur-md text-xs font-medium text-white px-2.5 py-1 rounded-full border border-white/10 shadow-sm flex items-center gap-1">
                                    <Sparkles className="h-3 w-3 text-indigo-400" />
                                    {Math.round(res.similarity * 100)}% Match
                                </div>
                            </div>

                            {/* Decorative Background Mesh */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <CardContent className="p-5 flex flex-col h-full relative z-0">
                                {/* Header with Icon */}
                                <div className="flex justify-between items-start mb-4 mt-2">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center border transition-colors duration-300 ${getTypeColor(res.type)} group-hover:scale-110`}>
                                        {getIcon(res.type)}
                                    </div>
                                    <Badge variant="outline" className="text-[10px] border-white/20 bg-white/5 text-muted-foreground">
                                        {res.subject}
                                    </Badge>
                                </div>

                                {/* Title & Desc */}
                                <div className="flex-1 space-y-2 mb-4">
                                    <h3 className="font-bold text-base line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors">
                                        {res.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                        {res.description}
                                    </p>
                                </div>

                                {/* Metadata Footer */}
                                <div className="pt-4 mt-auto border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1" title="Downloads">
                                            <Download className="h-3.5 w-3.5" />
                                            {res.downloads}
                                        </div>
                                        <div className="flex items-center gap-1 text-amber-500" title="Rating">
                                            <Star className="h-3.5 w-3.5 fill-amber-500" />
                                            {res.rating.toFixed(1)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1" title="Created At">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {res.created_at ? formatDistanceToNow(new Date(res.created_at), { addSuffix: true }).replace("about ", "") : "Recently"}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
