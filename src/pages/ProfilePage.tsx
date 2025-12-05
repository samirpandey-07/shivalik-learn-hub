import { useState } from "react";
import { useAuth } from "@/contexts/useAuth";
import { useSelection } from "@/contexts/SelectionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, School, BookOpen, Calendar, Shield, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CoinHistory } from "@/components/gamification/CoinHistory";
import { ResourceGrid } from "@/components/resources/ResourceGrid";

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

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Resolve academic info (prefer context selection, fallback to profile metadata)
  const college = selectedCollege; // In a real app, we might need to fetch by ID if context is empty
  const course = selectedCourse;
  const year = selectedYear;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 border-2 border-primary/10">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback className="text-xl bg-primary/5 text-primary">
            {getInitials(profile?.full_name || user?.email || "U")}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{profile?.full_name || "User"}</h1>
          <p className="text-muted-foreground">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            {roles.includes("admin") && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Student
            </span>
            {/* Coin Badge */}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
              <Coins className="w-3 h-3 mr-1 fill-yellow-500" />
              {profile?.coins || 0} Coins
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="contributions">My Contributions</TabsTrigger>
          <TabsTrigger value="coins">Coin History</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Manage your personal details and account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="flex gap-2">
                  <Input
                    value={isEditing ? formData.full_name : profile?.full_name || ""}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    disabled={!isEditing}
                  />
                  {isEditing ? (
                    <Button onClick={handleSave}>Save</Button>
                  ) : (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle>Academic Details</CardTitle>
              <CardDescription>
                Your current academic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>College</Label>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {college?.name || "Not selected"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Course</Label>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {course?.name || "Not selected"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    Year {year?.year_number || user?.user_metadata?.course_year || "Not selected"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {user?.user_metadata?.semester ? `Semester ${user.user_metadata.semester}` : "Not selected"}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button variant="outline" onClick={() => navigate("/onboarding?edit=true")}>
                  Edit Academic Info
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributions">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">My Contributions</h2>
            <p className="text-muted-foreground">Resources you have uploaded to the community.</p>
            {user && <ResourceGrid uploaderId={user.id} />}
          </div>
        </TabsContent>

        <TabsContent value="coins">
          <CoinHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}