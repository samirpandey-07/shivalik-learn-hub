import { useState } from "react";
import { format } from "date-fns";
import {
    CheckCircle,
    XCircle,
    Eye,
    FileText,
    Video,
    Link as LinkIcon,
    Presentation,
    HelpCircle,
    Loader2,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { usePendingResources, approveResource, rejectResource } from "@/hooks/useAdmin";
import { Resource } from "@/hooks/useResources";

const TypeIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'notes': return <FileText className="h-4 w-4 text-blue-400" />;
        case 'video': return <Video className="h-4 w-4 text-red-400" />;
        case 'presentation': return <Presentation className="h-4 w-4 text-orange-400" />;
        case 'link': return <LinkIcon className="h-4 w-4 text-green-400" />;
        case 'pyq': return <HelpCircle className="h-4 w-4 text-purple-400" />; // Question mark for PYQ
        default: return <FileText className="h-4 w-4 text-gray-400" />;
    }
};

export function AdminResourcesTable() {
    const { resources, loading, refetch } = usePendingResources();

    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const handleApprove = async (resource: Resource) => {
        setActionLoading(true);
        const { error } = await approveResource(resource.id, resource.uploader_id);
        setActionLoading(false);

        if (error) {
            console.error("Approval Error:", error);
            toast.error("Error", {
                description: error.message || "Failed to approve resource.",
            });
        } else {
            toast.success("Resource Launched! 🚀", {
                description: `${resource.title} is now live.`,
            });
            setIsPreviewOpen(false);
            refetch(); // Refresh list
        }
    };

    const handleReject = async () => {
        if (!selectedResource || !rejectionReason) return;

        setActionLoading(true);
        const { error } = await rejectResource(selectedResource.id, selectedResource.uploader_id, rejectionReason);
        setActionLoading(false);

        if (error) {
            toast.error("Error", {
                description: "Failed to reject resource.",
            });
        } else {
            toast.success("Resource Rejected", {
                description: "The uploader has been notified.",
            });
            setIsRejectOpen(false);
            setIsPreviewOpen(false);
            setRejectionReason("");
            refetch(); // Refresh list
        }
    };

    const openPreview = (resource: Resource) => {
        setSelectedResource(resource);
        setIsPreviewOpen(true);
    };

    const openReject = (resource: Resource) => {
        setSelectedResource(resource);
        setIsRejectOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500 dark:text-cyan-400" />
            </div>
        );
    }

    if (resources.length === 0) {
        return (
            <Card className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 p-12 text-center backdrop-blur-xl">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground dark:text-white mb-2">All Systems Operational</h3>
                <p className="text-muted-foreground">No pending resources to review at the moment.</p>
            </Card>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {resources.map((resource) => (
                    <div
                        key={resource.id}
                        className="group relative flex items-center gap-4 bg-white/70 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                    >
                        {/* Ambient Glow on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        {/* Icon Box */}
                        <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-900/50 flex items-center justify-center border border-slate-200 dark:border-white/5 shrink-0">
                            <TypeIcon type={resource.type} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground dark:text-white truncate pr-4">{resource.title}</h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                    {resource.subject}
                                </span>
                                <span>•</span>
                                <span>{resource.uploader_name || 'Unknown'}</span>
                                <span>•</span>
                                <span>{format(new Date(resource.created_at), "MMM d, yyyy")}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 z-10">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground dark:text-white/70 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full"
                                onClick={() => openPreview(resource)}
                                title="View Details"
                            >
                                <Eye className="h-5 w-5" />
                            </Button>

                            <Button
                                size="icon"
                                className="bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-full"
                                onClick={() => handleApprove(resource)}
                                disabled={actionLoading}
                                title="Approve"
                            >
                                <CheckCircle className="h-5 w-5" />
                            </Button>

                            <Button
                                size="icon"
                                className="bg-rose-500/10 text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-full"
                                onClick={() => openReject(resource)}
                                disabled={actionLoading}
                                title="Reject"
                            >
                                <XCircle className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="bg-background dark:bg-slate-950/95 backdrop-blur-xl border-slate-200 dark:border-white/10 text-foreground dark:text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <TypeIcon type={selectedResource?.type || ''} />
                            {selectedResource?.title}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground dark:text-slate-400 text-base mt-2">
                            Subject: <span className="text-cyan-600 dark:text-cyan-400">{selectedResource?.subject}</span> • Uploaded by {selectedResource?.uploader_name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <p className="text-sm text-foreground dark:text-slate-300 whitespace-pre-wrap">{selectedResource?.description || "No description provided."}</p>
                        </div>

                        {selectedResource?.file_url && (
                            <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900/50">
                                <div className="p-3 bg-white/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground dark:text-slate-400">File Preview</span>
                                    <a href={selectedResource.file_url} target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                                        Download Original
                                    </a>
                                </div>
                                <div className="h-64 flex items-center justify-center text-muted-foreground dark:text-slate-500">
                                    {/* If it's an image we could show it, but for generic files mostly just show link/icon */}
                                    <div className="text-center">
                                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>Preview not available for this file type.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:justify-between">
                        <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white">
                            Close
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="destructive"
                                className="bg-rose-500/10 text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 shadow-none"
                                onClick={() => { setIsPreviewOpen(false); if (selectedResource) openReject(selectedResource); }}
                            >
                                Reject
                            </Button>
                            <Button
                                className="bg-cyan-500 hover:bg-cyan-600 text-white"
                                onClick={() => { if (selectedResource) handleApprove(selectedResource); }}
                            >
                                Approve Launch 🚀
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent className="bg-background dark:bg-slate-950/95 backdrop-blur-xl border-slate-200 dark:border-white/10 text-foreground dark:text-white">
                    <DialogHeader>
                        <DialogTitle>Reject Resource</DialogTitle>
                        <DialogDescription className="text-muted-foreground dark:text-slate-400">
                            Please provide a reason for rejecting this resource. This will be sent to the uploader.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="e.g. Duplicate content, Poor scan quality, Irrelevant to course..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-foreground dark:text-white min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsRejectOpen(false)} className="text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white">
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={!rejectionReason || actionLoading}
                            className="bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            {actionLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Confirm Rejection"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
