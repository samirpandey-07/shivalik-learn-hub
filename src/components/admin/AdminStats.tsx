import { FileText, Users, Download, Clock, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAdminStats } from "@/hooks/useAdmin";

export function AdminStats() {
    const { stats, loading } = useAdminStats();

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="h-32 bg-white/5 border-white/10 animate-pulse rounded-2xl" />
                ))}
            </div>
        );
    }

    const statItems = [
        {
            label: "Total Resources",
            value: stats.totalResources,
            icon: FileText,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/20",
        },
        {
            label: "Pending Reviews",
            value: stats.pendingResources,
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/50", // Brighter border for attention
            pulse: stats.pendingResources > 0,
        },
        {
            label: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
            border: "border-violet-500/20",
        },
        {
            label: "Total Downloads",
            value: stats.totalDownloads,
            icon: Download,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statItems.map((item, index) => (
                <Card
                    key={index}
                    className={`relative overflow-hidden bg-white/5 backdrop-blur-xl border ${item.border} p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 group`}
                >
                    {/* Ambient Glow */}
                    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${item.bg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />

                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">{item.label}</p>
                            <h3 className="text-3xl font-bold text-white tracking-tight">{item.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${item.bg} border border-white/5 ${item.pulse ? 'animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.3)]' : ''}`}>
                            <item.icon className={`h-6 w-6 ${item.color}`} />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
