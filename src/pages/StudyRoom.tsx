
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Clock, Users, ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "sonner";

// Simple helper for avatar initials
const getInitials = (name: string) => name?.substring(0, 2).toUpperCase() || "??";

export default function StudyRoom() {
    const { id: roomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Room Data
    const [roomName, setRoomName] = useState("Study Room");
    const [users, setUsers] = useState<any[]>([]); // Using 'any' for presence state for now

    // Chat Data
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Timer Data (Shared State)
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');

    // Fetch Room Info & Initial Messages
    useEffect(() => {
        if (!roomId) return;

        const fetchRoomDetails = async () => {
            // Get Room Name
            const { data: roomData } = await supabase.from('study_rooms' as any).select('name').eq('id', roomId).single();
            if (roomData) setRoomName((roomData as any).name);

            // Get Message History (Last 50)
            const { data: msgData } = await supabase
                .from('room_messages' as any)
                .select('*, profiles:user_id(full_name)')
                .eq('room_id', roomId)
                .order('created_at', { ascending: true })
                .limit(50);

            if (msgData) {
                // Map to flatten structure if needed, or keep as is
                setMessages(msgData);
            }
        };

        fetchRoomDetails();
    }, [roomId]);

    // Realtime Subscription
    useEffect(() => {
        if (!roomId || !user) return;

        // Channel for Presence + Broadcast + Postgres Changes
        const channel = supabase.channel(`room:${roomId}`, {
            config: {
                presence: {
                    key: user.id,
                },
            },
        });

        channel
            // 1. Handle Incoming Messages (Database Insert)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'room_messages',
                filter: `room_id=eq.${roomId}`
            }, async (payload) => {
                const newMsg = payload.new;
                // We need to fetch the user name because the payload only has user_id
                // Optimization: In a real app, we might check if we already have this user in presence state
                // For now, let's just cheat and show "User" until we fetch, or fetch quickly.
                const { data: userData } = await supabase.from('profiles').select('full_name').eq('id', newMsg.user_id).single();

                setMessages(prev => [...prev, { ...newMsg, profiles: { full_name: userData?.full_name || 'User' } }]);
                // Scroll to bottom
                setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            })
            // 2. Handle Presence (Who is online)
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState();
                console.log("Presence sync:", newState);
                // Convert object to array
                const onlineUsers: any[] = [];
                for (const key in newState) {
                    onlineUsers.push(newState[key][0]); // usually an array of sessions per user
                }
                setUsers(onlineUsers);
            })
            // 3. Handle Broadcast (Timer Sync)
            .on('broadcast', { event: 'timer_update' }, (evt) => {
                console.log("Timer update received:", evt);
                const payload = evt.payload; // Extract the actual data payload
                if (payload.type === 'start') setIsRunning(true);
                if (payload.type === 'stop') setIsRunning(false);
                if (payload.type === 'reset') {
                    setTimeLeft(payload.mode === 'focus' ? 25 * 60 : 5 * 60);
                    setIsRunning(false);
                    setMode(payload.mode);
                }
                // Sync time occasionally or on specific events? 
                // Creating a true synced timer is hard. Let's just sync state changes.
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Track ourself
                    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
                    await channel.track({
                        user_id: user.id,
                        name: profile?.full_name || 'Anonymous',
                        online_at: new Date().toISOString()
                    });
                }
            });

        return () => {
            channel.unsubscribe();
        };
    }, [roomId, user]);

    // Local Timer Logic 
    // (In a real networked app, only the "leader" should drive this, 
    // but for now anyone can drive it locally and broadcast "Start/Stop" signals)
    useEffect(() => {
        let interval: any;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            // Play sound?
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);


    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        // Optimistic UI update? No, let's rely on Realtime for simplicity in this MVP
        await supabase.from('room_messages' as any).insert({
            room_id: roomId,
            user_id: user?.id,
            message: newMessage
        });
        setNewMessage("");
    };

    const handleTimerAction = async (action: 'start' | 'stop' | 'reset') => {
        if (action === 'start') setIsRunning(true);
        if (action === 'stop') setIsRunning(false);
        if (action === 'reset') {
            setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
            setIsRunning(false);
        }

        // Broadcast to others
        await supabase.channel(`room:${roomId}`).send({
            type: 'broadcast',
            event: 'timer_update',
            payload: { type: action, mode }, // Include mode for reset
        });
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* LEFT: Sidebar (Users) */}
            <div className="w-64 border-r border-border bg-card/50 hidden md:flex flex-col">
                <div className="p-4 border-b border-border flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/study/rooms')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="font-semibold truncate">{roomName}</h2>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Online ({users.length})
                    </h3>
                    <div className="space-y-3">
                        {users.map((u, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                                <Avatar className="h-8 w-8 border border-white/10">
                                    <AvatarImage src="" /> {/* Avatar URL not in presence yet */}
                                    <AvatarFallback className="bg-indigo-500 text-white text-xs">
                                        {getInitials(u.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-sm font-medium">{u.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MIDDLE: Timer & Focus Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                {/* Mobile Header */}
                <div className="md:hidden absolute top-4 left-4">
                    <Button variant="ghost" onClick={() => navigate('/study/rooms')}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Leave
                    </Button>
                </div>

                <div className="text-center space-y-8">
                    <div className="relative">
                        {/* Glowing Ring */}
                        <div className={`absolute inset-0 rounded-full blur-[100px] opacity-20 ${mode === 'focus' ? 'bg-indigo-500' : 'bg-green-500'} animate-pulse`} />

                        <div className="relative z-10 text-[8rem] font-black tabular-nums tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50 drop-shadow-2xl">
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <Button
                            size="lg"
                            className="rounded-full w-16 h-16 p-0 bg-white text-black hover:bg-white/90 hover:scale-110 transition-all"
                            onClick={() => handleTimerAction(isRunning ? 'stop' : 'start')}
                        >
                            {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full w-16 h-16 p-0 border-white/10 hover:bg-white/10"
                            onClick={() => handleTimerAction('reset')}
                        >
                            <RotateCcw className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="flex gap-2 justify-center">
                        <Button
                            variant={mode === 'focus' ? 'secondary' : 'ghost'}
                            onClick={() => { setMode('focus'); setTimeLeft(25 * 60); setIsRunning(false); }}
                            className="rounded-full"
                        >
                            Focus
                        </Button>
                        <Button
                            variant={mode === 'break' ? 'secondary' : 'ghost'}
                            onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsRunning(false); }}
                            className="rounded-full"
                        >
                            Break
                        </Button>
                    </div>
                </div>
            </div>

            {/* RIGHT: Chat */}
            <div className="w-80 border-l border-border bg-card/50 flex flex-col h-full">
                <div className="p-4 border-b border-border font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4 md:hidden" />
                    <span>Live Chat</span>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}>
                                <div className="text-[10px] text-muted-foreground mb-1 px-1">
                                    {msg.user_id === user?.id ? 'You' : msg.profiles?.full_name || 'User'}
                                </div>
                                <div className={`px-3 py-2 rounded-2xl text-sm max-w-[90%] ${msg.user_id === user?.id
                                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                                    : 'bg-slate-100 dark:bg-white/10 text-foreground rounded-tl-sm'
                                    }`}>
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-border bg-background/50 backdrop-blur">
                    <form
                        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                        className="flex gap-2"
                    >
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10"
                        />
                        <Button type="submit" size="icon" className="shrink-0 bg-indigo-600">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
