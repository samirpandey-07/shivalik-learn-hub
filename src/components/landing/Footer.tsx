import { GraduationCap, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export function Footer() {
    return (
        <footer className="py-12 bg-white/50 dark:bg-black/20 border-t border-slate-200 dark:border-white/5 backdrop-blur-sm relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors duration-700" />

            <div className="container relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Brand Section */}
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center space-x-2 group/brand cursor-default">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg group-hover/brand:scale-110 group-hover/brand:rotate-3 transition-all duration-300">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl text-foreground dark:text-white leading-none">Campus Flow</span>
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                                    by <span className="text-primary font-bold">DroneX</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Links Section */}
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium">
                        <a
                            href="https://dronexsce.in"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors hover:underline decoration-wavy decoration-primary/50 underline-offset-4"
                        >
                            DroneX Club
                        </a>
                        <a
                            href="https://shivalikcollege.edu.in"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors hover:underline decoration-wavy decoration-primary/50 underline-offset-4"
                        >
                            Shivalik College
                        </a>
                    </div>

                    {/* Contact & Utilities */}
                    <div className="flex flex-col items-center md:items-end gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-colors group/mail">
                            <Mail className="h-4 w-4 text-primary group-hover/mail:scale-110 transition-transform" />
                            <a href="mailto:alphastudent87@gmail.com" className="text-sm text-foreground dark:text-white font-medium hover:text-primary transition-colors">
                                alphastudent87@gmail.com
                            </a>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} Campus Flow</span>
                            <div className="h-3 w-[1px] bg-slate-300 dark:bg-white/20" />
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
