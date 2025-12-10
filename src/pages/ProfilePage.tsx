import { useState } from "react";
import { useAuth } from "@/contexts/useAuth";
import { useSelection } from "@/contexts/SelectionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, Upload, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CoinHistory } from "@/components/gamification/CoinHistory";
import { ResourceGrid } from "@/components/resources/ResourceGrid";
import { useGamification } from "@/hooks/useGamification";
import { BadgeCard } from "@/components/gamification/BadgeCard";

export default function ProfilePage() {
  const { user, profile, roles, updateProfile } = useAuth();
  const { selectedCollege, selectedCourse, selectedYear } = useSelection();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
  });

  const handleSave = async () => {
    try {
      await updateProfile({ full_name: formData.full_name });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const college = selectedCollege;
  const course = selectedCourse;
  const year = selectedYear;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">

      {/* Centered Large Glass Card - Reference Style */}
      <div className="relative w-full max-w-3xl mx-auto mt-8">
        {/* Glow behind the card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#8A4FFF]/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="glass-card rounded-[40px] p-10 neon-border-purple text-center relative z-10 overflow-hidden group bg-white/70 dark:bg-white/5 border-slate-200 dark:border-white/10">

          {/* Ambient inner glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#4CC9F0]/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8A4FFF]/10 blur-[80px] rounded-full pointer-events-none" />

          {/* 1. Profile Picture with Neon Rim */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 rounded-full blur-md bg-gradient-primary opacity-70 animate-pulse-slow"></div>
            <Avatar className="h-32 w-32 border-4 border-[#8A4FFF] shadow-[0_0_30px_rgba(138,79,255,0.6)] relative z-10">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-4xl bg-slate-100 dark:bg-slate-900 text-foreground dark:text-white font-bold">
                {profile?.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            {roles.includes("admin") && (
              <div className="absolute -bottom-2 -right-2 bg-red-500 text-white p-2 rounded-full border-2 border-white dark:border-slate-900 shadow-lg z-20" title="Admin">
                <Shield className="h-5 w-5 fill-current" />
              </div>
            )}
          </div>

          {/* 2. Name and Course */}
          <div className="space-y-2 mb-8">
            <h1 className="text-5xl font-bold text-foreground dark:text-white tracking-tight drop-shadow-md neon-text-glow">
              {profile?.full_name || "User"}
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mb-1">
              {college?.name || "College Not Selected"}
            </p>
            <p className="text-xl text-[#4CC9F0] font-medium tracking-wide shadow-black drop-shadow-sm">
              {course?.name || "Course"} • {year?.year_number ? `Year ${year.year_number}` : "Year"} • {user?.user_metadata?.semester || "Semester"}
            </p>
          </div>

          {/* 3. Progress Bar (Course Completion Simulation) */}
          <div className="max-w-md mx-auto mb-10 text-left">
            <div className="flex justify-between text-sm mb-2 text-muted-foreground dark:text-slate-300 font-medium">
              <span>Course Completion</span>
              <span className="text-[#8A4FFF]">68%</span>
            </div>
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-300 dark:border-white/5">
              <div className="h-full bg-gradient-to-r from-[#4CC9F0] to-[#8A4FFF] w-[68%] shadow-[0_0_15px_rgba(138,79,255,0.5)] rounded-full" />
            </div>
          </div>

          {/* 4. Badges & Achievements Row - Dynamic */}
          <div className="bg-white/50 dark:bg-white/5 rounded-3xl p-6 border border-slate-200 dark:border-white/5 inline-flex gap-4 sm:gap-8 items-center justify-center backdrop-blur-md flex-wrap min-h-[120px]">
            <ProfileBadges userId={user?.id} />
          </div>

        </div>
      </div>

      {/* Tabs for Detailed Info (Secondary) */}
      <Tabs defaultValue="contributions" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-1 mb-8">
          <TabsTrigger value="contributions" className="data-[state=active]:bg-[#8A4FFF] data-[state=active]:text-white rounded-lg">My Contributions</TabsTrigger>
          <TabsTrigger value="coins" className="data-[state=active]:bg-[#4CC9F0] data-[state=active]:text-slate-900 rounded-lg">Coin History</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-foreground dark:data-[state=active]:text-white rounded-lg">Settings & Info</TabsTrigger>
        </TabsList>

        <TabsContent value="contributions" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-foreground dark:text-white">My Uploads</h3>
            <Button onClick={() => navigate("/upload")} className="bg-gradient-primary shadow-[0_0_15px_rgba(138,79,255,0.4)] text-white">
              <Upload className="mr-2 h-4 w-4" /> Upload New
            </Button>
          </div>
          {user && <ResourceGrid uploaderId={user.id} />}
        </TabsContent>

        <TabsContent value="coins">
          <CoinHistory />
        </TabsContent>

        <TabsContent value="settings">
          <Card className="glass-card neon-border-blue max-w-2xl mx-auto bg-white/70 dark:bg-white/5 border-slate-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-foreground dark:text-white">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground dark:text-slate-300">Full Name</Label>
                <div className="flex gap-2">
                  <Input
                    value={isEditing ? formData.full_name : profile?.full_name || ""}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    disabled={!isEditing}
                    className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-foreground dark:text-white focus:border-[#4CC9F0]"
                  />
                  {isEditing ? (
                    <Button onClick={handleSave} className="bg-[#4CC9F0] text-slate-900 hover:bg-[#3db5da]">Save</Button>
                  ) : (
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="border-slate-200 dark:border-white/10 text-foreground dark:text-white hover:bg-slate-100 dark:hover:bg-white/10">
                      Edit
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground dark:text-slate-300">Email</Label>
                <Input value={user?.email || ""} disabled className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-muted-foreground dark:text-slate-400" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileBadges({ userId }: { userId?: string }) {
  const { badges, loading } = useGamification(userId);

  if (loading) return <div className="text-sm text-slate-400">Loading badges...</div>;

  if (badges.length === 0) {
    return (
      <div className="text-center">
        <p className="text-sm text-slate-500">No badges earned yet.</p>
        <p className="text-xs text-slate-400">Upload resources to unlock awards!</p>
      </div>
    );
  }

  return (
    <>
      {badges.map((ub) => (
        <BadgeCard key={ub.badge_id} badge={ub.badge} earned={true} />
      ))}
    </>
  );
}