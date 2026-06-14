import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "sonner";
import {
    Trophy,
    Calendar,
    Users,
    Link,
    FileText,
    Award,
    Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function ShareHackathonDialog({
    isOpen,
    onClose,
    onSuccess
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [organizer, setOrganizer] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [link, setLink] = useState("");
    const [prizePool, setPrizePool] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return toast.error("You must be logged in.");

        if (!title || !organizer || !eventDate || !description) {
            return toast.error("Please fill in all required fields.");
        }

        setSubmitting(true);
        try {
            // 1. Try to insert into Supabase
            const { error } = await supabase
                .from('hackathons' as any)
                .insert({
                    user_id: user.id,
                    title: title,
                    organizer: organizer,
                    event_date: eventDate,
                    registration_link: link || null,
                    prize_pool: prizePool || null,
                    description: description,
                    is_approved: true // Auto-approved for development simplicity
                } as any);

            if (error) throw error;

            toast.success("Hackathon Shared Successfully!");
            onSuccess();
            onClose();
            resetForm();
        } catch (error: any) {
            console.warn("Database save failed, falling back to localStorage:", error);
            
            // 2. LocalStorage Fallback
            try {
                const localData = localStorage.getItem("campus_flow_hackathons");
                const currentHackathons = localData ? JSON.parse(localData) : [];
                
                const newHackathon = {
                    id: `local-hack-${Date.now()}`,
                    user_id: user.id,
                    title: title,
                    organizer: organizer,
                    event_date: eventDate,
                    registration_link: link || "",
                    prize_pool: prizePool || "",
                    description: description,
                    is_approved: true,
                    created_at: new Date().toISOString()
                };

                localStorage.setItem("campus_flow_hackathons", JSON.stringify([newHackathon, ...currentHackathons]));
                toast.success("Saved locally!");
                onSuccess();
                onClose();
                resetForm();
            } catch (err) {
                console.error("Local storage save failed:", err);
                toast.error("Failed to share hackathon.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setOrganizer("");
        setEventDate("");
        setLink("");
        setPrizePool("");
        setDescription("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400">
                        Share Hackathon or Competition
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Post hackathons, coding contests, and events so students can form teams and build projects.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-foreground dark:text-slate-200 flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-orange-500" /> Hackathon/Event Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="e.g. Smart India Hackathon 2026"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-white dark:bg-black/20"
                                required
                            />
                        </div>

                        {/* Organizer */}
                        <div className="space-y-2">
                            <Label htmlFor="organizer" className="text-foreground dark:text-slate-200 flex items-center gap-2">
                                <Users className="h-4 w-4 text-amber-500" /> Organizer <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="organizer"
                                placeholder="e.g. Google, MIT, Shivalik College"
                                value={organizer}
                                onChange={(e) => setOrganizer(e.target.value)}
                                className="bg-white dark:bg-black/20"
                                required
                            />
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-foreground dark:text-slate-200 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-cyan-500" /> Event Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                className="bg-white dark:bg-black/20 text-foreground"
                                required
                            />
                        </div>

                        {/* Prize Pool */}
                        <div className="space-y-2">
                            <Label htmlFor="prize" className="text-foreground dark:text-slate-200 flex items-center gap-2">
                                <Award className="h-4 w-4 text-yellow-500" /> Prize Pool
                            </Label>
                            <Input
                                id="prize"
                                placeholder="e.g. Rs. 10 Lakhs or $5,000 USD"
                                value={prizePool}
                                onChange={(e) => setPrizePool(e.target.value)}
                                className="bg-white dark:bg-black/20"
                            />
                        </div>

                        {/* Registration Link */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="link" className="text-foreground dark:text-slate-200 flex items-center gap-2">
                                <Link className="h-4 w-4 text-emerald-500" /> Registration/Website URL
                            </Label>
                            <Input
                                id="link"
                                type="url"
                                placeholder="e.g. https://sih.gov.in"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="bg-white dark:bg-black/20"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-foreground dark:text-slate-200 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-500" /> Description & Details <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Provide details about the hackathon tracks, eligibility, timeline, and team formation rules..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[150px] resize-y bg-white dark:bg-black/20 leading-relaxed"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white min-w-[120px]"
                        >
                            {submitting ? "Posting..." : <><Send className="h-4 w-4 mr-2" /> Post Hackathon</>}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
