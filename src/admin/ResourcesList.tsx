import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase/client';
import { useAuth } from "@/contexts/useAuth";
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
import { MoreVertical, Trash2, Edit, Eye, Search } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function ResourcesList() {
    const { user } = useAuth();
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingResource, setEditingResource] = useState<any | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [filterMode, setFilterMode] = useState<'all' | 'my_uploads' | 'my_approvals'>('all');

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setLoading(true);
        try {
            // 1. Fetch Resources (Basic)
            const { data, error } = await supabase
                .from("resources")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            let mappedData = (data || []).map((r: any) => ({
                ...r,
                uploader_name: 'Unknown',
                approved_by_name: '-'
            }));

            // 2. Decoupled Profile Fetch
            const userIds = new Set<string>();
            data?.forEach((r: any) => {
                if (r.uploader_id) userIds.add(r.uploader_id);
                if (r.approved_by) userIds.add(r.approved_by);
            });

            if (userIds.size > 0) {
                const { data: profiles, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, full_name') // Start fetching email too if possible, but schema might vary. safely just full_name
                    .in('id', Array.from(userIds));

                if (profiles) {
                    const profileMap = new Map(profiles.map(p => [p.id, p]));
                    mappedData = mappedData.map((r: any) => ({
                        ...r,
                        uploader_name: profileMap.get(r.uploader_id)?.full_name || 'Unknown',
                        approved_by_name: r.approved_by ? (profileMap.get(r.approved_by)?.full_name || 'Unknown Admin') : '-'
                    }));
                }
            }

            setResources(mappedData);

        } catch (err: any) {
            console.error("Fetch error:", err);
            toast.error("Failed to fetch resources");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this resource? This cannot be undone.")) return;

        const { error } = await supabase
            .from("resources")
            .delete()
            .eq("id", id);

        if (error) {
            toast.error("Failed to delete resource");
        } else {
            toast.success("Resource deleted");
            setResources(resources.filter(r => r.id !== id));
        }
    };

    const handleEditSave = async () => {
        if (!editingResource) return;

        const { error } = await supabase
            .from("resources")
            .update({
                title: editingResource.title,
                description: editingResource.description,
                subject: editingResource.subject
            })
            .eq("id", editingResource.id);

        if (error) {
            toast.error("Failed to update resource");
        } else {
            toast.success("Resource updated");
            setResources(resources.map(r => r.id === editingResource.id ? editingResource : r));
            setIsEditDialogOpen(false);
        }
    };

    const filteredResources = resources.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.uploader_name?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (filterMode === 'my_uploads') {
            return r.uploader_id === user?.id;
        }
        if (filterMode === 'my_approvals') {
            return r.approved_by === user?.id;
        }
        return true;
    });

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Resource Management</h2>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search resources..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    {/* Filter Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant={filterMode === 'all' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterMode('all')}
                        >
                            All
                        </Button>
                        <Button
                            variant={filterMode === 'my_uploads' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterMode('my_uploads')}
                        >
                            My Uploads
                        </Button>
                        <Button
                            variant={filterMode === 'my_approvals' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterMode('my_approvals')}
                        >
                            My Approvals
                        </Button>
                    </div>
                </div>
                <Button variant="outline" onClick={fetchResources}>Refresh</Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Uploader</TableHead>
                            <TableHead>Approved By</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Downloads</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : filteredResources.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">No resources found</TableCell>
                            </TableRow>
                        ) : (
                            filteredResources.map((resource) => (
                                <TableRow key={resource.id}>
                                    <TableCell className="font-medium max-w-[200px] truncate" title={resource.title}>
                                        {resource.title}
                                    </TableCell>
                                    <TableCell>{resource.subject}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {resource.uploader_name?.split('@')[0]}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {resource.approved_by_name || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={resource.status === 'approved' ? 'default' : resource.status === 'pending' ? 'secondary' : 'destructive'}>
                                            {resource.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{resource.downloads}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => {
                                                    const url = resource.file_url || resource.drive_link;
                                                    if (url) {
                                                        window.open(url, '_blank');
                                                    } else {
                                                        // Fallback to detail page if no direct link
                                                        window.open(`/resource/${resource.id}`, '_blank');
                                                    }
                                                }}>
                                                    <Eye className="mr-2 h-4 w-4" /> View Content
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => window.open(`/resource/${resource.id}`, '_blank')}>
                                                    <Search className="mr-2 h-4 w-4" /> View Details Page
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => {
                                                    setEditingResource(resource);
                                                    setIsEditDialogOpen(true);
                                                }}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(resource.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
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

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Resource</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={editingResource?.title || ''}
                                onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Input
                                value={editingResource?.subject || ''}
                                onChange={(e) => setEditingResource({ ...editingResource, subject: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                value={editingResource?.description || ''}
                                onChange={(e) => setEditingResource({ ...editingResource, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
