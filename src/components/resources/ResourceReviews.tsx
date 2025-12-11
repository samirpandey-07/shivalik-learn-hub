import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/common/StarRating";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { MessageSquare, Star } from "lucide-react";

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    user_id: string;
    user: {
        full_name: string | null;
        avatar_url: string | null;
    };
}

export function ResourceReviews({ resourceId, userId }: { resourceId: string, userId?: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [hasRated, setHasRated] = useState(false);

    useEffect(() => {
        fetchReviews();

        // Real-time subscription
        const channel = supabase
            .channel(`reviews:${resourceId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'resource_ratings',
                    filter: `resource_id=eq.${resourceId}`
                },
                () => {
                    fetchReviews();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [resourceId]);

    const fetchReviews = async () => {
        try {
            // First fetch ratings
            const { data: ratings, error } = await supabase
                .from('resource_ratings')
                .select(`
                    *,
                    user:profiles (
                        full_name,
                        avatar_url,
                        email
                    )
                `)
                .eq('resource_id', resourceId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            const reviewsData = ratings as unknown as Review[];
            setReviews(reviewsData);

            if (userId) {
                const myReview = reviewsData.find(r => r.user_id === userId);
                if (myReview) {
                    setHasRated(true);
                    setUserRating(myReview.rating);
                    setUserComment(myReview.comment || "");
                }
            }
        } catch (err) {
            console.error("Error fetching reviews:", err);
            toast.error("Failed to load reviews: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!userId) {
            toast.error("Please sign in to write a review");
            return;
        }
        if (userRating === 0) {
            toast.error("Please select a rating");
            return;
        }

        setSubmitting(true);
        try {
            // Upsert rating
            const { error } = await supabase
                .from('resource_ratings')
                .upsert({
                    resource_id: resourceId,
                    user_id: userId,
                    rating: userRating,
                    comment: userComment
                });

            if (error) throw error;
            toast.success(hasRated ? "Review updated!" : "Review submitted!");
            fetchReviews();
        } catch (err) {
            toast.error("Failed to submit review: " + (err as Error).message);
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const averageRating = reviews.length
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    return (
        <div className="space-y-6 mt-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            <span>{averageRating}</span>
                            <span className="text-muted-foreground text-sm font-normal">
                                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                            </span>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Write Review Section */}
                    {userId ? (
                        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl space-y-4">
                            <h3 className="font-medium text-sm">
                                {hasRated ? "Edit your review" : "Write a review"}
                            </h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Rating:</span>
                                    <StarRating value={userRating} onChange={setUserRating} size="lg" />
                                </div>
                                <Textarea
                                    placeholder="Share your thoughts about this resource..."
                                    value={userComment}
                                    onChange={(e) => setUserComment(e.target.value)}
                                    className="resize-none"
                                />
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        size="sm"
                                    >
                                        {submitting ? "Posting..." : (hasRated ? "Update Review" : "Post Review")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-4 border rounded-xl bg-slate-50 dark:bg-white/5">
                            <p className="text-sm text-muted-foreground">Sign in to leave a review</p>
                        </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="flex gap-4 border-b pb-6 last:border-0">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={review.user?.avatar_url || ''} />
                                    <AvatarFallback>{review.user?.full_name?.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-sm">{review.user?.full_name || 'Anonymous user'}</h4>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <StarRating value={review.rating} readOnly size="sm" />
                                    {review.comment && (
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                                            {review.comment}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
