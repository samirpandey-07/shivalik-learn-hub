import { useState } from "react";
import { format } from "date-fns";
import {
    Users,
    Shield,
    User,
    Search,
    MoreVertical,
    Loader2,
    Ban,
    ShieldOff,
    ShieldOff,
    Trash2,
    Coins
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useUsers, updateUserRole, toggleBanUser, deleteUser } from "@/hooks/useAdmin";

export function UserManagement() {
    const { users, loading, refetch } = useUsers();
    const [searchTerm, setSearchTerm] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleRoleUpdate = async (userId: string, newRole: 'admin' | 'student') => {
        setActionLoading(userId);
        const { error } = await updateUserRole(userId, newRole);
        setActionLoading(null);

        if (error) {
            toast.error("Error", {
                description: "Failed to update user role.",
            });
        } else {
            toast.success("Role Updated", {
                description: `User is now a ${newRole}.`,
            });
            refetch();
        }
    };

    const handleBanToggle = async (userId: string, currentStatus: boolean) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'unban' : 'ban'} this user?`)) return;

        setActionLoading(userId);
        const { error } = await toggleBanUser(userId, !currentStatus);
        setActionLoading(null);

        if (error) {
            toast.error("Error", {
                description: "Failed to update ban status."
            });
        } else {
            toast.success(currentStatus ? "User Unbanned" : "User Banned", {
                description: currentStatus ? "User access restored." : "User access has been revoked."
            });
            refetch();
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.")) return;

        setActionLoading(userId);
        const { error } = await deleteUser(userId);
        setActionLoading(null);

        if (error) {
            console.error("Delete error:", error);
            toast.error("Error", {
                description: "Failed to delete user. Ensure you have permissions."
            });
        } else {
            toast.success("User Deleted", {
                description: "The user account has been removed."
            });
            refetch();
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search users by name or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground focus:border-cyan-500/50 dark:focus:border-cyan-400/50 rounded-xl"
                />
            </div>

            {/* User List */}
            <div className="space-y-3">
                {filteredUsers.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center justify-between p-4 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border border-slate-200 dark:border-white/10">
                                <AvatarImage src={user.avatar_url || undefined} />
                                <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400">
                                    {user.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="font-medium text-foreground dark:text-white flex items-center gap-2">
                                    {user.full_name || 'Anonymous User'}
                                    {user.is_banned && (
                                        <Badge variant="destructive" className="text-[10px] h-5 px-1.5 uppercase">Banned</Badge>
                                    )}
                                </h4>
                                <p className="text-xs text-muted-foreground">Joined {format(new Date(user.created_at), "PPpp")}</p>
                                <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-1 mt-1">
                                    <Coins className="h-3 w-3" /> {user.coins || 0} Coins
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Badge variant={user.role === 'admin' ? "default" : "secondary"} className={user.role === 'admin' ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20" : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"}>
                                {user.role === 'admin' ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                                {user.role || 'student'}
                            </Badge>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground dark:hover:text-white" disabled={actionLoading === user.id}>
                                        {actionLoading === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-background dark:bg-slate-950/95 border-slate-200 dark:border-white/10 text-foreground dark:text-white backdrop-blur-xl">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/10" />
                                    <DropdownMenuItem
                                        className="focus:bg-cyan-500/10 focus:text-cyan-600 dark:focus:text-cyan-400 cursor-pointer"
                                        onClick={() => handleRoleUpdate(user.id, 'admin')}
                                    >
                                        <Shield className="mr-2 h-4 w-4" /> Make Admin
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="focus:bg-slate-100 dark:focus:bg-white/10 focus:text-foreground dark:focus:text-white cursor-pointer"
                                        onClick={() => handleRoleUpdate(user.id, 'student')}
                                    >
                                        <User className="mr-2 h-4 w-4" /> Make Student
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/10" />
                                    <DropdownMenuItem
                                        className={`cursor - pointer ${user.is_banned ? 'text-green-600 focus:bg-green-500/10 focus:text-green-700' : 'text-destructive focus:bg-destructive/10 focus:text-destructive'}`}
                                        onClick={() => handleBanToggle(user.id, user.is_banned || false)}
                                    >
                                        {user.is_banned ? (
                                            <>
                                                <Shield className="mr-2 h-4 w-4" /> Unban User
                                            </>
                                        ) : (
                                            <>
                                                <Ban className="mr-2 h-4 w-4" /> Ban User
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/10" />
                                    <DropdownMenuItem
                                        className="text-red-600 focus:bg-red-500/10 focus:text-red-700 cursor-pointer"
                                        onClick={() => handleDeleteUser(user.id)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                ))}

                {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No users found matching "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
}
