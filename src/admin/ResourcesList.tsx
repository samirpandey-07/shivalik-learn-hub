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
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingResource, setEditingResource] = useState<any | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("resources")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Failed to fetch resources");
        } else {
            setResources(data || []);
        }
        setLoading(false);
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

    const filteredResources = resources.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.uploader_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
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
                            <TableHead>Status</TableHead>
                            <TableHead>Downloads</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : filteredResources.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">No resources found</TableCell>
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
                                                <DropdownMenuItem onClick={() => window.open(resource.drive_link, '_blank')}>
                                                    <Eye className="mr-2 h-4 w-4" /> View
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
