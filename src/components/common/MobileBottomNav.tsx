import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Search, Upload, User, BookOpen } from "lucide-react";

export function MobileBottomNav() {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
        { icon: Search, label: "Browse", href: "/browse" },
        { icon: Upload, label: "Upload", href: "/upload" },
        { icon: User, label: "Profile", href: "/profile" },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-white/10 pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <Link key={item.href} to={item.href} className="w-full h-full">
                        <div
                            className={cn(
                                "flex flex-col items-center justify-center h-full w-full gap-1 transition-all duration-300 relative",
                                isActive(item.href) ? "text-[#4CC9F0]" : "text-slate-400 hover:text-white"
                            )}
                        >
                            {isActive(item.href) && (
                                <div className="absolute top-0 w-8 h-1 bg-[#4CC9F0] rounded-b-full shadow-[0_0_10px_#4CC9F0]" />
                            )}

                            <item.icon
                                className={cn(
                                    "h-6 w-6 transition-all duration-300",
                                    isActive(item.href) ? "drop-shadow-[0_0_5px_rgba(76,201,240,0.5)]" : ""
                                )}
                            />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
