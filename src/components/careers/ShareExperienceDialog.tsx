import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "sonner";
import {
    Building2,
    Briefcase,
    GraduationCap,
    Star,
    FileText,
    DollarSign,
    CheckCircle2,
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
import { useGamification } from "@/hooks/useGamification";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function ShareExperienceDialog({
    isOpen,
    onClose,
    onSuccess
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const { user } = useAuth();
    const { awardCoins } = useGamification(user?.id);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [companyName, setCompanyName] = useState("");
    const [role, setRole] = useState("");
    const [batchYear, setBatchYear] = useState<string>(new Date().getFullYear().toString());
    const [status, setStatus] = useState<string>("");
    const [difficulty, setDifficulty] = useState<number>(3);
    const [pkg, setPkg] = useState("");
    const [content, setContent] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return toast.error("You must be logged in.");

        if (!companyName || !role || !batchYear || !status || !content) {
            return toast.error("Please fill in all required fields.");
        }

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('interview_experiences' as any)
                .insert({
                    user_id: user.id,
                    company_name: companyName,
                    role: role,
                    batch_year: parseInt(batchYear),
                    status: status,
                    difficulty: difficulty,
                    package: pkg || null,
                    content: content,
                    // is_approved defaults to true as per schema
                } as any);

            if (error) throw error;

            toast.success("Experience Shared Successfully!", {
                description: "Thank you for helping the community!"
            });

            // Reward the user!
            await awardCoins(50, 'Shared Interview Experience');

            onSuccess();
            onClose();

            // Reset form
            setCompanyName("");
            setRole("");
            setStatus("");
            setContent("");
            setPkg("");
            setDifficulty(3);

        } catch (error: any) {
            console.error("Error sharing experience:", error);
            toast.error(error.message || "Failed to share experience.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-2">
                    <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
                        Share Your Interview Experience
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Your insights help juniors prepare better. Plus, earn 50 Coins for sharing! 🏆
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Company */}
                        <div className="space-y-2">
                            <Label htmlFor="company" className="text-foreground dark:text-slate-200 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-purple-500" /> Company Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="company"
                                placeholder="e.g. Amazon, TCS, Google"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="bg-white dark:bg-black/20"
                                required
                            />
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-foreground dark:text-slate-200 flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-blue-500" /> Role/Position <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="role"
                                placeholder="e.g. Software Engineer Intern"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="bg-white dark:bg-black/20"
                                required
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label className="text-foreground dark:text-slate-200 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" /> Final Status <span className="text-red-500">*</span>
                            </Label>
                            <Select value={status} onValueChange={setStatus} required>
                                <SelectTrigger className="bg-white dark:bg-black/20">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Offer Selected">Got the Offer 🎉</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                    <SelectItem value="Waitlisted">Waitlisted / Pending</SelectItem>
                                    <SelectItem value="Interviewing">Still Interviewing</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Batch Year */}
                        <div className="space-y-2">
                            <Label className="text-foreground dark:text-slate-200 flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-orange-500" /> Batch Year <span className="text-red-500">*</span>
                            </Label>
                            <Select value={batchYear} onValueChange={setBatchYear} required>
                                <SelectTrigger className="bg-white dark:bg-black/20">
                                    <SelectValue placeholder="Select Batch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2024">2024</SelectItem>
                                    <SelectItem value="2025">2025</SelectItem>
                                    <SelectItem value="2026">2026</SelectItem>
                                    <SelectItem value="2027">2027</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Package */}
                        <div className="space-y-2">
                            <Label htmlFor="package" className="text-foreground dark:text-slate-200 flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-emerald-500" /> Package / Stipend
                            </Label>
                            <Input
                                id="package"
                                placeholder="e.g. 10 LPA or 40k/month"
                                value={pkg}
                                onChange={(e) => setPkg(e.target.value)}
                                className="bg-white dark:bg-black/20"
                            />
                        </div>

                        {/* Difficulty */}
                        <div className="space-y-2">
                            <Label className="text-foreground dark:text-slate-200 flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" /> Overall Difficulty
                            </Label>
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-black/20 p-2 rounded-lg border border-slate-200 dark:border-white/10">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setDifficulty(star)}
                                        className={`p-1 rounded-md transition-all hover:scale-110 ${star <= difficulty ? 'text-yellow-500' : 'text-slate-300 dark:text-slate-600'}`}
                                    >
                                        <Star className={`h-6 w-6 ${star <= difficulty ? 'fill-yellow-500' : ''}`} />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm text-muted-foreground">
                                    {difficulty === 1 ? "Very Easy" : difficulty === 5 ? "Very Hard" : "Medium"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <Label htmlFor="content" className="text-foreground dark:text-slate-200 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-500" /> Interview Details <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-xs text-muted-foreground pb-1">
                            Describe the rounds, questions asked, and your preparation strategy. Be as detailed as possible!
                        </p>
                        <Textarea
                            id="content"
                            placeholder="Round 1: Online Assessment (3 Coding Questions)...&#10;Round 2: Technical Interview...&#10;Advice: Focus on Graphs and DP!"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[200px] resize-y bg-white dark:bg-black/20 leading-relaxed"
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
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white min-w-[120px]"
                        >
                            {submitting ? "Posting..." : <><Send className="h-4 w-4 mr-2" /> Share via Campus Flow</>}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
