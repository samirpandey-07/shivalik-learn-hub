import { useEffect, useMemo, useState } from "react";
import { BookOpen, Building2, Edit, GraduationCap, Loader2, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type College = {
  id: string;
  name: string;
  location: string | null;
  established: string | null;
};

type Course = {
  id: string;
  college_id: string;
  name: string;
  duration: string | null;
  seats: number | null;
};

type Year = {
  id: string;
  course_id: string;
  year_number: number;
  semesters: string[] | null;
};

type CollegeForm = {
  name: string;
  location: string;
  established: string;
};

type CourseForm = {
  college_id: string;
  name: string;
  duration: string;
  seats: string;
};

type YearForm = {
  course_id: string;
  year_number: string;
  semesters: string;
};

const emptyCollegeForm: CollegeForm = {
  name: "",
  location: "",
  established: "",
};

const emptyCourseForm: CourseForm = {
  college_id: "",
  name: "",
  duration: "",
  seats: "",
};

const emptyYearForm: YearForm = {
  course_id: "",
  year_number: "",
  semesters: "",
};

const commonCourseTemplates = [
  { name: "B.Tech Computer Science", duration: "4 years", seats: 120, years: 4 },
  { name: "B.Tech Mechanical Engineering", duration: "4 years", seats: 120, years: 4 },
  { name: "B.Tech Civil Engineering", duration: "4 years", seats: 120, years: 4 },
  { name: "B.Tech Electrical Engineering", duration: "4 years", seats: 120, years: 4 },
  { name: "B.Tech Electronics and Communication", duration: "4 years", seats: 120, years: 4 },
  { name: "BBA", duration: "3 years", seats: 60, years: 3 },
  { name: "BCA", duration: "3 years", seats: 60, years: 3 },
  { name: "MBA", duration: "2 years", seats: 60, years: 2 },
  { name: "M.Tech", duration: "2 years", seats: 30, years: 2 },
  { name: "Diploma Engineering", duration: "3 years", seats: 60, years: 3 },
];

const parseSemesters = (value: string) =>
  value
    .split(",")
    .map((semester) => semester.trim())
    .filter(Boolean);

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Please check your database permissions and try again.";

export function AdminAcademicsManager() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [collegeForm, setCollegeForm] = useState<CollegeForm>(emptyCollegeForm);
  const [courseForm, setCourseForm] = useState<CourseForm>(emptyCourseForm);
  const [yearForm, setYearForm] = useState<YearForm>(emptyYearForm);
  const [editingCollegeId, setEditingCollegeId] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingYearId, setEditingYearId] = useState<string | null>(null);
  const [selectedTemplateCourses, setSelectedTemplateCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const selectedCollegeCourses = useMemo(
    () => courses.filter((course) => course.college_id === selectedCollegeId),
    [courses, selectedCollegeId],
  );

  const selectedCourseYears = useMemo(
    () => years.filter((year) => year.course_id === selectedCourseId),
    [years, selectedCourseId],
  );

  const collegeNameById = useMemo(
    () => new Map(colleges.map((college) => [college.id, college.name])),
    [colleges],
  );

  const existingCourseNames = useMemo(
    () => new Set(selectedCollegeCourses.map((course) => course.name.trim().toLowerCase())),
    [selectedCollegeCourses],
  );

  const selectedTemplates = useMemo(
    () => commonCourseTemplates.filter((template) => selectedTemplateCourses.includes(template.name)),
    [selectedTemplateCourses],
  );

  const loadAcademics = async (preferred?: { collegeId?: string; courseId?: string }) => {
    setLoading(true);
    try {
      const [collegeResult, courseResult, yearResult] = await Promise.all([
        supabase.from("colleges").select("*").order("name"),
        supabase.from("courses").select("*").order("name"),
        supabase.from("years").select("*").order("year_number"),
      ]);

      if (collegeResult.error) throw collegeResult.error;
      if (courseResult.error) throw courseResult.error;
      if (yearResult.error) throw yearResult.error;

      const nextColleges = (collegeResult.data || []) as College[];
      const nextCourses = (courseResult.data || []) as Course[];
      const nextYears = (yearResult.data || []) as Year[];

      setColleges(nextColleges);
      setCourses(nextCourses);
      setYears(nextYears);

      const nextCollegeId =
        preferred?.collegeId && nextColleges.some((college) => college.id === preferred.collegeId)
          ? preferred.collegeId
          : selectedCollegeId && nextColleges.some((college) => college.id === selectedCollegeId)
            ? selectedCollegeId
          : nextColleges[0]?.id || "";
      setSelectedCollegeId(nextCollegeId);

      const coursePool = nextCourses.filter((course) => course.college_id === nextCollegeId);
      const nextCourseId =
        preferred?.courseId && coursePool.some((course) => course.id === preferred.courseId)
          ? preferred.courseId
          : selectedCourseId && coursePool.some((course) => course.id === selectedCourseId)
            ? selectedCourseId
          : coursePool[0]?.id || "";
      setSelectedCourseId(nextCourseId);
    } catch (error) {
      toast.error("Failed to load academic setup", {
        description: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAcademics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const matchingCourses = courses.filter((course) => course.college_id === selectedCollegeId);
    if (!matchingCourses.some((course) => course.id === selectedCourseId)) {
      setSelectedCourseId(matchingCourses[0]?.id || "");
    }
  }, [courses, selectedCollegeId, selectedCourseId]);

  const resetCollegeForm = () => {
    setCollegeForm(emptyCollegeForm);
    setEditingCollegeId(null);
  };

  const resetCourseForm = (collegeId = selectedCollegeId) => {
    setCourseForm({ ...emptyCourseForm, college_id: collegeId });
    setEditingCourseId(null);
  };

  const resetYearForm = (courseId = selectedCourseId) => {
    setYearForm({ ...emptyYearForm, course_id: courseId });
    setEditingYearId(null);
  };

  const saveCollege = async () => {
    if (!collegeForm.name.trim()) {
      toast.error("Institution name is required");
      return;
    }

    setSaving("college");
    try {
      const payload = {
        name: collegeForm.name.trim(),
        location: collegeForm.location.trim() || null,
        established: collegeForm.established.trim() || null,
      };

      const { data, error } = editingCollegeId
        ? await supabase.from("colleges").update(payload).eq("id", editingCollegeId).select("id").single()
        : await supabase.from("colleges").insert(payload).select("id").single();

      if (error) throw error;
      toast.success(editingCollegeId ? "Institution updated" : "Institution created");
      resetCollegeForm();
      if (data?.id) setSelectedCollegeId(data.id);
      await loadAcademics({ collegeId: data?.id });
    } catch (error) {
      toast.error("Could not save institution", {
        description: getErrorMessage(error),
      });
    } finally {
      setSaving(null);
    }
  };

  const toggleTemplateCourse = (courseName: string) => {
    setSelectedTemplateCourses((current) =>
      current.includes(courseName)
        ? current.filter((name) => name !== courseName)
        : [...current, courseName],
    );
  };

  const addSelectedCommonCourses = async () => {
    if (!selectedCollegeId) {
      toast.error("Create or select an institute first");
      return;
    }

    const templatesToAdd = selectedTemplates.filter(
      (template) => !existingCourseNames.has(template.name.trim().toLowerCase()),
    );

    if (templatesToAdd.length === 0) {
      toast.error("Select at least one new course");
      return;
    }

    setSaving("templates");
    try {
      const { data: insertedCourses, error: coursesError } = await supabase
        .from("courses")
        .insert(
          templatesToAdd.map((template) => ({
            college_id: selectedCollegeId,
            name: template.name,
            duration: template.duration,
            seats: template.seats,
          })),
        )
        .select("id, college_id, name, duration, seats");

      if (coursesError) throw coursesError;

      const yearRows = (insertedCourses || []).flatMap((course) => {
        const template = templatesToAdd.find((item) => item.name === course.name);
        const yearCount = template?.years || 4;

        return Array.from({ length: yearCount }, (_, index) => {
          const yearNumber = index + 1;
          const firstSemester = index * 2 + 1;
          return {
            course_id: course.id,
            year_number: yearNumber,
            semesters: [`Semester ${firstSemester}`, `Semester ${firstSemester + 1}`],
          };
        });
      });

      if (yearRows.length > 0) {
        const { error: yearsError } = await supabase.from("years").insert(yearRows);
        if (yearsError) throw yearsError;
      }

      const firstCourseId = insertedCourses?.[0]?.id;
      toast.success("Courses added", {
        description: `${templatesToAdd.length} course${templatesToAdd.length === 1 ? "" : "s"} added with year and semester setup.`,
      });
      setSelectedTemplateCourses([]);
      if (firstCourseId) setSelectedCourseId(firstCourseId);
      await loadAcademics({ collegeId: selectedCollegeId, courseId: firstCourseId });
    } catch (error) {
      toast.error("Could not add selected courses", {
        description: getErrorMessage(error),
      });
    } finally {
      setSaving(null);
    }
  };

  const saveCourse = async () => {
    if (!courseForm.college_id || !courseForm.name.trim()) {
      toast.error("Select an institution and enter a course name");
      return;
    }

    const parsedSeats = courseForm.seats.trim() ? Number(courseForm.seats) : null;
    if (parsedSeats !== null && (!Number.isInteger(parsedSeats) || parsedSeats < 0)) {
      toast.error("Seats must be a positive whole number");
      return;
    }

    setSaving("course");
    try {
      const payload = {
        college_id: courseForm.college_id,
        name: courseForm.name.trim(),
        duration: courseForm.duration.trim() || null,
        seats: parsedSeats,
      };

      const { data, error } = editingCourseId
        ? await supabase.from("courses").update(payload).eq("id", editingCourseId).select("id").single()
        : await supabase.from("courses").insert(payload).select("id").single();

      if (error) throw error;
      toast.success(editingCourseId ? "Course updated" : "Course created");
      resetCourseForm(courseForm.college_id);
      setSelectedCollegeId(courseForm.college_id);
      if (data?.id) setSelectedCourseId(data.id);
      await loadAcademics();
    } catch (error) {
      toast.error("Could not save course", {
        description: getErrorMessage(error),
      });
    } finally {
      setSaving(null);
    }
  };

  const saveYear = async () => {
    if (!yearForm.course_id || !yearForm.year_number.trim()) {
      toast.error("Select a course and enter a year number");
      return;
    }

    const yearNumber = Number(yearForm.year_number);
    const semesters = parseSemesters(yearForm.semesters);
    if (!Number.isInteger(yearNumber) || yearNumber < 1) {
      toast.error("Year number must be a positive whole number");
      return;
    }
    if (semesters.length === 0) {
      toast.error("Add at least one semester");
      return;
    }

    setSaving("year");
    try {
      const payload = {
        course_id: yearForm.course_id,
        year_number: yearNumber,
        semesters,
      };

      const { data, error } = editingYearId
        ? await supabase.from("years").update(payload).eq("id", editingYearId).select("id").single()
        : await supabase.from("years").insert(payload).select("id").single();

      if (error) throw error;
      toast.success(editingYearId ? "Year updated" : "Year created");
      resetYearForm(yearForm.course_id);
      setSelectedCourseId(yearForm.course_id);
      await loadAcademics();
      if (data?.id) setEditingYearId(null);
    } catch (error) {
      toast.error("Could not save year", {
        description: getErrorMessage(error),
      });
    } finally {
      setSaving(null);
    }
  };

  const deleteRecord = async (table: "colleges" | "courses" | "years", id: string, label: string) => {
    if (!confirm(`Delete this ${label}? This can affect users and resources connected to it.`)) return;

    setSaving(`${table}-${id}`);
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      toast.success(`${label.charAt(0).toUpperCase()}${label.slice(1)} deleted`);
      await loadAcademics();
    } catch (error) {
      toast.error(`Could not delete ${label}`, {
        description: getErrorMessage(error),
      });
    } finally {
      setSaving(null);
    }
  };

  const startCollegeEdit = (college: College) => {
    setEditingCollegeId(college.id);
    setCollegeForm({
      name: college.name,
      location: college.location || "",
      established: college.established || "",
    });
  };

  const startCourseEdit = (course: Course) => {
    setEditingCourseId(course.id);
    setCourseForm({
      college_id: course.college_id,
      name: course.name,
      duration: course.duration || "",
      seats: course.seats?.toString() || "",
    });
  };

  const startYearEdit = (year: Year) => {
    setEditingYearId(year.id);
    setYearForm({
      course_id: year.course_id,
      year_number: year.year_number.toString(),
      semesters: (year.semesters || []).join(", "),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Academic Control</h2>
          <p className="text-sm text-muted-foreground">
            Create an institute, select common courses, and fine-tune special cases only when needed.
          </p>
        </div>
        <Button variant="outline" onClick={loadAcademics} disabled={saving !== null}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-cyan-500" />
              <h3 className="font-semibold">Institution</h3>
            </div>
            {editingCollegeId && (
              <Button variant="ghost" size="sm" onClick={resetCollegeForm}>
                New
              </Button>
            )}
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="college-name">Name</Label>
              <Input
                id="college-name"
                value={collegeForm.name}
                onChange={(event) => setCollegeForm({ ...collegeForm, name: event.target.value })}
                placeholder="Institution name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college-location">Location</Label>
              <Input
                id="college-location"
                value={collegeForm.location}
                onChange={(event) => setCollegeForm({ ...collegeForm, location: event.target.value })}
                placeholder="City, state"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college-established">Established</Label>
              <Input
                id="college-established"
                value={collegeForm.established}
                onChange={(event) => setCollegeForm({ ...collegeForm, established: event.target.value })}
                placeholder="2008"
              />
            </div>
            <Button className="w-full" onClick={saveCollege} disabled={saving === "college"}>
              {saving === "college" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editingCollegeId ? "Update Institution" : "Create Institution"}
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-violet-500" />
                <h3 className="font-semibold">Select Courses</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Add common college courses to {selectedCollegeId ? collegeNameById.get(selectedCollegeId) : "the selected institute"}.
              </p>
            </div>
            <Badge variant="secondary">{selectedTemplateCourses.length} selected</Badge>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {commonCourseTemplates.map((template) => {
              const alreadyAdded = existingCourseNames.has(template.name.trim().toLowerCase());
              const selected = selectedTemplateCourses.includes(template.name);

              return (
                <button
                  key={template.name}
                  type="button"
                  disabled={alreadyAdded || !selectedCollegeId}
                  onClick={() => toggleTemplateCourse(template.name)}
                  className={`min-h-24 rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    selected
                      ? "border-violet-400 bg-violet-50 dark:border-violet-500/50 dark:bg-violet-950/25"
                      : "border-slate-200 bg-background/70 hover:border-violet-300 hover:bg-violet-50/50 dark:border-white/10 dark:bg-white/5 dark:hover:border-violet-500/40 dark:hover:bg-violet-950/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium leading-snug">{template.name}</span>
                    <span className={`mt-0.5 h-4 w-4 shrink-0 rounded border ${selected ? "border-violet-500 bg-violet-500" : "border-slate-300 dark:border-slate-600"}`} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {template.duration} | {template.years * 2} semesters | {template.seats} seats
                  </p>
                  {alreadyAdded && (
                    <Badge variant="outline" className="mt-2">
                      Already added
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Courses are added with default years and semesters automatically.
            </p>
            <Button onClick={addSelectedCommonCourses} disabled={saving === "templates" || selectedTemplates.length === 0 || !selectedCollegeId}>
              {saving === "templates" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Selected Courses
            </Button>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-violet-500" />
              <h3 className="font-semibold">Custom Course</h3>
            </div>
            {editingCourseId && (
              <Button variant="ghost" size="sm" onClick={() => resetCourseForm()}>
                New
              </Button>
            )}
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Institution</Label>
              <Select
                value={courseForm.college_id || selectedCollegeId}
                onValueChange={(value) => {
                  setCourseForm({ ...courseForm, college_id: value });
                  setSelectedCollegeId(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select institution" />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-name">Name</Label>
              <Input
                id="course-name"
                value={courseForm.name}
                onChange={(event) => setCourseForm({ ...courseForm, name: event.target.value })}
                placeholder="B.Tech Computer Science"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="course-duration">Duration</Label>
                <Input
                  id="course-duration"
                  value={courseForm.duration}
                  onChange={(event) => setCourseForm({ ...courseForm, duration: event.target.value })}
                  placeholder="4 years"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-seats">Seats</Label>
                <Input
                  id="course-seats"
                  type="number"
                  min="0"
                  value={courseForm.seats}
                  onChange={(event) => setCourseForm({ ...courseForm, seats: event.target.value })}
                  placeholder="120"
                />
              </div>
            </div>
            <Button className="w-full" onClick={saveCourse} disabled={saving === "course" || colleges.length === 0}>
              {saving === "course" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              {editingCourseId ? "Update Course" : "Create Course"}
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              <h3 className="font-semibold">Years</h3>
            </div>
            {editingYearId && (
              <Button variant="ghost" size="sm" onClick={() => resetYearForm()}>
                New
              </Button>
            )}
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select
                value={yearForm.course_id || selectedCourseId}
                onValueChange={(value) => {
                  setYearForm({ ...yearForm, course_id: value });
                  setSelectedCourseId(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCollegeCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year-number">Year Number</Label>
              <Input
                id="year-number"
                type="number"
                min="1"
                value={yearForm.year_number}
                onChange={(event) => setYearForm({ ...yearForm, year_number: event.target.value })}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year-semesters">Semesters</Label>
              <Textarea
                id="year-semesters"
                value={yearForm.semesters}
                onChange={(event) => setYearForm({ ...yearForm, semesters: event.target.value })}
                placeholder="Semester 1, Semester 2"
              />
            </div>
            <Button className="w-full" onClick={saveYear} disabled={saving === "year" || selectedCollegeCourses.length === 0}>
              {saving === "year" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              {editingYearId ? "Update Year" : "Create Year"}
            </Button>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Institutions</h3>
            <Badge variant="secondary">{colleges.length}</Badge>
          </div>
          <div className="space-y-2">
            {colleges.map((college) => (
              <div
                key={college.id}
                className={`rounded-xl border p-3 transition-colors ${
                  selectedCollegeId === college.id
                    ? "border-cyan-300 bg-cyan-50 dark:border-cyan-500/40 dark:bg-cyan-950/20"
                    : "border-slate-200 bg-background/70 dark:border-white/10 dark:bg-white/5"
                }`}
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setSelectedCollegeId(college.id)}
                >
                  <p className="font-medium">{college.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[college.location, college.established ? `Est. ${college.established}` : null].filter(Boolean).join(" | ") || "No details added"}
                  </p>
                </button>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => startCollegeEdit(college)}>
                    <Edit className="mr-2 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteRecord("colleges", college.id, "institution")}
                    disabled={saving === `colleges-${college.id}`}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold">Courses and Years</h3>
              <p className="text-xs text-muted-foreground">
                {selectedCollegeId ? collegeNameById.get(selectedCollegeId) : "Select an institution"}
              </p>
            </div>
            <Badge variant="secondary">{selectedCollegeCourses.length} courses</Badge>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Years</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedCollegeCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No courses found for this institution.
                  </TableCell>
                </TableRow>
              ) : (
                selectedCollegeCourses.map((course) => {
                  const courseYears = years.filter((year) => year.course_id === course.id);
                  return (
                    <TableRow key={course.id} className={selectedCourseId === course.id ? "bg-muted/40" : ""}>
                      <TableCell>
                        <button
                          type="button"
                          className="text-left font-medium hover:text-cyan-600"
                          onClick={() => setSelectedCourseId(course.id)}
                        >
                          {course.name}
                        </button>
                      </TableCell>
                      <TableCell>{course.duration || "-"}</TableCell>
                      <TableCell>{course.seats ?? "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {courseYears.length === 0 ? (
                            <span className="text-xs text-muted-foreground">No years</span>
                          ) : (
                            courseYears.map((year) => (
                              <Badge key={year.id} variant="outline">
                                Y{year.year_number}: {(year.semesters || []).join(", ")}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => startCourseEdit(course)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteRecord("courses", course.id, "course")}
                            disabled={saving === `courses-${course.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {selectedCourseId && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-background/70 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-medium">Year controls</h4>
                <Badge variant="outline">{selectedCourseYears.length} rows</Badge>
              </div>
              <div className="space-y-2">
                {selectedCourseYears.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No years configured for this course.</p>
                ) : (
                  selectedCourseYears.map((year) => (
                    <div key={year.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 dark:border-white/10 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">Year {year.year_number}</p>
                        <p className="text-xs text-muted-foreground">{(year.semesters || []).join(", ")}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => startYearEdit(year)}>
                          <Edit className="mr-2 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteRecord("years", year.id, "year")}
                          disabled={saving === `years-${year.id}`}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
