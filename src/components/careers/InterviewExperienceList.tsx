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
    Search,
    Check,
    Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ShareExperienceDialog } from "./ShareExperienceDialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface InterviewExperience {
    id: string;
    user_id: string;
    company_name: string;
    role: string;
    profession?: string;
    batch_year: number;
    difficulty: number;
    status: string;
    package: string | null;
    content: string;
    upvotes: number;
    is_approved?: boolean;
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
    user_upvoted?: boolean; // Client side tracking
}

const MOCK_EXPERIENCES: InterviewExperience[] = [
    {
        id: "mock-1",
        user_id: "mock-user-1",
        company_name: "Google",
        role: "Associate Software Engineer",
        profession: "Software Engineering",
        batch_year: 2024,
        difficulty: 4,
        status: "Offer Selected",
        package: "32 LPA",
        content: "Round 1 (Coding): 2 LeetCode Medium questions on Trees and Graphs (DFS/BFS traversal). Round 2 (System Design): Design a URL shortener focusing on scalability, caching, and database partitioning. Round 3 (Behavioral): Googley-ness questions about teamwork, dealing with conflict, and career goals. Advice: Practice writing clean code on Google Docs and explaining your thought process out loud.",
        upvotes: 18,
        is_approved: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        profiles: {
            full_name: "Aarav Sharma",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav"
        }
    },
    {
        id: "mock-2",
        user_id: "mock-user-2",
        company_name: "Adobe",
        role: "Product Designer Intern",
        profession: "UI/UX Design",
        batch_year: 2025,
        difficulty: 3,
        status: "Offer Selected",
        package: "60k/month",
        content: "Round 1 (Portfolio Review): I walked through two design case studies, explaining user research, wireframes, usability testing, and visual design. Round 2 (Design Challenge): 45-minute whiteboard exercise to design a pet adoption app for college students. Round 3 (HR): Team fitment and behavioral questions. Advice: Focus on your design process, user empathy, and why you made specific design decisions.",
        upvotes: 12,
        is_approved: true,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        profiles: {
            full_name: "Ananya Iyer",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya"
        }
    },
    {
        id: "mock-3",
        user_id: "mock-user-3",
        company_name: "Microsoft",
        role: "Data Scientist",
        profession: "Data Science & Analytics",
        batch_year: 2024,
        difficulty: 5,
        status: "Offer Selected",
        package: "26 LPA",
        content: "Round 1 (Math & Stats): In-depth questions on probability distributions, linear algebra, and hypothesis testing. Round 2 (ML Coding): Implement K-Means clustering from scratch and discuss regularization techniques (L1 vs L2). Round 3 (Product & SQL): SQL queries involving complex joins and window functions. Advice: Master ML fundamentals and SQL.",
        upvotes: 15,
        is_approved: true,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        profiles: {
            full_name: "Rohan Varma",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan"
        }
    },
    {
        id: "mock-4",
        user_id: "mock-user-4",
        company_name: "Uber",
        role: "Associate Product Manager Intern",
        profession: "Product Management",
        batch_year: 2026,
        difficulty: 4,
        status: "Offer Selected",
        package: "80k/month",
        content: "Round 1 (Product Sense): How would you improve Uber Eats for college students? Round 2 (Analytical): Estimate the number of trips taken in Delhi on a Friday. Round 3 (Behavioral): Standard leadership questions. Advice: Read 'Decode and Conquer' and practice estimation.",
        upvotes: 6,
        is_approved: false,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        profiles: {
            full_name: "Neha Gupta",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha"
        }
    }
];

