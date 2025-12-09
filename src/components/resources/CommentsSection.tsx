import { useState } from 'react';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface CommentsSectionProps {
    resourceId: string;
}

export function CommentsSection({ resourceId }: CommentsSectionProps) {
    const { user, profile } = useAuth();
    const { comments, loading, addComment, deleteComment } = useComments(resourceId);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!user) {
            toast.error("You must be logged in to comment.");
            return;
        }
        if (!newComment.trim()) return;

        setSubmitting(true);
        const { error } = await addComment(user.id, newComment);
        setSubmitting(false);

        if (error) {
            toast.error("Failed to post comment.");
            console.error(error);
        } else {
            setNewComment("");
            toast.success("Comment posted!");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;
        const { error } = await deleteComment(id);
        if (error) {
            toast.error("Failed to delete comment.");
        } else {
            toast.success("Comment deleted.");
        }
    };

    if (loading) return <div className="text-sm text-muted-foreground">Loading comments...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Discussion ({comments.length})</h3>
            </div>

            {/* Comment Input */}
            <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name || 'User'}`} />
                    <AvatarFallback>{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <Textarea
                        placeholder={user ? "Ask a question or share your thoughts..." : "Please log in to participate in the discussion."}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={!user || submitting}
                        className="min-h-[80px] bg-white dark:bg-white/5 resize-y"
                    />
                    <div className="flex justify-end">
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={!user || !newComment.trim() || submitting}
                        >
                            {submitting ? "Posting..." : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Post Comment
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                        <p>No comments yet. Be the first to start the conversation!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group">
                            <Avatar className="h-8 w-8 mt-1">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.profiles?.full_name || 'User'}`} />
                                <AvatarFallback>{comment.profiles?.full_name?.charAt(0) || "?"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">{comment.profiles?.full_name || "Unknown User"}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {comment.created_at && !isNaN(new Date(comment.created_at).getTime())
                                                ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
                                                : 'Just now'}
                                        </span>
                                    </div>
                                    {(user && user.id === comment.user_id) && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(comment.id)}
                                            className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
