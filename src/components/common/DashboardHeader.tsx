import { Bell, Search, User, LogOut, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export function DashboardHeader({ onSidebarToggle }: { onSidebarToggle?: () => void }) {
    const { user, profile, signOut } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-slate-200 dark:border-white/5 bg-background/50 backdrop-blur-xl px-8">
            {/* Mobile Menu Trigger (Hidden on Desktop) */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onSidebarToggle}>
                <Menu className="h-5 w-5" />
            </Button>

            {/* Global Search */}
            <div className="relative flex-1 max-w-md hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search resources, books, courses..."
                    className="pl-10 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:border-primary/50 text-foreground dark:text-white placeholder:text-muted-foreground rounded-full transition-all hover:bg-slate-200 dark:hover:bg-white/10"
                />
            </div>

            <div className="flex items-center gap-4 ml-auto">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 dark:hover:bg-white/5 rounded-full">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 bg-background/95 backdrop-blur-xl border-slate-200 dark:border-white/10 shadow-xl">
                        <DropdownMenuLabel className="flex items-center justify-between">
                            <span className="text-foreground dark:text-white">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="text-xs text-primary cursor-pointer hover:underline" onClick={markAllAsRead}>Mark all read</span>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />
                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
                            ) : (
                                notifications.slice(0, 5).map((notif) => (
                                    <DropdownMenuItem
                                        key={notif.id}
                                        className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-slate-100 dark:focus:bg-white/5"
                                        onClick={() => markAsRead(notif.id)}
                                    >
                                        <span className={`font-medium text-sm ${!notif.is_read ? 'text-foreground dark:text-white' : 'text-muted-foreground'}`}>{notif.title}</span>
                                        <span className="text-xs text-muted-foreground line-clamp-2">{notif.message}</span>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-3 cursor-pointer pl-2 hover:opacity-80 transition-opacity">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-foreground dark:text-white">{profile?.full_name || 'Student'}</p>
                                <p className="text-xs text-muted-foreground">{profile?.role || 'User'}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold border-2 border-white/20 dark:border-white/10 shadow-lg">
                                {profile?.full_name?.[0] || 'U'}
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-950/90 backdrop-blur-xl border-slate-200 dark:border-white/10 shadow-xl">
                        <DropdownMenuLabel className="text-slate-900 dark:text-white">My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />
                        <DropdownMenuItem onClick={() => navigate('/profile')} className="text-slate-700 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-white/10 focus:text-slate-900 dark:focus:text-white cursor-pointer transition-colors duration-200">
                            <User className="mr-2 h-4 w-4" /> Profile
                        </DropdownMenuItem>

                        {/* Admin Link if role matches */}
                        {(profile?.role === 'admin' || profile?.role === 'superadmin') && (
                            <DropdownMenuItem onClick={() => navigate('/admin')} className="text-slate-700 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-white/10 focus:text-slate-900 dark:focus:text-white cursor-pointer transition-colors duration-200">
                                <Settings className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:text-purple-700" /> Admin Dashboard
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />
                        <DropdownMenuItem onClick={handleSignOut} className="text-red-500 dark:text-red-400 focus:bg-red-500/10 focus:text-red-500 dark:focus:text-red-400 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" /> Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
