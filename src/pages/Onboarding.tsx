import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useSelection } from '@/contexts/SelectionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, GraduationCap, Building2, BookOpen, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Onboarding() {
  const { user, profile } = useAuth();
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
    isLoading
  } = useSelection();

  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Redirect if already completed onboarding
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isEditing = searchParams.get('edit') === 'true';

    if (profile?.college_id && !isEditing) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleCollegeSelect = (college: any) => {
    selectCollege(college);
    setStep(2);
  };

  const handleCourseSelect = (course: any) => {
    selectCourse(course);
    setStep(3);
  };

  const handleYearSelect = (year: any) => {
    selectYear(year);
    setStep(4);
  };

  const handleSemesterSelect = (semester: string) => {
    selectSemester(semester);
  };

  const handleComplete = async () => {
    await completeOnboarding();
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Calculate progress
  const progress = (step / 4) * 100;

  // Common semesters
  const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 mb-4">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Select your college, course, and year to get personalized study resources
          </p>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>College</span>
            <span>Course</span>
            <span>Year</span>
            <span>Semester</span>
          </div>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 1 && <Building2 className="h-5 w-5" />}
              {step === 2 && <BookOpen className="h-5 w-5" />}
              {step === 3 && <Calendar className="h-5 w-5" />}
              {step === 4 && <CheckCircle className="h-5 w-5" />}
              {step === 1 && 'Select Your College'}
              {step === 2 && 'Select Your Course'}
              {step === 3 && 'Select Your Year'}
              {step === 4 && 'Select Semester'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Choose your college from the list below'}
              {step === 2 && 'Select your course/program'}
              {step === 3 && 'Choose your current academic year'}
              {step === 4 && 'Select your current semester'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading options...</p>
              </div>
            ) : (
              <>
                {/* Step 1: College Selection */}
                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {colleges.map((college) => (
                      <button
                        key={college.id}
                        onClick={() => handleCollegeSelect(college)}
                        className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${selectedCollege?.id === college.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Building2 className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{college.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {college.location || 'Location not specified'}
                            </p>
                            {college.established && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Est. {college.established}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}

                    {colleges.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <p className="text-muted-foreground">No colleges found</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => toast.info('Contact admin to add your college')}
                        >
                          Request College Addition
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Course Selection */}
                {step === 2 && selectedCollege && (
                  <div>
                    <div className="mb-6 p-4 bg-primary/5 rounded-lg flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Selected College</p>
                        <p className="font-semibold">{selectedCollege.name}</p>
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        Step 1/4
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courses.map((course) => (
                        <button
                          key={course.id}
                          onClick={() => handleCourseSelect(course)}
                          className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${selectedCourse?.id === course.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary/50'
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{course.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Duration: {course.duration || '4'} years
                              </p>
                              {course.seats && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Seats: {course.seats}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}

                      {courses.length === 0 && (
                        <div className="col-span-full text-center py-12">
                          <p className="text-muted-foreground">No courses found for this college</p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => toast.info('Contact admin to add courses for this college')}
                          >
                            Request Course Addition
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Year Selection */}
                {step === 3 && selectedCourse && (
                  <div>
                    <div className="space-y-4 mb-6">
                      <div className="p-4 bg-primary/5 rounded-lg flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">College</p>
                          <p className="font-semibold">{selectedCollege?.name}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-primary/5 rounded-lg flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Course</p>
                          <p className="font-semibold">{selectedCourse.name}</p>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          Step 2/4
                        </Badge>
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
                            className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${selectedYear?.id === year.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-primary/50'
                              }`}
                          >
                            <div className="text-center">
                              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                                <span className="text-xl font-bold text-primary">Y{year.year_number}</span>
                              </div>
                              <h3 className="font-semibold">Year {year.year_number}</h3>
                              {year.semesters && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {year.semesters.length} semesters
                                </p>
                              )}
                            </div>
                          </button>
                        ))}

                      {years.length === 0 && (
                        <div className="col-span-full text-center py-12">
                          <p className="text-muted-foreground">No years found for this course</p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => toast.info('Contact admin to add years for this course')}
                          >
                            Request Year Addition
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Semester Selection */}
                {step === 4 && selectedYear && (
                  <div>
                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-primary/5 rounded-lg">
                          <p className="text-sm font-medium">College</p>
                          <p className="font-semibold">{selectedCollege?.name}</p>
                        </div>
                        <div className="p-4 bg-primary/5 rounded-lg">
                          <p className="text-sm font-medium">Course</p>
                          <p className="font-semibold">{selectedCourse?.name}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-primary/5 rounded-lg flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Year</p>
                          <p className="font-semibold">Year {selectedYear.year_number}</p>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          Step 3/4
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-4">Select your current semester:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {semesters.map((semester) => (
                          <button
                            key={semester}
                            onClick={() => handleSemesterSelect(semester)}
                            className={`p-4 rounded-lg border-2 text-center transition-all ${selectedSemester === semester
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-gray-200 hover:border-primary/50'
                              }`}
                          >
                            <span className="font-medium">{semester}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-800">Ready to complete!</p>
                          <p className="text-sm text-green-700">
                            You'll get personalized resources based on your selections
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1 || isLoading}
              >
                Back
              </Button>

              <div className="flex items-center gap-3">
                {step < 4 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (step === 1 && selectedCollege) {
                        setStep(2);
                      } else if (step === 2 && selectedCourse) {
                        setStep(3);
                      } else if (step === 3 && selectedYear) {
                        setStep(4);
                      }
                    }}
                    disabled={
                      (step === 1 && !selectedCollege) ||
                      (step === 2 && !selectedCourse) ||
                      (step === 3 && !selectedYear) ||
                      isLoading
                    }
                  >
                    Continue
                  </Button>
                )}

                {step === 4 && (
                  <Button
                    onClick={handleComplete}
                    disabled={!selectedSemester || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Complete Onboarding'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Can't find your college/course? Contact your college admin to get it added to the system.</p>
        </div>
      </div>
    </div>
  );
}