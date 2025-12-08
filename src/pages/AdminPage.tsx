import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminResourcesTable } from "@/components/admin/AdminResourcesTable";
import { ResourcesList } from "@/admin/ResourcesList";
import { UserManagement } from "@/components/admin/UserManagement";
import { ParticlesBackground } from "@/components/landing/ParticlesBackground";
import { Shield, Users, FileCheck, FileText } from "lucide-react";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const { isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-cyan-500 dark:text-cyan-400" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <ParticlesBackground className="fixed inset-0 pointer-events-none opacity-20 z-0" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield className="h-3 w-3 mr-1" /> Mission Control
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:via-white dark:to-white/70">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage resources, approve launches, and oversee user activity.
          </p>
        </div>
      </div>

      <div className="relative z-10">
        <AdminStats />

        <div className="mb-8">
          <AdminAnalytics />
        </div>

        <Tabs defaultValue="approvals" className="w-full">
          <TabsList className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 rounded-xl mb-6">
            <TabsTrigger value="approvals" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white rounded-lg px-6">
              <FileCheck className="mr-2 h-4 w-4" /> Approvals
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white rounded-lg px-6">
              <FileText className="mr-2 h-4 w-4" /> All Resources
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-violet-500 data-[state=active]:text-white rounded-lg px-6">
              <Users className="mr-2 h-4 w-4" /> User Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="animate-in slide-in-from-bottom-2 fade-in duration-500">
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl">
              <h2 className="text-xl font-semibold text-foreground dark:text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                Pending Launches
              </h2>
              <AdminResourcesTable />
            </div>
          </TabsContent>

          <TabsContent value="resources" className="animate-in slide-in-from-bottom-2 fade-in duration-500">
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl">
              <h2 className="text-xl font-semibold text-foreground dark:text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                Resource Management
              </h2>
              <ResourcesList />
            </div>
          </TabsContent>

          <TabsContent value="users" className="animate-in slide-in-from-bottom-2 fade-in duration-500">
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl">
              <h2 className="text-xl font-semibold text-foreground dark:text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.5)]" />
                User Management
              </h2>
              <UserManagement />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}