import { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { MobileBottomNav } from "./MobileBottomNav";

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden pb-16 md:pb-0">
            {/* Global Ambient Effects */}
            {/* Cosmic Nebula Background */}
            <div className="fixed inset-0 cosmic-bg pointer-events-none z-0" />

            {/* Volumetric Glows - Adjusted for Light Mode */}
            <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-primary/5 dark:bg-[#8A4FFF]/20 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 pointer-events-none z-0 animate-pulse-slow hidden dark:block" />
            <div className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-secondary/5 dark:bg-[#4CC9F0]/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 pointer-events-none z-0 hidden dark:block" />

            <DashboardSidebar />

            <div className="md:pl-64 relative z-10 transition-all duration-300 flex flex-col min-h-screen">
                <DashboardHeader />
                <main className="flex-1 container mx-auto px-4 md:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </main>
            </div>

            <MobileBottomNav />
        </div>
    );
}
