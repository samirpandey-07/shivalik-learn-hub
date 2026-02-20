import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface DailyRewardPopupProps {
    isOpen: boolean;
    onClose: () => void;
    coins: number;
    streak?: number;
}

export function DailyRewardPopup({ isOpen, onClose, coins, streak = 1 }: DailyRewardPopupProps) {
    useEffect(() => {
        if (isOpen) {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Popup Card */}
                    <motion.div
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 10 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20
                        }}
                        className="relative bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-yellow-500/20 text-center overflow-hidden"
                    >
                        {/* Glow Effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/20 rounded-full blur-[60px] animate-pulse pointer-events-none" />

                        {/* Content */}
                        <div className="relative z-10 space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1.2 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30"
                            >
                                <Trophy className="w-12 h-12 text-white drop-shadow-md" />
                            </motion.div>

                            <div className="space-y-2">
                                <motion.h2
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-2xl font-bold text-slate-900 dark:text-white"
                                >
                                    Daily Reward!
                                </motion.h2>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-slate-500 dark:text-slate-400"
                                >
                                    You've earned <span className="font-bold text-yellow-500">+{coins} coins</span> for logging in today.
                                </motion.p>
                            </div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Button
                                    onClick={onClose}
                                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold shadow-lg shadow-orange-500/20"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Claim Reward
                                </Button>
                            </motion.div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
