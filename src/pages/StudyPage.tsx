
import { useState, useEffect } from "react";
import { PomodoroTimer } from "@/components/study/PomodoroTimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Book, Trash2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
                .from('flashcard_decks')
                .select('*, flashcards(count)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedDecks = data.map((d: any) => ({
                ...d,
                cards_count: d.flashcards[0]?.count || 0
            }));

            setDecks(formattedDecks);
        } catch (err) {
            console.error("Error fetching decks:", err);
        } finally {
            setLoading(false);
        }
    };

    const createDeck = async () => {
        if (!newDeckTitle.trim() || !user) return;
        try {
            const { error } = await supabase.from('flashcard_decks').insert({
                user_id: user.id,
                title: newDeckTitle,
                description: "Created via Study Suite" // Default for now
            });
            if (error) throw error;
            setNewDeckTitle("");
            setDialogOpen(false);
            fetchDecks();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteDeck = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (!confirm("Delete this deck permanently?")) return;
        try {
            const { error } = await supabase.from('flashcard_decks').delete().eq('id', id);
            if (error) throw error;
            fetchDecks();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchDecks();
    }, [user]);

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-12 pb-20">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                    Study Suite
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                    Boost your productivity with focused sessions and active recall tools.
                </p>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left: Pomodoro Timer */}
                <div className="lg:col-span-1">
                    <PomodoroTimer />
                </div>

                {/* Right: Flashcards */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Book className="w-6 h-6 text-yellow-400" /> Flashcard Decks
                        </h2>

                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-[#8A4FFF] hover:bg-[#7a46e0] text-white">
                                    <Plus className="mr-2 h-4 w-4" /> New Deck
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
                        <div className="text-center py-10 text-slate-500">Loading decks...</div>
                    ) : decks.length === 0 ? (
                        <Card className="border-dashed border-2 border-slate-200 dark:border-white/10 bg-transparent">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                                <Book className="h-12 w-12 mb-4 opacity-50" />
                                <p>No decks created yet.</p>
                                <p className="text-sm">Create one to start studying!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {decks.map(deck => (
                                <Card
                                    key={deck.id}
                                    className="group cursor-pointer hover:border-primary/50 transition-colors bg-white dark:bg-white/5 border border-slate-200 dark:border-transparent shadow-sm dark:shadow-none"
                                    onClick={() => navigate(`/study/decks/${deck.id}`)}
                                >
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="line-clamp-1">{deck.title}</CardTitle>
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
                                        <div className="flex justify-end">
                                            <Button size="sm" variant="ghost" className="group-hover:translate-x-1 transition-transform p-0 text-primary">
                                                Study Now <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
