import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Clock, BookOpen, Download } from "lucide-react";
import { useUserActivity } from "@/hooks/useUserActivity";

export default function HistoryPage() {
    const navigate = useNavigate();
    const { recentActivity, loading } = useUserActivity();

    if (loading) {
        return <div className="text-center py-20 text-white">Loading activity...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10 relative">

            <div className="relative z-10">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70 mb-2">
                    Recently Viewed
                </h1>
                <p className="text-muted-foreground">Pick up where you left off.</p>
            </div>

            <div className="relative z-10 grid gap-4">
                {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                        <div key={activity.id} className="glass-card p-4 rounded-xl border-white/5 flex items-center gap-4 hover:bg-white/5 transition-colors">
                            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                {activity.action === 'download' ? <Download className="h-5 w-5 text-blue-400" /> : <BookOpen className="h-5 w-5 text-blue-400" />}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-semibold text-white">{activity.resource?.title || 'Unknown Resource'}</h3>
                                <p className="text-xs text-muted-foreground">
                                    {activity.action === 'view' ? 'Viewed' : 'Downloaded'} on {new Date(activity.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/resource/${activity.resource_id}`)}
                            >
                                <Clock className="h-4 w-4 mr-2" />
                                Open
                            </Button>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center text-muted-foreground bg-white/5 rounded-3xl border border-white/10">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                        <p className="text-lg font-medium text-white mb-2">No recent history</p>
                        <p className="text-sm">Activity will appear here once you view resources.</p>
                        <Button
                            variant="link"
                            className="text-primary mt-4"
                            onClick={() => navigate('/browse')}
                        >
                            Start Exploring
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
