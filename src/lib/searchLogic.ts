import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Finds course IDs that match the search query (by Name or Code).
 * This allows "soft joining" resources to courses via ID.
 */
export async function getSearchableCourseIds(
    supabase: SupabaseClient,
    query: string
): Promise<string[]> {
    if (!query || query.trim().length < 2) return [];

    const { data } = await supabase
        .from('courses')
        .select('id')
        .ilike('name', `%${query.trim()}%`)
        .limit(20); // Limit to prevent massive ID lists

    return data?.map(c => c.id) || [];
}

/**
 * Builds the search filter for resources, covering:
 * - Title
 * - Subject
 * - Description
 * - Course IDs (if provided)
 */
export function buildResourceSearchQuery(
    queryBuilder: any,
    term: string,
    courseIds: string[] = []
) {
    if (!term) return queryBuilder;

    const trimmedTerm = term.trim();
    // Base text search on resource fields
    const textFilter = `title.ilike.%${trimmedTerm}%,subject.ilike.%${trimmedTerm}%,description.ilike.%${trimmedTerm}%`;

    if (courseIds.length > 0) {
        // Search text OR belong to one of the matching courses
        return queryBuilder.or(`${textFilter},course_id.in.(${courseIds.join(',')})`);
    } else {
        return queryBuilder.or(textFilter);
    }
}
