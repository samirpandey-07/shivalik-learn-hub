import { GraduationCap, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
    return (
        <footer className="py-14 bg-white/60 dark:bg-slate-950/70 border-t border-slate-200 dark:border-white/10 backdrop-blur-md relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
                    {/* 1. Brand Section */}
                    <div className="lg:col-span-2 flex flex-col items-center md:items-start gap-4">
                        <Link to="/" className="flex items-center space-x-2 group cursor-pointer">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl text-foreground dark:text-white leading-none tracking-tight">Campus Flow</span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold group-hover:text-primary transition-colors mt-0.5">
                                    by DroneX
                                </span>
                            </div>
                        </Link>
                        <p className="text-sm text-muted-foreground text-center md:text-left leading-relaxed max-w-sm">
                            Campus Flow is a student-first academic resource and collaboration platform. Empowering students across colleges with verified notes, PYQs, virtual study rooms, and community forums.
                        </p>
                    </div>

                    {/* 2. Platform Navigation */}
                    <div className="flex flex-col items-center md:items-start gap-3">
                        <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">Platform</h4>
                        <nav className="flex flex-col items-center md:items-start gap-2 text-sm text-muted-foreground">
                            <Link to="/features" className="hover:text-primary transition-colors">Core Features</Link>
                            <Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
                            <Link to="/browse" className="hover:text-primary transition-colors">Browse Catalog</Link>
                            <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
                            <Link to="/faq" className="hover:text-primary transition-colors">Frequently Asked</Link>
                        </nav>
                    </div>

                    {/* 3. Legal & Trust */}
                    <div className="flex flex-col items-center md:items-start gap-3">
                        <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">Trust & Safety</h4>
                        <nav className="flex flex-col items-center md:items-start gap-2 text-sm text-muted-foreground">
                            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                            <Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link>
                            <a href="https://dronexsce.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">DroneX Club</a>
                        </nav>
                    </div>

                    {/* 4. Contact & Community */}
                    <div className="flex flex-col items-center md:items-start gap-3">
                        <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">Get in Touch</h4>
                        <div className="flex flex-col items-center md:items-start gap-3 text-sm text-muted-foreground">
                            <a href="mailto:sigmaprimeplus@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors group">
                                <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <Mail className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-xs">sigmaprimeplus@gmail.com</span>
                            </a>
                            <a href="https://instagram.com/droneclubshivalik" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors group">
                                <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-pink-500/10 transition-colors">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                                        <rect x="2" y="2" width="20" height="20" rx="5" />
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                    </svg>
                                </div>
                                <span className="text-xs">@droneclubshivalik</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-slate-200 dark:border-white/10 gap-4">
                    <span className="text-xs text-muted-foreground text-center sm:text-left">
                        © {new Date().getFullYear()} Campus Flow. All rights reserved. Designed for student excellence.
                    </span>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <Link to="/privacy" className="hover:underline">Privacy</Link>
                        <span>•</span>
                        <Link to="/terms" className="hover:underline">Terms</Link>
                        <span>•</span>
                        <Link to="/faq" className="hover:underline">FAQ</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
