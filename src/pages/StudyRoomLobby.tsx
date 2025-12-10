
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Laptop, Coffee, Flame } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/useAuth";

export default function StudyRoomLobby() {
    const { user, roles } = useAuth();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Create Room State
    const [newRoomName, setNewRoomName] = useState("");
    const [newRoomTopic, setNewRoomTopic] = useState("");

    const fetchRooms = async () => {
        setLoading(true);
        // Fetch all rooms, client-side filtering for simplicity
        const { data, error } = await supabase
            .from('study_rooms' as any)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching rooms:", error);
            toast.error("Failed to load study rooms");
        } else {
            setRooms(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRooms();

        // Subscribe to new rooms
        const channel = supabase
            .channel('public_rooms')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'study_rooms' }, (payload) => {
                setRooms(prev => [payload.new, ...prev]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleCreateRoom = async () => {
        if (!newRoomName.trim()) return;

        try {
            const { data, error } = await supabase
                .from('study_rooms' as any)
                .insert({
                    name: newRoomName,
                    topic: newRoomTopic || "General Study",
                    created_by: user?.id
                })
                .select()
                .single();

            if (error) throw error;

            toast.success("Room Created!");
            setIsCreateOpen(false);
            setNewRoomName("");
            setNewRoomTopic("");

            if (data) navigate(`/study/rooms/${data.id}`);

        } catch (error: any) {
            toast.error("Error creating room", { description: error.message });
        }
    };

    const toggleHide = async (e: React.MouseEvent, room: any) => {
        e.stopPropagation();
        const { error } = await supabase.rpc('toggle_room_visibility', { p_room_id: room.id });

        if (error) {
            console.error(error);
            toast.error("Failed to update room: " + error.message);
        } else {
            toast.success(room.is_hidden ? "Room visible" : "Room hidden");
            fetchRooms();
        }
    };

    const deleteRoom = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure? This cannot be undone.")) return;

        const { error } = await supabase.rpc('delete_room_secure', { p_room_id: id });

        if (error) {
            console.error(error);
            toast.error("Failed to delete room: " + error.message);
        } else {
            toast.success("Room deleted");
            fetchRooms();
        }
    };

    const getIcon = (name: string) => {
        if (name.toLowerCase().includes('chill') || name.toLowerCase().includes('lofi')) return <Coffee className="h-6 w-6 text-orange-400" />;
        if (name.toLowerCase().includes('exam') || name.toLowerCase().includes('crunch')) return <Flame className="h-6 w-6 text-red-500" />;
        return <Laptop className="h-6 w-6 text-blue-400" />;
    };

    const isAdmin = roles?.includes('admin') || roles?.includes('superadmin');
    const displayedRooms = rooms.filter(r => !r.is_hidden || isAdmin);

    return (
        <div className="container py-8 space-y-8 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                        Study Rooms
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Join a live session, chat with peers, and focus together.
                    </p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg hover:shadow-indigo-500/25 transition-all">
                            <Plus className="h-4 w-4" /> Create Room
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-background/95 backdrop-blur border-white/10">
                        <DialogHeader>
                            <DialogTitle>Create New Study Room</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Room Name</Label>
                                <Input
                                    placeholder="e.g. Late Night Grind 🌙"
                                    value={newRoomName}
                                    onChange={e => setNewRoomName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Topic (Optional)</Label>
                                <Input
                                    placeholder="e.g. Calculus, Java, General"
                                    value={newRoomTopic}
                                    onChange={e => setNewRoomTopic(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleCreateRoom} className="w-full bg-indigo-600">
                                Launch Room
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedRooms.map((room) => (
                    <Card
                        key={room.id}
                        className={`group relative overflow-hidden border-slate-200 dark:border-white/10 ${room.is_hidden ? 'opacity-50 grayscale' : 'bg-white/50 dark:bg-white/5'} hover:border-indigo-500/50 transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1`}
                        onClick={() => navigate(`/study/rooms/${room.id}`)}
                    >
                        {/* Admin Controls */}
                        {isAdmin && (
                            <div className="absolute top-2 right-2 z-20 flex gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 bg-black/20 hover:bg-black/40 text-white text-xs"
                                    onClick={(e) => toggleHide(e, room)}
                                >
                                    {room.is_hidden ? "Unhide" : "Hide"}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-6 px-2 text-xs"
                                    onClick={(e) => deleteRoom(e, room.id)}
                                >
                                    X
                                </Button>
                            </div>
                        )}

                        {/* Gradient Overlay on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-500" />

                        <CardHeader className="relative">
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/10 mb-3 w-fit">
                                    {getIcon(room.name)}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Live
                                </div>
                            </div>
                            <CardTitle className="text-xl group-hover:text-indigo-400 transition-colors">
                                {room.name} {room.is_hidden && "(Hidden)"}
                            </CardTitle>
                            <CardDescription>{room.topic}</CardDescription>
                        </CardHeader>
                        <CardContent className="relative flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>Join Session</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {rooms.length === 0 && !loading && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl">
                        <Users className="h-12 w-12 mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">No Active Rooms</h3>
                        <p>Be the first to start a study session!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
