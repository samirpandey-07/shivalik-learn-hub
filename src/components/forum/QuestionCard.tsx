
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MessageSquare, ThumbsUp, Share2, Trash2 } from "lucide-react";
import { ForumQuestion } from "@/hooks/useForum";
import { format } from "date-fns";

interface QuestionCardProps {
    question: ForumQuestion;
    onClick: () => void;
    onVote?: (e: React.MouseEvent) => void;
    onShare?: (e: React.MouseEvent) => void;
    onDelete?: (e: React.MouseEvent) => void;
}

export function QuestionCard({ question, onClick, onVote, onShare, onDelete }: QuestionCardProps) {
    return (
        <Card
            onClick={onClick}
            className="p-6 hover:shadow-lg transition-all cursor-pointer border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 rounded-[2rem]"
        >
            <div className="flex flex-col gap-4">
                {/* Header: User Info & Date */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-slate-100 dark:border-slate-800">
                            <AvatarImage src={question.profile?.avatar_url} />
                            <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {question.profile?.full_name?.[0] || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                                    {question.profile?.full_name || 'Anonymous'}
                                </h4>
                                <Badge className="text-[10px] bg-slate-800 text-white hover:bg-slate-700 px-1.5 py-0 rounded-sm">
                                    PRO
                                </Badge>
                            </div>
                            <span className="text-xs text-slate-500">
                                {(() => {
                                    try {
                                        return question.created_at ? format(new Date(question.created_at), 'dd/MM/yyyy') : 'Recent';
                                    } catch (e) {
                                        return 'Recent';
                                    }
                                })()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content: Title & Text */}
                <div className="space-y-2">
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white line-clamp-2">
                        {question.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                        {question.content}
                    </p>

                    {/* Tags */}
                    {question.tags && question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {question.tags.map(tag => (
                                <Badge key={tag} className="text-xs px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-500/30 border-0">
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer: Stats & Actions */}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-50 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onVote && onVote(e);
                            }}
                            className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                            <ThumbsUp className="h-4 w-4" />
                            <span className="text-sm font-medium">{question.upvotes} Likes</span>
                        </button>
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-400">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-sm font-medium">{question.answers_count || 0} Comments</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onShare && onShare(e);
                            }}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full"
                        >
                            <Share2 className="h-5 w-5" />
                        </button>
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(e);
                                }}
                                className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
