import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Trophy, Users, Zap, Star, TrendingUp, BookMarked, Layout } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function FeaturesSection() {
    const navigate = useNavigate();
    return (
        <section className="py-20 bg-slate-50 dark:bg-background relative overflow-hidden">
            {/* Ambient Background Blobs for specific layout look */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-blue-300/30 dark:bg-blue-900/20 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-300/30 dark:bg-pink-900/20 rounded-full blur-[100px] animate-pulse-slow delay-2000" />
            </div>

            <div className="container relative z-10 mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(100px,auto)]">

                    {/* Card 1: Brand / Intro (Top Left - Tall-ish or Square) */}
                    <Card className="col-span-1 md:col-span-1 row-span-2 border-white/40 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 opacity-100" />
                        <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
                            <div>
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-4">
                                    <span className="text-white font-bold text-lg">S</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                                    SHIVALIK<br />LEARN HUB
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Learn, grow, and design your future with us.
                                </p>
                            </div>
                            <div className="mt-4">
                                <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-2/3 rounded-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 2: Hero Feature "Unlock Knowledge" (Top Right - Wide) */}
                    <Card className="col-span-1 md:col-span-3 row-span-2 border-white/40 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10" />
                        <div className="absolute right-[-50px] top-[-50px] w-64 h-64 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full blur-[60px] opacity-40 dark:opacity-20 animate-float" />

                        <CardContent className="p-8 h-full flex flex-col md:flex-row items-center justify-between relative z-10">
                            <div className="max-w-lg space-y-4">
                                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Unlock<br />Knowledge
                                </h2>
                                <p className="text-slate-600 dark:text-slate-300 text-lg">
                                    Curate your education with possibilities and knowledge advanced groups.
                                </p>
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full font-medium hover:scale-105 transition-transform shadow-lg"
                                >
                                    Learn more
                                </button>
                            </div>
                            {/* Decorative 3D-like Element Placeholder */}
                            <div className="hidden md:flex h-48 w-48 rounded-full bg-gradient-to-tr from-blue-500 via-cyan-400 to-white shadow-2xl items-center justify-center animate-float delay-75">
                                <div className="h-40 w-40 rounded-full bg-white/10 backdrop-blur-md border border-white/20" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 3: Popular Lists (Bottom Left - Tall List) */}
                    <Card className="col-span-1 md:col-span-1 row-span-2 border-white/40 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-md shadow-md hover:shadow-lg transition-all">
                        <CardContent className="p-5 h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <BookMarked className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                <h4 className="font-bold text-slate-800 dark:text-white">Popular Courses</h4>
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                                        <div className="h-8 w-8 rounded-md bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <BookOpen className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Learning Basics</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-500">12 mins</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 4: Your Progress (Middle Small) */}
                    <Card className="col-span-1 md:col-span-1 border-white/40 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-md shadow-md hover:shadow-lg transition-all group">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white">Your Progress</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Keep it up!</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 5: Best Brilliance (Right Small) */}
                    <Card className="col-span-1 md:col-span-2 border-white/40 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-md shadow-md hover:shadow-lg transition-all group overflow-hidden">
                        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-orange-500/10 to-transparent" />
                        <CardContent className="p-5 flex items-center justify-between h-full relative z-10">
                            <div>
                                <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-2 group-hover:rotate-12 transition-transform">
                                    <Trophy className="h-5 w-5" />
                                </div>
                                <h4 className="font-bold text-slate-800 dark:text-white">Best Brilliance</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Professional learning</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-orange-500">A+</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 6: Community (Bottom Grid) */}
                    <Card className="col-span-1 md:col-span-1 border-white/40 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-md shadow-md hover:shadow-lg transition-all group">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div className="h-10 w-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 mb-2 group-hover:scale-110 transition-transform">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white">Community</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Join 5k+ peers</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 7: Instant Access (Bottom Grid) */}
                    <Card className="col-span-1 md:col-span-2 border-white/40 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-md shadow-md hover:shadow-lg transition-all group">
                        <CardContent className="p-5 flex items-center gap-4 h-full">
                            <div className="h-12 w-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:spin-slow">
                                <Zap className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white">Instant Access</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 ">Download notes in seconds.</p>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </section>
    );
}
