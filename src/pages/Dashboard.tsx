import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/useAuth";
import { useSelection } from "@/contexts/SelectionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, BookOpen, Star, Coins, User, FileText, PlayCircle, Eye, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useResources } from "@/hooks/useResources";
import { supabase } from "@/lib/supabase/client";
import { useUserActivity } from "@/hooks/useUserActivity";

// Helper for resource icon
const ResourceIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'video': return <PlayCircle className="h-5 w-5 text-[#4CC9F0]" />;
    case 'notes': return <FileText className="h-5 w-5 text-[#8A4FFF]" />;
    default: return <BookOpen className="h-5 w-5 text-white" />;
  }
};

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { selectedCollege, selectedCourse, selectedYear } = useSelection();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    uploadCount: 0,
    avgRating: "0.0",
    totalResources: 0,
  });

  // Fetch recent resources for the user's selection
  const { resources: recentResources, loading } = useResources({
    collegeId: profile?.college_id,
    courseId: profile?.course_id,
    yearId: profile?.year_id,
    type: 'all' // Explicitly fetch all types
  });

  useEffect(() => {
    if (!user?.id) return;

    async function fetchUserStats() {
      // 1. Get Upload Count
      const { count: uploadsQueryCount } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })
        .eq('uploader_id', user.id);

      // 2. Get Average Rating
      const { data: userResources } = await supabase
        .from('resources')
        .select('rating')
        .eq('uploader_id', user.id)
        .not('rating', 'is', null);

      let avg = 0;
      if (userResources && userResources.length > 0) {
        const sum = userResources.reduce((acc, r) => acc + (r.rating || 0), 0);
        avg = sum / userResources.length;
      }

      // 3. Get Total Platform Resources (or Course Resources if preferred)
      const { count: totalCount } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      setStats({
        uploadCount: uploadsQueryCount || 0,
        avgRating: avg.toFixed(1),
        totalResources: totalCount || 0
      });
    }

    fetchUserStats();

    // Real-time subscription for Resources (Uploads, Ratings, etc.)
    const channel = supabase.channel('dashboard-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'resources',
          filter: `uploader_id=eq.${user.id}`
        },
        () => {
          console.log("[Dashboard] Realtime resource update captured, refreshing stats...");
          fetchUserStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-foreground dark:text-white tracking-tight drop-shadow-lg neon-text-glow">
            Welcome back, <span className="text-primary dark:text-[#8A4FFF]">{profile?.full_name?.split(" ")[0] || 'Student'}!</span>
          </h1>
          <p className="text-muted-foreground dark:text-slate-300 mt-2 text-lg">
            Here is an overview of your academic progress.
          </p>
        </div>
      </div>

      {/* 2. Stats Row (4 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Coins */}
        <div className="glass-card p-6 rounded-[24px] neon-border-purple group hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="text-muted-foreground dark:text-slate-400 font-medium">Coins</span>
            <Coins className="h-5 w-5 text-primary dark:text-[#8A4FFF]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-yellow-400 mr-2 text-xl">●</span>
            <h3 className="text-3xl font-bold text-foreground dark:text-white">{profile?.coins || 1000}</h3>
          </div>
        </div>

        {/* Resources */}
        <div className="glass-card p-6 rounded-[24px] neon-border-blue group hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="text-muted-foreground dark:text-slate-400 font-medium">Resources</span>
            <BookOpen className="h-5 w-5 text-secondary dark:text-[#4CC9F0]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-secondary dark:text-[#4CC9F0] mr-2 text-xl">■</span>
            <h3 className="text-3xl font-bold text-foreground dark:text-white">{stats.totalResources}</h3>
          </div>
        </div>

        {/* Uploads */}
        <div className="glass-card p-6 rounded-[24px] neon-border-purple group hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="text-muted-foreground dark:text-slate-400 font-medium">Uploads</span>
            <Upload className="h-5 w-5 text-primary dark:text-[#8A4FFF]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-primary dark:text-[#8A4FFF] mr-2 text-xl">▲</span>
            <h3 className="text-3xl font-bold text-foreground dark:text-white">{stats.uploadCount || 188}</h3>
          </div>
        </div>

        {/* Rating */}
        <div className="glass-card p-6 rounded-[24px] neon-border-blue group hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="text-muted-foreground dark:text-slate-400 font-medium">Rating</span>
            <Star className="h-5 w-5 text-secondary dark:text-[#4CC9F0]" />
          </div>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-bold text-foreground dark:text-white">{stats.avgRating || '4.8'}</h3>
            <div className="flex ml-2">
              {[1, 2, 3, 4].map(i => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
              <Star className="h-3 w-3 text-slate-300 dark:text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: New in Course (Left) & Profile (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">

        {/* Left: New in Your Course */}
        <div className="lg:col-span-2 glass-card rounded-[32px] p-8 border-slate-200 dark:border-white/5">
          <h2 className="text-xl font-bold text-foreground dark:text-white mb-6">New in Your Course</h2>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-white/5 animate-pulse rounded-2xl" />)
            ) : recentResources.length > 0 ? (
              recentResources.slice(0, 3).map((resource) => (
                <div key={resource.id} className="group flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-transparent hover:border-secondary/30 dark:hover:border-[#4CC9F0]/30 transition-all duration-300">
                  {/* Icon Box */}
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 group-hover:shadow-[0_0_15px_rgba(76,201,240,0.3)] transition-shadow`}>
                    <ResourceIcon type={resource.type} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground dark:text-white truncate">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground dark:text-slate-400">{resource.description?.slice(0, 60) || 'No description'}...</p>
                  </div>

                  {/* View Button */}
                  <Button
                    onClick={() => navigate(`/resource/${resource.id}`)}
                    variant="outline"
                    className="rounded-full border-secondary/50 dark:border-[#4CC9F0]/50 text-secondary dark:text-[#4CC9F0] hover:bg-secondary/10 dark:hover:bg-[#4CC9F0]/10 hover:text-foreground dark:hover:text-white px-6 shadow-[0_0_10px_rgba(76,201,240,0.1)] hover:shadow-[0_0_15px_rgba(76,201,240,0.4)] transition-all"
                  >
                    View
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">No new resources found.</div>
            )}
          </div>
        </div>

        {/* Right: Academic Profile */}
        <div className="glass-card rounded-[32px] p-8 border-slate-200 dark:border-white/5 flex flex-col justify-between h-[400px]">
          <div>
            <h2 className="text-xl font-bold text-foreground dark:text-white mb-6">Academic Profile</h2>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground dark:text-slate-400 mb-1">Name</p>
                <p className="text-lg font-semibold text-foreground dark:text-white">{profile?.full_name || 'Anonymous'}</p>
                <div className="h-[1px] w-full bg-slate-200 dark:bg-white/10 mt-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground dark:text-slate-400 mb-1">College</p>
                <p className="text-lg font-semibold text-foreground dark:text-white truncate">{selectedCollege?.name || 'Not Selected'}</p>
                <div className="h-[1px] w-full bg-slate-200 dark:bg-white/10 mt-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground dark:text-slate-400 mb-1">Course</p>
                <p className="text-lg font-semibold text-foreground dark:text-white">{selectedCourse?.name || 'Not Selected'}</p>
              </div>
            </div>
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90 dark:bg-[#8A4FFF] dark:hover:bg-[#7b46e5] text-white rounded-xl py-6 text-lg font-semibold shadow-[0_0_20px_rgba(138,79,255,0.4)] hover:shadow-[0_0_30px_rgba(138,79,255,0.6)] transition-all">
            View Full Profile
          </Button>
        </div>

      </div>
    </div>
  );
}