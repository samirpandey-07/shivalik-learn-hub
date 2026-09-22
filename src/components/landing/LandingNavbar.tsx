import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export function LandingNavbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { name: "Features", href: "/features" },
        { name: "How It Works", href: "/how-it-works" },
        { name: "About", href: "/about" },
        { name: "Browse", href: "/browse" },
        { name: "FAQ", href: "/faq" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
            <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4" aria-label="Main Navigation">
                {/* Brand Logo */}
                <Link
                    to="/"
                    className="flex items-center space-x-2 group cursor-pointer"
                    aria-label="Campus Flow Homepage"
                >
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-xl tracking-tight text-foreground dark:text-white group-hover:text-primary transition-colors leading-none">
                            Campus<span className="text-primary">Flow</span>
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold group-hover:text-primary transition-colors mt-0.5">
                            by DroneX
                        </span>
                    </div>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden lg:flex items-center space-x-6 text-sm font-medium">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={`transition-colors py-1 ${
                                    isActive
                                        ? "text-primary font-semibold border-b-2 border-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-foreground dark:text-white hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 hidden sm:flex"
                        onClick={() => navigate("/auth")}
                    >
                        Sign In
                    </Button>
                    <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-white shadow-glow hover:shadow-glow-strong transition-all rounded-full px-5 hidden sm:flex"
                        onClick={() => navigate("/auth")}
                    >
                        Get Started
                    </Button>

                    {/* Mobile Hamburger Toggle */}
                    <button
                        type="button"
                        className="lg:hidden p-2 text-muted-foreground hover:text-foreground focus:outline-none"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle navigation menu"
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Navigation Dropdown */}
            {mobileOpen && (
                <div className="lg:hidden border-b border-slate-200 dark:border-white/10 bg-background/95 backdrop-blur-xl px-6 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`text-base font-medium py-2 px-3 rounded-lg transition-colors ${
                                    location.pathname === link.href
                                        ? "bg-primary/10 text-primary font-semibold"
                                        : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5 hover:text-foreground"
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
                        <Button
                            variant="outline"
                            className="w-full justify-center"
                            onClick={() => {
                                setMobileOpen(false);
                                navigate("/auth");
                            }}
                        >
                            Sign In
                        </Button>
                        <Button
                            className="w-full justify-center bg-primary text-white"
                            onClick={() => {
                                setMobileOpen(false);
                                navigate("/auth");
                            }}
                        >
                            Get Started
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}
