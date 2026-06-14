import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "sonner";
import {
    Plus,
    Building2,
    Briefcase,
    MapPin,
    Link as LinkIcon,
    Loader2,
    Search,
    Check,
    Trash2,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShareJobDialog } from "./ShareJobDialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface JobOpportunity {
    id: string;
    user_id: string;
    company_name: string;
    role: string;
    profession: string;
    job_type: string;
    location: string;
    link: string | null;
    description: string;
    is_approved?: boolean;
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
}

const MOCK_JOBS: JobOpportunity[] = [
    {
        id: "mock-job-1",
        user_id: "mock-user-1",
        company_name: "Google",
        role: "STEP Intern 2026",
        profession: "Software Engineering",
        job_type: "Internship",
        location: "Bengaluru, India (On-site)",
        link: "https://careers.google.com",
        description: "Google STEP (Student Training in Engineering Program) is a 12-week internship for first- and second-year undergraduate computer science students. Focuses on practical projects, technical training, and professional development. Requirements: Basic coding skills in C++, Java, or Python.",
        is_approved: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        profiles: {
            full_name: "Google Careers",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=google"
        }
    },
    {
        id: "mock-job-2",
        user_id: "mock-user-2",
        company_name: "Adobe",
        role: "Product Designer Intern",
        profession: "UI/UX Design",
        job_type: "Internship",
        location: "Noida, India (Hybrid)",
        link: "https://adobe.com/careers",
        description: "Join the Adobe design ecosystem to help build next-gen creative tools. You will work on wireframes, prototyping, user studies, and visual specs. Portfolio required demonstrating product thinking.",
        is_approved: true,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        profiles: {
            full_name: "Design Lead",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=adobe"
        }
    },
    {
        id: "mock-job-3",
        user_id: "mock-user-3",
        company_name: "Microsoft",
        role: "Software Engineer",
        profession: "Software Engineering",
        job_type: "Full-time",
        location: "Hyderabad, India",
        link: "https://careers.microsoft.com",
        description: "Looking for 2025/2026 graduates with strong foundations in DSA, OS, and DBMS. Focus on cloud services (Azure). Work on building scalable backends and distributed architectures.",
        is_approved: true,
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        profiles: {
            full_name: "Microsoft Recruiting",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=microsoft"
        }
    },
    {
        id: "mock-job-4",
        user_id: "mock-user-4",
        company_name: "Stripe",
        role: "Product Manager Intern",
        profession: "Product Management",
        job_type: "Internship",
        location: "Remote",
        link: "https://stripe.com/jobs",
        description: "Work with engineers and designers to build payment APIs. Excellent chance to experience world-class product culture. Requirements: strong analytical skills, product sense, and engineering curiosity.",
        is_approved: false, // Pending for admin testing!
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        profiles: {
            full_name: "Stripe Talent",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=stripe"
        }
    }
];

