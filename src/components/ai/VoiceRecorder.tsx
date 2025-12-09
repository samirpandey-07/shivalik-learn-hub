
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceRecorderProps {
    onTranscript: (text: string) => void;
    className?: string;
    variant?: "default" | "icon" | "minimal";
}

export function VoiceRecorder({ onTranscript, className = "", variant = "default" }: VoiceRecorderProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setIsSupported(false);
            console.warn("Speech recognition not supported in this browser.");
            return;
        }

        // Initialize Speech Recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript);
            setIsListening(false);
            toast.success("Heard: " + transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                toast.error("Microphone access denied.");
            } else {
                toast.error("Didn't catch that. Try again.");
            }
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

    }, [onTranscript]);

    const toggleListening = () => {
        if (!isSupported) {
            toast.error("Voice search not supported in this browser (try Chrome).");
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    if (!isSupported) return null;

    if (variant === "icon") {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleListening}
                className={`relative ${isListening ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'} ${className}`}
                title="Voice Search"
                type="button"
            >
                {isListening ? (
                    <>
                        <span className="absolute inset-0 rounded-full animate-ping bg-red-500/20" />
                        <MicOff className="h-4 w-4" />
                    </>
                ) : (
                    <Mic className="h-4 w-4" />
                )}
            </Button>
        );
    }

    if (variant === "minimal") {
        return (
            <div
                onClick={toggleListening}
                className={`cursor-pointer transition-colors ${isListening ? 'text-red-500' : 'text-muted-foreground hover:text-white'}`}
            >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </div>
        )
    }

    return (
        <Button
            variant={isListening ? "destructive" : "secondary"}
            onClick={toggleListening}
            className={`gap-2 ${className}`}
            type="button"
        >
            {isListening ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Listening...
                </>
            ) : (
                <>
                    <Mic className="h-4 w-4" /> Voice Note
                </>
            )}
        </Button>
    );
}
