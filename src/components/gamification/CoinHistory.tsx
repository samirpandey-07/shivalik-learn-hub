import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase/client';
import { useAuth } from "@/contexts/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Coins, Calendar, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Transaction {
    id: string;
    amount: number;
    reason: string;
    created_at: string;
}

export function CoinHistory() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchHistory = async () => {
            try {
                const { data, error } = await supabase
                    .from("coin_transactions")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(20);

                if (error) throw error;
                setTransactions(data || []);
            } catch (err) {
                console.error("Error fetching coin history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    if (loading) {
        return <div className="p-4 text-center text-muted-foreground">Loading history...</div>;
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    Coin History
                </CardTitle>
            </CardHeader>
            <CardContent>
                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No coin history yet.</p>
                        <p className="text-xs mt-1">Upload resources or login daily to earn!</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-4">
                            {transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-1.5 rounded-full bg-yellow-500/10">
                                            <ArrowUpRight className="h-3 w-3 text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{tx.reason}</p>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(tx.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 border-yellow-500/20">
                                        +{tx.amount}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
