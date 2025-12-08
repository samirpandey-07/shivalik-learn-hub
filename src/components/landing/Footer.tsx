import { GraduationCap } from "lucide-react";

export function Footer() {
    return (
        <footer className="py-12 bg-black/20 border-t border-white/5">
            <div className="container">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-bold text-lg text-white">Shivalik Hub</span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} Shivalik College. All rights reserved.
                    </div>

                    <div className="flex items-center gap-6">
                        <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">Terms</a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
