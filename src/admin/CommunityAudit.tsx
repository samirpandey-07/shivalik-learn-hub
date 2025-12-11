import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AuditLog {
    id: string;
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    table_name: string;
    changed_at: string;
    changed_by: string; // ID
    old_data: any;
    new_data: any;
    actor?: {
        full_name: string | null;
        avatar_url: string | null;
        email: string | null;
    };
}

export function CommunityAudit() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // 1. Fetch Logs
            const { data: logsData, error } = await supabase
                .from('audit_logs' as any)
                .select('*')
                .in('table_name', ['communities', 'study_rooms'])
                .order('changed_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            let formattedLogs = logsData || [];

            // 2. Collect User IDs
            const userIds = new Set<string>();
            formattedLogs.forEach((log: any) => {
                if (log.changed_by) userIds.add(log.changed_by);
            });

            console.log("Audit Logs Found:", formattedLogs.length);
            console.log("Unique Actors:", userIds.size);

            // 3. Fetch Profiles for these IDs
            if (userIds.size > 0) {
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, email')
                    .in('id', Array.from(userIds));

                if (profilesError) console.error("Error fetching profiles:", profilesError);
                console.log("Profiles DB Result:", profiles);

                if (profiles) {
                    const profileMap = new Map(profiles.map(p => [p.id, p]));

                    // 4. Attach Profile Data
                    formattedLogs = formattedLogs.map((log: any) => ({
                        ...log,
                        actor: profileMap.get(log.changed_by) || {
                            full_name: null,
                            avatar_url: null,
                            email: 'No Profile Found'
                        }
                    }));
                }
            }

            setLogs(formattedLogs as any);
        } catch (err) {
            console.error("Error fetching audit logs:", err);
        } finally {
            setLoading(false);
        }
    };

    const getEntityName = (log: AuditLog) => {
        if (log.operation === 'INSERT' || log.operation === 'UPDATE') {
            return log.new_data?.name || 'Unknown';
        }
        return log.old_data?.name || 'Unknown';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-indigo-600" />
                    Audit Logs
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                    Logs found: {logs.length}
                </p>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No audit records found.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Actor</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Entity Name</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-xs">
                                        {format(new Date(log.changed_at), "MMM d, yyyy HH:mm")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2" title={`ID: ${log.changed_by || 'NULL'}`}>
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={log.actor?.avatar_url || ''} />
                                                <AvatarFallback className="text-[10px]">
                                                    {(log.actor?.full_name?.[0] || log.actor?.email?.[0] || '?').toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {log.actor?.full_name || log.actor?.email || (log.changed_by ? 'Unnamed User' : 'System')}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                                    {log.changed_by ? ((!log.actor?.email || log.actor?.email === 'No Profile Found') ? `ID: ${log.changed_by.substring(0, 8)}...` : log.actor?.email) : 'Automatic'}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {log.table_name === 'communities' ? 'Community' : 'Study Room'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            log.operation === 'INSERT' ? "bg-green-100 text-green-700 border-green-200" :
                                                log.operation === 'DELETE' ? "bg-red-100 text-red-700 border-red-200" :
                                                    "bg-blue-100 text-blue-700"
                                        }>
                                            {log.operation === 'INSERT' ? 'CREATED' : 'DELETED'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {getEntityName(log)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
