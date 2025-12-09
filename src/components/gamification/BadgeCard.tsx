
import React from "react";
import * as LucideIcons from "lucide-react";
import { Badge as BadgeType } from "@/hooks/useGamification";
import { cn } from "@/lib/utils";

// Helper to resolve icon string to component
const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Award;
    return Icon;
};

interface BadgeCardProps {
    badge: BadgeType;
    earned?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function BadgeCard({ badge, earned = false, size = "md", className }: BadgeCardProps) {
    const Icon = getIcon(badge.icon);

    const sizeClasses = {
        sm: "h-8 w-8 p-1.5",
        md: "h-12 w-12 p-3",
        lg: "h-16 w-16 p-4",
    };

    const iconSizes = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
    };

    return (
        <div className={cn("flex flex-col items-center gap-2 group/badge text-center", className)}>
            <div
                className={cn(
                    "rounded-full border transition-all duration-300 relative overflow-hidden",
                    sizeClasses[size],
                    earned
                        ? "bg-gradient-to-br from-[#8A4FFF]/20 to-[#4CC9F0]/20 border-[#8A4FFF]/50 shadow-[0_0_15px_rgba(138,79,255,0.3)]"
                        : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 grayscale opacity-50"
                )}
            >
                {earned && <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover/badge:opacity-100 transition-opacity" />}
                <Icon
                    className={cn(
                        "text-current transition-colors",
                        iconSizes[size],
                        earned ? "text-[#8A4FFF] drop-shadow-sm" : "text-slate-400"
                    )}
                />
            </div>
            <div className="space-y-0.5">
                <span
                    className={cn(
                        "font-semibold block leading-tight",
                        size === "sm" ? "text-[10px]" : "text-xs",
                        earned ? "text-foreground dark:text-white" : "text-muted-foreground"
                    )}
                >
                    {badge.name}
                </span>
                {size !== "sm" && (
                    <p className="text-[10px] text-muted-foreground hidden group-hover/badge:block absolute bg-popover text-popover-foreground p-2 rounded-md shadow-lg border -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 animate-in fade-in zoom-in-95">
                        {badge.description}
                    </p>
                )}
            </div>
        </div>
    );
}
