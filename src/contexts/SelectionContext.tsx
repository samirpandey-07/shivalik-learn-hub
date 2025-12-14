import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface College {
  id: string;
  name: string;
  location: string | null;
  established: string | null;
}

interface Course {
  id: string;
  name: string;
  college_id: string;
  duration: string | null;
  seats: number | null;
}

interface Year {
  id: string;
  year_number: number;
  course_id: string;
  semesters: string[] | null;
}

interface SelectionState {
  colleges: College[];
  courses: Course[];
  years: Year[];
  selectedCollege: College | null;
  selectedCourse: Course | null;
  selectedYear: Year | null;
  selectedSemester: string | null;
  isLoading: boolean;
}

interface SelectionContextType extends SelectionState {
  fetchColleges: () => Promise<void>;
  fetchCourses: (collegeId: string) => Promise<void>;
  fetchYears: (courseId: string) => Promise<void>;
  selectCollege: (college: College) => void;
  selectCourse: (course: Course) => void;
  selectYear: (year: Year) => void;
  selectSemester: (semester: string) => void;
  completeOnboarding: () => Promise<void>;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SelectionState>({
    colleges: [],
    courses: [],
    years: [],
    selectedCollege: null,
    selectedCourse: null,
    selectedYear: null,
    selectedSemester: null,
    isLoading: false,
  });

  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Load colleges on mount
  useEffect(() => {
    fetchColleges();
  }, []);

  // Load user's previous selection if exists
  const loadPreviousSelection = useCallback(async () => {
    if (!profile?.college_id) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Fetch college
      const { data: college } = await supabase
        .from('colleges')
        .select('*')
        .eq('id', profile.college_id)
        .single();

      if (college) {
        setState(prev => ({ ...prev, selectedCollege: college }));

        // Fetch courses for this college
        const { data: courses } = await supabase
          .from('courses')
          .select('*')
          .eq('college_id', profile.college_id);

        if (courses) {
          setState(prev => ({ ...prev, courses }));

          if (profile.course_id) {
            const course = courses.find(c => c.id === profile.course_id);
            if (course) {
              setState(prev => ({ ...prev, selectedCourse: course }));

              // Fetch years for this course
              const { data: years } = await supabase
                .from('years')
                .select('*')
                .eq('course_id', profile.course_id);

              if (years) {
                setState(prev => ({ ...prev, years }));

                if (profile.year_id) {
                  const year = years.find(y => y.id === profile.year_id);
                  if (year) {
                    // Load Semester from Auth Metadata
                    const savedSemester = user?.user_metadata?.semester || null;

                    setState(prev => ({
                      ...prev,
                      selectedYear: year,
                      selectedSemester: savedSemester
                    }));
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading previous selection:', error);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [profile, user]);

  useEffect(() => {
    if (profile?.college_id) {
      loadPreviousSelection();
    }
  }, [profile, loadPreviousSelection]);


  const fetchColleges = async () => {
    console.log("[SelectionContext] fetchColleges started");
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), 15000)
      );

      // Race against the actual request
      const { data, error } = await Promise.race([
        supabase.from('colleges').select('*').order('name'),
        timeoutPromise
      ]) as any;

      if (error) {
        console.error("[SelectionContext] fetchColleges ERROR:", error);
        throw error;
      }

      console.log("[SelectionContext] fetchColleges SUCCESS:", data?.length, "colleges found");

      // Filter out "Shivalik College" to only show "Shivalik College of Engineering"
      const filteredData = data?.filter((c: any) => c.name !== 'Shivalik College') || [];

      setState(prev => ({ ...prev, colleges: filteredData }));
    } catch (error) {
      console.error('[SelectionContext] Error fetching colleges:', error);
      toast.error('Failed to load colleges');
    } finally {
      console.log("[SelectionContext] fetchColleges FINISHED - setting isLoading false");
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const fetchCourses = async (collegeId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('college_id', collegeId)
        .order('name');

      if (error) throw error;

      setState(prev => ({
        ...prev,
        courses: data || [],
        selectedCourse: null,
        selectedYear: null,
        selectedSemester: null,
        years: [],
      }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const fetchYears = async (courseId: string) => {
    try {
      console.log('Fetching years for courseId:', courseId); // Debug log
      setState(prev => ({ ...prev, isLoading: true }));
      const { data, error } = await supabase
        .from('years')
        .select('*')
        .eq('course_id', courseId)
        .order('year_number');

      if (error) throw error;

      console.log('Years fetched:', data); // Debug log

      setState(prev => ({
        ...prev,
        years: data || [],
        selectedYear: null,
        selectedSemester: null,
      }));
    } catch (error) {
      console.error('Error fetching years:', error);
      toast.error('Failed to load years');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const selectCollege = (college: College) => {
    setState(prev => ({
      ...prev,
      selectedCollege: college,
      selectedCourse: null,
      selectedYear: null,
      selectedSemester: null,
      courses: [],
      years: [],
    }));

    if (college.id) {
      fetchCourses(college.id);
    }
  };

  const selectCourse = (course: Course) => {
    setState(prev => ({
      ...prev,
      selectedCourse: course,
      selectedYear: null,
      selectedSemester: null,
      years: [],
    }));

    if (course.id) {
      fetchYears(course.id);
    }
  };

  const selectYear = (year: Year) => {
    setState(prev => ({
      ...prev,
      selectedYear: year,
      selectedSemester: null,
      years: [],
    }));
  };

  const selectSemester = (semester: string) => {
    setState(prev => ({ ...prev, selectedSemester: semester }));
  };

  const completeOnboarding = async () => {
    if (!user || !state.selectedCollege || !state.selectedCourse || !state.selectedYear) {
      toast.error('Please complete all selections');
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const updates = {
        college_id: state.selectedCollege.id,
        course_id: state.selectedCourse.id,
        year_id: state.selectedYear.id,
      };

      console.log("Saving onboarding data:", updates);

      // 1. Update Profile Table (Public Relational Data)
      const profilePromise = updateProfile(updates);

      // 2. Update Auth Metadata (Private/Session Data for Semester)
      const authPromise = state.selectedSemester
        ? supabase.auth.updateUser({
          data: { semester: state.selectedSemester }
        })
        : Promise.resolve();

      await Promise.all([profilePromise, authPromise]);

      toast.success('Onboarding completed!');

      // Redirect without reload using navigate
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);

    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to save selections');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const value = {
    ...state,
    fetchColleges,
    fetchCourses,
    fetchYears,
    selectCollege,
    selectCourse,
    selectYear,
    selectSemester,
    completeOnboarding,
  };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};