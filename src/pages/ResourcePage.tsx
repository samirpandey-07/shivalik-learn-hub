
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CommentsSection } from "@/components/resources/CommentsSection";
import { AISummary } from "@/components/resources/AISummary";
import { AIQuiz } from "@/components/resources/AIQuiz";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Download,
    Share2,
    ThumbsUp,
    FileText,
    Clock,
    User,
    ShieldAlert,
    Flag
} from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function ResourcePage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const { data: resource, isLoading, isError, error } = useQuery({
        queryKey: ["resource", id],
        queryFn: async () => {
            console.log("Fetching resource", id);
            // 1. Fetch Resource without joins to avoid PGRST201 (missing FK)
            const { data: resourceData, error: resourceError } = await supabase
                .from("resources")
                .select("*")
                .eq("id", id)
                .single();

            if (resourceError) {
                console.error("Supabase resource error:", resourceError);
                throw resourceError;
            }

            // 2. Fetch joined data manually to avoid FK errors
            let uploaderName = "Anonymous";
            if (resourceData.uploader_id) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", resourceData.uploader_id)
                    .single();
                if (profile) uploaderName = profile.full_name;
            }

            // 3. Construct final object (mocking the joined shape expected by UI)
            const finalData = {
                ...resourceData,
                uploader: { full_name: uploaderName },
                college: { name: "Unknown College" },
                course: { name: "Unknown Course" }
            };

            console.log("Resource data constructed:", finalData);
            return finalData;
        },
    });

    const handleDownload = () => {
        if (!resource) return;

        const urlToOpen = resource.file_url || resource.drive_link;
        if (!urlToOpen) {
            toast.error("Error", {
                description: "No URL found for this resource"
            });
            return;
        }

        // Open immediately to avoid popup blockers
        window.open(urlToOpen, '_blank', 'noopener,noreferrer');

        toast.success("Opening Resource", {
            description: "Your resource is opening in a new tab.",
        });

        // Increment download count in background (fire and forget)
        (supabase.rpc as any)('increment_downloads', { resource_id: id }).then(({ error }: { error: any }) => {
            if (error) console.error("Failed to increment downloads:", error);
        });
    };

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="text-destructive font-bold text-xl">Error Loading Resource</div>
                <p className="text-muted-foreground">{error instanceof Error ? error.message : "Unknown error"}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container py-8 space-y-8">
                <Skeleton className="h-96 w-full rounded-3xl bg-slate-200 dark:bg-white/5" />
                <div className="grid md:grid-cols-3 gap-8">
                    <Skeleton className="h-64 w-full rounded-2xl bg-slate-200 dark:bg-white/5 md:col-span-2" />
                    <Skeleton className="h-64 w-full rounded-2xl bg-slate-200 dark:bg-white/5" />
                </div>
            </div>
        );
    }

    if (!resource) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="p-6 rounded-full bg-slate-100 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground dark:text-white">Resource Not Found</h1>
                <p className="text-muted-foreground">The resource you are looking for does not exist or has been removed.</p>
                <Button variant="outline" onClick={() => window.history.back()} className="border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">
                    Go Back
                </Button>
            </div>
        );
    }

    // Safety check for date
    const safeDate = (dateStr: any) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    };

    return (
        <div className="container py-8 space-y-8">
            {/* Top Split Layout */}
            <div className="grid lg:grid-cols-3 gap-8">

                {/* Left: Preview / Hero (Glass Panel) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="relative group overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-2xl shadow-primary/5 min-h-[400px] flex items-center justify-center">
                        {/* Ambient Glows */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

                        {/* Preview Content */}
                        <div className="relative z-10 flex flex-col items-center gap-6 p-8 text-center">
                            <div className="p-8 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/20 shadow-inner backdrop-blur-md">
                                <FileText className="h-24 w-24 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-medium text-foreground dark:text-white/90">Preview Available</h3>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                    This resource is available for instant download. Click the button below to access the full file.
                                </p>
                            </div>

                            {/* Primary Neon Action */}
                            <Button
                                size="lg"
                                className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] border-none px-8 py-6 text-lg font-semibold transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
                                onClick={handleDownload}
                            >
                                <Download className="mr-2 h-5 w-5" />
                                Download Now
                            </Button>
                        </div>
                    </div>

                    {/* Description Card */}
                    <Card className="border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-lg">
                        <div className="p-6 space-y-4">
                            <h3 className="text-xl font-semibold text-foreground dark:text-white/90 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Description
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {resource.description || "No description provided for this resource."}
                            </p>
                        </div>
                    </Card>

                    {/* AI Tools Section - Only for PDFs */}
                    {resource.file_url && (resource.file_url.toLowerCase().endsWith('.pdf') || resource.title.toLowerCase().endsWith('.pdf')) && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                            <AISummary fileUrl={resource.file_url} />
                            <AIQuiz fileUrl={resource.file_url} />
                        </div>
                    )}
                </div>

                {/* Right: Metadata Sidebar (Glass Column) */}
                <div className="space-y-6">
                    <Card className="border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-lg h-full">
                        <div className="p-6 space-y-8">
                            {/* Title & Type */}
                            <div className="space-y-4">
                                <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 px-3 py-1 text-xs uppercase tracking-wider backdrop-blur-sm">
                                    {(resource.type || 'Resource').replace('_', ' ')}
                                </Badge>
                                <h1 className="text-3xl font-bold text-foreground dark:text-white leading-tight">
                                    {resource.title}
                                </h1>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-1 gap-4 text-sm">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                                    <span className="flex items-center text-muted-foreground">
                                        <User className="mr-2 h-4 w-4" /> Author
                                    </span>
                                    <span className="font-medium text-foreground dark:text-white/90 truncate max-w-[120px]">
                                        {resource.uploader?.full_name || 'Anonymous'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                                    <span className="flex items-center text-muted-foreground">
                                        <Clock className="mr-2 h-4 w-4" /> Uploaded
                                    </span>
                                    <span className="font-medium text-foreground dark:text-white/90">
                                        {safeDate(resource.created_at) ? formatDistanceToNow(new Date(resource.created_at)) + ' ago' : 'Unknown date'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                                    <span className="flex items-center text-muted-foreground">
                                        <Download className="mr-2 h-4 w-4" /> Downloads
                                    </span>
                                    <span className="font-medium text-foreground dark:text-white/90">
                                        {resource.downloads || 0}
                                    </span>
                                </div>
                            </div>

                            {/* Secondary Actions */}
                            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                                <Button variant="outline" className="flex-1 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white transition-colors">
                                    <Share2 className="mr-2 h-4 w-4" /> Share
                                </Button>
                                <Button variant="outline" className="flex-1 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white transition-colors">
                                    <ThumbsUp className="mr-2 h-4 w-4" /> Like
                                </Button>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                            <Flag className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="border-slate-200 dark:border-white/10 bg-background dark:bg-black/90 backdrop-blur-xl">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground dark:text-white">
                                                <ShieldAlert className="h-5 w-5 text-destructive" />
                                                Report Resource
                                            </h3>
                                            <p className="text-muted-foreground text-sm">
                                                If you believe this resource violates our community guidelines, please report it.
                                            </p>
                                            <textarea
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md p-3 text-foreground dark:text-white focus:outline-none focus:border-primary/50"
                                                rows={4}
                                                placeholder="Please describe the issue..."
                                                id="report-reason"
                                            />
                                            <Button
                                                variant="destructive"
                                                className="w-full"
                                                onClick={async () => {
                                                    const reason = (document.getElementById('report-reason') as HTMLTextAreaElement).value;
                                                    if (!reason) return;

                                                    const { error } = await supabase.from('reports' as any).insert([{
                                                        reporter_id: user?.id,
                                                        resource_id: id,
                                                        reason: reason,
                                                        status: 'pending'
                                                    }]);

                                                    if (error) {
                                                        toast.error("Error", { description: "Failed to submit report." });
                                                    } else {
                                                        toast.success("Report Submitted", { description: "Thank you for helping keep our community safe." });
                                                    }
                                                }}
                                            >
                                                Submit Report
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </Card>

                    {/* Comments Section */}
                    <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md">
                        {id && <CommentsSection resourceId={id} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
