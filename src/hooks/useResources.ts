import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getSearchableCourseIds, buildResourceSearchQuery } from '@/lib/searchLogic';

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: 'notes' | 'pyq' | 'presentation' | 'link' | 'video' | 'important_questions';
  subject: string;
  college_id: string;
  course_id: string;
  year_id: string;
  uploader_id: string | null;
  uploader_name: string | null;
  uploader_year: string | null;
  file_url: string | null;
  drive_link: string | null;
  file_size: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_comments: string | null;
  downloads: number;
  rating: number;
  created_at: string;
  year_number?: number | null;
}

export interface College {
  id: string;
  name: string;
  location: string | null;
  established: string | null;
}

export interface Course {
  id: string;
  college_id: string;
  name: string;
  duration: string | null;
  seats: number | null;
}

export interface Year {
  id: string;
  course_id: string;
  year_number: number;
  semesters: string[];
}

export function useColleges() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColleges = async () => {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .order('name');

      if (!error && data) {
        // Filter out "Shivalik College of Engineering" as requested
        const filteredData = data.filter(c => c.name !== 'Shivalik College of Engineering');
        setColleges(filteredData);
      }
      setLoading(false);
    };

    fetchColleges();
  }, []);

  return { colleges, loading };
}

export function useCourses(collegeId: string | null) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!collegeId) {
      setCourses([]);
      return;
    }

    const fetchCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('college_id', collegeId)
        .order('name');

      if (!error && data) {
        setCourses(data);
      }
      setLoading(false);
    };

    fetchCourses();
  }, [collegeId]);

  return { courses, loading };
}

export function useYears(courseId: string | null) {
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseId) {
      setYears([]);
      return;
    }

    const fetchYears = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('years')
        .select('*')
        .eq('course_id', courseId)
        .order('year_number');

      if (!error && data) {
        // Client-side deduplication by year_number
        const uniqueYears = data.filter((year, index, self) =>
          index === self.findIndex((y) => y.year_number === year.year_number)
        );
        setYears(uniqueYears);
      }
      setLoading(false);
    };

    fetchYears();
  }, [courseId]);

  return { years, loading };
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('resources')
        .select('subject')
        .not('subject', 'is', null);

      if (!error && data) {
        // Client-side deduplication
        const uniqueSubjects = Array.from(new Set(data.map(item => item.subject))).sort();
        setSubjects(uniqueSubjects);
      }
      setLoading(false);
    };

    fetchSubjects();
  }, []);

  return { subjects, loading };
}

type ResourceType = 'notes' | 'pyq' | 'presentation' | 'link' | 'video' | 'important_questions';

export function useGlobalYearNumbers() {
  const [yearNumbers, setYearNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchYearNumbers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('years')
        .select('year_number')
        .order('year_number');

      if (!error && data) {
        const uniqueYears = Array.from(new Set(data.map(y => y.year_number))).sort((a, b) => a - b);
        setYearNumbers(uniqueYears);
      }
      setLoading(false);
    };

    fetchYearNumbers();
  }, []);

  return { yearNumbers, loading };
}

