import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ParticlesBackground } from "./ParticlesBackground";

export function HeroSection() {
    const navigate = useNavigate();

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 pt-20">
            {/* Ambient Background - Antigravity space effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-slate-950 to-slate-950 z-0" />

            {/* Interactive Particles */}
            <ParticlesBackground />

            <div className="container relative z-10 flex flex-col items-center justify-center text-center space-y-8 animate-fade-in px-4">

                {/* Floating Logo / Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg animate-float">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-white/90 tracking-wide">Next-Gen Learning Platform</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.1] max-w-5xl drop-shadow-2xl">
                    Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-purple-500 animate-gradient-x">Liftoff</span> <br />
                    with Shivalik Hub
                </h1>

                {/* Subheadline */}
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                    Unlock your potential with exclusive access to a universe of learning resources, expert-led courses, and a thriving community.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pt-6 w-full sm:w-auto">
                    <Button
                        size="lg"
                        className="h-16 px-10 text-xl w-full sm:w-auto rounded-full bg-gradient-to-r from-primary to-purple-600 text-white hover:scale-105 transition-all font-semibold shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] border-0"
                        onClick={() => navigate("/auth")}
                    >
                        Get Started
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                        size="lg"
                        className="h-16 px-10 text-xl w-full sm:w-auto rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all hover:scale-105"
                        onClick={() => navigate("/browse")}
                    >
                        Explore Resources
                    </Button>
                </div>

                {/* Bottom decorative hint */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-50 animate-bounce hidden md:block">
                    <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
                </div>
            </div>
        </section>
    );
}
