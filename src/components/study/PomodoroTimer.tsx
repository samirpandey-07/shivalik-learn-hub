
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export function PomodoroTimer() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');
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
            // Optional: Auto switch mode? Let's just stop.
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

    const progress = mode === 'focus'
        ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
        : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

    return (
        <Card className="glass-card bg-white/50 dark:bg-black/20 border-slate-200 dark:border-white/10 w-full max-w-sm mx-auto">
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
                        className="rounded-full w-12 h-12 p-0 border-2"
                        onClick={resetTimer}
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
