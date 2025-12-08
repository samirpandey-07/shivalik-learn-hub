import { GraduationCap, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export function Footer() {
    return (
        <footer className="py-12 bg-white/50 dark:bg-black/20 border-t border-slate-200 dark:border-white/5 backdrop-blur-sm">
            <div className="container">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-bold text-lg text-foreground dark:text-white">Shivalik Hub</span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} Shivalik College. All rights reserved.
                    </div>

                    <div className="flex items-center gap-6">
                        <a href="mailto:pamdeysamir@gmail.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors">
                            <Mail className="h-4 w-4" />
                            pamdeysamir@gmail.com
                        </a>
                        <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </footer>
    );
}
