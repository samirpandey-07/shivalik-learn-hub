
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Coffee, Brain, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PomodoroTimer() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');
    const [isZenMode, setIsZenMode] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Timer finished
            new Audio('/notification.mp3').play().catch(() => { }); // Simple notification sound attempt
            setIsActive(false);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    };

    const switchMode = (newMode: 'focus' | 'break') => {
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleZenMode = () => {
        setIsZenMode(!isZenMode);
    };

    // Zen Mode View
    // Zen Mode View
    if (isZenMode) {
        return (
            <div className="fixed inset-0 z-[2147483647] bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 text-white flex flex-col items-center justify-center animate-in fade-in duration-300 w-screen h-screen overflow-hidden">
                {/* Background Particles/Glow (Optional Subtle touch) */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-6 right-6 text-white/50 hover:text-white z-50 hover:bg-white/10"
                    onClick={toggleZenMode}
                    title="Exit Fullscreen"
                >
                    <Minimize2 className="h-6 w-6" />
                </Button>

                <div className="flex flex-col items-center gap-12 z-10">
                    {/* Top Mode Toggles - Pill Shape */}
                    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md p-1 rounded-full border border-white/10">
                        <button
                            onClick={() => switchMode('focus')}
                            className={cn(
                                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                mode === 'focus'
                                    ? "bg-white text-slate-900 shadow-lg"
                                    : "text-white/70 hover:text-white hover:bg-white/10"
                            )}
                        >
                            Focus
                        </button>
                        <button
                            onClick={() => switchMode('break')}
                            className={cn(
                                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                mode === 'break'
                                    ? "bg-white text-slate-900 shadow-lg"
                                    : "text-white/70 hover:text-white hover:bg-white/10"
                            )}
                        >
                            Break
                        </button>
                    </div>

                    {/* Massive Timer */}
                    <span className="text-[12rem] leading-none font-bold tracking-tighter tabular-nums select-none drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                        {formatTime(timeLeft)}
                    </span>

                    {/* Main Control */}
                    <div className="flex items-center gap-8">
                        <Button
                            size="lg"
                            variant="ghost"
                            className="rounded-full w-14 h-14 p-0 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                            onClick={resetTimer}
                            title="Reset Timer"
                        >
                            <RotateCcw className="w-6 h-6" />
                        </Button>

                        <button
                            onClick={toggleTimer}
                            className="group relative flex items-center justify-center px-12 py-4 bg-white text-slate-900 rounded-full font-bold text-xl shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-105 active:scale-95 transition-all duration-300"
                        >
                            <span className="mr-2">{isActive ? "PAUSE" : "START"}</span>
                            {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                        </button>

                        <div className="w-14 h-14" /> {/* Spacer to balance Reset button */}
                    </div>

                    <p className="text-white/30 text-sm uppercase tracking-[0.2em] animate-pulse absolute bottom-12">
                        {mode === 'focus' ? 'Stay Focused' : 'Take a deep breath'}
                    </p>
                </div>
            </div>
        );
    }

    // Default Card View
    return (
        <Card className="glass-card bg-white/50 dark:bg-black/20 border-slate-200 dark:border-white/10 w-full max-w-sm mx-auto relative group">
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={toggleZenMode}
                title="Enter Zen Mode"
            >
                <Maximize2 className="h-4 w-4" />
            </Button>

            <CardHeader className="pb-2">
                <CardTitle className="text-center flex items-center justify-center gap-2 text-xl font-bold text-slate-800 dark:text-white">
                    {mode === 'focus' ? <Brain className="w-5 h-5 text-[#4CC9F0]" /> : <Coffee className="w-5 h-5 text-green-400" />}
                    {mode === 'focus' ? 'Focus Time' : 'Break Time'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Timer Display */}
                <div className="relative flex items-center justify-center py-6">
                    {/* Circular Progress Ring (Simplified as border for now) */}
                    <div className={cn(
                        "w-48 h-48 rounded-full border-8 flex items-center justify-center shadow-lg transition-colors duration-500",
                        mode === 'focus'
                            ? isActive ? "border-[#4CC9F0] shadow-[#4CC9F0]/20" : "border-slate-200 dark:border-white/10"
                            : isActive ? "border-green-400 shadow-green-400/20" : "border-slate-200 dark:border-white/10"
                    )}>
                        <span className="text-6xl font-mono font-bold tabular-nums tracking-tighter text-slate-900 dark:text-white">
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                    <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full w-14 h-14 p-0 border-2 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400"
                        onClick={resetTimer}
                        title="Reset Timer"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </Button>

                    <Button
                        size="lg"
                        className={cn(
                            "rounded-full w-16 h-16 p-0 shadow-lg transition-transform hover:scale-105 active:scale-95",
                            mode === 'focus' ? "bg-[#4CC9F0] hover:bg-[#3db5da] text-slate-900" : "bg-green-500 hover:bg-green-600 text-white"
                        )}
                        onClick={toggleTimer}
                    >
                        {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </Button>
                </div>

                {/* Mode Switcher */}
                <div className="flex justify-center gap-2 pt-2">
                    <Button
                        variant={mode === 'focus' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => switchMode('focus')}
                        className="text-xs"
                    >
                        Focus (25m)
                    </Button>
                    <Button
                        variant={mode === 'break' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => switchMode('break')}
                        className="text-xs"
                    >
                        Break (5m)
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
