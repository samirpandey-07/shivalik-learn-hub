
import React from "react";
import { useGamification } from "@/hooks/useGamification";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

import { useAuth } from "@/contexts/useAuth";

export function LeaderboardWidget() {
    const { user } = useAuth();
    const { leaderboard, loading } = useGamification(user?.id);

    if (loading) return <div className="h-full w-full animate-pulse bg-white/5 rounded-2xl" />;

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown className="h-5 w-5 text-yellow-500 fill-yellow-500" />;
            case 2: return <Medal className="h-5 w-5 text-slate-300 fill-slate-300" />;
            case 3: return <Medal className="h-5 w-5 text-amber-600 fill-amber-600" />;
            default: return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top Learners
                </h3>
                <span className="text-xs text-muted-foreground">Updated Weekly</span>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar flex-1">
                {leaderboard.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No data yet. Be the first to earn coins!
                    </div>
                ) : (
                    leaderboard.map((user) => (
                        <div key={user.user_id} className="flex items-center gap-3 p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors group">
                            <div className="flex-shrink-0 flex items-center justify-center w-8">
                                {getRankIcon(user.rank)}
                            </div>

                            <Avatar className={cn("h-10 w-10 border-2", user.rank === 1 ? "border-yellow-500" : "border-transparent")}>
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback>{user.full_name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{user.full_name}</p>
                                <p className="text-xs text-muted-foreground">{user.coins} Coins</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
