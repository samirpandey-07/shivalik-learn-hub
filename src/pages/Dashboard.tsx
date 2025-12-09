import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/useAuth";
import { useSelection } from "@/contexts/SelectionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, BookOpen, Star, Coins, User, FileText, PlayCircle, Eye, ArrowRight, TrendingUp, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useResources } from "@/hooks/useResources";
import { supabase } from "@/lib/supabase/client";
import { useUserActivity } from "@/hooks/useUserActivity";
import { LeaderboardWidget } from "@/components/gamification/LeaderboardWidget";
import { MissionTracker } from "@/components/gamification/MissionTracker";
import { SeasonProgress } from "@/components/gamification/SeasonProgress";
import { RecommendedSection } from "@/components/personalization/RecommendedSection";

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
      <SeasonProgress />
      <RecommendedSection />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(120px,auto)]">

        {/* 1. Welcome Card (Top Left - Large 2x2) */}
        <div className="col-span-1 md:col-span-2 row-span-2 rounded-[32px] border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg relative overflow-hidden group p-8 flex flex-col justify-between">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 opacity-100" />
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
              Welcome back,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                {profile?.full_name?.split(" ")[0] || 'Student'}!
              </span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg max-w-md">
              You're doing great! Here is an overview of your academic progress and new resources.
            </p>
          </div>
          <div className="relative z-10 mt-6">
            <Button
              onClick={() => navigate('/browse')}
              className="rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform shadow-lg px-8"
            >
              Start Learning <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          {/* Decorative Element */}
          <div className="absolute right-[-20px] bottom-[-20px] opacity-20 dark:opacity-10 pointer-events-none">
            <Coins className="h-64 w-64 text-indigo-500" />
          </div>
        </div>

        {/* 2. Stats Grid (Right Side - 2x2 Area) */}

        {/* Coins */}
        <div className="col-span-1 md:col-span-1 row-span-1 rounded-[24px] border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-md hover:shadow-lg transition-all p-6 flex flex-col justify-between group decoration-none">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Coins</span>
            <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{profile?.coins || 1000}</h3>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +50 this week
            </p>
          </div>
        </div>

        {/* Resources */}
        <div className="col-span-1 md:col-span-1 row-span-1 rounded-[24px] border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-md hover:shadow-lg transition-all p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Resources</span>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalResources}</h3>
        </div>

        {/* Uploads */}
        <div className="col-span-1 md:col-span-1 row-span-1 rounded-[24px] border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-md hover:shadow-lg transition-all p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Uploads</span>
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Upload className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.uploadCount || 0}</h3>
        </div>

        {/* Rating */}
        <div className="col-span-1 md:col-span-1 row-span-1 rounded-[24px] border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-md hover:shadow-lg transition-all p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Rating</span>
            <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Star className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.avgRating || '0.0'}</h3>
            <div className="flex mb-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        </div>


        {/* 3. New in Course (Bottom Left - Wide 2 cols) */}
        <div className="col-span-1 md:col-span-2 row-span-2 rounded-[32px] border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" /> New in Your Course
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/browse')} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">View All</Button>
          </div>

          <div className="flex flex-col gap-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-white/5 animate-pulse rounded-2xl" />)
            ) : recentResources.length > 0 ? (
              recentResources.slice(0, 3).map((resource) => (
                <div key={resource.id} onClick={() => navigate(`/resource/${resource.id}`)} className="group cursor-pointer rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-indigo-500/30 hover:shadow-md transition-all p-4 flex items-center gap-4">
                  <div className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 group-hover:scale-110 transition-transform`}>
                    <ResourceIcon type={resource.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-white/50 dark:bg-white/5 border-0 text-[10px] h-5">
                        {resource.subject || 'General'}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{resource.title}</h3>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No new resources found yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Mission Tracker (Bottom Middle - 1 col) */}
        <div className="col-span-1 md:col-span-1 row-span-2">
          <MissionTracker />
        </div>

        {/* 5. Leaderboard (Bottom Right - 1 col) */}
        <div className="col-span-1 md:col-span-1 row-span-2 rounded-[32px] border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg p-6 flex flex-col relative overflow-hidden">
          <LeaderboardWidget />
        </div>
      </div>
    </div>
  );
}