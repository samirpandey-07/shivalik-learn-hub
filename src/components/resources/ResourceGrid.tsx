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
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ResourceCard } from "./ResourceCard";
// ... imports
import { useResources, useYears, useGlobalYearNumbers } from "@/hooks/useResources";

type SortOption = "recent" | "popular" | "rating";

interface ResourceGridProps {
  collegeId?: string;
  courseId?: string;
  yearId?: string;
  yearNumber?: number; // New prop for global filtering
  uploaderId?: string;
  searchQuery?: string;
  typeFilter?: string | null;
  subjectFilter?: string | null;
  sortBy?: SortOption;
  hideFilters?: boolean;
}

export function ResourceGrid({
  collegeId,
  courseId,
  yearId,
  yearNumber,
  uploaderId,
  searchQuery,
  typeFilter,
  subjectFilter,
  sortBy: externalSortBy,
  hideFilters = false
}: ResourceGridProps) {
  // Internal state (used if no external props provided, or mixed)
  const [internalSearch, setInternalSearch] = useState("");
  const [internalType, setInternalType] = useState<string>("all");
  const [internalSortBy, setInternalSortBy] = useState<SortOption>("recent");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Filter States
  const [filterYearId, setFilterYearId] = useState<string | undefined>(yearId);
  const [filterYearNumber, setFilterYearNumber] = useState<number | undefined>(yearNumber);

  // Derive effective values
  const effectiveSearch = searchQuery !== undefined ? searchQuery : internalSearch;
  const effectiveType = typeFilter !== undefined
    ? (typeFilter === null ? 'all' : typeFilter)
    : internalType;
  const effectiveSort = externalSortBy || internalSortBy;
  // Use prop yearId if provided
  const effectiveYearId = yearId !== undefined ? yearId : filterYearId;
  const effectiveYearNumber = yearNumber !== undefined ? yearNumber : filterYearNumber;

  // Fetch available years for the dropdown (Context specific)
  const { years } = useYears(courseId || null);
  // Fetch global years for dropdown (Global context)
  const { yearNumbers } = useGlobalYearNumbers();

  const { resources, loading } = useResources({
    collegeId,
    courseId,
    yearId: effectiveYearId,
    yearNumber: effectiveYearNumber,
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

  // ... (sorting logic remains same)
  // Client-side sorting
  const sortedResources = [...resources].sort((a, b) => {
    if (effectiveSort === "recent") {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      const validDateA = isNaN(dateA) ? 0 : dateA;
      const validDateB = isNaN(dateB) ? 0 : dateB;
      return validDateB - validDateA;
    }
    if (effectiveSort === "popular") {
      return (b.downloads || 0) - (a.downloads || 0);
    }
    if (effectiveSort === "rating") {
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0;
  });

  // Resources to display
  const displayResources = sortedResources.filter(r => {
    if (subjectFilter && r.subject !== subjectFilter) {
      return false;
    }
    if (hideFilters) return true;
    if (activeTab === "all") return true;
    if (activeTab === "media") return r.type === "video" || r.type === "link";
    return r.type === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Filters and Search (Only show if not hidden) */}
      {!hideFilters && (
        <Card className="shadow-soft bg-white/70 dark:bg-white/5 border-slate-200 dark:border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-foreground dark:text-white">
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
                  className="pl-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground focus-visible:ring-primary/50"
                />
              </div>

              {/* Year Filter: Toggle between specific years (IDs) or global years (Numbers) */}
              <Select
                value={courseId ? (filterYearId || "all") : (filterYearNumber?.toString() || "all")}
                onValueChange={(val) => {
                  if (courseId) {
                    setFilterYearId(val === "all" ? undefined : val);
                  } else {
                    setFilterYearNumber(val === "all" ? undefined : parseInt(val));
                  }
                }}
              >
                <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-foreground dark:text-white focus:ring-primary/50">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="All Years" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-background dark:bg-slate-950 border-slate-200 dark:border-white/10 text-foreground dark:text-white">
                  <SelectItem value="all">All Years</SelectItem>
                  {courseId ? (
                    // Course Specific Years (with IDs)
                    years
                      .filter((year, index, self) => index === self.findIndex((y) => y.year_number === year.year_number))
                      .map((y) => (
                        <SelectItem key={y.id} value={y.id}>
                          Year {y.year_number}
                        </SelectItem>
                      ))
                  ) : (
                    // Global Year Numbers
                    yearNumbers.map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        Year {num}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <Select value={internalType} onValueChange={setInternalType}>
                <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-foreground dark:text-white focus:ring-primary/50">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-background dark:bg-slate-950 border-slate-200 dark:border-white/10 text-foreground dark:text-white">
                  {resourceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "all" ? "All Types" : type.replace("_", " ").toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={internalSortBy}
                onValueChange={(value) => setInternalSortBy(value as SortOption)}
              >
                <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-foreground dark:text-white focus:ring-primary/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-background dark:bg-slate-950 border-slate-200 dark:border-white/10 text-foreground dark:text-white">
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
                  <ErrorBoundary key={resource.id} componentName={`Card: ${resource.title}`}>
                    <ResourceCard resource={resource} />
                  </ErrorBoundary>
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
                <ErrorBoundary key={resource.id} componentName={`Card: ${resource.title}`}>
                  <ResourceCard resource={resource} />
                </ErrorBoundary>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
