import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, Loader2, User, Bot, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { chatWithPDF } from "@/lib/ai/gemini";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface AIChatProps {
    fileUrl: string;
}

interface Message {
    role: "user" | "model";
    content: string;
}

export function AIChat({ fileUrl }: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: "model", content: "Hi! I've analyzed this PDF. Ask me anything about it." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            // Send history excluding the initial greeting if needed, or keeping it
            // Gemini expects "user" then "model" usually.
            // We pass the previous messages as history context (excluding the just added one for "message" arg? 
            // No, chatWithPDF takes history AND current message.

            // Map our messages to the history format expect by chatWithPDF
            const history = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const responseText = await chatWithPDF(fileUrl, history, userMessage.content);

            const aiMessage: Message = { role: "model", content: responseText };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error: any) {
            console.error(error);
            toast.error("Failed to get answer");
            setMessages(prev => [...prev, { role: "model", content: "Sorry, I encountered an error answering that. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Card className="border-l-4 border-l-blue-500 shadow-md bg-white/80 dark:bg-black/40 backdrop-blur overflow-hidden h-[600px] flex flex-col">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-white/5 bg-white/40 dark:bg-white/5">
                <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    Chat with PDF
                    <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={() => setMessages([{ role: "model", content: "Hi! I've analyzed this PDF. Ask me anything about it." }])}>
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                {m.role === "model" && (
                                    <Avatar className="h-8 w-8 mt-1 border border-blue-200 dark:border-blue-900">
                                        <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">AI</AvatarFallback>
                                        <AvatarImage src="/bot-avatar.png" /> {/* Optional */}
                                    </Avatar>
                                )}

                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${m.role === "user"
                                    ? "bg-blue-600 text-white rounded-tr-none"
                                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-tl-none text-foreground dark:text-white"
                                    }`}>
                                    <div className="prose dark:prose-invert prose-sm max-w-none">
                                        <ReactMarkdown>{m.content}</ReactMarkdown>
                                    </div>
                                </div>

                                {m.role === "user" && (
                                    <Avatar className="h-8 w-8 mt-1 border border-slate-200 dark:border-white/10">
                                        <AvatarFallback className="bg-slate-100 dark:bg-slate-800"><User className="h-4 w-4" /></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-3 justify-start">
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900">AI</AvatarFallback>
                                </Avatar>
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                    <span className="text-xs text-muted-foreground">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <div className="p-4 bg-white/50 dark:bg-black/20 border-t border-slate-200 dark:border-white/5 backdrop-blur-sm">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a question about this document..."
                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 focus-visible:ring-blue-500"
                            disabled={loading}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
