import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, Crown, Star, History, Loader2, Award } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Simple XP to Level calculation
// Level N requires N*100 XP
export function SeasonProgress() {
    const { user, profile } = useAuth(); // Assuming profile has XP now
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [open, setOpen] = useState(false);

    // Fallback if schema update hasn't propagated to auth context yet (we might need to reload profile)
    const xp = (profile as any)?.xp || 0;
    const level = (profile as any)?.level || 1;

    const xpForNextLevel = level * 100;
    const progress = Math.min((xp % 100) / 100 * 100, 100);

    useEffect(() => {
        if (open && user?.id) {
            const fetchHistory = async () => {
                setLoadingHistory(true);
                try {
                    const { data, error } = await supabase
                        .from('coin_transactions')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(20);

                    if (error) throw error;
                    setHistory(data || []);
                } catch (err) {
                    console.error("Error fetching activity history:", err);
                } finally {
                    setLoadingHistory(false);
                }
            };
            fetchHistory();
        }
    }, [open, user?.id]);

    const formatReason = (reason: string) => {
        return reason.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 border-indigo-200 dark:border-indigo-500/20 mb-6 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-2xl" />

            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6 relative z-10">
                {/* Level Badge with Dialog */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <div className="relative shrink-0 cursor-pointer group transition-transform hover:scale-105">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 transform rotate-3 group-hover:rotate-6 transition-all">
                                <Crown className="h-8 w-8 text-white" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-white/20">
                                LVL {level}
                            </div>
                        </div>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-white/20 dark:border-white/10">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl pb-2 border-b border-slate-100 dark:border-white/5">
                                <History className="h-5 w-5 text-purple-500" />
                                Activity & XP History
                            </DialogTitle>
                        </DialogHeader>

                        <ScrollArea className="h-[400px] w-full rounded-md pr-4 mt-2">
                            {loadingHistory ? (
                                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                    <Loader2 className="h-8 w-8 animate-spin mb-2 opacity-50 text-purple-500" />
                                    <p className="text-sm">Loading history...</p>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                    <Award className="h-12 w-12 mb-3 opacity-20" />
                                    <p>No activity recorded yet.</p>
                                    <p className="text-xs opacity-70 mt-1">Start uploading or completing missions to earn XP!</p>
                                </div>
                            ) : (
                                <div className="space-y-3 pt-2">
                                    {history.map((tx) => (
                                        <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-purple-500/30 transition-colors">
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-sm font-semibold text-foreground dark:text-white">
                                                    {formatReason(tx.reason || 'Reward')}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                    {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/20 px-2 py-0 text-xs">
                                                    +{tx.amount} Coins
                                                </Badge>
                                                <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border-purple-500/20 px-2 py-0 text-[10px]">
                                                    +XP
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </DialogContent>
                </Dialog>

                {/* Progress Bar */}
                <div className="flex-1 w-full space-y-2">
                    <div className="flex justify-between items-center text-sm font-medium">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-blue-300 dark:to-purple-300 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                            Season 1: Genesis
                        </span>
                        <span className="text-muted-foreground">{xp} XP</span>
                    </div>
                    <Progress value={progress} className="h-3 bg-slate-200 dark:bg-black/20" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Level {level}</span>
                        <span>{100 - (xp % 100)} XP to Level {level + 1}</span>
                    </div>
                </div>

                {/* Next Reward Preview */}
                <div className="hidden md:flex flex-col items-center gap-1 opacity-70">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
                        <Star className="h-4 w-4 text-yellow-500 dark:text-yellow-200" />
                    </div>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400">Next Reward</span>
                </div>
            </CardContent>
        </Card>
    );

}
