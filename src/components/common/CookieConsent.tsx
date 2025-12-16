import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            // Small delay for animation
            setTimeout(() => setIsVisible(true), 1000);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-lg shadow-lg border border-slate-700 dark:border-slate-600 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <p className="font-semibold text-sm">We use cookies 🍪</p>
                        <p className="text-xs text-slate-300 mt-1">
                            We use local storage and essential cookies to ensure you get the best experience on Campus Flow.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)} // Just close without saving if dismissed via X
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        className="w-full bg-primary hover:bg-primary/90 text-white border-0"
                        onClick={handleAccept}
                    >
                        Accept
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-slate-600 hover:bg-slate-700 text-slate-200"
                        onClick={() => setIsVisible(false)}
                    >
                        Decline
                    </Button>
                </div>
            </div>
        </div>
    );
}
