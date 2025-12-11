import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Video,
    Link,
    Presentation,
    Download,
    Eye,
    Bookmark,
    Trash2
} from "lucide-react";
import { Resource } from "@/hooks/useResources";
import { useSavedResources } from "@/hooks/useSavedResources";
import { useUserActivity } from "@/hooks/useUserActivity";
import { useAuth } from "@/contexts/useAuth";
import { useNavigate } from "react-router-dom";
import { StarRating } from "@/components/common/StarRating";
import { useRating } from "@/hooks/useRating";
import { toast } from "sonner";
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

export function ResourceCard({ resource }: { resource: Resource }) {
    const IconComponent = typeIcons[resource.type] || FileText;
    const { toggleSave, isSaved } = useSavedResources();
    const { logActivity } = useUserActivity();
    const { userRating, submitRating } = useRating(resource.id);
    const [showRatingDialog, setShowRatingDialog] = useState(false);
    const [averageRating, setAverageRating] = useState(resource.rating || 0);

    useEffect(() => {
        setAverageRating(resource.rating || 0);
    }, [resource.rating]);

    const isExternal = resource.type === "link" || resource.type === "video";
    const primaryActionLabel = resource.type === "video" ? "Watch" : resource.type === "link" ? "Open" : "Download";

    // Safety checks
    const safeUploaderName = resource.uploader_name || 'Anonymous';
    const safeDate = useMemo(() => {
        try {
            return new Date(resource.created_at).toLocaleDateString();
        } catch (e) {
            return 'Recently';
        }
    }, [resource.created_at]);

    const { user } = useAuth();
    const navigate = useNavigate();

    const handlePrimaryAction = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            navigate("/auth");
            return;
        }
        if (resource.type !== 'video') {
            const { error: rpcError } = await supabase.rpc('increment_downloads', { resource_id: resource.id });
            if (rpcError) console.error("Failed to increment downloads:", rpcError);
        }

        // Log activity
        logActivity(resource.id, isExternal ? 'view' : 'download');

        const urlToOpen = resource.drive_link || resource.file_url;
        if (urlToOpen) {
            window.open(urlToOpen, "_blank", "noopener,noreferrer");
        }
        setTimeout(() => setShowRatingDialog(true), 1500);
    };

    const handlePreview = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            navigate("/auth");
            return;
        }
        logActivity(resource.id, 'view');

        const urlToOpen = resource.drive_link || resource.file_url;
        if (urlToOpen) {
            window.open(urlToOpen, "_blank", "noopener,noreferrer");
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this resource? This action cannot be undone.")) return;

        const { error } = await supabase.from('resources').delete().eq('id', resource.id);
        if (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete resource");
        } else {
            toast.success("Resource deleted successfully");
        }
    };

    const handleRatingSubmit = async (rating: number) => {
        await submitRating(rating);
        setTimeout(() => setShowRatingDialog(false), 500);
        const { data } = await supabase.from('resources').select('rating').eq('id', resource.id).single();
        if (data) setAverageRating(data.rating);
    };

    // Card Colors based on Type
    const getStripColor = (type: string) => {
        switch (type) {
            case 'pyq': return 'bg-blue-500 text-white';
            case 'notes': return 'bg-purple-600 text-white';
            case 'video': return 'bg-red-500 text-white';
            case 'link': return 'bg-emerald-500 text-white';
            case 'presentation': return 'bg-orange-500 text-white';
            default: return 'bg-slate-500 text-white';
        }
    };

    const getBadgeColor = (type: string) => {
        switch (type) {
            case 'pyq': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300';
            case 'notes': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300';
            case 'video': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300';
            case 'link': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300';
            case 'presentation': return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
        }
    }

    const stripColor = getStripColor(resource.type);
    const badgeColor = getBadgeColor(resource.type);

    return (
        <>
            <Card
                className="group overflow-hidden border-slate-200 dark:border-white/10 shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900/50 cursor-pointer"
                onClick={() => navigate(`/resource/${resource.id}`)}
            >
                {/* Header Strip */}
                <div className={`h-10 px-4 flex items-center justify-between ${stripColor}`}>
                    <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {resource.type === "pyq" ? "PYQ" : resource.type.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Delete Button for Owner */}
                        {user?.id === resource.uploader_id && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-white hover:bg-white/20 hover:text-red-300 transition-colors"
                                onClick={handleDelete}
                                title="Delete Resource"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}

                        <div className="flex items-center text-xs font-medium">
                            <StarRating value={averageRating} readOnly size="sm" className="text-yellow-300" />
                            <span className="ml-1">{averageRating.toFixed(1)}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-white hover:bg-white/20 hover:text-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleSave(resource.id);
                            }}
                        >
                            <Bookmark className={`h-4 w-4 ${isSaved(resource.id) ? "fill-white" : ""}`} />
                        </Button>
                    </div>
                </div>

                <CardContent className="p-4 space-y-4">
                    {/* Title & Subject */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-lg leading-tight line-clamp-1 text-foreground" title={resource.title}>
                                {resource.title}
                            </h3>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                            <Badge variant="secondary" className={`${badgeColor} hover:bg-opacity-80 border-0`}>
                                {resource.subject}
                            </Badge>
                            {resource.year_number && (
                                <Badge variant="outline" className="border-slate-200 dark:border-white/10 text-muted-foreground">
                                    Year {resource.year_number}
                                </Badge>
                            )}
                            {resource.file_size && (
                                <span className="text-muted-foreground ml-auto">{resource.file_size}</span>
                            )}
                        </div>
                    </div>

                    {/* Uploader */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {safeUploaderName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground">
                                {safeUploaderName.split('@')[0]}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                                {safeDate}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreview}
                            className="w-full h-9 bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
                        >
                            <Eye className="h-3.5 w-3.5 mr-2" />
                            Preview
                        </Button>
                        <Button
                            size="sm"
                            onClick={handlePrimaryAction}
                            className={`w-full h-9 text-white shadow-md hover:shadow-lg transition-shadow ${stripColor.split(' ')[0]}`} // Use same color as header for consistency
                        >
                            <Download className="h-3.5 w-3.5 mr-2" />
                            {primaryActionLabel}
                        </Button>
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
