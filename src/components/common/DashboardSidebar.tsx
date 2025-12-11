import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Search,
    Upload,
    User,
    GraduationCap,
    ShieldAlert,
    BookOpen,
    Bookmark,
    Clock,
    MessageSquare,
    Brain,
    MonitorPlay,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/useAuth";

// Reusable Sidebar Content (for Desktop & Mobile)
export function SidebarContent({ className, onClose }: { className?: string, onClose?: () => void }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { profile, roles } = useAuth();
    const isActive = (path: string) => location.pathname === path;

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        { icon: BookOpen, label: "Resources", href: "/browse" },
        { icon: Brain, label: "Study Tools", href: "/study" },
        { icon: MonitorPlay, label: "Live Rooms", href: "/study/rooms" },
        { icon: Users, label: "Communities", href: "/communities" },
        { icon: Brain, label: "AI Doubt Solver", href: "/doubt-solver" },
        { icon: MessageSquare, label: "Forum", href: "/forum" },
        { icon: Bookmark, label: "Saved", href: "/saved" },
        { icon: Clock, label: "Recent", href: "/recent" },
        { icon: Upload, label: "Upload", href: "/upload" },
        { icon: User, label: "Profile", href: "/profile" },
    ];

    // Filter menu items based on role
    // "Live Rooms" (MonitorPlay) and "Communities" (Users) are now available for all students to encourage engagement
    const filteredMenuItems = menuItems.filter(item => {
        // Only Admin Page is restricted now (handled by separate push logic below)
        return true;
    });

    if (roles?.includes('admin') || roles?.includes('superadmin')) {
        filteredMenuItems.push({ icon: ShieldAlert, label: "Admin", href: "/admin" });
    }

    const handleNavigation = (href: string) => {
        navigate(href);
        if (onClose) onClose();
    };

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Logo */}
            <div className="p-6 h-20 flex items-center">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigation("/")}>
                    <div className="flex items-center gap-3 px-2">
                        <div className="bg-gradient-to-br from-[#4CC9F0] to-[#8A4FFF] p-2 rounded-xl shadow-lg shadow-purple-500/20">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#4CC9F0] to-[#8A4FFF]">
                                Campus Flow
                            </h1>
                            <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                                by Dronex
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                <div className="mb-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Menu
                </div>
                {filteredMenuItems.map((item) => (
                    <div key={item.href} onClick={() => handleNavigation(item.href)}>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-3 relative overflow-hidden transition-all duration-300 h-11",
                                isActive(item.href)
                                    ? "bg-primary/20 text-primary dark:text-white shadow-glow hover:bg-primary/25"
                                    : "text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                            )}
                        >
                            {isActive(item.href) && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                            )}
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                        </Button>
                    </div>
                ))}

                {/* Separator / Additional Links */}
                <div className="mt-8 mb-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Resources
                </div>
                <div onClick={() => handleNavigation("/browse")}>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-white hover:bg-white/5 h-11">
                        <BookOpen className="h-5 w-5" />
                        <span>Library</span>
                    </Button>
                </div>
            </nav>

            {/* Footer / Copyright */}
            <div className="p-6 text-xs text-muted-foreground text-center border-t border-slate-200 dark:border-white/5">
                &copy; 2025 Campus Flow
                <div className="mt-1 text-[10px] text-slate-600">
                    Role: {roles?.join(', ') || 'None'}
                </div>
            </div>
        </div>
    );
}

export function DashboardSidebar() {
    return (
        <div className="hidden md:flex h-screen w-64 fixed left-0 top-0 flex-col glass-sidebar border-r border-slate-200 dark:border-white/10 z-40 bg-background/50 backdrop-blur-xl">
            <SidebarContent />
        </div>
    );
}
