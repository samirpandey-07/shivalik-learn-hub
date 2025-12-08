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
  searchQuery?: string;
  typeFilter?: string | null;
  hideFilters?: boolean;
}

export function ResourceGrid({
  collegeId,
  courseId,
  yearId,
  uploaderId,
  searchQuery,
  typeFilter,
  hideFilters = false
}: ResourceGridProps) {
  // Internal state (used if no external props provided, or mixed)
  const [internalSearch, setInternalSearch] = useState("");
  const [internalType, setInternalType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Derive effective values
  const effectiveSearch = searchQuery !== undefined ? searchQuery : internalSearch;
  const effectiveType = typeFilter !== undefined
    ? (typeFilter === null ? 'all' : typeFilter)
    : internalType;

  // Filter States
  const [filterYearId, setFilterYearId] = useState<string | undefined>(yearId);

  // Fetch available years for the dropdown
  const { years } = useYears(courseId || null);

  const { resources, loading } = useResources({
    collegeId,
    courseId,
    yearId: filterYearId,
    type: effectiveType === "all" ? undefined : effectiveType,
    searchTerm: effectiveSearch || undefined,
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

  // Client-side sorting
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

  // Resources to display (Filter by Tab if filters are NOT hidden, because if hidden, tabs are also hidden)
  // If filters are hidden (External control), we assume 'effectiveType' handles the filtering, 
  // so we might not need tab filtering on top, or we just rely on the API response.
  // HOWEVER, the logic below effectively filters by 'activeTab' if tabs are used.
  // If 'hideFilters' is true, 'activeTab' is ignored/default "all".

  const displayResources = sortedResources.filter(r => {
    // If external filters are active (hideFilters=true), we rely on effectiveType which filters the API query.
    // So here we shouldn't double filter unless we want client-side refinement.
    // For safety, if hideFilters is true, we just pass everything (since effectiveType presumably already filtered it from DB side or we want to show what we got)
    if (hideFilters) return true;

    if (activeTab === "all") return true;
    if (activeTab === "media") return r.type === "video" || r.type === "link";
    return r.type === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Filters and Search (Only show if not hidden) */}
      {!hideFilters && (
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
                  value={internalSearch}
                  onChange={(e) => setInternalSearch(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-primary/50"
                />
              </div>

              <Select
                value={filterYearId || "all"}
                onValueChange={(val) => setFilterYearId(val === "all" ? undefined : val)}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-primary/50">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="All Years" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-white/10 text-white">
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

              <Select value={internalType} onValueChange={setInternalType}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-primary/50">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-white/10 text-white">
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
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-primary/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-white/10 text-white">
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Downloaded</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs / Grid Content */}
      {!hideFilters ? (
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
      ) : (
        /* Direct Grid Render for External Control (Browse Page) */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Showing {displayResources.length} results
            </p>
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
        </div>
      )}
    </div>
  );
}
