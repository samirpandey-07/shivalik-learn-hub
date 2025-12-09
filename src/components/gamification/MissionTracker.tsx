
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Target, Gift, CheckCircle, Lock } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/contexts/useAuth";

export function MissionTracker() {
    const { user } = useAuth();
    const { missions, claimMission } = useGamification(user?.id);

    return (
        <Card className="glass-card shadow-lg border-white/10 dark:border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-10" />

            <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-400" />
                    Daily Missions
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-3">
                        {missions.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">All missions completed! Come back tomorrow.</p>
                        )}
                        {missions.map((um) => (
                            <div key={um.id} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all flex items-center justify-between group">
                                <div className="space-y-1">
                                    <div className="font-medium text-sm flex items-center gap-2">
                                        {um.mission.title}
                                        {um.is_claimed && <CheckCircle className="h-3 w-3 text-green-500" />}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{um.mission.description}</div>
                                    <div className="flex items-center gap-2 text-[10px] font-mono mt-1">
                                        <span className="bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded">+{um.mission.coin_reward} Coins</span>
                                        <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">+{um.mission.xp_reward} XP</span>
                                    </div>
                                </div>

                                {um.is_claimed ? (
                                    <Button size="sm" variant="ghost" disabled className="opacity-50 h-8 px-2">
                                        Claimed
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        className="h-8 bg-purple-600 hover:bg-purple-700 text-white gap-1 shadow-lg shadow-purple-900/20"
                                        disabled={um.progress < um.mission.target_value}
                                        onClick={() => claimMission(um.id, um.mission.coin_reward, um.mission.xp_reward)}
                                    >
                                        {um.progress >= um.mission.target_value ? (
                                            <>Claim <Gift className="h-3 w-3 ml-1" /></>
                                        ) : (
                                            <><Lock className="h-3 w-3 opacity-70" /> {um.progress}/{um.mission.target_value}</>
                                        )}
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
