
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Search, Plus, ArrowRight, UserPlus, Check } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Community {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    members_count?: number;
    is_member?: boolean;
}

export default function CommunityLobby() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Create Community State
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newCategory, setNewCategory] = useState("General");
    const [newIcon, setNewIcon] = useState("🌍");

    useEffect(() => {
        fetchCommunities();
    }, [user]);

    const fetchCommunities = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Use the new RPC function for efficient stats
            const { data, error } = await supabase.rpc('get_communities_with_stats');

            if (error) throw error;
            setCommunities(data || []);

        } catch (error) {
            console.error("Error fetching communities:", error);
            toast.error("Failed to load communities");
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (id: string) => {
        try {
            const { error } = await supabase
                .from('community_members' as any)
                .insert({ community_id: id, user_id: user?.id });

            if (error) throw error;

            toast.success("Joined community!");
            setCommunities(prev => prev.map(c =>
                c.id === id
                    ? { ...c, is_member: true, members_count: (c.members_count || 0) + 1 }
                    : c
            ));
        } catch (error) {
            toast.error("Failed to join");
        }
    };

    const handleCreate = async () => {
        try {
            const { data, error } = await supabase
                .from('communities' as any)
                .insert({
                    name: newName,
                    description: newDesc,
                    category: newCategory,
                    icon: newIcon,
                    created_by: user?.id
                })
                .select()
                .single();

            if (error) throw error;

            // Auto Join
            await supabase.from('community_members' as any).insert({ community_id: data.id, user_id: user?.id, role: 'admin' });

            toast.success("Community Created!");
            setShowCreate(false);
            fetchCommunities();
        } catch (error) {
            toast.error("Failed to create community");
        }
    };

    const filtered = communities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="container mx-auto p-6 max-w-7xl animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-orange-500 flex items-center gap-3">
                        <Users className="h-8 w-8 text-orange-500" />
                        Communities
                    </h1>
                    <p className="text-muted-foreground mt-1">Find your tribe. Join clubs, study groups, and societies.</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search groups..."
                            className="pl-9 bg-white/5 border-white/10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Dialog open={showCreate} onOpenChange={setShowCreate}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 border-0 text-white shadow-lg shadow-orange-900/20">
                                <Plus className="h-4 w-4 mr-2" /> Create
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create a Community</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input placeholder="e.g. Python Wizards" value={newName} onChange={e => setNewName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input placeholder="Short bio..." value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Icon (Emoji)</Label>
                                        <Input placeholder="🐍" value={newIcon} onChange={e => setNewIcon(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Input placeholder="Generate" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreate} disabled={!newName}>Create Group</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse" />)
                ) : filtered.length > 0 ? (
                    filtered.map(community => (
                        <Card key={community.id} className="group bg-white/60 dark:bg-white/5 border-white/20 hover:border-orange-500/50 transition-all hover:shadow-lg dark:hover:shadow-orange-900/10 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-50 text-[5rem] grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all pointer-events-none select-none">
                                {community.icon}
                            </div>

                            <CardContent className="p-6 relative z-10 h-full flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl border border-orange-200 dark:border-orange-500/20">
                                        {community.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg group-hover:text-orange-500 transition-colors">{community.name}</h3>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-muted-foreground">{community.category}</span>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground dark:text-gray-400 mb-6 flex-1">
                                    {community.description || "No description provided."}
                                </p>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <Users className="h-3 w-3 mr-1" /> {community.members_count} Members
                                    </div>

                                    {community.is_member ? (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => navigate(`/communities/${community.id}`)}
                                            className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20"
                                        >
                                            <Check className="h-4 w-4 mr-1" /> Open
                                        </Button>
                                    ) : (
                                        <Button size="sm" onClick={() => handleJoin(community.id)}>
                                            <UserPlus className="h-4 w-4 mr-2" /> Join
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center text-muted-foreground">
                        <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p>No communities found. Be the first to create one!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
