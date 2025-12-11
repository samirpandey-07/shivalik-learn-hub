import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Clock,
    Eye,
    MessageSquare,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/useAuth";
import {
    getPendingResources,
    approveResource,
    rejectResource
} from "@/api/admin";

export function PendingReviews() {
    const [pendingUploads, setPendingUploads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [reviewingId, setReviewingId] = useState<string | null>(null);
    const [reviewComment, setReviewComment] = useState("");

    const { user } = useAuth();

    useEffect(() => {
        loadPending();
    }, []);

    async function loadPending() {
        setLoading(true);
        const { data, error } = await getPendingResources();

        if (!error && data) {
            setPendingUploads(data);
        } else {
            console.error("Failed to load pending resources:", error);
            toast.error("Failed to load pending reviews");
        }
        setLoading(false);
    }

    const handleApprove = async (id: string) => {
        if (!user?.id) return;

        const { error } = await approveResource(id, user.id);

        if (!error) {
            setPendingUploads(prev => prev.filter(upload => upload.id !== id));
            setReviewingId(null);
            toast.success("Resource approved!");
        } else {
            toast.error("Failed to approve resource");
        }
    };

    const handleReject = async (id: string) => {
        if (!user?.id) return;
        if (!reviewComment.trim()) return; // Require comment

        const { error } = await rejectResource(id, user.id, reviewComment.trim());

        if (!error) {
            setPendingUploads(prev => prev.filter(upload => upload.id !== id));
            setReviewingId(null);
            setReviewComment("");
            toast.success("Resource rejected");
        } else {
            console.error("Reject failed:", error);
            toast.error("Failed to reject resource");
        }
    };

    return (
        <Card className="shadow-card">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Pending Resource Reviews</span>
                    <Badge variant="secondary">{pendingUploads.length}</Badge>
                </CardTitle>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <div className="py-10 text-center text-muted-foreground">
                        Loading pending resources...
                    </div>
                ) : pendingUploads.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <CheckCircle className="h-14 w-14 mx-auto text-green-500 mb-3" />
                        <h3 className="text-lg font-semibold">All Reviewed!</h3>
                        <p>No pending uploads remaining.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {pendingUploads.map(upload => (
                            <Card
                                key={upload.id}
                                className="border-l-4 border-l-orange-500 shadow-sm"
                            >
                                <CardContent className="p-4">
                                    <div className="flex justify-between">
                                        {/* Resource Info */}
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-semibold">
                                                    {upload.title}
                                                </h3>
                                                <Badge>{upload.type}</Badge>
                                                <Badge variant="secondary">{upload.subject}</Badge>
                                            </div>

                                            <p className="text-sm text-muted-foreground">
                                                {upload.description || "No description provided."}
                                            </p>

                                            <div className="flex items-center text-xs text-muted-foreground space-x-4">
                                                <span>Uploaded by {upload.uploader_name}</span>
                                                {upload.file_size && <span>{upload.file_size}</span>}
                                                <span>
                                                    {new Date(upload.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex space-x-2 ml-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    window.open(upload.drive_link, "_blank")
                                                }
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                Preview
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setReviewingId(upload.id)}
                                            >
                                                <MessageSquare className="h-4 w-4 mr-1" />
                                                Review
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Review Section */}
                                    {reviewingId === upload.id && (
                                        <div className="mt-4 bg-muted/50 p-4 rounded-lg space-y-4">
                                            <Textarea
                                                placeholder="Add a review comment (required for rejection)"
                                                value={reviewComment}
                                                onChange={e => setReviewComment(e.target.value)}
                                            />

                                            <div className="flex space-x-2">
                                                <Button
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleApprove(upload.id)}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Approve
                                                </Button>

                                                <Button
                                                    variant="destructive"
                                                    disabled={!reviewComment.trim()}
                                                    onClick={() => handleReject(upload.id)}
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Reject
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setReviewingId(null);
                                                        setReviewComment("");
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
