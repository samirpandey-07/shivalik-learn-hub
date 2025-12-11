import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, CheckCircle, XCircle, ExternalLink, Shield } from "lucide-react";
import { toast } from "sonner";

interface Report {
    id: string;
    reason: string;
    status: 'pending' | 'resolved' | 'dismissed';
    created_at: string;
    resource_id: string;
    reporter_id: string;
    resource: {
        title: string;
        id: string;
    };
    reporter: {
        full_name: string;
        email: string;
    };
}

export function ReportedResources() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();

        // Real-time subscription
        const channel = supabase
            .channel('admin-reports')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'reports'
                },
                () => {
                    fetchReports();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchReports = async () => {
        try {
            const { data, error } = await supabase
                .from('reports')
                .select(`
                    *,
                    resource:resources(id, title),
                    reporter:profiles(full_name, email)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data as unknown as Report[]);
        } catch (error) {
            console.error("Error fetching reports:", error);
            toast.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (reportId: string, newStatus: 'resolved' | 'dismissed') => {
        try {
            const { error } = await supabase
                .from('reports')
                .update({ status: newStatus })
                .eq('id', reportId);

            if (error) throw error;
            toast.success(`Report marked as ${newStatus}`);
            fetchReports();
        } catch (error) {
            console.error("Error updating report:", error);
            toast.error("Failed to update status");
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
            resolved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
            dismissed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
        };
        return (
            <Badge variant="outline" className={styles[status as keyof typeof styles]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading reports...</div>;
    }

    return (
        <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-100">
                    <Shield className="h-5 w-5 text-red-500" />
                    Reported Resources
                </CardTitle>
            </CardHeader>
            <CardContent>
                {reports.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500/50" />
                        <p>No reports found. Good job!</p>
                    </div>
                ) : (
                    <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-900">
                                <TableRow>
                                    <TableHead>Resource</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Reporter</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={`/resource/${report.resource_id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline text-blue-600 dark:text-blue-400 flex items-center gap-1"
                                                >
                                                    {report.resource?.title || "Unknown Resource"}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[300px] truncate" title={report.reason}>
                                            {report.reason}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span>{report.reporter?.full_name || "Unknown"}</span>
                                                <span className="text-xs text-muted-foreground">{report.reporter?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={report.status} />
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {report.status === 'pending' && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                        onClick={() => handleStatusUpdate(report.id, 'resolved')}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Resolve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-slate-600 border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                        onClick={() => handleStatusUpdate(report.id, 'dismissed')}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Dismiss
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
