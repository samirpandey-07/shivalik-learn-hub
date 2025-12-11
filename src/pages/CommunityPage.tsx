
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MoreVertical, Users, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function CommunityPage() {
    const { id } = useParams();
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [community, setCommunity] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [membersCount, setMembersCount] = useState(0);
    const [newPost, setNewPost] = useState("");
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (id) {
            fetchDetails();
            const channel = setupRealtime();
            return () => { supabase.removeChannel(channel); };
        }
    }, [id]);

    const setupRealtime = () => {
        const channel = supabase.channel(`community-${id}`)
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'community_posts' }, // Removed filter for debugging/robustness
                (payload) => {
                    const newMsg = payload.new;
                    console.log("Realtime msg received:", newMsg);

                    // Client-side filter
                    if (newMsg.community_id !== id) return;

                    // Prevent duplicate if we optimistically added it
                    if (newMsg.user_id !== user?.id) {
                        fetchSenderProfile(newMsg);
                    }
                }
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'community_members', filter: `community_id=eq.${id}` },
                () => {
                    // Refresh members on any change
                    fetchMembers();
                }
            )
            .subscribe((status) => {
                console.log("Realtime connection status:", status);
                if (status === "SUBSCRIBED") {
                    // toast.success("Connected to live chat");
                }
                if (status === "CHANNEL_ERROR") {
                    console.error("Realtime channel error");
                    toast.error("Live chat connection issue. Reconnecting...");
                }
            });
        return channel;
    };

    const fetchSenderProfile = async (msg: any) => {
        try {
            const { data, error } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', msg.user_id).single();

            if (error) {
                // Profile fetch failure shouldn't break the UI, just log it. 
                // Using a fallback "Unknown User" is better than an alert.
                console.warn("Sender profile fetch failed:", error);
            }

            // Always add the post, even if profile missing (fallback)
            const profileData = data || { full_name: 'Unknown User', avatar_url: null };
            setPosts(prev => [{ ...msg, profiles: profileData }, ...prev]);

        } catch (err) {
            console.error("Exception in fetchSenderProfile:", err);
            // Fallback
            setPosts(prev => [{ ...msg, profiles: { full_name: 'Unknown User', avatar_url: null } }, ...prev]);
        }
    };

    const fetchMembers = async () => {
        try {
            // 1. Get exact count and IDs first (No joins)
            const { data: memberData, count, error } = await supabase
                .from('community_members' as any)
                .select('user_id', { count: 'exact' })
                .eq('community_id', id)
                .limit(50); // Increased limit

            if (error) {
                throw error;
            }

            if (count !== null) setMembersCount(count);

            if (!memberData || memberData.length === 0) {
                setMembers([]);
                return;
            }

            // 2. Fetch Profiles
            const userIds = memberData.map((d: any) => d.user_id);
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', userIds);

            // 3. Merge
            const profileMap = new Map(profiles?.map(p => [p.id, p]));
            const flatMembers = memberData.map((d: any) => ({
                user_id: d.user_id,
                ...(profileMap.get(d.user_id) || { full_name: 'Unknown Member', avatar_url: null })
            }));

            setMembers(flatMembers);

        } catch (error) {
            console.error("Error fetching members", error);
            toast.error("Failed to load members list");
        }
    };

    const fetchDetails = async () => {
        try {
            // 1. Community Info
            const { data: com, error: comError } = await supabase.from('communities' as any).select('*').eq('id', id).single();
            if (comError) throw comError;
            setCommunity(com);

            // 2. Members
            fetchMembers();

            // 3. Posts (Fetch raw first to ensure we get data)
            console.log("Fetching posts for community:", id);
            const { data: rawPosts, error: postError } = await supabase
                .from('community_posts' as any)
                .select('*')
                .eq('community_id', id)
                .order('created_at', { ascending: false });

            if (postError) {
                throw postError;
            }

            console.log("Raw posts fetched:", rawPosts?.length);

            if (!rawPosts || rawPosts.length === 0) {
                setPosts([]);
                return;
            }

            // 4. Fetch Profiles manually
            const userIds = Array.from(new Set(rawPosts.map((p: any) => p.user_id)));
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', userIds);

            // 5. Merge
            const profileMap = new Map(profiles?.map(p => [p.id, p]));

            const mergedPosts = rawPosts.map((p: any) => ({
                ...p,
                profiles: profileMap.get(p.user_id) || { full_name: 'Unknown User', avatar_url: null }
            }));

            setPosts(mergedPosts);

        } catch (error) {
            console.error(error);
            toast.error("Failed to load community details. Please try refreshing.");
        } finally {
            setLoading(false);
        }
    };

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        const optimId = Math.random().toString();
        const content = newPost;

        // Optimistic Update
        const optimisticMsg = {
            id: optimId,
            content: content,
            user_id: user?.id,
            created_at: new Date().toISOString(),
            profiles: {
                full_name: profile?.full_name,
                avatar_url: profile?.avatar_url
            }
        };

        setPosts(prev => [optimisticMsg, ...prev]);
        setNewPost("");

        try {
            const { data, error } = await supabase
                .from('community_posts' as any)
                .insert({
                    community_id: id,
                    user_id: user?.id,
                    content: content
                })
                .select()
                .single();

            if (error) throw error;

            // Update the optimistic message with real ID (optional, or just leave it)
            setPosts(prev => prev.map(p => p.id === optimId ? { ...p, id: data.id } : p));

        } catch (error) {
            toast.error("Failed to post");
            // Revert optimistic
            setPosts(prev => prev.filter(p => p.id !== optimId));
            setNewPost(content); // Put text back
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!community) return <div className="p-10 text-center">Community not found</div>;

    return (
        <div className="container mx-auto max-w-5xl h-[calc(100vh-100px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-t-2xl">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-3xl shadow-lg">
                    {community.icon}
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{community.name}</h1>
                    <p className="text-muted-foreground">{community.description}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" /> {membersCount} Members
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex overflow-hidden rounded-b-2xl border border-t-0 border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5">
                {/* Posts Feed */}
                <div className="flex-1 flex flex-col">
                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-6 max-w-3xl mx-auto pb-10">
                            {posts.length === 0 && (
                                <div className="text-center py-20 opacity-50">
                                    <MessageSquare className="h-12 w-12 mx-auto mb-2" />
                                    <p>No posts yet. Start the conversation!</p>
                                </div>
                            )}
                            {posts.map(post => (
                                <div key={post.id} className="flex gap-4 group">
                                    <Avatar className="h-10 w-10 border border-slate-200 dark:border-white/10">
                                        <AvatarImage src={post.profiles?.avatar_url} />
                                        <AvatarFallback>{post.profiles?.full_name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">{post.profiles?.full_name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-white dark:bg-white/5 rounded-r-xl rounded-bl-xl text-sm leading-relaxed border border-slate-200 dark:border-white/5 group-hover:border-slate-300 dark:group-hover:border-white/10 transition-colors shadow-sm dark:shadow-none">
                                            {post.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
                        <form onSubmit={handlePost} className="max-w-3xl mx-auto flex gap-2">
                            <Input
                                placeholder={`Message #${community.name}...`}
                                value={newPost}
                                onChange={e => setNewPost(e.target.value)}
                                className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 focus-visible:ring-orange-500"
                            />
                            <Button type="submit" size="icon" className="bg-orange-600 hover:bg-orange-700">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Sidebar (Members) - Hidden on mobile */}
                <div className="w-64 border-l border-slate-200 dark:border-white/10 p-4 hidden lg:block bg-slate-50 dark:bg-black/10">
                    <h3 className="font-semibold mb-4 text-sm uppercase text-muted-foreground tracking-wider">Members</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-4 bg-white dark:bg-white/5 p-2 rounded-lg border border-slate-100 dark:border-transparent cursor-default shadow-sm dark:shadow-none">
                            <Avatar className="h-8 w-8 border border-slate-200 dark:border-white/10"><AvatarFallback>ME</AvatarFallback><AvatarImage src={profile?.avatar_url} /></Avatar>
                            <span className="text-sm font-medium truncat cursor-default">You</span>
                        </div>

                        {members.filter(m => m.user_id !== user?.id).map((member) => (
                            <div key={member.user_id} className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                                <Avatar className="h-8 w-8 border border-slate-200 dark:border-white/10">
                                    <AvatarImage src={member.avatar_url} />
                                    <AvatarFallback>{member.full_name?.[0] || '?'}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm truncate max-w-[150px]">{member.full_name || 'Anonymous'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
