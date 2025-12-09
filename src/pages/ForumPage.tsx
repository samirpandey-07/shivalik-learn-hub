
import { useState } from "react";
import { useForum } from "@/hooks/useForum";
import { QuestionCard } from "@/components/forum/QuestionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelection } from "@/contexts/SelectionContext";

export default function ForumPage() {
    const navigate = useNavigate();
    const { selectedCollege, selectedCourse } = useSelection();
    const [viewMode, setViewMode] = useState<'all' | 'college' | 'course'>('all');

    // Decide filters based on view mode
    const apiParams = {
        collegeId: viewMode !== 'all' ? selectedCollege?.id : undefined,
        courseId: viewMode === 'course' ? selectedCourse?.id : undefined
    };

    const { questions, loading } = useForum(apiParams);

    return (
        <div className="max-w-7xl mx-auto pb-20 p-4 lg:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                        Community Forum
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Ask questions, share knowledge, and connect with peers.
                    </p>
                </div>
                <Button onClick={() => navigate('/forum/new')} className="bg-[#8A4FFF] hover:bg-[#7a46e0] text-white shadow-lg shadow-purple-500/20">
                    <Plus className="mr-2 h-4 w-4" /> Ask Question
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className="hidden lg:block space-y-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 px-2">Feeds</h3>
                    <Button
                        variant={viewMode === 'all' ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setViewMode('all')}
                    >
                        Global Feed
                    </Button>
                    <Button
                        variant={viewMode === 'college' ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setViewMode('college')}
                        disabled={!selectedCollege}
                    >
                        My College ({selectedCollege?.name || 'Set College'})
                    </Button>
                    <Button
                        variant={viewMode === 'course' ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setViewMode('course')}
                        disabled={!selectedCourse}
                    >
                        My Course ({selectedCourse?.name || 'Set Course'})
                    </Button>
                </div>

                {/* Main Feed */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Search Bar (Visual only for now) */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search questions..." className="pl-10 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10" />
                    </div>

                    {/* Mobile Filter Tabs (Visible only on small screens) */}
                    <div className="lg:hidden flex gap-2 overflow-x-auto pb-2">
                        <Button size="sm" variant={viewMode === 'all' ? 'default' : 'outline'} onClick={() => setViewMode('all')}>All</Button>
                        <Button size="sm" variant={viewMode === 'college' ? 'default' : 'outline'} onClick={() => setViewMode('college')}>College</Button>
                        <Button size="sm" variant={viewMode === 'course' ? 'default' : 'outline'} onClick={() => setViewMode('course')}>Course</Button>
                    </div>

                    {/* Questions List */}
                    {loading ? (
                        <div className="text-center py-20 text-slate-400">Loading discussion...</div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                            <p className="text-slate-500 mb-4">No questions found in this feed.</p>
                            <Button variant="outline" onClick={() => navigate('/forum/new')}>Be the first to ask!</Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {questions.map(q => (
                                <QuestionCard key={q.id} question={q} onClick={() => navigate(`/forum/${q.id}`)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
