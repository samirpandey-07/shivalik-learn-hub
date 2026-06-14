import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "sonner";
import {
    Building2,
    Briefcase,
    MapPin,
    Link,
    FileText,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function ShareJobDialog({
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
    const [companyName, setCompanyName] = useState("");
    const [role, setRole] = useState("");
    const [profession, setProfession] = useState("Software Engineering");
    const [jobType, setJobType] = useState("Internship");
    const [location, setLocation] = useState("");
    const [link, setLink] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return toast.error("You must be logged in.");

        if (!companyName || !role || !location || !description) {
            return toast.error("Please fill in all required fields.");
        }

        setSubmitting(true);
        try {
            // 1. Try to insert into Supabase
            const { error } = await supabase
                .from('jobs' as any)
                .insert({
                    user_id: user.id,
                    company_name: companyName,
                    role: role,
                    profession: profession,
                    job_type: jobType,
                    location: location,
                    link: link || null,
                    description: description,
                    is_approved: true // Auto-approved for demo/development simplicity
                } as any);

            if (error) throw error;

            toast.success("Opportunity Shared Successfully!");
            onSuccess();
            onClose();
            resetForm();
        } catch (error: any) {
            console.warn("Database save failed, falling back to localStorage:", error);
            
            // 2. LocalStorage Fallback
            try {
                const localData = localStorage.getItem("campus_flow_jobs");
                const currentJobs = localData ? JSON.parse(localData) : [];
                
                const newJob = {
                    id: `local-job-${Date.now()}`,
                    user_id: user.id,
                    company_name: companyName,
                    role: role,
                    profession: profession,
                    job_type: jobType,
                    location: location,
                    link: link || "",
                    description: description,
                    is_approved: true,
                    created_at: new Date().toISOString(),
                    profiles: {
                        full_name: user.email?.split('@')[0] || "Student",
                        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                    }
                };

                localStorage.setItem("campus_flow_jobs", JSON.stringify([newJob, ...currentJobs]));
                toast.success("Saved locally!");
                onSuccess();
                onClose();
                resetForm();
            } catch (err) {
                console.error("Local storage save failed:", err);
                toast.error("Failed to share opportunity.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setCompanyName("");
        setRole("");
        setProfession("Software Engineering");
        setJobType("Internship");
        setLocation("");
        setLink("");
        setDescription("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
                        Share Job / Internship Opportunity
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Post off-campus opportunities to help your peers find jobs and internships.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Company */}
                        <div className="space-y-2">
                            <Label htmlFor="company" className="text-foreground dark:text-slate-200 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-blue-500" /> Company Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="company"
                                placeholder="e.g. Google, Stripe, CRED"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="bg-white dark:bg-black/20"
                                required
                            />
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-foreground dark:text-slate-200 flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-cyan-500" /> Role/Position <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="role"
                                placeholder="e.g. Frontend Engineer Intern"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="bg-white dark:bg-black/20"
                                required
                            />
                        </div>

                        {/* Profession */}
                        <div className="space-y-2">
                            <Label className="text-foreground dark:text-slate-200 flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-purple-500" /> Profession Type <span className="text-red-500">*</span>
                            </Label>
                            <Select value={profession} onValueChange={setProfession}>
                                <SelectTrigger className="bg-white dark:bg-black/20">
                                    <SelectValue placeholder="Select Profession" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                                    <SelectItem value="Data Science & Analytics">Data Science & Analytics</SelectItem>
                                    <SelectItem value="Product Management">Product Management</SelectItem>
                                    <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                                    <SelectItem value="Business Analyst & Consulting">Business Analyst & Consulting</SelectItem>
                                    <SelectItem value="Finance & Core Operations">Finance & Core Operations</SelectItem>
                                    <SelectItem value="Hardware & Core Engineering">Hardware & Core Engineering</SelectItem>
                                    <SelectItem value="Marketing & Sales">Marketing & Sales</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Job Type */}
                        <div className="space-y-2">
                            <Label className="text-foreground dark:text-slate-200 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Job Type <span className="text-red-500">*</span>
                            </Label>
                            <Select value={jobType} onValueChange={setJobType}>
                                <SelectTrigger className="bg-white dark:bg-black/20">
                                    <SelectValue placeholder="Select Job Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Internship">Internship</SelectItem>
                                    <SelectItem value="Full-time">Full-time</SelectItem>
                                    <SelectItem value="Part-time">Part-time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-foreground dark:text-slate-200 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-orange-500" /> Location <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="location"
                                placeholder="e.g. Bengaluru / Remote / Hybrid"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="bg-white dark:bg-black/20"
                                required
                            />
                        </div>

                        {/* Application Link */}
                        <div className="space-y-2">
                            <Label htmlFor="link" className="text-foreground dark:text-slate-200 flex items-center gap-2">
                                <Link className="h-4 w-4 text-emerald-500" /> Application URL
                            </Label>
                            <Input
                                id="link"
                                type="url"
                                placeholder="e.g. https://careers.company.com/job/123"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="bg-white dark:bg-black/20"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-foreground dark:text-slate-200 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-500" /> Description & Requirements <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Provide details about the job, stipend/package, eligibility criteria, and application deadline..."
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
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white min-w-[120px]"
                        >
                            {submitting ? "Posting..." : <><Send className="h-4 w-4 mr-2" /> Post Job</>}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
