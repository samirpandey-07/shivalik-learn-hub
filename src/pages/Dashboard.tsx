import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/useAuth";
import { useSelection } from "@/contexts/SelectionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, BookOpen, Star, Clock, Coins, Bookmark, History } from "lucide-react";
import { Link } from "react-router-dom";
import { useResources } from "@/hooks/useResources";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { supabase } from "@/lib/supabase/client";
import { useUserActivity } from "@/hooks/useUserActivity";
import { useSavedResources } from "@/hooks/useSavedResources";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { selectedCollege, selectedCourse, selectedYear } = useSelection();

  const { recentActivity } = useUserActivity();
  const { savedResources } = useSavedResources();

  const [stats, setStats] = useState({
    uploadCount: 0,
    avgRating: "0.0",
    streak: 0
  });

  // Fetch recent resources for the user's selection
  const { resources: recentResources, loading } = useResources({
    collegeId: profile?.college_id,
    courseId: profile?.course_id,
    yearId: profile?.year_id
  });

  useEffect(() => {
    if (!user?.id) return;

    async function fetchUserStats() {
      // 1. Get Upload Count
      const { count } = await supabase
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

      setStats({
        uploadCount: count || 0,
        avgRating: avg.toFixed(1),
        streak: 5
      });
    }

    fetchUserStats();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Welcome back, {profile?.full_name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening in your course today.
          </p>
        </div>
        <Link to="/upload">
          <Button className="bg-gradient-primary shadow-lg hover:shadow-xl transition-all">
            <Upload className="h-4 w-4 mr-2" />
            Upload Resource
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-yellow-500/5 border-yellow-500/10">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Coins className="h-8 w-8 text-yellow-500 mb-2" />
            <h3 className="text-2xl font-bold">{profile?.coins || 0}</h3>
            <p className="text-xs text-muted-foreground">Total Coins</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <BookOpen className="h-8 w-8 text-primary mb-2" />
            <h3 className="text-2xl font-bold">{recentResources.length}</h3>
            <p className="text-xs text-muted-foreground">New Resources</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/5 border-orange-500/10">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Upload className="h-8 w-8 text-orange-600 mb-2" />
            <h3 className="text-2xl font-bold">{stats.uploadCount}</h3>
            <p className="text-xs text-muted-foreground">Your Uploads</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/10">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Star className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="text-2xl font-bold">{stats.avgRating}</h3>
            <p className="text-xs text-muted-foreground">Average Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Recently Viewed (History) */}
      {recentActivity.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Recently Viewed
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="min-w-[300px]">
                {activity.resource && <ResourceCard resource={activity.resource} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved Resources */}
      {savedResources.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" />
              Saved Resources
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedResources.slice(0, 3).map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Resources (General) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            New in Your Course
          </h2>
          <Link to="/browse">
            <Button variant="ghost" className="text-primary">
              View All
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-[200px] animate-pulse bg-muted/50" />
            ))}
          </div>
        ) : recentResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentResources.slice(0, 3).map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-muted-foreground bg-muted/30 border-dashed">
            <p>No resources found for your course yet.</p>
            <Link to="/upload" className="text-primary hover:underline mt-2 inline-block">
              Be the first to upload!
            </Link>
          </Card>
        )}
      </div>

      {/* Your College Selection Info */}
      {profile && (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">Your Academic Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="px-3 py-1 text-sm">
                {selectedCollege?.name || "College not loaded"}
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/5 border-primary/20">
                {selectedCourse?.name || "Course"}
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/5 border-primary/20">
                Year {selectedYear?.year_number || user?.user_metadata?.course_year}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}