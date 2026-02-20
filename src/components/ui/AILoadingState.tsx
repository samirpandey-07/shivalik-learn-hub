import { motion } from "framer-motion";
import { Sparkles, BrainCircuit } from "lucide-react";

export function AILoadingState() {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-6 min-h-[300px] w-full bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">

            {/* Central Pulsing Brain */}
            <div className="relative">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 1, 0.5],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="relative z-10 p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/20"
                >
                    <BrainCircuit className="w-12 h-12 text-white" />
                </motion.div>

                {/* Orbital Sparkles */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 z-0"
                >
                    <div className="absolute -top-4 -left-4">
                        <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="absolute -bottom-4 -right-4">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                </motion.div>
            </div>

            <div className="text-center space-y-2">
                <motion.h3
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500"
                >
                    Solving your doubt...
                </motion.h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Analyzing context, checking resources, and formatting the perfect answer.
                </p>
            </div>
        </div>
    );
}