export function InterviewExperienceList() {
    const { user, roles = [] } = useAuth();
    const isAdmin = roles.includes('admin') || roles.includes('superadmin');
    
    const [experiences, setExperiences] = useState<InterviewExperience[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProfession, setSelectedProfession] = useState<string>("all");
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const fetchExperiences = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('interview_experiences')
                .select(`
                    *,
                    profiles (full_name, avatar_url)
                `);

            if (!isAdmin) {
                query = query.eq('is_approved', true);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            
            let fetched = data as any[] || [];
            if (fetched.length === 0) {
                // If DB has no records, fallback to mock data
                fetched = MOCK_EXPERIENCES;
            }
            setExperiences(fetched);
        } catch (error) {
            console.error('Error fetching experiences:', error);
            // On error, also use mock data
            setExperiences(MOCK_EXPERIENCES);
            toast.error("Using offline mock data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExperiences();
    }, [isAdmin]);

    const handleApprove = async (id: string) => {
        if (id.startsWith('mock-')) {
            setExperiences(prev => prev.map(exp => 
                exp.id === id ? { ...exp, is_approved: true } : exp
            ));
            toast.success("Mock experience approved successfully!");
            return;
        }

        try {
            const { error } = await supabase
                .from('interview_experiences')
                .update({ is_approved: true } as any)
                .eq('id', id);

            if (error) throw error;
            toast.success("Experience approved successfully!");
            fetchExperiences();
        } catch (error) {
            console.error("Error approving experience:", error);
            toast.error("Failed to approve experience.");
        }
    };

    const handleDelete = async (id: string) => {
        if (id.startsWith('mock-')) {
            setExperiences(prev => prev.filter(exp => exp.id !== id));
            toast.success("Mock experience deleted successfully!");
            return;
        }

        try {
            const { error } = await supabase
                .from('interview_experiences')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success("Experience deleted successfully!");
            fetchExperiences();
        } catch (error) {
            console.error("Error deleting experience:", error);
            toast.error("Failed to delete experience.");
        }
    };

    const filteredExperiences = experiences.filter(exp => {
        const profession = exp.profession || (exp.role.includes(' | ') ? exp.role.split(' | ')[0] : 'Other');
        const roleText = exp.role.includes(' | ') ? exp.role.split(' | ')[1] : exp.role;

        const matchesSearch = 
            exp.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            roleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
            profession.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesProfession = selectedProfession === "all" || profession === selectedProfession;

        return matchesSearch && matchesProfession;
    });

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
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-1">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by company or role..."
                            className="pl-9 bg-white dark:bg-black/20 border-slate-200 dark:border-white/10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-64">
                        <Select value={selectedProfession} onValueChange={setSelectedProfession}>
                            <SelectTrigger className="bg-white dark:bg-black/20 border-slate-200 dark:border-white/10">
                                <SelectValue placeholder="All Professions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Professions</SelectItem>
                                <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                                <SelectItem value="Data Science & Analytics">Data Science & Analytics</SelectItem>
                                <SelectItem value="Product Management">Product Management</SelectItem>
                                <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                                <SelectItem value="Business Analyst & Consulting">Business Analyst & Consulting</SelectItem>
                                <SelectItem value="Finance & Core Operations">Finance & Core Operations</SelectItem>
                                <SelectItem value="Hardware & Core Engineering">Hardware & Core Engineering</SelectItem>
                                <SelectItem value="Marketing & Sales">Marketing & Sales</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button
                    onClick={() => setIsShareModalOpen(true)}
                    className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25"
                >
                    <Plus className="h-4 w-4 mr-2" /> Share Experience
                </Button>
            </div>

            {/* Mock Data Notice */}
            {experiences.some(exp => exp.id.startsWith('mock-')) && (
                <div className="bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
                    <span>💡 <strong>Demo Mode:</strong> Showing mock data experiences. Apply the database migration and add your own to see them live!</span>
                </div>
            )}

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
                    {filteredExperiences.map((exp) => {
                        const profession = exp.profession || (exp.role.includes(' | ') ? exp.role.split(' | ')[0] : 'Other');
                        const displayRole = exp.role.includes(' | ') ? exp.role.split(' | ')[1] : exp.role;

                        return (
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
                                    <div className="flex items-center gap-2">
                                        <div className="text-[10px] text-muted-foreground flex items-center bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                                            <Calendar className="h-3 w-3 mr-1 opacity-70" />
                                            {exp.created_at ? formatDistanceToNow(new Date(exp.created_at), { addSuffix: true }) : 'recent'}
                                        </div>
                                        {isAdmin && (
                                            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-white/10 pl-2 ml-1">
                                                {!exp.is_approved && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-500/15"
                                                        onClick={() => handleApprove(exp.id)}
                                                        title="Approve Experience"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-500/15"
                                                    onClick={() => handleDelete(exp.id)}
                                                    title="Delete Experience"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Card Body - Top Setup */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4 gap-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                <Building2 className="h-5 w-5 opacity-70" />
                                                {exp.company_name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                <Briefcase className="h-3.5 w-3.5" />
                                                {displayRole}
                                            </p>
                                            <div className="mt-2">
                                                <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                                    {profession}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                            <Badge variant="outline" className={getStatusVariant(exp.status)}>
                                                {exp.status}
                                            </Badge>
                                            {isAdmin && (
                                                <Badge variant="outline" className={exp.is_approved ? 'bg-green-500/10 text-green-600 border-green-500/20 text-[9px] py-0' : 'bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] py-0'}>
                                                    {exp.is_approved ? 'Approved' : 'Pending'}
                                                </Badge>
                                            )}
                                        </div>
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
                    );
                })}
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