export function useResources(filters: {
  collegeId?: string | null;
  courseId?: string | null;
  yearId?: string | null;
  yearNumber?: number | null;
  type?: string | null;
  uploaderId?: string;
  searchTerm?: string;
}) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      let query = supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      // Only filter by status 'approved' if generic browse, allow 'pending' if viewing own uploads
      if (!filters.uploaderId) {
        query = query.eq('status', 'approved');
      }

      if (filters.collegeId) {
        // Defensive: Handle case where collegeId is passed as an object (bug fix)
        const cId = typeof filters.collegeId === 'object' ? (filters.collegeId as any).id : filters.collegeId;
        query = query.eq('college_id', cId);
      }
      if (filters.courseId) {
        // Defensive: Handle case where courseId is passed as an object
        const coId = typeof filters.courseId === 'object' ? (filters.courseId as any).id : filters.courseId;
        query = query.eq('course_id', coId);
      }
      if (filters.yearId) {
        query = query.eq('year_id', filters.yearId);
      }

      // Handle Global Year Number Filter
      if (filters.yearNumber && !filters.yearId) {
        // Fetch valid year_ids for this number first
        const { data: matchingYears } = await supabase
          .from('years')
          .select('id')
          .eq('year_number', filters.yearNumber);

        if (matchingYears && matchingYears.length > 0) {
          const ids = matchingYears.map(y => y.id);
          query = query.in('year_id', ids);
        } else {
          // If no years match, return empty result strictly
          setResources([]);
          setLoading(false);
          return;
        }
      }

      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type as ResourceType);
      }
      if (filters.uploaderId) {
        query = query.eq('uploader_id', filters.uploaderId);
      }
      if (filters.searchTerm) {
        // Improved Search Logic with Course matching
        try {
          const courseIds = await getSearchableCourseIds(supabase, filters.searchTerm);
          query = buildResourceSearchQuery(query, filters.searchTerm, courseIds);
        } catch (err) {
          console.error("Error in search logic", err);
          // Fallback to basic text search if course fetch fails
          query = query.or(`title.ilike.%${filters.searchTerm}%,subject.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
        }
      }

      const { data, error } = await query;

      if (!error && data) {
        let enrichedData = data as Resource[];

        // Decoupled fetch for uploader names if missing
        const uploaderIds = Array.from(new Set(data.map((r: any) => r.uploader_id).filter(Boolean)));
        // Collect year IDs
        const yearIds = Array.from(new Set(data.map((r: any) => r.year_id).filter(Boolean)));

        const fetches = [];

        if (uploaderIds.length > 0) {
          fetches.push(
            supabase
              .from('profiles')
              .select('id, full_name')
              .in('id', uploaderIds)
              .then(({ data }) => ({ type: 'profiles', data }))
          );
        }

        if (yearIds.length > 0) {
          fetches.push(
            supabase
              .from('years')
              .select('id, year_number')
              .in('id', yearIds)
              .then(({ data }) => ({ type: 'years', data }))
          );
        }

        if (fetches.length > 0) {
          const results = await Promise.all(fetches);
          const profileMap = new Map();
          const yearMap = new Map();

          results.forEach((res: any) => {
            if (res.type === 'profiles' && res.data) {
              res.data.forEach((p: any) => profileMap.set(p.id, p));
            }
            if (res.type === 'years' && res.data) {
              res.data.forEach((y: any) => yearMap.set(y.id, y));
            }
          });

          enrichedData = data.map((r: any) => ({
            ...r,
            uploader_name: r.uploader_name || profileMap.get(r.uploader_id)?.full_name || 'Unknown User',
            year_number: yearMap.get(r.year_id)?.year_number || null
          }));
        }

        setResources(enrichedData);
      }
      setLoading(false);
    };

    fetchResources();

    // specific subscription for realtime updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'resources'
        },
        () => {
          fetchResources();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters.collegeId, filters.courseId, filters.yearId, filters.yearNumber, filters.type, filters.searchTerm, filters.uploaderId]);

  return { resources, loading, refetch: () => { } };
}

export async function uploadResource(resource: {
  title: string;
  description: string;
  type: ResourceType;
  subject: string;
  college_id: string;
  course_id: string;
  year_id: string;
  drive_link: string;
  file_size?: string;
  uploader_id: string;
  uploader_name: string;
  uploader_year: string;
}) {
  const { data, error } = await supabase
    .from('resources')
    .insert([{ ...resource, status: 'pending' as const }])
    .select()
    .single();

  return { data, error };
}

export function useBookmarks(userId: string | undefined) {
  const [bookmarks, setBookmarks] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    const fetchBookmarks = async () => {
      setLoading(true);
      // Fetch bookmarked resource IDs first
      const { data: bookmarkData, error: bookmarkError } = await (supabase as any)
        .from('saved_resources')
        .select('resource_id')
        .eq('user_id', userId);

      if (bookmarkError || !bookmarkData) {
        console.error('Error fetching bookmarks:', bookmarkError);
        setLoading(false);
        return;
      }

      if (bookmarkData.length === 0) {
        setBookmarks([]);
        setLoading(false);
        return;
      }

      const resourceIds = bookmarkData.map((b: any) => b.resource_id);

      // Fetch actual resources
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('resources')
        .select('*')
        .in('id', resourceIds)
        .eq('status', 'approved');

      if (!resourcesError && resourcesData) {
        let enrichedBookmarks = resourcesData as Resource[];

        // Decoupled fetch for uploader names
        const uploaderIds = Array.from(new Set(resourcesData.map((r: any) => r.uploader_id).filter(Boolean)));

        if (uploaderIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', uploaderIds);

          if (profiles) {
            const profileMap = new Map(profiles.map(p => [p.id, p]));
            enrichedBookmarks = resourcesData.map((r: any) => ({
              ...r,
              uploader_name: r.uploader_name || profileMap.get(r.uploader_id)?.full_name || 'Unknown User'
            }));
          }
        }
        setBookmarks(enrichedBookmarks);
      }
      setLoading(false);
    };

    fetchBookmarks();
  }, [userId]);

  return { bookmarks, loading };
}

export async function toggleBookmark(userId: string, resourceId: string) {
  // Check if already bookmarked
  const { data: existing } = await (supabase as any)
    .from('saved_resources')
    .select('*')
    .eq('user_id', userId)
    .eq('resource_id', resourceId)
    .single();

  if (existing) {
    // Remove
    const { error } = await (supabase as any)
      .from('saved_resources')
      .delete()
      .eq('user_id', userId)
      .eq('resource_id', resourceId);
    return { bookmarked: false, error };
  } else {
    // Add
    const { error } = await (supabase as any)
      .from('saved_resources')
      .insert([{ user_id: userId, resource_id: resourceId }]);
    return { bookmarked: true, error };
  }
}

export async function submitReview(userId: string, resourceId: string, rating: number, comment?: string) {
  const { error } = await (supabase as any)
    .from('reviews')
    .upsert([{
      user_id: userId,
      resource_id: resourceId,
      rating,
      comment
    }], { onConflict: 'user_id,resource_id' });

  return { error };
}

export async function incrementDownload(resourceId: string, currentDownloads: number) {
  const { error } = await supabase
    .from('resources')
    .update({ downloads: currentDownloads + 1 })
    .eq('id', resourceId);

  return { error };
}
