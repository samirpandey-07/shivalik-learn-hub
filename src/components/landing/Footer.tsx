import { GraduationCap, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export function Footer() {
    return (
        <footer className="py-12 bg-white/50 dark:bg-black/40 border-t border-slate-200 dark:border-white/10 backdrop-blur-md relative overflow-hidden group">
            {/* Ambient Background Glow - Enhanced */}
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-colors duration-700 pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] group-hover:bg-purple-500/20 transition-colors duration-700 pointer-events-none" />

            <div className="container relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* 1. Brand Section */}
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center space-x-2 group/brand cursor-default">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg transform group-hover/brand:scale-110 transition-all duration-300 ring-2 ring-white/10">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl text-foreground dark:text-white leading-none tracking-tight">Campus Flow</span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold group-hover/brand:text-primary transition-colors">
                                    by DroneX
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center md:text-left leading-relaxed">
                            Empowering students with next-gen tools and resources for academic excellence.
                        </p>
                    </div>

                    {/* 2. Helpful Links */}
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <h3 className="font-bold text-foreground dark:text-white">Helpful Links</h3>
                        <div className="flex flex-col items-center md:items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <a href="/browse" className="hover:text-primary transition-colors">Browse Resources</a>
                            <a href="/auth" className="hover:text-primary transition-colors">Get Started</a>
                            <a href="https://shivalik-redesign.netlify.app/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Shivalik College</a>
                            <a href="https://dronexsce.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">DroneX Club</a>
                        </div>
                    </div>

                    {/* 3. Legal */}
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <h3 className="font-bold text-foreground dark:text-white">Legal</h3>
                        <div className="flex flex-col items-center md:items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <a href="#" className="hover:text-primary transition-colors">Terms & Conditions</a>
                            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        </div>
                    </div>

                    {/* 4. Contact Section */}
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <h3 className="font-bold text-foreground dark:text-white">Contact Us</h3>
                        <div className="flex flex-col gap-3">
                            <a href="mailto:sigmaprimeplus@gmail.com" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-primary transition-colors group">
                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <span>sigmaprimeplus@gmail.com</span>
                            </a>
                            <a href="https://instagram.com/droneclubshivalik" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-primary transition-colors group">
                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-pink-500/10 transition-colors">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                        <rect x="2" y="2" width="20" height="20" rx="5" />
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                    </svg>
                                </div>
                                <span>@droneclubshivalik</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="flex items-center justify-center pt-8 border-t border-slate-200 dark:border-white/5">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        © {new Date().getFullYear()} Campus Flow. All rights reserved.
                    </span>
                </div>
            </div>
        </footer>
    );
}
