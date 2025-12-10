import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ParticlesBackground } from "./ParticlesBackground";
import { useTheme } from "@/hooks/useTheme";

import { useState, useEffect } from "react";

// ... existing imports

function TypewriterEffect({ texts, typingSpeed = 50, deletingSpeed = 30, pauseDuration = 2000 }: { texts: string[], typingSpeed?: number, deletingSpeed?: number, pauseDuration?: number }) {
    const [displayedText, setDisplayedText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [textIndex, setTextIndex] = useState(0);

    useEffect(() => {
        const currentText = texts[textIndex];

        let timer: NodeJS.Timeout;

        if (isDeleting) {
            timer = setTimeout(() => {
                setDisplayedText(currentText.substring(0, displayedText.length - 1));
            }, deletingSpeed);
        } else {
            timer = setTimeout(() => {
                setDisplayedText(currentText.substring(0, displayedText.length + 1));
            }, typingSpeed);
        }

        if (!isDeleting && displayedText === currentText) {
            timer = setTimeout(() => setIsDeleting(true), pauseDuration);
        } else if (isDeleting && displayedText === "") {
            setIsDeleting(false);
            setTextIndex((prev) => (prev + 1) % texts.length);
        }

        return () => clearTimeout(timer);
    }, [displayedText, isDeleting, textIndex, texts, typingSpeed, deletingSpeed, pauseDuration]);

    return (
        <span className="inline-block min-h-[1.5em] border-r-2 border-cyan-500 animate-pulse pr-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400 font-semibold">
            {displayedText}
        </span>
    );
}

export function HeroSection() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const particleColor = theme === 'dark' ? "rgba(255, 255, 255, 0.8)" : "#3b82f6";

    const typewriterTexts = [
        "Unlock your potential with next-generation tools.",
        "Access exclusive resources and study materials.",
        "Join a thriving community of learners.",
        "Experience the future of education."
    ];

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-background pt-20">
            {/* Ambient Background - Antigravity space effect (Dark mode only or very subtle in light) */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0 hidden dark:block" />

            {/* Interactive Particles */}
            <ParticlesBackground className="opacity-100" color={particleColor} />

            <div className="container relative z-10 flex flex-col items-center justify-center text-center space-y-8 animate-fade-in px-4">

                {/* Floating Logo / Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-sm dark:shadow-lg animate-float">
                    <GraduationCap className="h-5 w-5 text-blue-600 dark:text-primary" />
                    <span className="text-sm font-medium text-slate-700 dark:text-white/90 tracking-wide">Next-Gen Learning Platform</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] max-w-5xl drop-shadow-sm dark:drop-shadow-2xl animate-fade-in-up">
                    <span className="animate-gradient-x bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 dark:from-primary dark:via-cyan-400 dark:to-purple-500">
                        Experience Liftoff
                    </span> <br />
                    <span className="text-slate-800 dark:text-white">with Campus Flow</span>
                </h1>

                {/* Subheadline with Typewriter */}
                <p className="text-lg md:text-xl text-slate-600 dark:text-muted-foreground max-w-2xl leading-relaxed h-[3.5rem] md:h-[2rem] flex items-center justify-center">
                    <TypewriterEffect texts={typewriterTexts} />
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pt-6 w-full sm:w-auto">
                    <Button
                        size="lg"
                        className="h-16 px-10 text-xl w-full sm:w-auto rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-gradient-to-r dark:from-primary dark:to-purple-600 dark:hover:scale-105 transition-all font-semibold shadow-lg dark:shadow-[0_0_20px_rgba(124,58,237,0.3)] border-0"
                        onClick={() => navigate("/auth")}
                    >
                        Get Started
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                        size="lg"
                        className="h-16 px-10 text-xl w-full sm:w-auto rounded-full bg-slate-100 text-slate-900 hover:bg-slate-200 border-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 backdrop-blur-md dark:border-white/10 transition-all hover:scale-105"
                        onClick={() => navigate("/browse")}
                    >
                        Explore Resources
                    </Button>
                </div>

                {/* Bottom decorative hint (Dark mode mainly, hidden or subtle in light) */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-50 animate-bounce hidden md:block">
                    <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-slate-300 dark:via-white/50 to-transparent"></div>
                </div>
            </div>
        </section>
    );
}