export function JobList() {
    const { user, roles = [] } = useAuth();
    const isAdmin = roles.includes('admin') || roles.includes('superadmin');

    const [jobs, setJobs] = useState<JobOpportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProfession, setSelectedProfession] = useState<string>("all");
    const [selectedJobType, setSelectedJobType] = useState<string>("all");
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [usingMock, setUsingMock] = useState(false);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('jobs')
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
                // Try fetching from localStorage
                const local = localStorage.getItem('campus_flow_jobs');
                if (local) {
                    fetched = JSON.parse(local);
                } else {
                    fetched = MOCK_JOBS;
                    localStorage.setItem('campus_flow_jobs', JSON.stringify(MOCK_JOBS));
                }
                setUsingMock(true);
            } else {
                setUsingMock(false);
            }
            setJobs(fetched);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            const local = localStorage.getItem('campus_flow_jobs');
            let fetched = MOCK_JOBS;
            if (local) {
                fetched = JSON.parse(local);
            } else {
                localStorage.setItem('campus_flow_jobs', JSON.stringify(MOCK_JOBS));
            }
            setJobs(fetched);
            setUsingMock(true);
            toast.error("Using offline jobs data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [isAdmin]);

    const handleApprove = async (id: string) => {
        if (id.startsWith('mock-job-') || id.startsWith('local-job-')) {
            const updated = jobs.map(job => 
                job.id === id ? { ...job, is_approved: true } : job
            );
            setJobs(updated);
            localStorage.setItem('campus_flow_jobs', JSON.stringify(updated));
            toast.success("Opportunity approved successfully!");
            return;
        }

        try {
            const { error } = await supabase
                .from('jobs')
                .update({ is_approved: true } as any)
                .eq('id', id);

            if (error) throw error;
            toast.success("Opportunity approved successfully!");
            fetchJobs();
        } catch (error) {
            console.error("Error approving job:", error);
            toast.error("Failed to approve opportunity.");
        }
    };

    const handleDelete = async (id: string) => {
        if (id.startsWith('mock-job-') || id.startsWith('local-job-')) {
            const updated = jobs.filter(job => job.id !== id);
            setJobs(updated);
            localStorage.setItem('campus_flow_jobs', JSON.stringify(updated));
            toast.success("Opportunity deleted successfully!");
            return;
        }

        try {
            const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success("Opportunity deleted successfully!");
            fetchJobs();
        } catch (error) {
            console.error("Error deleting job:", error);
            toast.error("Failed to delete opportunity.");
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = 
            job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.location.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesProfession = selectedProfession === "all" || job.profession === selectedProfession;
        const matchesJobType = selectedJobType === "all" || job.job_type === selectedJobType;

        return matchesSearch && matchesProfession && matchesJobType;
    });

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search jobs, companies, skills..."
                            className="pl-9 bg-white dark:bg-black/20 border-slate-200 dark:border-white/10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-56">
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
                    <div className="w-full sm:w-44">
                        <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                            <SelectTrigger className="bg-white dark:bg-black/20 border-slate-200 dark:border-white/10">
                                <SelectValue placeholder="All Job Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Internship">Internship</SelectItem>
                                <SelectItem value="Full-time">Full-time</SelectItem>
                                <SelectItem value="Part-time">Part-time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button
                    onClick={() => setIsShareModalOpen(true)}
                    className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25 shrink-0"
                >
                    <Plus className="h-4 w-4 mr-2" /> Share Opportunity
                </Button>
            </div>

            {/* Local/Demo Banner */}
            {usingMock && (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
                    <span>💡 <strong>Demo Mode:</strong> Showing mock/locally saved jobs. Apply the database migration and add your own to see them live!</span>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="flex flex-col justify-center items-center py-20 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-500 opacity-80" />
                    <p>Loading opportunities...</p>
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 dark:border-white/20 p-12 text-center flex flex-col items-center">
                    <Briefcase className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No opportunities found</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        {searchQuery ? "We couldn't find any opportunities matching your search." : "Be the first to share a job or internship opportunity!"}
                    </p>
                    {!searchQuery && (
                        <Button variant="outline" onClick={() => setIsShareModalOpen(true)}>
                            Post a Job
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredJobs.map((job) => (
                        <div key={job.id} className="group bg-white dark:bg-[#0B1021] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all duration-300 flex flex-col h-full">
                            {/* Card Header */}
                            <div className="p-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-start bg-slate-50/50 dark:bg-white/[0.02]">
                                <div className="flex gap-3 items-center">
                                    <Avatar className="h-10 w-10 border border-blue-200 dark:border-blue-500/30">
                                        <AvatarImage src={job.profiles?.avatar_url} />
                                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                                            {job.company_name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground dark:text-slate-200">
                                            {job.company_name}
                                        </p>
                                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                                            <span className="flex items-center"><MapPin className="h-3 w-3 mr-1 text-orange-500" /> {job.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isAdmin && (
                                        <div className="flex items-center gap-1 border-r border-slate-200 dark:border-white/10 pr-2 mr-1">
                                            {!job.is_approved && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-500/15"
                                                    onClick={() => handleApprove(job.id)}
                                                    title="Approve Job"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-500/15"
                                                onClick={() => handleDelete(job.id)}
                                                title="Delete Job"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                    <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-xs">
                                        {job.job_type}
                                    </Badge>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {job.role}
                                            </h3>
                                            <div className="mt-1">
                                                <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                                    {job.profession}
                                                </Badge>
                                                {isAdmin && (
                                                    <Badge variant="outline" className={`ml-2 text-[9px] ${job.is_approved ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                                                        {job.is_approved ? 'Approved' : 'Pending'}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                                        {job.description}
                                    </p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-black/10 -mx-5 -mb-5 px-5 py-4">
                                    <span className="text-xs text-muted-foreground">
                                        Shared by {job.profiles?.full_name || 'Anonymous'}
                                    </span>
                                    {job.link && (
                                        <a
                                            href={job.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            Apply Now <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ShareJobDialog
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                onSuccess={fetchJobs}
            />
        </div>
    );
}
