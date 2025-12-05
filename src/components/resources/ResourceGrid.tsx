import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, Filter } from "lucide-react";
import { ResourceCard } from "./ResourceCard";
import { useResources, useYears } from "@/hooks/useResources";

type SortOption = "recent" | "popular" | "rating";

interface ResourceGridProps {
  collegeId?: string;
  courseId?: string;
  yearId?: string;
  uploaderId?: string;
}

export function ResourceGrid({ collegeId, courseId, yearId, uploaderId }: ResourceGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Filter States (Initialize with props, but allow changing)
  const [filterYearId, setFilterYearId] = useState<string | undefined>(yearId);

  // Fetch available years for the dropdown
  const { years } = useYears(courseId || null);

  const { resources, loading } = useResources({
    collegeId, // Keep college locked for now (usually students don't browse other colleges)
    courseId,  // Keep course locked
    yearId: filterYearId, // Allow changing year
    type: selectedType === "all" ? undefined : selectedType,
    searchTerm: searchTerm || undefined,
    uploaderId
  });

  const resourceTypes = [
    "all",
    "notes",
    "pyq",
    "presentation",
    "link",
    "video",
    "important_questions"
  ];

  // Client-side sorting (since Supabase hook only sorts by created_at)
  const sortedResources = [...resources].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === "popular") {
      return b.downloads - a.downloads;
    }
    if (sortBy === "rating") {
      return b.rating - a.rating;
    }
    return 0;
  });

  // Client-side filtering for Tabs (if not handling type via hook param on tab switch)
  // We can let the Hook handle type filtering if we update selectedType when Tab changes.
  // But standard UI often separates Main Tabs (Categories) from Filters.
  // Let's rely on `activeTab` to filter if it's not "all".

  const displayResources = sortedResources.filter(r => {
    if (activeTab === "all") return true;
    if (activeTab === "media") return r.type === "video" || r.type === "link";
    return r.type === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search & Filter Resources</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative col-span-2 md:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filterYearId || "all"}
              onValueChange={(val) => setFilterYearId(val === "all" ? undefined : val)}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="All Years" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years
                  .filter(
                    (year, index, self) =>
                      index === self.findIndex((y) => y.year_number === year.year_number)
                  )
                  .map((y) => (
                    <SelectItem key={y.id} value={y.id}>
                      Year {y.year_number}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {resourceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "all" ? "All Types" : type.replace("_", " ").toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Downloaded</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="pyq">PYQs</TabsTrigger>
          <TabsTrigger value="presentation">Slides</TabsTrigger>
          <TabsTrigger value="media">Videos/Links</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold capitalize">
              {activeTab === "all" ? "All Resources" : activeTab.replace("_", " ")}
            </h2>
            <Badge variant="secondary">
              {displayResources.length} resources
            </Badge>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : displayResources.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-medium mb-1">No resources found</p>
              <p className="text-sm">
                Try changing filters or search keywords to see more results.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
