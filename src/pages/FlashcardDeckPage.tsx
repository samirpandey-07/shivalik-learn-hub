
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash, RotateCw, Edit2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";

interface Flashcard {
    id: string;
    front: string;
    back: string;
}

export default function FlashcardDeckPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [deckTitle, setDeckTitle] = useState("");
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(true);

    // Study State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [studyMode, setStudyMode] = useState(true); // Toggle between Study and Edit

    // Edit State
    const [newFront, setNewFront] = useState("");
    const [newBack, setNewBack] = useState("");
    const [addDialogOpen, setAddDialogOpen] = useState(false);

    const fetchDeck = async () => {
        if (!id) return;
        setLoading(true);
        try {
            // Fetch Deck Info
            const { data: deckData, error: deckError } = await supabase
                .from('flashcard_decks')
                .select('title')
                .eq('id', id)
                .single();

            if (deckError) throw deckError;
            setDeckTitle(deckData.title);

            // Fetch Cards
            const { data: cardsData, error: cardsError } = await supabase
                .from('flashcards')
                .select('*')
                .eq('deck_id', id)
                .order('created_at', { ascending: true });

            if (cardsError) throw cardsError;
            setCards(cardsData || []);
        } catch (err) {
            console.error(err);
            navigate('/study');
        } finally {
            setLoading(false);
        }
    };

    const addCard = async () => {
        if (!newFront.trim() || !newBack.trim() || !id) return;
        try {
            const { error } = await supabase.from('flashcards').insert({
                deck_id: id,
                front: newFront,
                back: newBack
            });
            if (error) throw error;
            setNewFront("");
            setNewBack("");
            setAddDialogOpen(false);
            fetchDeck();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteCard = async (cardId: string) => {
        try {
            const { error } = await supabase.from('flashcards').delete().eq('id', cardId);
            if (error) throw error;
            fetchDeck(); // Re-fetch to update list
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchDeck();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading deck...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8 min-h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/study')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">
                            {deckTitle}
                        </h1>
                        <p className="text-sm text-slate-500">{cards.length} cards</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={studyMode ? "secondary" : "ghost"}
                        onClick={() => setStudyMode(true)}
                    >
                        <RotateCw className="mr-2 h-4 w-4" /> Study
                    </Button>
                    <Button
                        variant={!studyMode ? "secondary" : "ghost"}
                        onClick={() => setStudyMode(false)}
                    >
                        <Edit2 className="mr-2 h-4 w-4" /> Edit
                    </Button>
                </div>
            </div>

            {/* STUDY MODE */}
            {studyMode && (
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    {cards.length === 0 ? (
                        <div className="text-center text-slate-500">
                            <p className="mb-4">This deck is empty.</p>
                            <Button onClick={() => setStudyMode(false)}>Add Cards</Button>
                        </div>
                    ) : (
                        <div className="w-full max-w-xl perspective-1000">
                            {/* Card Container */}
                            <div
                                className={`relative w-full h-80 transition-transform duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                                onClick={() => setIsFlipped(!isFlipped)}
                                style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                            >
                                {/* FRONT */}
                                <div className="absolute inset-0 backface-hidden bg-white dark:bg-[#1A1F2C] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl flex items-center justify-center p-8 text-center">
                                    <h3 className="text-2xl font-medium text-slate-800 dark:text-slate-100">
                                        {cards[currentIndex].front}
                                    </h3>
                                    <p className="absolute bottom-4 text-xs text-slate-400 uppercase tracking-widest">Front (Click to Flip)</p>
                                </div>

                                {/* BACK */}
                                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center p-8 text-center rotate-y-180"
                                    style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                                >
                                    <h3 className="text-2xl font-medium text-white">
                                        {cards[currentIndex].back}
                                    </h3>
                                    <p className="absolute bottom-4 text-xs text-white/50 uppercase tracking-widest">Back</p>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex justify-between items-center mt-8 px-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsFlipped(false);
                                        setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length);
                                    }}
                                    disabled={cards.length <= 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm font-mono text-slate-500">
                                    {currentIndex + 1} / {cards.length}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsFlipped(false);
                                        setCurrentIndex(prev => (prev + 1) % cards.length);
                                    }}
                                    disabled={cards.length <= 1}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* EDIT MODE */}
            {!studyMode && (
                <div className="flex-1 max-w-3xl w-full mx-auto space-y-6">
                    <div className="flex justify-end">
                        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-green-500 hover:bg-green-600 text-white">
                                    <Plus className="mr-2 h-4 w-4" /> Add Card
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Flashcard</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">Front</h4>
                                        <Input
                                            value={newFront}
                                            onChange={e => setNewFront(e.target.value)}
                                            placeholder="Question or Term"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">Back</h4>
                                        <Textarea
                                            value={newBack}
                                            onChange={e => setNewBack(e.target.value)}
                                            placeholder="Answer or Definition"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={addCard}>Add Card</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid gap-4">
                        {cards.map((card, idx) => (
                            <Card key={card.id} className="bg-white/50 dark:bg-white/5">
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">FRONT</p>
                                            <p className="font-medium">{card.front}</p>
                                        </div>
                                        <div className="border-l border-slate-200 dark:border-white/10 pl-4">
                                            <p className="text-xs text-slate-500 mb-1">BACK</p>
                                            <p className="text-slate-600 dark:text-slate-300">{card.back}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-destructive hover:bg-destructive/10 ml-4 h-8 w-8"
                                        onClick={() => deleteCard(card.id)}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
