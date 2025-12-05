import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Shield, Ban, UserCheck, Search } from "lucide-react";
import { toast } from "sonner";

export function UsersList() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);

        // Fetch profiles
        const { data: profiles, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Failed to fetch users");
            setLoading(false);
            return;
        }

        // Fetch roles for all users
        const { data: rolesData } = await supabase
            .from("user_roles")
            .select("*");

        // Combine data
        const usersWithRoles = profiles.map(profile => ({
            ...profile,
            roles: rolesData?.filter(r => r.user_id === profile.id).map(r => r.role) || []
        }));

        setUsers(usersWithRoles);
        setLoading(false);
    };

    const toggleAdminRole = async (userId: string, currentRoles: string[]) => {
        const isAdmin = currentRoles.includes('admin');

        if (isAdmin) {
            // Remove admin role
            const { error } = await supabase
                .from('user_roles')
                .delete()
                .eq('user_id', userId)
                .eq('role', 'admin');

            if (error) toast.error("Failed to remove admin role");
            else toast.success("Admin role removed");
        } else {
            // Add admin role
            const { error } = await supabase
                .from('user_roles')
                .insert({ user_id: userId, role: 'admin' });

            if (error) toast.error("Failed to add admin role");
            else toast.success("User promoted to Admin");
        }

        fetchUsers();
    };

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Button variant="outline" onClick={fetchUsers}>Refresh</Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Coins</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">No users found</TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.full_name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        {user.roles.includes('admin') ? (
                                            <Badge className="bg-purple-500">Admin</Badge>
                                        ) : (
                                            <Badge variant="secondary">Student</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>{user.coins}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => toggleAdminRole(user.id, user.roles)}>
                                                    {user.roles.includes('admin') ? (
                                                        <>
                                                            <UserCheck className="mr-2 h-4 w-4" /> Remove Admin
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Shield className="mr-2 h-4 w-4" /> Make Admin
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                {/* Ban functionality requires a 'banned' column or similar logic, skipping for now or adding placeholder */}
                                                <DropdownMenuItem className="text-destructive" onClick={() => toast.info("Ban functionality coming soon")}>
                                                    <Ban className="mr-2 h-4 w-4" /> Ban User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
