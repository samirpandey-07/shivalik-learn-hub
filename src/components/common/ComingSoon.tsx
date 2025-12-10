import { Rocket, Bell, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ComingSoonProps {
    title: string;
    description: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
    const navigate = useNavigate();

    const handleNotify = () => {
        toast.success("You've been added to the waitlist!");
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

            <div className="relative z-10 text-center max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                {/* Icon/Illustration */}
                <div className="relative inline-block group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                    <div className="relative w-32 h-32 bg-gradient-to-br from-background to-muted border border-white/10 rounded-full flex items-center justify-center shadow-2xl">
                        <Rocket className="w-16 h-16 text-primary animate-pulse-slow" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-sm">
                        {title}
                    </h1>
                    <div className="inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
                        <span className="text-sm font-medium text-primary tracking-widest uppercase">Coming Soon</span>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
                        {description}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                    <Button
                        size="lg"
                        className="w-full sm:w-auto gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-purple-500/20 rounded-full px-8 h-12"
                        onClick={handleNotify}
                    >
                        <Bell className="w-4 h-4" /> Notify Me When Ready
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto gap-2 rounded-full px-8 h-12 border-white/10 hover:bg-white/5"
                        onClick={() => navigate('/dashboard')}
                    >
                        <Home className="w-4 h-4" /> Back to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}
