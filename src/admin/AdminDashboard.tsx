import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Download, AlertCircle } from "lucide-react";
import { PendingReviews } from "./PendingReviews";
import { Analytics } from "./Analytics";
import { useAdminRealtime } from "@/contexts/AdminRealtimeContext";
import { ResourcesList } from "./ResourcesList";
import { UsersList } from "./UsersList";
import { useSearchParams, useNavigate } from "react-router-dom";

export function AdminDashboard() {
  const { stats, loading } = useAdminRealtime();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentTab = searchParams.get("tab") || "pending";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // Stats card component
  const StatsCard = ({
    title,
    value,
    icon: Icon,
    description,
    trend,
    alert,
    loading
  }: {
    title: string;
    value: string | number;
    icon: any;
    description: string;
    trend?: string;
    alert?: boolean;
    loading?: boolean;
  }) => (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${alert ? 'border-orange-500/50 shadow-orange-500/10' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-xl ${alert ? 'bg-orange-500/10 text-orange-600' : 'bg-primary/10 text-primary'}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
        {trend && !loading && (
          <div className="text-xs font-medium text-green-600 mt-1">
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of platform activity and resource management
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Resources"
          value={stats.totalResources}
          icon={FileText}
          description="Across all colleges"
          trend="+12% this week"
          loading={loading}
        />
        <StatsCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          icon={AlertCircle}
          description="Requires attention"
          alert={stats.pendingReviews > 0}
          loading={loading}
        />
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          description="Registered students"
          trend="+48 new users"
          loading={loading}
        />
        <StatsCard
          title="Total Downloads"
          value={stats.totalDownloads}
          icon={Download}
          description="Lifetime downloads"
          trend="+28% this month"
          loading={loading}
        />
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
          <TabsTrigger value="resources">All Resources</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PendingReviews />
        </TabsContent>

        <TabsContent value="resources">
          <ResourcesList />
        </TabsContent>

        <TabsContent value="users">
          <UsersList />
        </TabsContent>

        <TabsContent value="analytics">
          <Analytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
