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
import { Resource } from "@/hooks/useResources";

type SortOption = "recent" | "popular" | "rating";

interface SavedResourceGridProps {
    resources: Resource[];
    loading?: boolean;
}

export function SavedResourceGrid({
    resources,
    loading = false
}: SavedResourceGridProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState<string>("all");
    const [sortBy, setSortBy] = useState<SortOption>("recent");
    const [activeTab, setActiveTab] = useState<string>("all");

    // Client-side filtering logic
    const filteredResources = resources.filter(resource => {
        // 1. Search Query
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchesSearch =
                resource.title.toLowerCase().includes(q) ||
                (resource.description && resource.description.toLowerCase().includes(q)) ||
                resource.subject.toLowerCase().includes(q);

            if (!matchesSearch) return false;
        }

        // 2. Type Filter (Dropdown)
        if (selectedType !== "all" && resource.type !== selectedType) {
            return false;
        }

        // 3. Tab Filter (Categories)
        if (activeTab !== "all") {
            if (activeTab === "media") {
                if (resource.type !== "video" && resource.type !== "link") return false;
            } else {
                if (resource.type !== activeTab) return false;
            }
        }

        return true;
    });

    // Client-side sorting
    const sortedResources = [...filteredResources].sort((a, b) => {
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

    const resourceTypes = [
        "all",
        "notes",
        "pyq",
        "presentation",
        "link",
        "video",
        "important_questions"
    ];

    return (
        <div className="space-y-6">
            {/* Filters and Search */}
            <Card className="shadow-soft bg-white/70 dark:bg-white/5 border-slate-200 dark:border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-foreground dark:text-white">
                        <Search className="h-5 w-5" />
                        <span>Search & Filter Your Collection</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="relative col-span-2 md:col-span-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search saved resources..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground focus-visible:ring-primary/50"
                            />
                        </div>

                        <Select value={selectedType} onValueChange={setSelectedType}>
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
                            value={sortBy}
                            onValueChange={(value) => setSortBy(value as SortOption)}
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

            {/* Tabs / Grid Content */}
            <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
            >
                <TabsList className="grid grid-cols-5 w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-muted-foreground">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm">All</TabsTrigger>
                    <TabsTrigger value="notes" className="data-[state=active]:bg-white dark:data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm">Notes</TabsTrigger>
                    <TabsTrigger value="pyq" className="data-[state=active]:bg-white dark:data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm">PYQs</TabsTrigger>
                    <TabsTrigger value="presentation" className="data-[state=active]:bg-white dark:data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm">Slides</TabsTrigger>
                    <TabsTrigger value="media" className="data-[state=active]:bg-white dark:data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm">Videos/Links</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold capitalize text-foreground dark:text-white">
                            {activeTab === "all" ? "All Saved Resources" : activeTab.replace("_", " ")}
                        </h2>
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-white/10 text-foreground dark:text-white">
                            {sortedResources.length} resources
                        </Badge>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : sortedResources.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10">
                            <p className="text-lg font-medium mb-1">No matching resources found</p>
                            <p className="text-sm">
                                Try adjusting your filters or <span className="text-primary hover:underline cursor-pointer">browse more resources</span>.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {sortedResources.map((resource) => (
                                <ResourceCard key={resource.id} resource={resource} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
