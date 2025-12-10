
import { useState } from "react";
import { useForum, useTopContributors, voteQuestion, deleteQuestion } from "@/hooks/useForum";
import { QuestionCard } from "@/components/forum/QuestionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trophy, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelection } from "@/contexts/SelectionContext";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/useAuth";

export default function ForumPage() {
    const navigate = useNavigate();
    const { roles } = useAuth();
    const { selectedCollege, selectedCourse } = useSelection();
    const [viewMode, setViewMode] = useState<'all' | 'college' | 'course'>('all');

    // Decide filters based on view mode
    const apiParams = {
        collegeId: viewMode !== 'all' ? selectedCollege?.id : undefined,
        courseId: viewMode === 'course' ? selectedCourse?.id : undefined
    };

    console.log('[ForumPage] Rendering', { viewMode, selectedCollege, selectedCourse, roles });

    const { questions, loading, refresh } = useForum(apiParams);
    const { contributors, loading: loadingContributors } = useTopContributors();

    console.log('[ForumPage] Data', { questionsCount: questions.length, loading, contributorsCount: contributors.length });
    const trendingTopics = [
        { name: "Exams", count: 120, color: "bg-blue-500" },
        { name: "Canteen", count: 85, color: "bg-pink-500" },
        { name: "Python", count: 64, color: "bg-purple-500" },
        { name: "Dostiton", count: 42, color: "bg-indigo-500" },
        { name: "Innoduis", count: 30, color: "bg-cyan-500" },
        { name: "Files", count: 18, color: "bg-teal-500" },
    ];

    const handleVote = async (e: React.MouseEvent, questionId: string) => {
        e.stopPropagation();
        const { error } = await voteQuestion(questionId);
        if (error) {
            toast.error("Failed to vote");
        } else {
            refresh(); // Refresh list to show new vote count
        }
    };

    const handleDelete = async (e: React.MouseEvent, questionId: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this discussion?")) return;

        const { error } = await deleteQuestion(questionId);
        if (error) {
            toast.error("Failed to delete question");
        } else {
            toast.success("Question deleted");
            refresh();
        }
    };

    const handleShare = (e: React.MouseEvent, questionId: string) => {
        e.stopPropagation();
        const url = `${window.location.origin}/forum/${questionId}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };


    return (
        <div className="max-w-7xl mx-auto pb-20 p-4 lg:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                        Community Forum
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Ask questions, share knowledge, and connect with peers.
                    </p>
                </div>
                <Button onClick={() => navigate('/forum/new')} className="bg-[#1e1b4b] hover:bg-[#2e2a6b] text-white shadow-lg shadow-indigo-500/20 rounded-full px-6">
                    <Plus className="mr-2 h-4 w-4" /> Ask Question
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Sidebar: Feeds (3 columns) */}
                <div className="hidden lg:block lg:col-span-3 space-y-6">
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 px-2">Feeds</h3>
                        <div className="space-y-1">
                            <Button
                                variant="ghost"
                                className={`w-full justify-start rounded-xl ${viewMode === 'all' ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-l-4 border-cyan-500' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                onClick={() => setViewMode('all')}
                            >
                                Global Feed
                            </Button>
                            <Button
                                variant="ghost"
                                className={`w-full justify-start rounded-xl ${viewMode === 'college' ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-l-4 border-cyan-500' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                onClick={() => setViewMode('college')}
                                disabled={!selectedCollege}
                            >
                                <span className="truncate text-left">My College {selectedCollege && `(${selectedCollege.name})`}</span>
                            </Button>
                            <Button
                                variant="ghost"
                                className={`w-full justify-start rounded-xl ${viewMode === 'course' ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-l-4 border-cyan-500' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                onClick={() => setViewMode('course')}
                                disabled={!selectedCourse}
                            >
                                <span className="truncate text-left">My Course {selectedCourse && `(${selectedCourse.name})`}</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Middle Column: Main Feed (6 columns) */}
                <div className="lg:col-span-6 space-y-6">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search questions..."
                            className="pl-11 h-12 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl focus:ring-0 focus:border-cyan-500 shadow-sm"
                        />
                    </div>

                    {/* Mobile Filter Tabs (Visible only on small screens) */}
                    <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <Button size="sm" className="rounded-full" variant={viewMode === 'all' ? 'default' : 'outline'} onClick={() => setViewMode('all')}>All</Button>
                        <Button size="sm" className="rounded-full" variant={viewMode === 'college' ? 'default' : 'outline'} onClick={() => setViewMode('college')}>College</Button>
                        <Button size="sm" className="rounded-full" variant={viewMode === 'course' ? 'default' : 'outline'} onClick={() => setViewMode('course')}>Course</Button>
                    </div>

                    {/* Questions List */}
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-48 bg-white dark:bg-white/5 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No discussions yet</h3>
                            <p className="text-slate-500 mb-6">Be the first to start a conversation in this feed.</p>
                            <Button onClick={() => navigate('/forum/new')}>Start Discussion</Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {questions.map(q => (
                                <QuestionCard
                                    key={q.id}
                                    question={q}
                                    onClick={() => navigate(`/forum/${q.id}`)}
                                    onVote={(e) => handleVote(e, q.id)}
                                    onShare={(e) => handleShare(e, q.id)}
                                    onDelete={
                                        (roles?.includes('admin') || roles?.includes('superadmin'))
                                            ? (e) => handleDelete(e, q.id)
                                            : undefined
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Widgets (3 columns) */}
                <div className="hidden lg:block lg:col-span-3 space-y-6">
                    {/* Trending Topics Widget */}
                    <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 dark:text-white">Trending Topics</h3>
                            <div className="flex gap-1 text-slate-400">
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {trendingTopics.map((topic) => (
                                <Badge
                                    key={topic.name}
                                    className={`${topic.color} text-white hover:opacity-90 cursor-pointer px-3 py-1 rounded-full text-xs font-medium border-0`}
                                >
                                    #{topic.name}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Top Contributors Widget */}
                    <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/5 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Top Contributors</h3>
                        {loadingContributors ? (
                            <div className="text-sm text-slate-400">Loading leaders...</div>
                        ) : contributors.length === 0 ? (
                            <div className="text-sm text-slate-400">No contributors yet</div>
                        ) : (
                            <div className="space-y-4">
                                {contributors.map((user, index) => (
                                    <div key={user.id} className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-slate-100 dark:border-slate-800">
                                            <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                {user.full_name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                            <AvatarImage src={user.avatar_url || ''} />
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{user.full_name}</p>
                                            <p className="text-xs text-slate-500">{user.points} coins</p>
                                        </div>
                                        <Trophy className={`h-5 w-5 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-400' : 'text-amber-700'}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                        <Button variant="outline" className="w-full mt-4 rounded-full text-xs h-9" onClick={() => navigate('/forum/new')}>
                            <Plus className="h-3 w-3 mr-1" /> Ask Question
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
