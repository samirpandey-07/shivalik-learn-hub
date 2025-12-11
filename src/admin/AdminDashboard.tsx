import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Download, AlertCircle } from "lucide-react";
import { PendingReviews } from "./PendingReviews";
import { Analytics } from "./Analytics";
import { useAdminRealtime } from "@/contexts/AdminRealtimeContext";
import { ResourcesList } from "./ResourcesList";
import { UsersList } from "./UsersList";
import { ReportedResources } from "./ReportedResources";

// ... (existing imports)

// ...

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
      </Tabs >
    </div >
  );
}
