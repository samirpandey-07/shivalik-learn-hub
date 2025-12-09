
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Brain, Target, Zap, CheckCircle2 } from "lucide-react";

export function OnboardingWizard() {
    const { user, profile, refreshProfile } = useAuth();
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [goal, setGoal] = useState("exam_prep");
    const [weakAreas, setWeakAreas] = useState<string[]>([]);
    const [customWeakArea, setCustomWeakArea] = useState("");

    useEffect(() => {
        // Show if user is logged in but hasn't completed onboarding
        if (user && profile && !profile.onboarding_completed) {
            setOpen(true);
        }
    }, [user, profile]);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const toggleWeakArea = (area: string) => {
        setWeakAreas(prev =>
            prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
        );
    };

    const handleAddCustomArea = () => {
        if (customWeakArea.trim() && !weakAreas.includes(customWeakArea)) {
            setWeakAreas([...weakAreas, customWeakArea]);
            setCustomWeakArea("");
        }
    };

    const handleFinish = async () => {
        setLoading(true);
        try {
            const preferences = {
                goal,
                weak_areas: weakAreas,
                completed_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('profiles')
                .update({
                    onboarding_completed: true,
                    study_preferences: preferences
                })
                .eq('id', user?.id);

            if (error) throw error;

            toast.success("Profile Personalized! 🚀", {
                description: "We've tailored your recommendations."
            });

            await refreshProfile(); // Update local context
            setOpen(false);

        } catch (error) {
            console.error(error);
            toast.error("Failed to save preferences");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-white/10" hideClose>
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
                        {step === 1 && <Target className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
                        {step === 2 && <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
                        {step === 3 && <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />}
                    </div>
                    <DialogTitle className="text-center text-xl">
                        {step === 1 && "What is your main goal?"}
                        {step === 2 && "Identify your weak spots"}
                        {step === 3 && "All set!"}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {step === 1 && "Help us understand what you want to achieve."}
                        {step === 2 && "We'll recommend resources to help you improve."}
                        {step === 3 && "Your personalized learning path is ready."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    {step === 1 && (
                        <RadioGroup value={goal} onValueChange={setGoal} className="gap-3">
                            <div className="flex items-center space-x-2 border border-border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                                <RadioGroupItem value="exam_prep" id="r1" />
                                <Label htmlFor="r1" className="cursor-pointer flex-1">
                                    <div className="font-semibold">Ace My Exams 💯</div>
                                    <div className="text-xs text-muted-foreground">Focus on past papers and high-yield notes</div>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 border border-border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                                <RadioGroupItem value="deep_learning" id="r2" />
                                <Label htmlFor="r2" className="cursor-pointer flex-1">
                                    <div className="font-semibold">Deep Understanding 🧠</div>
                                    <div className="text-xs text-muted-foreground">Detailed textbooks and concept guides</div>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 border border-border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                                <RadioGroupItem value="assignment_help" id="r3" />
                                <Label htmlFor="r3" className="cursor-pointer flex-1">
                                    <div className="font-semibold">Assignment Help 📝</div>
                                    <div className="text-xs text-muted-foreground">Practical examples and problem sets</div>
                                </Label>
                            </div>
                        </RadioGroup>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a subject (e.g. Calculus)"
                                    value={customWeakArea}
                                    onChange={e => setCustomWeakArea(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddCustomArea()}
                                />
                                <Button size="icon" onClick={handleAddCustomArea}><Zap className="h-4 w-4" /></Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {weakAreas.map(area => (
                                    <Badge
                                        key={area}
                                        variant="secondary"
                                        className="cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => toggleWeakArea(area)}
                                    >
                                        {area} ×
                                    </Badge>
                                ))}
                                {weakAreas.length === 0 && (
                                    <p className="text-sm text-muted-foreground italic w-full text-center">No areas added yet.</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase text-muted-foreground">Suggestions:</Label>
                                <div className="flex flex-wrap gap-2">
                                    {["Data Structures", "Thermodynamics", "Java", "Linear Algebra", "React", "Digital Logic"].map(tag => (
                                        <div
                                            key={tag}
                                            className={`text-xs px-2 py-1 rounded-full border cursor-pointer transition-colors ${weakAreas.includes(tag) ? 'bg-indigo-500 text-white border-indigo-500' : 'hover:bg-muted'}`}
                                            onClick={() => toggleWeakArea(tag)}
                                        >
                                            {tag}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center space-y-4">
                            <div className="p-4 bg-green-500/10 text-green-500 rounded-xl">
                                <p className="font-medium">Preference Profile Created</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                We've updated your home feed to prioritize content that matches your goal of
                                <span className="font-bold text-foreground mx-1">{goal === 'exam_prep' ? 'Acing Exams' : goal.replace('_', ' ')}</span>
                                and helps with <span className="font-bold text-foreground">{weakAreas.length} subjects</span>.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between sm:justify-between w-full">
                    {step > 1 ? (
                        <Button variant="outline" onClick={handleBack} disabled={loading}>Back</Button>
                    ) : (
                        <div /> // Spacer
                    )}

                    {step < 3 ? (
                        <Button onClick={handleNext}>Next</Button>
                    ) : (
                        <Button onClick={handleFinish} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                            {loading ? "Saving..." : "Start Exploring"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import { Badge } from "@/components/ui/badge"; // Import missing component
