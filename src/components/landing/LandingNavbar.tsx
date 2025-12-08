import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export function LandingNavbar() {
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/10 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
            <div
                className="flex items-center space-x-2 cursor-pointer group"
                onClick={() => navigate("/")}
            >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                    <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight text-foreground dark:text-white group-hover:text-primary transition-colors">
                    Shivalik<span className="text-primary">Hub</span>
                </span>
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />
                <Button
                    variant="ghost"
                    className="text-foreground dark:text-white hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 hidden md:flex"
                    onClick={() => navigate("/auth")}
                >
                    Sign In
                </Button>
                <Button
                    className="bg-primary hover:bg-primary/90 text-white shadow-glow hover:shadow-glow-strong transition-all rounded-full px-6"
                    onClick={() => navigate("/auth")}
                >
                    Get Started
                </Button>
            </div>
        </nav>
    );
}
