
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, Crown, Star } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";

// Simple XP to Level calculation
// Level N requires N*100 XP
export function SeasonProgress() {
    const { profile } = useAuth(); // Assuming profile has XP now

    // Fallback if schema update hasn't propagated to auth context yet (we might need to reload profile)
    const xp = (profile as any)?.xp || 0;
    const level = (profile as any)?.level || 1;

    const xpForNextLevel = level * 100;
    const progress = Math.min((xp % 100) / 100 * 100, 100);
    // Simplified logic: Every 100 XP is a level up. 
    // In reality, this should be consistent with the backend.

    return (
        <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/20 mb-6 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl" />

            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6 relative z-10">
                {/* Level Badge */}
                <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 transform rotate-3">
                        <Crown className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-black/80 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-white/20">
                        LVL {level}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="flex-1 w-full space-y-2">
                    <div className="flex justify-between items-center text-sm font-medium">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            Season 1: Genesis
                        </span>
                        <span className="text-muted-foreground">{xp} XP</span>
                    </div>
                    <Progress value={progress} className="h-3 bg-black/20" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Level {level}</span>
                        <span>{100 - (xp % 100)} XP to Level {level + 1}</span>
                    </div>
                </div>

                {/* Next Reward Preview */}
                <div className="hidden md:flex flex-col items-center gap-1 opacity-70">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                        <Star className="h-4 w-4 text-yellow-200" />
                    </div>
                    <span className="text-[10px]">Next Reward</span>
                </div>
            </CardContent>
        </Card>
    );
}
