import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Video,
    Link,
    Presentation,
    Download,
    Eye,
    Calendar,
    User,
    Bookmark
} from "lucide-react";
import { Resource } from "@/hooks/useResources";
import { useSavedResources } from "@/hooks/useSavedResources";
import { useUserActivity } from "@/hooks/useUserActivity";
import { useAuth } from "@/contexts/useAuth";
import { useNavigate } from "react-router-dom";
import { StarRating } from "@/components/common/StarRating";
import { useRating } from "@/hooks/useRating";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from '@/lib/supabase/client';

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    notes: FileText,
    pyq: FileText,
    presentation: Presentation,
    link: Link,
    video: Video,
    important_questions: FileText
};

const typeColors: Record<string, string> = {
    notes: "bg-blue-500/10 text-blue-600 border-blue-200",
    pyq: "bg-green-500/10 text-green-600 border-green-200",
    presentation: "bg-orange-500/10 text-orange-600 border-orange-200",
    link: "bg-purple-500/10 text-purple-600 border-purple-200",
    video: "bg-red-500/10 text-red-600 border-red-200",
    important_questions: "bg-yellow-500/10 text-yellow-600 border-yellow-200"
};

export function ResourceCard({ resource }: { resource: Resource }) {
    const IconComponent = typeIcons[resource.type] || FileText;
    const { toggleSave, isSaved } = useSavedResources();
    const { logActivity } = useUserActivity();
    const { userRating, submitRating } = useRating(resource.id);
    const [showRatingDialog, setShowRatingDialog] = useState(false);
    const [averageRating, setAverageRating] = useState(resource.rating || 0);

    // Update local state if prop changes
    useEffect(() => {
        setAverageRating(resource.rating || 0);
    }, [resource.rating]);

    const isExternal = resource.type === "link" || resource.type === "video";
    const primaryActionLabel =
        resource.type === "video" ? "Watch" : resource.type === "link" ? "Open" : "Download";

    const { user } = useAuth();
    const navigate = useNavigate();

    const handlePrimaryAction = () => {
        if (!user) {
            navigate("/auth");
            return;
        }

        logActivity(resource.id, isExternal ? 'view' : 'download');

        // Open the link/download
        if (resource.drive_link) {
            window.open(resource.drive_link, "_blank", "noopener,noreferrer");
        }

        // Show rating dialog after a short delay
        setTimeout(() => {
            setShowRatingDialog(true);
        }, 1500);
    };

    const handlePreview = () => {
        if (!user) {
            navigate("/auth");
            return;
        }

        logActivity(resource.id, 'view');
        if (resource.drive_link) {
            window.open(resource.drive_link, "_blank", "noopener,noreferrer");
        }
    };

    const handleRatingSubmit = async (rating: number) => {
        await submitRating(rating);
        setTimeout(() => setShowRatingDialog(false), 500);

        // Fetch new average rating to update UI immediately
        const { data } = await supabase
            .from('resources')
            .select('rating')
            .eq('id', resource.id)
            .single();

        if (data) {
            setAverageRating(data.rating);
        }
    };

    return (
        <>
            <Card className="shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-1 rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur-md border-slate-200 dark:border-white/10 text-foreground dark:text-white group overflow-hidden">
                <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                            <div className={`p-2 rounded-lg border bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 ${typeColors[resource.type]?.replace('bg-', 'text-') || 'text-blue-400'}`}>
                                <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Badge variant="secondary" className="text-xs capitalize w-fit bg-slate-200 text-slate-700 dark:bg-secondary dark:text-secondary-foreground">
                                    {resource.type === "pyq" ? "PYQ" : resource.type.replace('_', ' ')}
                                </Badge>
                                {/* Show status if needed (e.g. for uploader viewing their own) */}
                                {resource.status !== 'approved' && (
                                    <Badge variant={resource.status === 'rejected' ? 'destructive' : 'outline'} className="text-[10px] h-5 w-fit">
                                        {resource.status === 'pending' ? 'Pending Review' : 'Rejected'}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="flex items-center gap-1 hover:bg-muted p-1 rounded transition-colors group/rating">
                                        <StarRating value={averageRating} readOnly size="sm" />
                                        <span className="ml-0.5 font-medium group-hover/rating:text-primary">
                                            {averageRating.toFixed(1)}
                                        </span>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-4">
                                    <div className="text-center space-y-3">
                                        <p className="text-sm font-medium">Rate this resource</p>
                                        <StarRating
                                            value={userRating}
                                            onChange={handleRatingSubmit}
                                            size="lg"
                                        />
                                    </div>
                                </PopoverContent>
                            </Popover>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSave(resource.id);
                                }}
                            >
                                <Bookmark className={`h-4 w-4 ${isSaved(resource.id) ? "fill-primary text-primary" : ""}`} />
                            </Button>
                        </div>
                    </div>
                    <CardTitle className="text-lg leading-tight line-clamp-2 mt-2">
                        {resource.title}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span className="font-medium text-primary">{resource.subject}</span>
                        {resource.file_size && <span>{resource.file_size}</span>}
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3rem]">
                        {resource.description || "No description provided."}
                    </p>

                    {resource.status === 'rejected' && resource.admin_comments && (
                        <div className="bg-red-50 border border-red-100 p-2 rounded text-xs text-red-600 mt-2">
                            <strong>Admin Note:</strong> {resource.admin_comments}
                        </div>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span className="truncate max-w-[100px]">
                                {resource.uploader_name?.split('@')[0]}
                            </span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-y-2 pt-2">
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Download className="h-3 w-3" />
                            <span>{resource.downloads} downloads</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handlePreview} className="h-8 px-2 text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                Preview
                            </Button>
                            <Button size="sm" className="bg-gradient-primary h-8 px-2 text-xs" onClick={handlePrimaryAction}>
                                <Download className="h-3 w-3 mr-1" />
                                {primaryActionLabel}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-center">Rate this Resource</DialogTitle>
                        <DialogDescription className="text-center">
                            How helpful was <strong>{resource.title}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center py-6">
                        <StarRating
                            value={userRating}
                            onChange={handleRatingSubmit}
                            size="lg"
                        />
                    </div>
                    <DialogFooter className="sm:justify-center">
                        <Button variant="ghost" size="sm" onClick={() => setShowRatingDialog(false)}>
                            Maybe later
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
