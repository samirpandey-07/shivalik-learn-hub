import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "sonner";
import {
    Plus,
    Building2,
    Briefcase,
    GraduationCap,
    Star,
    Calendar,
    ThumbsUp,
    MoreVertical,
    Loader2,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ShareExperienceDialog } from "./ShareExperienceDialog";

export interface InterviewExperience {
    id: string;
    user_id: string;
    company_name: string;
    role: string;
    batch_year: number;
    difficulty: number;
    status: string;
    package: string | null;
    content: string;
    upvotes: number;
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
    user_upvoted?: boolean; // Client side tracking
}

export function InterviewExperienceList() {
    const { user } = useAuth();
    const [experiences, setExperiences] = useState<InterviewExperience[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const fetchExperiences = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('interview_experiences')
                .select(`
                    *,
                    profiles (full_name, avatar_url)
                `)
                .eq('is_approved', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setExperiences(data as any[] || []);
        } catch (error) {
            console.error('Error fetching experiences:', error);
            toast.error("Failed to load interview experiences.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExperiences();
    }, []);

    const filteredExperiences = experiences.filter(exp =>
        exp.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusVariant = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('offer') || s.includes('selected') || s.includes('accepted')) return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
        if (s.includes('reject')) return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'; // Pending / Waitlisted
    };

    const handleUpvote = async (id: string, currentUpvotes: number) => {
        // Optimistic UI update
        setExperiences(prev => prev.map(exp =>
            exp.id === id ? { ...exp, upvotes: currentUpvotes + 1, user_upvoted: true } : exp
        ));

        // Note: Real upvote system should track user_id in an 'upvotes' join table to prevent infinite clicking.
        // For now, we do a simple increment.
        const { error } = await supabase.rpc('increment_upvotes', { exp_id: id }); // Assumes you make an RPC, or just direct update for simple demo:

        // Direct update approach (less safe against race conditions but works for this demo scope if RPC doesn't exist)
        const { error: directError } = await supabase
            .from('interview_experiences')
            .update({ upvotes: currentUpvotes + 1 })
            .eq('id', id);

        if (directError) {
            // Revert on fail
            toast.error("Failed to upvote");
            setExperiences(prev => prev.map(exp =>
                exp.id === id ? { ...exp, upvotes: currentUpvotes, user_upvoted: false } : exp
            ));
        }
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by company or role..."
                        className="pl-9 bg-white dark:bg-black/20 border-slate-200 dark:border-white/10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button
                    onClick={() => setIsShareModalOpen(true)}
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25"
                >
                    <Plus className="h-4 w-4 mr-2" /> Share Experience
                </Button>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col justify-center items-center py-20 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-purple-500 opacity-80" />
                    <p>Loading experiences...</p>
                </div>
            ) : filteredExperiences.length === 0 ? (
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 dark:border-white/20 p-12 text-center flex flex-col items-center">
                    <Building2 className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No experiences found</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        {searchQuery ? "We couldn't find any companies matching your search." : "Be the first to share your interview experience and earn rewards!"}
                    </p>
                    {!searchQuery && (
                        <Button variant="outline" onClick={() => setIsShareModalOpen(true)}>
                            Write the first review
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredExperiences.map((exp) => (
                        <div key={exp.id} className="group bg-white dark:bg-[#0B1021] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col h-full">
                            {/* Card Header Profile */}
                            <div className="p-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-start bg-slate-50/50 dark:bg-white/[0.02]">
                                <div className="flex gap-3 items-center">
                                    <Avatar className="h-10 w-10 border border-purple-200 dark:border-purple-500/30">
                                        <AvatarImage src={exp.profiles?.avatar_url} />
                                        <AvatarFallback className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                                            {exp.profiles?.full_name?.charAt(0) || 'S'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground dark:text-slate-200">
                                            {exp.profiles?.full_name || 'Anonymous Student'}
                                        </p>
                                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                                            <span className="flex items-center"><GraduationCap className="h-3 w-3 mr-1" /> Class of {exp.batch_year}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[10px] text-muted-foreground flex items-center bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                                    <Calendar className="h-3 w-3 mr-1 opacity-70" />
                                    {formatDistanceToNow(new Date(exp.created_at), { addSuffix: true })}
                                </div>
                            </div>

                            {/* Card Body - Top Setup */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                            <Building2 className="h-5 w-5 opacity-70" />
                                            {exp.company_name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                            <Briefcase className="h-3.5 w-3.5" />
                                            {exp.role}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className={getStatusVariant(exp.status)}>
                                        {exp.status}
                                    </Badge>
                                </div>

                                {/* Content Preview (Truncated) */}
                                <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-4 relative flex-1">
                                    {exp.content}
                                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-[#0B1021] to-transparent pointer-events-none" />
                                </div>

                                <Button variant="link" className="p-0 h-auto self-start mt-2 text-purple-600 dark:text-purple-400 font-medium text-xs">
                                    Read Full Experience →
                                </Button>
                            </div>

                            {/* Card Footer */}
                            <div className="p-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-black/20">
                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Difficulty</span>
                                        <div className="flex gap-0.5 mt-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-3 w-3 ${star <= exp.difficulty ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300 dark:text-slate-600'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    {exp.package && (
                                        <div className="flex flex-col border-l border-slate-200 dark:border-white/10 pl-4">
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Package/Stipend</span>
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{exp.package}</span>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-8 px-2 gap-1.5 ${exp.user_upvoted ? 'text-purple-600 dark:text-purple-400 bg-purple-500/10' : 'text-muted-foreground'}`}
                                    onClick={() => handleUpvote(exp.id, exp.upvotes)}
                                    disabled={exp.user_upvoted}
                                >
                                    <ThumbsUp className={`h-4 w-4 ${exp.user_upvoted ? 'fill-current' : ''}`} />
                                    <span className="text-xs font-medium">{exp.upvotes}</span>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ShareExperienceDialog
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                onSuccess={fetchExperiences}
            />
        </div>
    );
}
