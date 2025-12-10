import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AISummaryProps {
    fileUrl: string;
}

export function AISummary({ fileUrl }: AISummaryProps) {
    return (
        <Card className="border-l-4 border-l-[#8A4FFF] shadow-md bg-white/80 dark:bg-black/40 backdrop-blur overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-colors duration-500" />

            <CardContent className="pt-6 relative z-10">
                <div className="flex flex-col items-center text-center space-y-4 py-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-[#8A4FFF]" />
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-1">AI Smart Summary</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            This feature is coming soon! We're fine-tuning our AI to give you the best summaries possible.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-primary/20 hover:bg-primary/5"
                        onClick={() => toast.success("We'll notify you when AI Summary is available!")}
                    >
                        <Bell className="h-4 w-4" /> Notify Me
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
