import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useSubjects } from "@/hooks/useResources";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useRef, useEffect, useState } from "react";
import { useNavbarSearch } from "@/hooks/useNavbarSearch";
import { Loader2, FileText, Video, Link as LinkIcon, Bell, Menu, Search, LogOut, User, LayoutDashboard, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function DashboardHeader({ onSidebarToggle }: { onSidebarToggle?: () => void }) {
    const { user, profile, signOut } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { subjects } = useSubjects();
    const [knownContexts, setKnownContexts] = useState<string[]>([]);

    // Fetch course names for client-side prefix check
    useEffect(() => {
        async function fetchContexts() {
            const { data } = await supabase.from('courses').select('name');
            if (data) {
                // Cast to any to avoid strict type checks if schema is out of sync
                const ctx = (data as any[]).map(c => c.name).filter(Boolean);
                setKnownContexts(ctx);
            }
        }
        fetchContexts();
    }, []);

    const navigate = useNavigate();

    const {
        query,
        results,
        isSearching,
        showDropdown,
        setQuery,
        setShowDropdown,
        handleSearch,
        handleKeyDown,
        handleResultClick
    } = useNavbarSearch();

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Removed manual outside click handler, Popover handles this.

    // Helper for icons
    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="h-4 w-4 text-blue-500" />;
            case 'link': return <LinkIcon className="h-4 w-4 text-green-500" />;
            default: return <FileText className="h-4 w-4 text-purple-500" />;
        }
    };

    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <header className="h-16 border-b border-sidebar-border bg-sidebar-background px-6 flex items-center justify-between sticky top-0 z-10 w-full">
            <div className="flex items-center gap-4 flex-1">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onSidebarToggle}>
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Global Search */}
                <div className="relative flex-1 max-w-md hidden md:block">
                    <Popover open={showDropdown && query.length >= 1} onOpenChange={setShowDropdown}>
                        <PopoverTrigger asChild>
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                <Input
                                    placeholder="Search resources, books, courses..."
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        if (e.target.value.length >= 2) setShowDropdown(true);
                                    }}
                                    onFocus={() => {
                                        if (query.length >= 2) setShowDropdown(true);
                                    }}
                                    onKeyDown={handleKeyDown}
                                    className="pl-10 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:border-primary/50 text-foreground dark:text-white placeholder:text-muted-foreground rounded-full transition-all hover:bg-slate-200 dark:hover:bg-white/10 w-full"
                                />
                            </div>
                        </PopoverTrigger>

                        <PopoverContent
                            className="p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-[100]"
                            align="start"
                            sideOffset={8}
                            style={{
                                width: 'var(--radix-popover-trigger-width)',
                                maxWidth: 'var(--radix-popover-trigger-width)'
                            }}
                            onOpenAutoFocus={(e) => e.preventDefault()} // Don't steal focus from input
                        >
                            {isSearching ? (
                                <div className="p-4 flex items-center justify-center text-muted-foreground">
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Searching...
                                </div>
                            ) : results.length > 0 ? (
                                <div className="py-2">
                                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                                        Top Results
                                    </div>
                                    {results.map((r) => (
                                        <div
                                            key={r.id}
                                            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors"
                                            onClick={() => handleResultClick(r.id)}
                                        >
                                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 shrink-0">
                                                {getIcon(r.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-foreground dark:text-white truncate">
                                                    {r.title}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    {r.subject && <Badge variant="outline" className="text-[10px] h-4 px-1">{r.subject}</Badge>}
                                                    <span className="capitalize">{r.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div
                                        className="border-t border-slate-100 dark:border-white/5 mt-1 px-4 py-3 text-center text-sm text-primary font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5"
                                        onClick={handleSearch}
                                    >
                                        See all results for "{query}"
                                    </div>
                                </div>
                            ) : (
                                (() => {
                                    // Prefix Aware Logic
                                    // Check if query matches prefix of any Subject or Course context
                                    const combinedContexts = [...subjects, ...knownContexts];
                                    const isPrefix = combinedContexts.some(c =>
                                        c && c.toLowerCase().includes(query.toLowerCase())
                                    );

                                    if (query.trim().length < 3 || isPrefix) {
                                        return (
                                            <div className="p-4 text-center text-muted-foreground text-sm">
                                                Keep typing to search...
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="p-4 text-center text-muted-foreground text-sm">
                                            No direct matches found. <br /> Press Enter to browse all.
                                        </div>
                                    );
                                })()
                            )}
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="flex items-center gap-4 ml-auto">
                <ThemeToggle />

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
                                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary" onClick={() => markAllAsRead()}>
                                    Mark all read
                                </Button>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No notifications
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        className={`p-3 cursor-pointer ${!notification.is_read ? 'bg-slate-50 dark:bg-white/5' : ''}`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-sm text-foreground dark:text-white">{notification.title}</span>
                                            <span className="text-xs text-muted-foreground">{notification.message}</span>
                                            <span className="text-[10px] text-muted-foreground opacity-70">
                                                {new Date(notification.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="group rounded-full pl-0 hover:bg-transparent">
                            <Avatar className="h-8 w-8 border border-slate-200 dark:border-white/10 transition-transform group-hover:scale-105">
                                <AvatarImage src={profile?.avatar_url || undefined} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || <User className="h-4 w-4" />}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-xl rounded-xl p-1">
                        <DropdownMenuLabel className="font-normal p-2">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-foreground dark:text-white capitalize">{profile?.full_name || 'User'}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 my-1" />
                        <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-slate-100 dark:focus:bg-white/5" onClick={() => navigate('/admin')}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-slate-100 dark:focus:bg-white/5" onClick={() => navigate('/upload')}>
                            <Upload className="mr-2 h-4 w-4" />
                            <span>Upload Resource</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 my-1" />
                        <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-slate-100 dark:focus:bg-white/5 text-red-500 focus:text-red-500" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
