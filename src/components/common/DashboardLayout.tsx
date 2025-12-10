import { ReactNode, useState } from "react";
import { DashboardSidebar, SidebarContent } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { useTheme } from "@/hooks/useTheme";
import { ParticlesBackground } from "../landing/ParticlesBackground";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { theme } = useTheme();
    const particleColor = theme === 'dark' ? "rgba(255, 255, 255, 0.4)" : "#3b82f6"; // Slightly lower opacity for dashboard to avoid noise
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden pb-16 md:pb-0">
            {/* Global Ambient Effects */}
            {/* Cosmic Nebula Background */}
            <div className="fixed inset-0 cosmic-bg pointer-events-none z-0" />

            {/* Interactive Particles - Removed as per request */}
            {/* <ParticlesBackground className="fixed inset-0 z-0 opacity-50 pointer-events-none" color={particleColor} /> */}

            {/* Volumetric Glows - Adjusted for Light Mode */}
            <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-primary/5 dark:bg-[#8A4FFF]/20 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 pointer-events-none z-0 animate-pulse-slow hidden dark:block" />
            <div className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-secondary/5 dark:bg-[#4CC9F0]/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 pointer-events-none z-0 hidden dark:block" />

            <DashboardSidebar />

            {/* Mobile Sidebar Sheet */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetContent side="left" className="p-0 border-r border-white/10 bg-background/80 backdrop-blur-xl w-72">
                    <SidebarContent onClose={() => setIsSidebarOpen(false)} />
                </SheetContent>
            </Sheet>

            <div className="md:pl-64 relative z-10 transition-all duration-300 flex flex-col min-h-screen">
                <DashboardHeader onSidebarToggle={() => setIsSidebarOpen(true)} />
                <main className="flex-1 container mx-auto px-4 md:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </main>
            </div>

            <MobileBottomNav />
        </div>
    );
}
