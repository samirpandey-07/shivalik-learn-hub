import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useSelection } from '@/contexts/SelectionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Home,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface College {
  id: string;
  name: string;
  location?: string;
  established?: string;
}

interface Course {
  id: string;
  name: string;
  duration?: string;
  seats?: number;
}

interface Year {
  id: string;
  year_number: number;
  total_semesters?: number;
  semester_start?: number;
}

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
    error: selectionError
  } = useSelection();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isEditing = searchParams.get('edit') === 'true';
  const isLoading = authLoading || selectionLoading;

  // Calculate semesters based on selected year
  const availableSemesters = useMemo(() => {
    if (!selectedYear) return [];

    const yearNumber = selectedYear.year_number;
    // Each year typically has 2 semesters
    // Year 1: Sem 1-2, Year 2: Sem 3-4, Year 3: Sem 5-6, Year 4: Sem 7-8
    const startSemester = (yearNumber - 1) * 2 + 1;
    const endSemester = startSemester + 1; // 2 semesters per year

    // If the year data includes total semesters, use that
    const totalSemesters = selectedYear.total_semesters || 2;

    const semesters = [];
    for (let i = 1; i <= totalSemesters; i++) {
      const semesterNumber = (yearNumber - 1) * totalSemesters + i;
      semesters.push({
        number: semesterNumber,
        name: `Semester ${semesterNumber}`,
        isCurrentYear: true
      });
    }

    return semesters;
  }, [selectedYear]);

  // Redirect if already completed onboarding and not editing
  useEffect(() => {
    if (!authLoading && profile?.college_id && !isEditing) {
      navigate('/dashboard', { replace: true });
    }
  }, [profile, authLoading, isEditing, navigate]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Auto-advance logic
  useEffect(() => {
    if (isLoading) return;

    // Auto-advance to course selection if only one course
    if (step === 2 && courses.length === 1 && selectedCollege && !selectedCourse) {
      selectCourse(courses[0]);
      setTimeout(() => setStep(3), 300);
    }

    // Auto-advance to year selection if only one year
    if (step === 3 && years.length === 1 && selectedCourse && !selectedYear) {
      selectYear(years[0]);
      setTimeout(() => setStep(4), 300);
    }
  }, [step, courses, years, selectedCollege, selectedCourse, selectedYear, selectCourse, selectYear, isLoading]);

  // Handle errors
  useEffect(() => {
    if (selectionError) {
      toast.error('Failed to load data. Please try again.');
      setLocalError(selectionError);
    }
  }, [selectionError]);

  const handleCollegeSelect = useCallback((college: College) => {
    selectCollege(college);
    setStep(2);
    setLocalError(null);
  }, [selectCollege]);

  const handleCourseSelect = useCallback((course: Course) => {
    selectCourse(course);
    setStep(3);
    setLocalError(null);
  }, [selectCourse]);

  const handleYearSelect = useCallback((year: Year) => {
    selectYear(year);
    setStep(4);
    setLocalError(null);
  }, [selectYear]);

  const handleSemesterSelect = useCallback((semesterNumber: number) => {
    const semesterName = `Semester ${semesterNumber}`;
    selectSemester(semesterName);
    setLocalError(null);
  }, [selectSemester]);

  const handleComplete = async () => {
    if (!selectedCollege || !selectedCourse || !selectedYear || !selectedSemester) {
      toast.error('Please complete all selections');
      return;
    }

    setIsCompleting(true);
    try {
      await completeOnboarding();
      toast.success('Profile completed successfully!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error('Failed to save profile. Please check your connection and try again.');
      console.error('Onboarding error:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setLocalError(null);
    }
  };

  const handleContinue = () => {
    if (step === 1 && !selectedCollege) {
      toast.error('Please select a college');
      return;
    }
    if (step === 2 && !selectedCourse) {
      toast.error('Please select a course');
      return;
    }
    if (step === 3 && !selectedYear) {
      toast.error('Please select a year');
      return;
    }

    setStep(step + 1);
  };

  const handleCancel = () => {
    if (profile?.college_id) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  // Calculate progress
  const progress = (step / 4) * 100;

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
        {/* Ambient Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

        <div className="text-center relative z-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">Loading onboarding...</p>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  // If user is already onboarded (and not editing), don't show anything
  if (!isEditing && profile?.college_id) {
    return null;
  }

  // If no user but not loading, show nothing (will redirect)
  if (!user && !authLoading) {
    return null;
  }

  const getStepIcon = () => {
    switch (step) {
      case 1: return <Building2 className="h-5 w-5" />;
      case 2: return <BookOpen className="h-5 w-5" />;
      case 3: return <Calendar className="h-5 w-5" />;
      case 4: return <CheckCircle className="h-5 w-5" />;
      default: return <GraduationCap className="h-5 w-5" />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Select Your College';
      case 2: return 'Select Your Course';
      case 3: return 'Select Your Year';
      case 4: return 'Select Semester';
      default: return 'Complete Your Profile';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return 'Choose your college from the list below';
      case 2: return 'Select your course/program';
      case 3: return 'Choose your current academic year';
      case 4: return 'Select your current semester for Year ' + (selectedYear?.year_number || '');
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Ambient Background Effects matching Auth page */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 mb-4 shadow-glow transform hover:scale-105 transition-transform duration-300">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent uppercase tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Select your college, course, and year to get personalized study resources and course materials
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 bg-secondary" indicatorClassName="bg-gradient-to-r from-primary to-purple-600" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span className={`font-medium transition-colors ${step >= 1 ? 'text-primary' : ''}`}>College</span>
            <span className={`font-medium transition-colors ${step >= 2 ? 'text-primary' : ''}`}>Course</span>
            <span className={`font-medium transition-colors ${step >= 3 ? 'text-primary' : ''}`}>Year</span>
            <span className={`font-medium transition-colors ${step >= 4 ? 'text-primary' : ''}`}>Semester</span>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border shadow-soft bg-card/50 backdrop-blur-sm relative z-10 glass-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              {getStepIcon()}
              <div>
                <CardTitle>{getStepTitle()}</CardTitle>
                <CardDescription>{getStepDescription()}</CardDescription>
              </div>
              <Badge className="ml-auto" variant="secondary">
                Step {step} of 4
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            {/* Error Display */}
            {localError && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Error Loading Data</p>
                  <p className="text-sm text-destructive/80">{localError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 border-destructive/20 hover:bg-destructive/10 text-destructive"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {/* Step Content */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading options...</p>
              </div>
            ) : (
              <>
                {/* Step 1: College Selection */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {colleges.map((college) => (
                        <button
                          key={college.id}
                          onClick={() => handleCollegeSelect(college)}
                          className={`p-4 rounded-xl border text-left transition-all hover:shadow-lg duration-300 group ${selectedCollege?.id === college.id
                              ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-glow-sm'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{college.name}</h3>
                              {college.location && (
                                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                  <span>📍</span> {college.location}
                                </p>
                              )}
                              {college.established && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Est. {college.established}
                                </p>
                              )}
                            </div>
                            {selectedCollege?.id === college.id && (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </button>
                      ))}

                      {colleges.length === 0 && !localError && (
                        <div className="col-span-full text-center py-12">
                          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-muted-foreground text-lg mb-2">No colleges available</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Please contact your administrator to add colleges
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => {
                              toast.info('Please contact your college administrator');
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText('college-administrator@example.com');
                                toast.success('Admin email copied to clipboard');
                              }
                            }}
                          >
                            Contact Administrator
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Course Selection */}
                {step === 2 && selectedCollege && (
                  <div className="space-y-6">
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Selected College</p>
                          <p className="font-semibold">{selectedCollege.name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courses.map((course) => (
                        <button
                          key={course.id}
                          onClick={() => handleCourseSelect(course)}
                          className={`p-4 rounded-xl border text-left transition-all hover:shadow-lg duration-300 group ${selectedCourse?.id === course.id
                              ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-glow-sm'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{course.name}</h3>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-muted-foreground">
                                  Duration: {course.duration || '4'} years
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {course.duration ? parseInt(course.duration) * 2 : 8} semesters total
                                </p>
                                {course.seats && (
                                  <p className="text-xs text-muted-foreground">
                                    Seats: {course.seats}
                                  </p>
                                )}
                              </div>
                            </div>
                            {selectedCourse?.id === course.id && (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </button>
                      ))}

                      {courses.length === 0 && !localError && (
                        <div className="col-span-full text-center py-12">
                          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-muted-foreground text-lg mb-2">
                            No courses found for {selectedCollege.name}
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Please contact your administrator to add courses
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => handleBack()}
                          >
                            Back to College Selection
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Year Selection */}
                {step === 3 && selectedCourse && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">College</p>
                            <p className="font-semibold">{selectedCollege?.name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Course</p>
                            <p className="font-semibold">{selectedCourse.name}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {years
                        .filter((year, index, self) =>
                          index === self.findIndex((t) => t.year_number === year.year_number)
                        )
                        .map((year) => (
                          <button
                            key={year.id}
                            onClick={() => handleYearSelect(year)}
                            className={`p-6 rounded-xl border text-center transition-all hover:shadow-lg duration-300 group ${selectedYear?.id === year.id
                                ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-glow-sm'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                              }`}
                          >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 group-hover:scale-110 transition-transform">
                              <span className="text-2xl font-bold text-primary">
                                Y{year.year_number}
                              </span>
                            </div>
                            <h3 className="font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">Year {year.year_number}</h3>
                            <p className="text-sm text-muted-foreground">
                              2 semesters
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Sem {((year.year_number - 1) * 2) + 1}-{year.year_number * 2}
                            </p>
                            {selectedYear?.id === year.id && (
                              <div className="mt-3">
                                <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                              </div>
                            )}
                          </button>
                        ))}

                      {years.length === 0 && !localError && (
                        <div className="col-span-full text-center py-12">
                          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-muted-foreground text-lg mb-2">
                            No years found for {selectedCourse.name}
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Please contact your administrator to add academic years
                          </p>
                          <div className="flex gap-2 justify-center">
                            <Button variant="outline" onClick={handleBack}>
                              Back to Course Selection
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Semester Selection */}
                {step === 4 && selectedYear && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <p className="text-sm font-medium text-muted-foreground">College</p>
                          <p className="font-semibold">{selectedCollege?.name}</p>
                        </div>
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <p className="text-sm font-medium text-muted-foreground">Course</p>
                          <p className="font-semibold">{selectedCourse?.name}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Year</p>
                            <p className="font-semibold">Year {selectedYear.year_number}</p>
                          </div>
                          <Badge variant="outline" className="ml-auto">
                            Semesters {((selectedYear.year_number - 1) * 2) + 1}-{selectedYear.year_number * 2}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-4">
                        Select your current semester for Year {selectedYear.year_number}:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableSemesters.map((semester) => (
                          <button
                            key={semester.number}
                            onClick={() => handleSemesterSelect(semester.number)}
                            className={`p-6 rounded-xl border text-center transition-all duration-300 group ${selectedSemester === semester.name
                                ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20 shadow-glow-sm'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                              }`}
                          >
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3 group-hover:scale-110 transition-transform">
                              <span className="text-xl font-bold">S{semester.number}</span>
                            </div>
                            <span className="font-medium block text-foreground group-hover:text-primary transition-colors">{semester.name}</span>
                            <p className="text-sm text-muted-foreground mt-1">
                              Year {Math.ceil(semester.number / 2)}
                            </p>
                            {selectedSemester === semester.name && (
                              <CheckCircle className="h-5 w-5 text-primary mx-auto mt-3" />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Optional: Show all semesters for context */}
                      {selectedCourse?.duration && parseInt(selectedCourse.duration) > 0 && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                          <p className="text-sm font-medium mb-2">Course Structure:</p>
                          <div className="grid grid-cols-4 md:grid-cols-8 gap-1">
                            {Array.from({ length: parseInt(selectedCourse.duration) * 2 }, (_, i) => i + 1).map((semNum) => {
                              const isAvailable = availableSemesters.some(s => s.number === semNum);
                              const yearNum = Math.ceil(semNum / 2);
                              return (
                                <div
                                  key={semNum}
                                  className={`text-center p-2 rounded ${isAvailable
                                    ? 'bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400'
                                    : 'bg-muted border border-border opacity-50'
                                    }`}
                                >
                                  <div className="text-xs font-medium">S{semNum}</div>
                                  <div className="text-xs text-muted-foreground">Y{yearNum}</div>
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Green boxes show available semesters for Year {selectedYear.year_number}
                          </p>
                        </div>
                      )}
                    </div>

                    {selectedSemester && (
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg animate-in fade-in duration-500">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="font-semibold text-green-700 dark:text-green-400">All set!</p>
                            <p className="text-sm text-green-600/80 dark:text-green-400/80">
                              You'll get personalized resources for {selectedSemester.toLowerCase()} of Year {selectedYear.year_number}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1 || isCompleting}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>

              <div className="flex items-center gap-3">
                {step < 4 ? (
                  <Button
                    onClick={handleContinue}
                    disabled={
                      (step === 1 && !selectedCollege) ||
                      (step === 2 && !selectedCourse) ||
                      (step === 3 && !selectedYear) ||
                      isCompleting
                    }
                    className="gap-2"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    disabled={!selectedSemester || isCompleting}
                    className="gap-2"
                  >
                    {isCompleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Complete Onboarding
                        <CheckCircle className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Can't find your college/course? Contact your college administrator to get it added to the system.
          </p>
          <p className="mt-1 text-xs">
            You can edit these settings later from your profile page
          </p>
        </div>
      </div>
    </div>
  );
}