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

export function DashboardHeader() {
    const { user, profile, signOut } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-white/5 bg-background/50 backdrop-blur-xl px-8">
            {/* Mobile Menu Trigger (Hidden on Desktop) */}
            <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
            </Button>

            {/* Global Search */}
            <div className="relative flex-1 max-w-md hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search resources, books, courses..."
                    className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-muted-foreground/50 rounded-full"
                />
            </div>

            <div className="flex items-center gap-4 ml-auto">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative hover:bg-white/5">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 bg-background/95 backdrop-blur-xl border-white/10">
                        <DropdownMenuLabel className="flex items-center justify-between">
                            <span>Notifications</span>
                            {unreadCount > 0 && (
                                <span className="text-xs text-primary cursor-pointer" onClick={markAllAsRead}>Mark all read</span>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
                            ) : (
                                notifications.slice(0, 5).map((notif) => (
                                    <DropdownMenuItem
                                        key={notif.id}
                                        className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-white/5"
                                        onClick={() => markAsRead(notif.id)}
                                    >
                                        <span className={`font-medium text-sm ${!notif.is_read ? 'text-white' : 'text-muted-foreground'}`}>{notif.title}</span>
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
                                <p className="text-sm font-medium text-white">{profile?.full_name || 'Student'}</p>
                                <p className="text-xs text-muted-foreground">{profile?.role || 'User'}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold border-2 border-white/10">
                                {profile?.full_name?.[0] || 'U'}
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-xl border-white/10">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem onClick={() => navigate('/profile')} className="focus:bg-white/5">
                            <User className="mr-2 h-4 w-4" /> Profile
                        </DropdownMenuItem>

                        {/* Admin Link if role matches */}
                        {(profile?.role === 'admin' || profile?.role === 'superadmin') && (
                            <DropdownMenuItem onClick={() => navigate('/admin')} className="focus:bg-white/5 text-purple-400">
                                <Settings className="mr-2 h-4 w-4" /> Admin Dashboard
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem onClick={handleSignOut} className="text-red-400 focus:bg-red-500/10 focus:text-red-400">
                            <LogOut className="mr-2 h-4 w-4" /> Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
