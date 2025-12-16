import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Wrench, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Course {
    id: string;
    name: string;
    college_id: string;
    duration: string; // e.g. "4 years", "3 years"
}

interface Year {
    id: string;
    course_id: string;
    year_number: number;
}

export default function AdminDataRepair() {
    const [loading, setLoading] = useState(true);
    const [fixing, setFixing] = useState<string | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [allYears, setAllYears] = useState<Year[]>([]);
    const [brokenCourses, setBrokenCourses] = useState<Course[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch all courses
            const { data: coursesData, error: coursesError } = await supabase
                .from("courses")
                .select("*")
                .order("name");

            if (coursesError) throw coursesError;

            // 2. Fetch all years
            const { data: yearsData, error: yearsError } = await supabase
                .from("years")
                .select("*");

            if (yearsError) throw yearsError;

            setCourses(coursesData || []);
            setAllYears(yearsData || []);

            // 3. Analyze
            const broken = (coursesData || []).filter(course => {
                const courseYears = (yearsData || []).filter(y => y.course_id === course.id);
                return courseYears.length === 0;
            });

            setBrokenCourses(broken);

        } catch (err: any) {
            toast.error("Failed to fetch data", { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fixCourse = async (course: Course) => {
        setFixing(course.id);
        try {
            // Determine number of years based on duration string if possible, else default to 3 or 4
            let numYears = 3; // Default for BCA, BBA, etc.
            if (course.duration?.toLowerCase().includes("4")) numYears = 4;
            if (course.duration?.toLowerCase().includes("2")) numYears = 2; // MBA, M.Tech

            // Heuristic for B.Tech
            if (course.name.toLowerCase().includes("b.tech") || course.name.toLowerCase().includes("engineering")) {
                numYears = 4;
            }

            const newYears = [];
            for (let i = 1; i <= numYears; i++) {
                // Create semesters for this year
                const startSem = (i - 1) * 2 + 1;
                const endSem = startSem + 1;
                const semesters = [String(startSem), String(endSem)];

                newYears.push({
                    course_id: course.id,
                    year_number: i,
                    semesters: semesters
                });
            }

            const { error } = await supabase
                .from("years")
                .insert(newYears);

            if (error) throw error;

            toast.success(`Fixed ${course.name}`, {
                description: `Generated ${numYears} years for this course.`
            });

            // Refresh list
            await fetchData();

        } catch (err: any) {
            toast.error("Fix Failed", { description: err.message });
        } finally {
            setFixing(null);
        }
    };

    const fixAll = async () => {
        // Sequential fix to avoid rate limits or weirdness
        for (const course of brokenCourses) {
            await fixCourse(course);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-5xl py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Wrench className="h-8 w-8 text-yellow-500" />
                        Database Repair
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Detect and fix missing data relationships (e.g. Courses without Years).
                    </p>
                </div>
                <Button onClick={fetchData} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-6">
                <Card className="border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-900/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                            <AlertTriangle className="h-5 w-5" />
                            Missing Year Data
                        </CardTitle>
                        <CardDescription>
                            The following courses have 0 years defined in the database.
                            Users cannot upload or browse resources for these courses.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {brokenCourses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-green-600 dark:text-green-400">
                                <CheckCircle className="h-12 w-12 mb-2" />
                                <p className="font-medium">All courses have year data!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-4 border-b">
                                    <span className="font-medium">{brokenCourses.length} Courses Found</span>
                                    <Button
                                        variant="default"
                                        onClick={fixAll}
                                        disabled={!!fixing}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                    >
                                        {fixing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wrench className="h-4 w-4 mr-2" />}
                                        Fix All
                                    </Button>
                                </div>

                                <div className="grid gap-3 max-h-[400px] overflow-y-auto">
                                    {brokenCourses.map(course => (
                                        <div
                                            key={course.id}
                                            className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 rounded-lg border shadow-sm"
                                        >
                                            <div>
                                                <p className="font-semibold">{course.name}</p>
                                                <Badge variant="outline" className="text-xs text-muted-foreground mt-1">
                                                    ID: {course.id.slice(0, 8)}...
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-muted-foreground">0 Years</span>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => fixCourse(course)}
                                                    disabled={!!fixing}
                                                >
                                                    {fixing === course.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Generate Years"}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                            <p className="text-sm text-muted-foreground">Total Courses</p>
                            <p className="text-2xl font-bold">{courses.length}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                            <p className="text-sm text-muted-foreground">Total Year Records</p>
                            <p className="text-2xl font-bold">{allYears.length}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                            <p className="text-sm text-muted-foreground">Healthy Courses</p>
                            <p className="text-2xl font-bold text-green-500">{courses.length - brokenCourses.length}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                            <p className="text-sm text-muted-foreground">Broken Courses</p>
                            <p className="text-2xl font-bold text-red-500">{brokenCourses.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
