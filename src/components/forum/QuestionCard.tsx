
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MessageSquare, ThumbsUp, Eye } from "lucide-react";
import { ForumQuestion } from "@/hooks/useForum";

interface QuestionCardProps {
    question: ForumQuestion;
    onClick: () => void;
}

export function QuestionCard({ question, onClick }: QuestionCardProps) {
    return (
        <Card
            onClick={onClick}
            className="p-4 hover:shadow-md transition-all cursor-pointer border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm"
        >
            <div className="flex gap-4">
                {/* Vote/Stat Column */}
                <div className="flex flex-col items-center gap-2 min-w-[3rem] text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-lg text-slate-700 dark:text-slate-300">{question.upvotes}</span>
                        <ThumbsUp className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col items-center mt-2">
                        <span className="text-sm font-medium">{question.answers_count || 0}</span>
                        <MessageSquare className="h-4 w-4" />
                    </div>
                </div>

                {/* Content Column */}
                <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white line-clamp-2 hover:text-blue-500 transition-colors">
                        {question.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                        {question.content}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex gap-2">
                            {question.tags?.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    {tag}
                                </Badge>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={question.profile?.avatar_url} />
                                <AvatarFallback>{question.profile?.full_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <span>{question.profile?.full_name}</span>
                            <span>•</span>
                            <span>{new Date(question.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
