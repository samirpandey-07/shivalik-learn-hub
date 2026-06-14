import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "sonner";
import {
    Plus,
    Trophy,
    Calendar,
    Users,
    Award,
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
import { ShareHackathonDialog } from "./ShareHackathonDialog";
import { format } from "date-fns";

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

const MOCK_HACKATHONS: HackathonEvent[] = [
    {
        id: "mock-hack-1",
        title: "Smart India Hackathon 2026",
        organizer: "Ministry of Education, Govt of India",
        event_date: "2026-11-15",
        registration_link: "https://sih.gov.in",
        prize_pool: "Rs. 10 Lakhs",
        description: "SIH is a nationwide initiative to provide students with a platform to solve some of the pressing problems we face in our daily lives, and thus inculcate a product innovation mindset. Open to all Indian college students.",
        is_approved: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "mock-hack-2",
        title: "Google Developer Solution Challenge",
        organizer: "Google Developer Student Clubs",
        event_date: "2026-03-30",
        registration_link: "https://developers.google.com/community/gdsc",
        prize_pool: "Global Mentorship & Prizes",
        description: "Build a solution for one or more of the United Nations 17 Sustainable Development Goals using Google technology. Finalists receive global recognition and 1-on-1 mentorship.",
        is_approved: true,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "mock-hack-3",
        title: "HackMIT 2026",
        organizer: "Massachusetts Institute of Technology",
        event_date: "2026-09-20",
        registration_link: "https://hackmit.org",
        prize_pool: "$15,000 USD",
        description: "HackMIT is MIT's annual student-run hackathon, bringing together over 1,000 hackers from across the world to build tech solutions and explore new technologies. Travel reimbursements available.",
        is_approved: true,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "mock-hack-4",
        title: "Unstop Tech Park Challenge",
        organizer: "Unstop",
        event_date: "2026-07-05",
        registration_link: "https://unstop.com",
        prize_pool: "Rs. 5 Lakhs + Job Offers",
        description: "Competitive coding, hardware prototype, and system design competition open to engineering students across India. Great opportunities for pre-placement interviews.",
        is_approved: false, // Pending for admin testing!
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
];

export function HackathonList() {
    const { user, roles = [] } = useAuth();
    const isAdmin = roles.includes('admin') || roles.includes('superadmin');

    const [hackathons, setHackathons] = useState<HackathonEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [usingMock, setUsingMock] = useState(false);

    const fetchHackathons = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('hackathons')
                .select('*');

            if (!isAdmin) {
                query = query.eq('is_approved', true);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            let fetched = data as any[] || [];
            if (fetched.length === 0) {
                const local = localStorage.getItem('campus_flow_hackathons');
                if (local) {
                    fetched = JSON.parse(local);
                } else {
                    fetched = MOCK_HACKATHONS;
                    localStorage.setItem('campus_flow_hackathons', JSON.stringify(MOCK_HACKATHONS));
                }
                setUsingMock(true);
            } else {
                setUsingMock(false);
            }
            setHackathons(fetched);
        } catch (error) {
            console.error('Error fetching hackathons:', error);
            const local = localStorage.getItem('campus_flow_hackathons');
            let fetched = MOCK_HACKATHONS;
            if (local) {
                fetched = JSON.parse(local);
            } else {
                localStorage.setItem('campus_flow_hackathons', JSON.stringify(MOCK_HACKATHONS));
            }
            setHackathons(fetched);
            setUsingMock(true);
            toast.error("Using offline hackathons data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHackathons();
    }, [isAdmin]);

    const handleApprove = async (id: string) => {
        if (id.startsWith('mock-hack-') || id.startsWith('local-hack-')) {
            const updated = hackathons.map(hack => 
                hack.id === id ? { ...hack, is_approved: true } : hack
            );
            setHackathons(updated);
            localStorage.setItem('campus_flow_hackathons', JSON.stringify(updated));
            toast.success("Hackathon approved successfully!");
            return;
        }

        try {
            const { error } = await supabase
                .from('hackathons')
                .update({ is_approved: true } as any)
                .eq('id', id);

            if (error) throw error;
            toast.success("Hackathon approved successfully!");
            fetchHackathons();
        } catch (error) {
            console.error("Error approving hackathon:", error);
            toast.error("Failed to approve hackathon.");
        }
    };

    const handleDelete = async (id: string) => {
        if (id.startsWith('mock-hack-') || id.startsWith('local-hack-')) {
            const updated = hackathons.filter(hack => hack.id !== id);
            setHackathons(updated);
            localStorage.setItem('campus_flow_hackathons', JSON.stringify(updated));
            toast.success("Hackathon deleted successfully!");
            return;
        }

        try {
            const { error } = await supabase
                .from('hackathons')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success("Hackathon deleted successfully!");
            fetchHackathons();
        } catch (error) {
            console.error("Error deleting hackathon:", error);
            toast.error("Failed to delete hackathon.");
        }
    };

    const filteredHackathons = hackathons.filter(hack => {
        return (
            hack.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hack.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hack.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const formatDateString = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "MMM d, yyyy");
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search hackathons, organizers..."
                        className="pl-9 bg-white dark:bg-black/20 border-slate-200 dark:border-white/10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button
                    onClick={() => setIsShareModalOpen(true)}
                    className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg shadow-orange-500/25 shrink-0"
                >
                    <Plus className="h-4 w-4 mr-2" /> Share Hackathon
                </Button>
            </div>

            {/* Local/Demo Banner */}
            {usingMock && (
                <div className="bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
                    <span>💡 <strong>Demo Mode:</strong> Showing mock/locally saved hackathons. Apply the database migration and add your own to see them live!</span>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="flex flex-col justify-center items-center py-20 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-orange-500 opacity-80" />
                    <p>Loading hackathons...</p>
                </div>
            ) : filteredHackathons.length === 0 ? (
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 dark:border-white/20 p-12 text-center flex flex-col items-center">
                    <Trophy className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No hackathons found</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        {searchQuery ? "We couldn't find any hackathons matching your search." : "Be the first to share an upcoming hackathon!"}
                    </p>
                    {!searchQuery && (
                        <Button variant="outline" onClick={() => setIsShareModalOpen(true)}>
                            Post a Hackathon
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredHackathons.map((hack) => (
                        <div key={hack.id} className="group bg-white dark:bg-[#0B1021] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-500/30 transition-all duration-300 flex flex-col h-full">
                            {/* Card Header */}
                            <div className="p-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-start bg-slate-50/50 dark:bg-white/[0.02]">
                                <div className="flex gap-3 items-center">
                                    <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center border border-orange-200 dark:border-orange-900/30 text-orange-600 dark:text-orange-400 shrink-0">
                                        <Trophy className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground dark:text-slate-200 truncate max-w-[200px] sm:max-w-[250px]">
                                            {hack.title}
                                        </h3>
                                        <div className="flex items-center text-xs text-muted-foreground gap-2 mt-0.5">
                                            <span className="flex items-center"><Users className="h-3 w-3 mr-1 text-slate-500" /> {hack.organizer}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isAdmin && (
                                        <div className="flex items-center gap-1 border-l sm:border-l border-slate-200 dark:border-white/10 pl-2 ml-1">
                                            {!hack.is_approved && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-500/15"
                                                    onClick={() => handleApprove(hack.id)}
                                                    title="Approve Hackathon"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-500/15"
                                                onClick={() => handleDelete(hack.id)}
                                                title="Delete Hackathon"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4 flex-wrap text-xs">
                                        <span className="flex items-center gap-1 text-muted-foreground bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-md border border-slate-200 dark:border-white/5">
                                            <Calendar className="h-3.5 w-3.5 text-cyan-500" />
                                            {formatDateString(hack.event_date)}
                                        </span>
                                        {hack.prize_pool && (
                                            <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-md border border-yellow-500/20 font-semibold">
                                                <Award className="h-3.5 w-3.5 text-yellow-500" />
                                                {hack.prize_pool}
                                            </span>
                                        )}
                                        {isAdmin && (
                                            <Badge variant="outline" className={`text-[9px] py-0.5 ${hack.is_approved ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                                                {hack.is_approved ? 'Approved' : 'Pending'}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">
                                        {hack.description}
                                    </p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end items-center bg-slate-50/50 dark:bg-black/10 -mx-5 -mb-5 px-5 py-4">
                                    {hack.registration_link && (
                                        <a
                                            href={hack.registration_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                                        >
                                            Register & Learn More <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ShareHackathonDialog
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                onSuccess={fetchHackathons}
            />
        </div>
    );
}
