import { Card, CardContent } from "@/components/ui/card";
import { Brain, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AIQuizProps {
    fileUrl: string;
}

export function AIQuiz({ fileUrl }: AIQuizProps) {
    return (
        <Card className="mt-4 border-l-4 border-l-pink-500 shadow-md bg-white/80 dark:bg-black/40 backdrop-blur overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5 group-hover:from-pink-500/10 group-hover:to-purple-500/10 transition-colors duration-500" />

            <CardContent className="pt-6 relative z-10">
                <div className="flex flex-col items-center text-center space-y-4 py-4">
                    <div className="h-12 w-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                        <Brain className="h-6 w-6 text-pink-500" />
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-1">AI Smart Quiz</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            Generate instant quizzes from your notes. This feature is coming soon!
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-pink-500/20 hover:bg-pink-500/5 text-pink-600 dark:text-pink-400"
                        onClick={() => toast.success("We'll notify you when AI Quiz is available!")}
                    >
                        <Bell className="h-4 w-4" /> Notify Me
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
