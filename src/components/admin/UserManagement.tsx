import { useState } from "react";
import { format } from "date-fns";
import {
    Users,
    Shield,
    User,
    Search,
    MoreVertical,
    Loader2
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
import { useUsers, updateUserRole, UserProfile } from "@/hooks/useAdmin";

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
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-cyan-400/50 rounded-xl"
                />
            </div>

            {/* User List */}
            <div className="space-y-3">
                {filteredUsers.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border border-white/10">
                                <AvatarImage src={user.avatar_url || undefined} />
                                <AvatarFallback className="bg-slate-800 text-cyan-400">
                                    {user.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="font-medium text-white">{user.full_name || 'Anonymous User'}</h4>
                                <p className="text-xs text-muted-foreground">Joined {format(new Date(user.created_at), "MMM yyyy")}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Badge variant={user.role === 'admin' ? "default" : "secondary"} className={user.role === 'admin' ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20" : "bg-white/10 text-slate-300 hover:bg-white/10"}>
                                {user.role === 'admin' ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                                {user.role || 'student'}
                            </Badge>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" disabled={actionLoading === user.id}>
                                        {actionLoading === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-950/95 border-white/10 text-white backdrop-blur-xl">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem
                                        className="focus:bg-cyan-500/10 focus:text-cyan-400 cursor-pointer"
                                        onClick={() => handleRoleUpdate(user.id, 'admin')}
                                    >
                                        <Shield className="mr-2 h-4 w-4" /> Make Admin
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="focus:bg-white/10 focus:text-white cursor-pointer"
                                        onClick={() => handleRoleUpdate(user.id, 'student')}
                                    >
                                        <User className="mr-2 h-4 w-4" /> Make Student
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
