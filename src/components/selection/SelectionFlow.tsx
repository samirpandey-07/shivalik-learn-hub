import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  GraduationCap,
  Book,
  Calendar,
  Loader2,
  CheckCircle
} from "lucide-react";
import { supabase } from '@/lib/supabase/client';

interface SelectionFlowProps {
  onSelectionComplete: (selection: {
    collegeId: string;
    collegeName: string;
    courseId: string;
    courseName: string;
    yearId: string;
    yearNumber: number;
  }) => void;
}

export function SelectionFlow({ onSelectionComplete }: SelectionFlowProps) {
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [colleges, setColleges] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  // Smooth scroll refs for better flow UX
  const courseSectionRef = useRef<HTMLDivElement>(null);
  const yearSectionRef = useRef<HTMLDivElement>(null);

  //------------------------------------------------------
  // FETCHERS
  //------------------------------------------------------

  useEffect(() => {
    loadColleges();
  }, []);

  const loadColleges = async () => {
    setLoading(true);
    const { data } = await supabase.from("colleges").select("*");
    if (data) setColleges(data);
    setLoading(false);
  };

  const loadCourses = async (collegeId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("college_id", collegeId);
    setCourses(data || []);
    setLoading(false);

    // Auto-scroll to next section
    setTimeout(() => courseSectionRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
  };

  const loadYears = async (courseId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("years")
      .select("*")
      .eq("course_id", courseId)
      .order("year_number");
    setYears(data || []);
    setLoading(false);

    // Auto-scroll to next section
    setTimeout(() => yearSectionRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
  };

  //------------------------------------------------------
  // HANDLERS
  //------------------------------------------------------

  const handleCollegeSelect = (id: string) => {
    setSelectedCollege(id);
    setSelectedCourse("");
    setSelectedYear("");
    loadCourses(id);
  };

  const handleCourseSelect = (id: string) => {
    setSelectedCourse(id);
    setSelectedYear("");
    loadYears(id);
  };

  const handleFinalSubmit = () => {
    const college = colleges.find((c) => c.id === selectedCollege);
    const course = courses.find((c) => c.id === selectedCourse);
    const year = years.find((y) => y.id === selectedYear);

    if (college && course && year) {
      onSelectionComplete({
        collegeId: college.id,
        collegeName: college.name,
        courseId: course.id,
        courseName: course.name,
        yearId: year.id,
        yearNumber: year.year_number,
      });
    }
  };

  const yearLabel = (n: number) =>
    n === 1 ? "1st Year" : n === 2 ? "2nd Year" : n === 3 ? "3rd Year" : `${n}th Year`;

  //------------------------------------------------------
  // REUSABLE SELECTION GRID
  //------------------------------------------------------

  const SelectGrid = ({
    items,
    selected,
    onSelect,
    children,
  }: {
    items: any[];
    selected: string;
    onSelect: (id: string) => void;
    children: (item: any) => React.ReactNode;
  }) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`cursor-pointer rounded-xl transition-all hover:shadow-md 
          ${selected === item.id
              ? "ring-2 ring-primary bg-primary/5 scale-[1.02]"
              : "hover:bg-muted/50"
            }`}
        >
          <CardContent className="p-4">{children(item)}</CardContent>
        </Card>
      ))}
    </div>
  );

  //------------------------------------------------------
  // PROGRESS STEPPER UI
  //------------------------------------------------------

  const Step = ({
    active,
    label,
    icon: Icon,
  }: {
    active: boolean;
    label: string;
    icon: any;
  }) => (
    <div className={`flex items-center space-x-2 transition-all ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}>
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {active && <CheckCircle className="h-4 w-4 text-primary" />}
    </div>
  );

  //------------------------------------------------------
  // UI
  //------------------------------------------------------

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-12">

      {/* HEADER */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Find Your Study Resources
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose your academic path to unlock curated study materials.
        </p>
      </div>

      {/* PROGRESS STEPPER */}
      <div className="flex justify-center items-center space-x-6 text-sm">
        <Step active={!!selectedCollege} label="College" icon={GraduationCap} />
        <ChevronRight className="text-muted-foreground" />
        <Step active={!!selectedCourse} label="Course" icon={Book} />
        <ChevronRight className="text-muted-foreground" />
        <Step active={!!selectedYear} label="Year" icon={Calendar} />
      </div>

      {/* COLLEGE SELECTION */}
      <Card className="shadow-card animate-fadeIn">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5" />
            <span>Select College</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading && colleges.length === 0 ? (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin h-6 w-6" />
            </div>
          ) : (
            <SelectGrid
              items={colleges}
              selected={selectedCollege}
              onSelect={handleCollegeSelect}
            >
              {(college) => (
                <div className="flex items-center justify-between w-full">
                  <div>
                    <h3 className="font-semibold">{college.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {college.location}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {college.established ? `Est. ${college.established}` : "View"}
                  </Badge>
                </div>
              )}
            </SelectGrid>
          )}
        </CardContent>
      </Card>

      {/* COURSE SELECTION */}
      {selectedCollege && (
        <div ref={courseSectionRef} className="animate-slideUp">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Book className="h-5 w-5" />
                <span>Select Course</span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              {loading && courses.length === 0 ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="animate-spin h-6 w-6" />
                </div>
              ) : (
                <SelectGrid
                  items={courses}
                  selected={selectedCourse}
                  onSelect={handleCourseSelect}
                >
                  {(course) => (
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <h3 className="font-semibold">{course.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {course.duration}
                        </p>
                      </div>
                      <Badge variant="secondary">{course.seats} seats</Badge>
                    </div>
                  )}
                </SelectGrid>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* YEAR SELECTION */}
      {selectedCourse && (
        <div ref={yearSectionRef} className="animate-slideUp">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Select Year</span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              {loading && years.length === 0 ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="animate-spin h-6 w-6" />
                </div>
              ) : (
                <SelectGrid
                  items={years.filter((year, index, self) =>
                    index === self.findIndex((t) => t.year_number === year.year_number)
                  )}
                  selected={selectedYear}
                  onSelect={setSelectedYear}
                >
                  {(year) => (
                    <div className="space-y-2">
                      <h3 className="font-semibold">{yearLabel(year.year_number)}</h3>
                      <div className="flex space-x-2 flex-wrap">
                        {year.semesters?.map((s: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </SelectGrid>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* FINAL ACTION */}
      {selectedYear && (
        <div className="text-center animate-fadeIn">
          <Button
            size="lg"
            onClick={handleFinalSubmit}
            className="px-8 py-3 text-lg bg-gradient-primary rounded-xl"
          >
            Access Resources
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
