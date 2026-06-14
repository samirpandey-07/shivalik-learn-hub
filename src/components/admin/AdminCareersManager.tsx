import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    CheckCircle,
    XCircle,
    Eye,
    Briefcase,
    Building2,
    Calendar,
    Star,
    Loader2,
    Search,
    Trash2,
    Trophy,
    Award,
    Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

// Interfaces
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
}

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

export interface HackathonEvent {
    id: string;
    user_id?: string;
    title: string;
    organizer: string;
    event_date: string;
    registration_link: string | null;
    prize_pool: string | null;
    description: string;
    is_approved?: boolean;
    created_at: string;
}

// Fallback Mock Data Definitions
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
        content: "Round 1 (Coding): 2 LeetCode Medium questions on Trees and Graphs (DFS/BFS traversal). Round 2 (System Design): Design a URL shortener focusing on scalability, caching, and database partitioning. Round 3 (Behavioral): Googley-ness questions about teamwork, dealing with conflict, and career goals.",
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
        content: "Round 1 (Portfolio Review): I walked through two design case studies, explaining user research, wireframes, usability testing, and visual design. Round 2 (Design Challenge): 45-minute whiteboard exercise to design a pet adoption app for college students.",
        upvotes: 12,
        is_approved: true,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        profiles: {
            full_name: "Ananya Iyer",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya"
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
        content: "Round 1 (Product Sense): How would you improve Uber Eats for college students? Round 2 (Analytical): Estimate the number of trips taken in Delhi on a Friday.",
        upvotes: 6,
        is_approved: false,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        profiles: {
            full_name: "Neha Gupta",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha"
        }
    }
];

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
        description: "Google STEP is a 12-week internship for computer science undergraduates. Focuses on practical projects, training, and development.",
        is_approved: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        profiles: {
            full_name: "Google Careers",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=google"
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
        description: "Work with engineers and designers to build payment APIs. Excellent chance to experience PM culture.",
        is_approved: false,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        profiles: {
            full_name: "Stripe Talent",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=stripe"
        }
    }
];

