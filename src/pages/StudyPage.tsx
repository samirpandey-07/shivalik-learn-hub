
import { useState, useEffect } from "react";
import { PomodoroTimer } from "@/components/study/PomodoroTimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Book, Trash2, ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Deck {
    id: string;
    title: string;
    description: string;
    cards_count?: number;
}

export default function StudyPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(true);

    // New Deck State
    const [newDeckTitle, setNewDeckTitle] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    const fetchDecks = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('flashcard_decks' as any)
                .select('*, flashcards(count)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedDecks = data.map((d: any) => ({
                ...d,
                cards_count: d.flashcards[0]?.count || 0
            }));

            setDecks(formattedDecks);
        } catch (err: any) {
            console.error("Error fetching decks:", err);
            toast.error("Failed to load your decks.");
        } finally {
            setLoading(false);
        }
    };

    const createDeck = async () => {
        if (!newDeckTitle.trim() || !user) return;
        try {
            const { error } = await supabase.from('flashcard_decks' as any).insert({
                user_id: user.id,
                title: newDeckTitle,
                description: "Created via Study Suite" // Default for now
            });
            if (error) throw error;
            setNewDeckTitle("");
            setDialogOpen(false);
            toast.success("Deck created successfully!");
            fetchDecks();
        } catch (err: any) {
            console.error("Create deck error:", err);
            toast.error("Failed to create deck.");
        }
    };

    const deleteDeck = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (!confirm("Delete this deck permanently?")) return;
        try {
            const { error } = await supabase.from('flashcard_decks' as any).delete().eq('id', id);
            if (error) throw error;
            toast.success("Deck deleted.");
            fetchDecks();
        } catch (err: any) {
            console.error("Delete deck error:", err);
            toast.error("Failed to delete deck.");
        }
    };

    useEffect(() => {
        fetchDecks();
    }, [user]);

    return (
        <div className="min-h-screen bg-background relative overflow-hidden pb-20">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-full h-[500px] bg-purple-500/10 rounded-full blur-[120px] translate-y-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                            Study Suite
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Your personal productivity command center.
                        </p>
                    </div>
                    {/* Active Session Indicator (Mock) */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-medium animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        Focus Mode Ready
                    </div>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="focus" className="space-y-8">
                    <TabsList className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 rounded-full inline-flex">
                        <TabsTrigger value="focus" className="rounded-full px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-primary dark:data-[state=active]:text-white shadow-none data-[state=active]:shadow-md transition-all">
                            Focus Timer
                        </TabsTrigger>
                        <TabsTrigger value="flashcards" className="rounded-full px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-primary dark:data-[state=active]:text-white shadow-none data-[state=active]:shadow-md transition-all">
                            Flashcards
                        </TabsTrigger>
                        <TabsTrigger value="rooms" className="rounded-full px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-primary dark:data-[state=active]:text-white shadow-none data-[state=active]:shadow-md transition-all">
                            Live Rooms
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="focus" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <PomodoroTimer />
                            </div>
                            <div className="lg:col-span-2">
                                <Card className="h-full border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm p-6 flex flex-col justify-center items-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600">
                                        <Book className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold">Productivity Tips</h3>
                                    <p className="text-muted-foreground max-w-md">
                                        • Break tasks into 25-minute chunks.<br />
                                        • Take a 5-minute break to stretch.<br />
                                        • Remove distractions like phone notifications.
                                    </p>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="flashcards" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">My Decks</h2>
                                <p className="text-muted-foreground">Active Recall</p>
                            </div>
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition-opacity text-white shadow-lg shadow-indigo-500/20">
                                        <Plus className="mr-2 h-4 w-4" /> Create Deck
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Deck</DialogTitle>
                                        <DialogDescription>Give your flashcard deck a name.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Deck Title</Label>
                                            <Input
                                                value={newDeckTitle}
                                                onChange={e => setNewDeckTitle(e.target.value)}
                                                placeholder="e.g. Physics Formulas"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={createDeck}>Create Deck</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : decks.length === 0 ? (
                            <Card className="border-dashed border-2 border-slate-200 dark:border-white/10 bg-transparent py-16">
                                <CardContent className="flex flex-col items-center text-center text-slate-500">
                                    <Book className="h-12 w-12 mb-4 opacity-50" />
                                    <p>No decks created yet. Start building your knowledge!</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {decks.map(deck => (
                                    <Card
                                        key={deck.id}
                                        className="group cursor-pointer hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 overflow-hidden relative"
                                        onClick={() => navigate(`/study/decks/${deck.id}`)}
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="line-clamp-1 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{deck.title}</CardTitle>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:bg-destructive/10"
                                                    onClick={(e) => deleteDeck(deck.id, e)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <CardDescription>{deck.cards_count} cards</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between items-center mt-4">
                                                <div className="flex -space-x-2">
                                                    {/* Avatars placeholder or decorative dots */}
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20" />
                                                    <div className="w-6 h-6 rounded-full bg-purple-500/20" />
                                                </div>
                                                <Button size="sm" variant="ghost" className="text-xs group-hover:translate-x-1 transition-transform p-0 text-indigo-500">
                                                    Study <ArrowRight className="ml-1 h-3 w-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="rooms" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center py-16 space-y-6">
                            <div className="w-24 h-24 mx-auto bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center animate-pulse">
                                <Zap className="h-12 w-12 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Live Focus Rooms</h2>
                                <p className="text-muted-foreground max-w-lg mx-auto mt-2">
                                    Join thousands of students studying together in real-time.
                                    Listen to lo-fi beats, chat, and stay accountable.
                                </p>
                            </div>
                            <Button
                                size="lg"
                                className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30"
                                onClick={() => navigate('/study/rooms')}
                            >
                                Enter Study Lounge
                            </Button>
                        </div>
                    </TabsContent>

                </Tabs>
            </div>
        </div>
    );
}
