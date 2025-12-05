import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    readOnly?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function StarRating({
    value,
    onChange,
    readOnly = false,
    size = "md",
    className
}: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    const starSize = {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-6 w-6"
    };

    const displayValue = hoverValue ?? value;

    return (
        <div className={cn("flex items-center gap-0.5", className)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readOnly}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => !readOnly && setHoverValue(star)}
                    onMouseLeave={() => !readOnly && setHoverValue(null)}
                    className={cn(
                        "transition-all duration-150 focus:outline-none",
                        readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
                    )}
                >
                    <Star
                        className={cn(
                            starSize[size],
                            star <= displayValue
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-muted text-muted-foreground/30"
                        )}
                    />
                </button>
            ))}
        </div>
    );
}