const MOCK_HACKATHONS: HackathonEvent[] = [
    {
        id: "mock-hack-1",
        title: "Smart India Hackathon 2026",
        organizer: "Ministry of Education, Govt of India",
        event_date: "2026-11-15",
        registration_link: "https://sih.gov.in",
        prize_pool: "Rs. 10 Lakhs",
        description: "SIH is a nationwide initiative to provide students with a platform to solve some of the pressing problems we face in our daily lives.",
        is_approved: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "mock-hack-4",
        title: "Unstop Tech Park Challenge",
        organizer: "Unstop",
        event_date: "2026-07-05",
        registration_link: "https://unstop.com",
        prize_pool: "Rs. 5 Lakhs + Job Offers",
        description: "Competitive coding, hardware prototype, and system design competition open to engineering students across India.",
        is_approved: false,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
];

export function AdminCareersManager() {
    const [activeSubTab, setActiveSubTab] = useState("experiences");

    // Lists
    const [experiences, setExperiences] = useState<InterviewExperience[]>([]);
    const [jobs, setJobs] = useState<JobOpportunity[]>([]);
    const [hackathons, setHackathons] = useState<HackathonEvent[]>([]);

    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [professionFilter, setProfessionFilter] = useState("all");

    // Modal state
    const [selectedExp, setSelectedExp] = useState<InterviewExperience | null>(null);
    const [selectedJob, setSelectedJob] = useState<JobOpportunity | null>(null);
    const [selectedHack, setSelectedHack] = useState<HackathonEvent | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Reset filters on tab change
    useEffect(() => {
        setSearchQuery("");
        setStatusFilter("all");
        setProfessionFilter("all");
    }, [activeSubTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeSubTab === "experiences") {
                const { data, error } = await supabase
                    .from('interview_experiences')
                    .select('*, profiles (full_name, avatar_url)')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                let fetched = data as any[] || [];
                if (fetched.length === 0) fetched = MOCK_EXPERIENCES;
                setExperiences(fetched);
            } else if (activeSubTab === "jobs") {
                const { data, error } = await supabase
                    .from('jobs')
                    .select('*, profiles (full_name, avatar_url)')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                let fetched = data as any[] || [];
                if (fetched.length === 0) {
                    const local = localStorage.getItem('campus_flow_jobs');
                    fetched = local ? JSON.parse(local) : MOCK_JOBS;
                }
                setJobs(fetched);
            } else if (activeSubTab === "hackathons") {
                const { data, error } = await supabase
                    .from('hackathons')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                let fetched = data as any[] || [];
                if (fetched.length === 0) {
                    const local = localStorage.getItem('campus_flow_hackathons');
                    fetched = local ? JSON.parse(local) : MOCK_HACKATHONS;
                }
                setHackathons(fetched);
            }
        } catch (error) {
            console.warn("Fetch failed, loading from fallbacks:", error);
            if (activeSubTab === "experiences") {
                setExperiences(MOCK_EXPERIENCES);
            } else if (activeSubTab === "jobs") {
                const local = localStorage.getItem('campus_flow_jobs');
                setJobs(local ? JSON.parse(local) : MOCK_JOBS);
            } else if (activeSubTab === "hackathons") {
                const local = localStorage.getItem('campus_flow_hackathons');
                setHackathons(local ? JSON.parse(local) : MOCK_HACKATHONS);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeSubTab]);

    const handleApprove = async (id: string) => {
        setActionLoading(true);
        const isMock = id.startsWith('mock-') || id.startsWith('local-');

        try {
            if (activeSubTab === "experiences") {
                if (isMock) {
                    setExperiences(prev => prev.map(exp => exp.id === id ? { ...exp, is_approved: true } : exp));
                } else {
                    await supabase.from('interview_experiences').update({ is_approved: true } as any).eq('id', id);
                }
            } else if (activeSubTab === "jobs") {
                if (isMock) {
                    const updated = jobs.map(job => job.id === id ? { ...job, is_approved: true } : job);
                    setJobs(updated);
                    localStorage.setItem('campus_flow_jobs', JSON.stringify(updated));
                } else {
                    await supabase.from('jobs').update({ is_approved: true } as any).eq('id', id);
                }
            } else if (activeSubTab === "hackathons") {
                if (isMock) {
                    const updated = hackathons.map(hack => hack.id === id ? { ...hack, is_approved: true } : hack);
                    setHackathons(updated);
                    localStorage.setItem('campus_flow_hackathons', JSON.stringify(updated));
                } else {
                    await supabase.from('hackathons').update({ is_approved: true } as any).eq('id', id);
                }
            }
            toast.success("Item approved successfully!");
            setIsPreviewOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error approving:", error);
            toast.error("Failed to approve item.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        setActionLoading(true);
        const isMock = id.startsWith('mock-') || id.startsWith('local-');

        try {
            if (activeSubTab === "experiences") {
                if (isMock) {
                    setExperiences(prev => prev.filter(exp => exp.id !== id));
                } else {
                    await supabase.from('interview_experiences').delete().eq('id', id);
                }
            } else if (activeSubTab === "jobs") {
                if (isMock) {
                    const updated = jobs.filter(job => job.id !== id);
                    setJobs(updated);
                    localStorage.setItem('campus_flow_jobs', JSON.stringify(updated));
                } else {
                    await supabase.from('jobs').delete().eq('id', id);
                }
            } else if (activeSubTab === "hackathons") {
                if (isMock) {
                    const updated = hackathons.filter(hack => hack.id !== id);
                    setHackathons(updated);
                    localStorage.setItem('campus_flow_hackathons', JSON.stringify(updated));
                } else {
                    await supabase.from('hackathons').delete().eq('id', id);
                }
            }
            toast.success("Item deleted successfully!");
            setIsPreviewOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error deleting:", error);
            toast.error("Failed to delete item.");
        } finally {
            setActionLoading(false);
        }
    };

    // Filter Logic
    const getFilteredExperiences = () => {
        return experiences.filter(exp => {
            const profession = exp.profession || (exp.role.includes(' | ') ? exp.role.split(' | ')[0] : 'Other');
            const roleText = exp.role.includes(' | ') ? exp.role.split(' | ')[1] : exp.role;
            const matchesSearch = 
                exp.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                roleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (exp.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesProfession = professionFilter === "all" || profession === professionFilter;
            const matchesStatus = statusFilter === "all" || (statusFilter === "approved" ? exp.is_approved : !exp.is_approved);
            return matchesSearch && matchesProfession && matchesStatus;
        });
    };

    const getFilteredJobs = () => {
        return jobs.filter(job => {
            const matchesSearch = 
                job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.location.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesProfession = professionFilter === "all" || job.profession === professionFilter;
            const matchesStatus = statusFilter === "all" || (statusFilter === "approved" ? job.is_approved : !job.is_approved);
            return matchesSearch && matchesProfession && matchesStatus;
        });
    };

    const getFilteredHackathons = () => {
        return hackathons.filter(hack => {
            const matchesSearch = 
                hack.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                hack.organizer.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || (statusFilter === "approved" ? hack.is_approved : !hack.is_approved);
            return matchesSearch && matchesStatus;
        });
    };

    const openPreview = (item: any) => {
        if (activeSubTab === "experiences") {
            setSelectedExp(item);
            setIsPreviewOpen(true);
        } else if (activeSubTab === "jobs") {
            setSelectedJob(item);
            setIsPreviewOpen(true);
        } else if (activeSubTab === "hackathons") {
            setSelectedHack(item);
            setIsPreviewOpen(true);
        }
    };

    return (
        <div className="space-y-6">
            <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
                <TabsList className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 rounded-xl mb-4 flex flex-wrap h-auto">
                    <TabsTrigger value="experiences" className="rounded-lg">
                        Interview Experiences
                    </TabsTrigger>
                    <TabsTrigger value="jobs" className="rounded-lg">
                        Jobs & Internships
                    </TabsTrigger>
                    <TabsTrigger value="hackathons" className="rounded-lg">
                        Hackathons & Events
                    </TabsTrigger>
                </TabsList>

                {/* Filters Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-sm backdrop-blur-md mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white dark:bg-black/20"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="w-40">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="bg-white dark:bg-black/20">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {activeSubTab !== "hackathons" && (
                            <div className="w-56">
                                <Select value={professionFilter} onValueChange={setProfessionFilter}>
                                    <SelectTrigger className="bg-white dark:bg-black/20">
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
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                    </div>
                ) : (
                    <>
                        {/* Experiences Tab */}
                        <TabsContent value="experiences" className="space-y-4">
                            {getFilteredExperiences().length === 0 ? (
                                <Card className="bg-slate-50 dark:bg-white/5 p-12 text-center border-slate-200 dark:border-white/10">
                                    <p className="text-muted-foreground">No experiences found matching filters.</p>
                                </Card>
                            ) : (
                                getFilteredExperiences().map(exp => {
                                    const profession = exp.profession || (exp.role.includes(' | ') ? exp.role.split(' | ')[0] : 'Other');
                                    const displayRole = exp.role.includes(' | ') ? exp.role.split(' | ')[1] : exp.role;

                                    return (
                                        <div key={exp.id} className="relative flex flex-col md:flex-row md:items-center gap-4 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-white/10">
                                            <div className="flex items-center gap-3 w-56 shrink-0">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">{exp.profiles?.full_name?.charAt(0) || 'S'}</AvatarFallback>
                                                </Avatar>
                                                <div className="truncate">
                                                    <h5 className="font-semibold text-foreground dark:text-white truncate">{exp.profiles?.full_name || 'Anonymous Student'}</h5>
                                                    <span className="text-xs text-muted-foreground">Class of {exp.batch_year}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-semibold text-foreground dark:text-white">{exp.company_name}</span>
                                                    <span className="text-muted-foreground text-xs">•</span>
                                                    <span className="text-sm text-foreground/85">{displayRole}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-[10px] bg-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/10">{profession}</Badge>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {exp.created_at ? format(new Date(exp.created_at), "MMM d, yyyy") : 'recent'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-24 shrink-0">
                                                <Badge className={exp.is_approved ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}>
                                                    {exp.is_approved ? 'Approved' : 'Pending'}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-end gap-2 shrink-0">
                                                <Button variant="ghost" size="icon" onClick={() => openPreview(exp)}><Eye className="h-4 w-4" /></Button>
                                                {!exp.is_approved && <Button size="icon" className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 rounded-full" onClick={() => handleApprove(exp.id)}><CheckCircle className="h-4 w-4" /></Button>}
                                                <Button size="icon" className="bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 rounded-full" onClick={() => handleDelete(exp.id)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </TabsContent>

                        {/* Jobs Tab */}
                        <TabsContent value="jobs" className="space-y-4">
                            {getFilteredJobs().length === 0 ? (
                                <Card className="bg-slate-50 dark:bg-white/5 p-12 text-center border-slate-200 dark:border-white/10">
                                    <p className="text-muted-foreground">No jobs or internships found matching filters.</p>
                                </Card>
                            ) : (
                                getFilteredJobs().map(job => (
                                    <div key={job.id} className="relative flex flex-col md:flex-row md:items-center gap-4 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-white/10">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Briefcase className="h-4 w-4 text-blue-500" />
                                                <span className="font-semibold text-foreground dark:text-white">{job.company_name}</span>
                                                <span className="text-muted-foreground text-xs">•</span>
                                                <span className="text-sm text-foreground/85">{job.role}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-[10px] bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/10">{job.profession}</Badge>
                                                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-slate-100 dark:bg-white/10">{job.job_type}</Badge>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {job.created_at ? format(new Date(job.created_at), "MMM d, yyyy") : 'recent'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-24 shrink-0">
                                            <Badge className={job.is_approved ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}>
                                                {job.is_approved ? 'Approved' : 'Pending'}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-end gap-2 shrink-0">
                                            <Button variant="ghost" size="icon" onClick={() => openPreview(job)}><Eye className="h-4 w-4" /></Button>
                                            {!job.is_approved && <Button size="icon" className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 rounded-full" onClick={() => handleApprove(job.id)}><CheckCircle className="h-4 w-4" /></Button>}
                                            <Button size="icon" className="bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 rounded-full" onClick={() => handleDelete(job.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </TabsContent>

                        {/* Hackathons Tab */}
                        <TabsContent value="hackathons" className="space-y-4">
                            {getFilteredHackathons().length === 0 ? (
                                <Card className="bg-slate-50 dark:bg-white/5 p-12 text-center border-slate-200 dark:border-white/10">
                                    <p className="text-muted-foreground">No hackathons found matching filters.</p>
                                </Card>
                            ) : (
                                getFilteredHackathons().map(hack => (
                                    <div key={hack.id} className="relative flex flex-col md:flex-row md:items-center gap-4 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-white/10">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Trophy className="h-4 w-4 text-orange-500" />
                                                <span className="font-semibold text-foreground dark:text-white">{hack.title}</span>
                                                <span className="text-muted-foreground text-xs">•</span>
                                                <span className="text-sm text-foreground/80">Organizer: {hack.organizer}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                {hack.prize_pool && <Badge variant="outline" className="text-[10px] bg-yellow-500/5 text-yellow-600 dark:text-yellow-400 border-yellow-500/10">Prizes: {hack.prize_pool}</Badge>}
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    Date: {hack.event_date}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-24 shrink-0">
                                            <Badge className={hack.is_approved ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}>
                                                {hack.is_approved ? 'Approved' : 'Pending'}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-end gap-2 shrink-0">
                                            <Button variant="ghost" size="icon" onClick={() => openPreview(hack)}><Eye className="h-4 w-4" /></Button>
                                            {!hack.is_approved && <Button size="icon" className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 rounded-full" onClick={() => handleApprove(hack.id)}><CheckCircle className="h-4 w-4" /></Button>}
                                            <Button size="icon" className="bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 rounded-full" onClick={() => handleDelete(hack.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </TabsContent>
                    </>
                )}
            </Tabs>

            {/* Experience Detail View Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="bg-background dark:bg-slate-950/95 backdrop-blur-xl border-slate-200 dark:border-white/10 text-foreground dark:text-white max-w-2xl max-h-[85vh] overflow-y-auto">
                    {activeSubTab === "experiences" && selectedExp && (() => {
                        const profession = selectedExp.profession || (selectedExp.role.includes(' | ') ? selectedExp.role.split(' | ')[0] : 'Other');
                        const displayRole = selectedExp.role.includes(' | ') ? selectedExp.role.split(' | ')[1] : selectedExp.role;
                        return (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-6 w-6 text-purple-500" />
                                            <span>{selectedExp.company_name}</span>
                                            <span className="text-muted-foreground text-sm font-normal">({displayRole})</span>
                                        </div>
                                        <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 w-fit">
                                            {profession}
                                        </Badge>
                                    </DialogTitle>
                                    <DialogDescription className="text-muted-foreground pt-1">
                                        Shared by {selectedExp.profiles?.full_name || 'Anonymous Student'} • Class of {selectedExp.batch_year}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6 my-4 border-t border-b border-slate-200 dark:border-white/10 py-6">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                                        <div>
                                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Status</span>
                                            <p className="text-sm font-semibold mt-1">{selectedExp.status}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Difficulty</span>
                                            <div className="flex gap-0.5 mt-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`h-3.5 w-3.5 ${star <= selectedExp.difficulty ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300 dark:text-slate-600'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Package/Stipend</span>
                                            <p className="text-sm font-semibold mt-1">{selectedExp.package || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Approval</span>
                                            <div className="mt-1">
                                                <Badge variant="outline" className={selectedExp.is_approved ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}>
                                                    {selectedExp.is_approved ? 'Approved' : 'Pending'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Interview Details</h4>
                                        <div className="text-sm bg-white dark:bg-black/10 border border-slate-200 dark:border-white/5 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                                            {selectedExp.content}
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="outline" onClick={() => setIsPreviewOpen(false)} disabled={actionLoading}>Close</Button>
                                    {!selectedExp.is_approved && <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApprove(selectedExp.id)} disabled={actionLoading}>Approve</Button>}
                                    <Button variant="destructive" onClick={() => handleDelete(selectedExp.id)} disabled={actionLoading}>Delete</Button>
                                </DialogFooter>
                            </>
                        );
                    })()}

                    {activeSubTab === "jobs" && selectedJob && (() => {
                        return (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-6 w-6 text-blue-500" />
                                            <span>{selectedJob.company_name}</span>
                                        </div>
                                        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400">{selectedJob.job_type}</Badge>
                                    </DialogTitle>
                                    <DialogDescription className="text-muted-foreground">
                                        {selectedJob.role}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 my-4 border-t border-b border-slate-200 dark:border-white/10 py-6">
                                    <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-black/20 p-4 rounded-xl">
                                        <div>
                                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Location</span>
                                            <p className="text-sm font-semibold mt-1">{selectedJob.location}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Profession</span>
                                            <p className="text-sm font-semibold mt-1">{selectedJob.profession}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Description & Details</h4>
                                        <div className="text-sm bg-white dark:bg-black/10 border border-slate-200 dark:border-white/5 p-4 rounded-xl whitespace-pre-wrap">
                                            {selectedJob.description}
                                        </div>
                                    </div>

                                    {selectedJob.link && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <LinkIcon className="h-4 w-4 text-emerald-500" />
                                            <a href={selectedJob.link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all">
                                                {selectedJob.link}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="outline" onClick={() => setIsPreviewOpen(false)} disabled={actionLoading}>Close</Button>
                                    {!selectedJob.is_approved && <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApprove(selectedJob.id)} disabled={actionLoading}>Approve</Button>}
                                    <Button variant="destructive" onClick={() => handleDelete(selectedJob.id)} disabled={actionLoading}>Delete</Button>
                                </DialogFooter>
                            </>
                        );
                    })()}

                    {activeSubTab === "hackathons" && selectedHack && (() => {
                        return (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="h-6 w-6 text-orange-500" />
                                            <span>{selectedHack.title}</span>
                                        </div>
                                    </DialogTitle>
                                    <DialogDescription className="text-muted-foreground">
                                        Organized by {selectedHack.organizer}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 my-4 border-t border-b border-slate-200 dark:border-white/10 py-6">
                                    <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-black/20 p-4 rounded-xl">
                                        <div>
                                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Event Date</span>
                                            <p className="text-sm font-semibold mt-1">{selectedHack.event_date}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Prize Pool</span>
                                            <p className="text-sm font-semibold mt-1 text-yellow-600 dark:text-yellow-400">{selectedHack.prize_pool || "N/A"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Description & Details</h4>
                                        <div className="text-sm bg-white dark:bg-black/10 border border-slate-200 dark:border-white/5 p-4 rounded-xl whitespace-pre-wrap">
                                            {selectedHack.description}
                                        </div>
                                    </div>

                                    {selectedHack.registration_link && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <LinkIcon className="h-4 w-4 text-emerald-500" />
                                            <a href={selectedHack.registration_link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all">
                                                {selectedHack.registration_link}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="outline" onClick={() => setIsPreviewOpen(false)} disabled={actionLoading}>Close</Button>
                                    {!selectedHack.is_approved && <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApprove(selectedHack.id)} disabled={actionLoading}>Approve</Button>}
                                    <Button variant="destructive" onClick={() => handleDelete(selectedHack.id)} disabled={actionLoading}>Delete</Button>
                                </DialogFooter>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    );
}
