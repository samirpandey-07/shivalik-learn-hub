import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { BookOpen, Building2, Calendar, CheckCircle2, GraduationCap, Loader2, Search } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { useSelection } from "@/contexts/SelectionContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

type College = {
  id: string;
  name: string;
  location: string | null;
  established: string | null;
};

type Course = {
  id: string;
  name: string;
  duration: string | null;
  seats: number | null;
};

type Year = {
  id: string;
  year_number: number;
  semesters: string[] | null;
};

const yearLabel = (yearNumber: number) => {
  if (yearNumber === 1) return "1st Year";
  if (yearNumber === 2) return "2nd Year";
  if (yearNumber === 3) return "3rd Year";
  return `${yearNumber}th Year`;
};

const getSemesterOptions = (year?: Year | null) => {
  if (!year) return [];
  if (year.semesters?.length) return year.semesters;

  const firstSemester = (year.year_number - 1) * 2 + 1;
  return [`Semester ${firstSemester}`, `Semester ${firstSemester + 1}`];
};

export default function Onboarding() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const {
    colleges,
    courses,
    years,
    selectedCollege,
    selectedCourse,
    selectedYear,
    selectedSemester,
    selectCollege,
    selectCourse,
    selectYear,
    selectSemester,
    completeOnboarding,
    isLoading: selectionLoading,
  } = useSelection();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [collegeSearch, setCollegeSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = searchParams.get("edit") === "true";
  const isLoading = authLoading || (selectionLoading && colleges.length === 0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, navigate, user]);

  useEffect(() => {
    if (!authLoading && profile?.college_id && !isEditing) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, isEditing, navigate, profile?.college_id]);

  useEffect(() => {
    if (selectedYear && !selectedSemester) {
      const [firstSemester] = getSemesterOptions(selectedYear);
      if (firstSemester) selectSemester(firstSemester);
    }
  }, [selectSemester, selectedSemester, selectedYear]);

  const filteredColleges = useMemo(() => {
    const query = collegeSearch.trim().toLowerCase();
    if (!query) return colleges;

    return colleges.filter((college) =>
      [college.name, college.location]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [collegeSearch, colleges]);

  const filteredCourses = useMemo(() => {
    const query = courseSearch.trim().toLowerCase();
    if (!query) return courses;

    return courses.filter((course) =>
      [course.name, course.duration]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [courseSearch, courses]);

  const uniqueYears = useMemo(
    () => years.filter((year, index, list) => index === list.findIndex((item) => item.year_number === year.year_number)),
    [years],
  );

  const semesterOptions = useMemo(() => getSemesterOptions(selectedYear), [selectedYear]);

  const progress = [selectedCollege, selectedCourse, selectedYear, selectedSemester].filter(Boolean).length * 25;
  const canFinish = Boolean(selectedCollege && selectedCourse && selectedYear && selectedSemester);

  const handleCollegeSelect = (college: College) => {
    setCourseSearch("");
    selectCollege(college);
  };

  const handleCourseSelect = (course: Course) => {
    selectCourse(course);
  };

  const handleYearSelect = (year: Year) => {
    selectYear(year);
    const [firstSemester] = getSemesterOptions(year);
    if (firstSemester) selectSemester(firstSemester);
  };

  const handleFinish = async () => {
    if (!canFinish) {
      toast.error("Please select your institute, course, year, and semester.");
      return;
    }

    setSaving(true);
    try {
      await completeOnboarding();
      navigate("/dashboard", { replace: true });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="font-medium">Preparing your setup...</p>
          <p className="text-sm text-muted-foreground">This will only take a moment.</p>
        </div>
      </div>
    );
  }

  if (!user || (!isEditing && profile?.college_id)) return null;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <Badge variant="secondary" className="mb-3">
                First time setup
              </Badge>
              <h1 className="text-3xl font-black tracking-tight text-foreground md:text-5xl">
                Set up your study hub
              </h1>
              <p className="mt-3 text-muted-foreground md:text-lg">
                Pick your institute, course, and current year. We will personalize resources and uploads from this.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5 md:min-w-72">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Profile setup</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="mt-3 text-xs text-muted-foreground">
                Your selection can be changed later from profile settings.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-slate-200 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/5">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-600 dark:text-cyan-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">Institute</h2>
                  <p className="text-xs text-muted-foreground">Start here</p>
                </div>
                {selectedCollege && <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-500" />}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={collegeSearch}
                  onChange={(event) => setCollegeSearch(event.target.value)}
                  placeholder="Search institute..."
                  className="pl-9"
                />
              </div>

              <div className="max-h-[430px] space-y-2 overflow-y-auto pr-1">
                {filteredColleges.map((college) => (
                  <button
                    key={college.id}
                    type="button"
                    onClick={() => handleCollegeSelect(college)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      selectedCollege?.id === college.id
                        ? "border-cyan-400 bg-cyan-50 dark:border-cyan-500/50 dark:bg-cyan-950/25"
                        : "border-slate-200 hover:border-cyan-300 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                    }`}
                  >
                    <p className="font-medium leading-snug">{college.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[college.location, college.established ? `Est. ${college.established}` : null].filter(Boolean).join(" | ") || "Details not added"}
                    </p>
                  </button>
                ))}
                {filteredColleges.length === 0 && (
                  <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No institute found. Ask an admin to add it.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/5">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-violet-500/10 p-2 text-violet-600 dark:text-violet-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">Course</h2>
                  <p className="text-xs text-muted-foreground">{selectedCollege ? selectedCollege.name : "Select institute first"}</p>
                </div>
                {selectedCourse && <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-500" />}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={courseSearch}
                  onChange={(event) => setCourseSearch(event.target.value)}
                  placeholder="Search course..."
                  disabled={!selectedCollege}
                  className="pl-9"
                />
              </div>

              <div className="max-h-[430px] space-y-2 overflow-y-auto pr-1">
                {!selectedCollege ? (
                  <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Choose an institute to see courses.
                  </p>
                ) : selectionLoading && courses.length === 0 ? (
                  <div className="flex items-center justify-center rounded-xl border border-dashed p-6">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No courses found for this institute.
                  </p>
                ) : (
                  filteredCourses.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => handleCourseSelect(course)}
                      className={`w-full rounded-xl border p-3 text-left transition-colors ${
                        selectedCourse?.id === course.id
                          ? "border-violet-400 bg-violet-50 dark:border-violet-500/50 dark:bg-violet-950/25"
                          : "border-slate-200 hover:border-violet-300 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                      }`}
                    >
                      <p className="font-medium leading-snug">{course.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {[course.duration, course.seats ? `${course.seats} seats` : null].filter(Boolean).join(" | ") || "Course details not added"}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/5">
            <CardContent className="space-y-5 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">Year and Semester</h2>
                  <p className="text-xs text-muted-foreground">{selectedCourse ? selectedCourse.name : "Select course first"}</p>
                </div>
                {selectedYear && selectedSemester && <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-500" />}
              </div>

              {!selectedCourse ? (
                <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Choose a course to see academic years.
                </p>
              ) : selectionLoading && years.length === 0 ? (
                <div className="flex items-center justify-center rounded-xl border border-dashed p-6">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : uniqueYears.length === 0 ? (
                <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No years found for this course.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {uniqueYears.map((year) => (
                      <button
                        key={year.id}
                        type="button"
                        onClick={() => handleYearSelect(year)}
                        className={`rounded-xl border p-4 text-center transition-colors ${
                          selectedYear?.id === year.id
                            ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500/50 dark:bg-emerald-950/25"
                            : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                        }`}
                      >
                        <GraduationCap className="mx-auto mb-2 h-5 w-5 text-emerald-500" />
                        <p className="font-medium">{yearLabel(year.year_number)}</p>
                      </button>
                    ))}
                  </div>

                  {selectedYear && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Current semester</p>
                      <div className="grid grid-cols-2 gap-2">
                        {semesterOptions.map((semester) => (
                          <button
                            key={semester}
                            type="button"
                            onClick={() => selectSemester(semester)}
                            className={`rounded-xl border p-3 text-sm transition-colors ${
                              selectedSemester === semester
                                ? "border-emerald-400 bg-emerald-50 font-medium text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-950/25 dark:text-emerald-300"
                                : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                            }`}
                          >
                            {semester}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <footer className="sticky bottom-4 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-950/95">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 text-sm">
              {canFinish ? (
                <p className="truncate font-medium">
                  {selectedCollege?.name} | {selectedCourse?.name} | {yearLabel(selectedYear!.year_number)} | {selectedSemester}
                </p>
              ) : (
                <p className="text-muted-foreground">Complete the three sections above to continue.</p>
              )}
            </div>
            <div className="flex gap-2">
              {isEditing && (
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  Cancel
                </Button>
              )}
              <Button onClick={handleFinish} disabled={!canFinish || saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    Start Learning
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
