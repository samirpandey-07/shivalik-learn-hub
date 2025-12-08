import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Trophy, Users, Zap } from "lucide-react";

export function FeaturesSection() {
    const features = [
        {
            icon: BookOpen,
            title: "Vast Library",
            description: "Access thousands of curated notes, papers, and books tailored for your course.",
            gradient: "from-primary/20 to-purple-500/20",
            accent: "text-primary"
        },
        {
            icon: Trophy,
            title: "Gamified Learning",
            description: "Earn XP and coins for every resource you study. Compete on global leaderboards.",
            gradient: "from-purple-500/20 to-pink-500/20",
            accent: "text-purple-400"
        },
        {
            icon: Users,
            title: "Community Driven",
            description: "Connect with peers, share knowledge, and grow together in a thriving ecosystem.",
            gradient: "from-blue-500/20 to-cyan-500/20",
            accent: "text-blue-400"
        },
        {
            icon: Zap,
            title: "Instant Access",
            description: "Lightning fast downloads and search. Find exactly what you need in seconds.",
            gradient: "from-pink-500/20 to-primary/20",
            accent: "text-pink-400"
        }
    ];

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Why Shivalik Hub?
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        Reinventing how you study with cutting-edge technology and design.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className={`group border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 overflow-hidden relative`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <CardContent className="p-8 relative z-10 flex flex-col h-full">
                                <div className={`h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.accent}`}>
                                    <feature.icon className="h-6 w-6" />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
