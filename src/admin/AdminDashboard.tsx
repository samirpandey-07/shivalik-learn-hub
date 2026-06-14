import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PendingReviews } from "./PendingReviews";
import { Analytics } from "./Analytics";
import { ResourcesList } from "./ResourcesList";
import { UsersList } from "./UsersList";
import { ReportedResources } from "./ReportedResources";
import { CommunityAudit } from "./CommunityAudit";

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
          <TabsTrigger value="resources">All Resources</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="communities">Audit Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PendingReviews />
        </TabsContent>

        <TabsContent value="resources">
          <ResourcesList />
        </TabsContent>

        <TabsContent value="reports">
          <ReportedResources />
        </TabsContent>

        <TabsContent value="users">
          <UsersList />
        </TabsContent>

        <TabsContent value="communities">
          <CommunityAudit />
        </TabsContent>

        <TabsContent value="analytics">
          <Analytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminDashboard;
