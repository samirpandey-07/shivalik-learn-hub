import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDebounce } from "./useDebounce";
import { supabase } from "@/integrations/supabase/client";
import { getSearchableCourseIds, buildResourceSearchQuery } from "@/lib/searchLogic";

export const SEARCH_PARAM = "search";

interface UseNavbarSearchReturn {
    // State
    query: string;
    results: any[];
    isSearching: boolean;
    showDropdown: boolean;

    // Actions
    setQuery: (q: string) => void;
    setShowDropdown: (show: boolean) => void;
    handleSearch: () => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleResultClick: (id: string) => void;
    clearSearch: () => void;
}

export function useNavbarSearch(): UseNavbarSearchReturn {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // State
    const [query, setQuery] = useState(searchParams.get(SEARCH_PARAM) || "");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // Debounce
    const debouncedQuery = useDebounce(query, 300);

    // Derived state for UI feedback
    const isDebouncing = query !== debouncedQuery;
    const showLoading = isSearching || isDebouncing;

    // Sync from URL
    useEffect(() => {
        const urlQuery = searchParams.get(SEARCH_PARAM) || "";
        setQuery(urlQuery);
    }, [searchParams]);

    // Perform Live Search
    useEffect(() => {
        let mounted = true;

        async function fetchResults() {
            // Check for empty or whitespace-only
            if (!debouncedQuery || debouncedQuery.trim().length < 2) {
                setResults([]);
                return;
            }

            setIsSearching(true);
            try {
                // 1. Find matching courses first (using shared logic)
                const courseIds = await getSearchableCourseIds(supabase, debouncedQuery);

                // 2. Build resource query
                let queryBuilder = supabase
                    .from('resources')
                    .select('id, title, type, subject, courses(name)')
                    .limit(5);

                queryBuilder = buildResourceSearchQuery(queryBuilder, debouncedQuery, courseIds);

                const { data } = await queryBuilder;

                if (mounted) {
                    setResults(data || []);
                    // Auto-open dropdown if we have results and user is typing
                    if (data && data.length > 0) setShowDropdown(true);
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                if (mounted) setIsSearching(false);
            }
        }

        fetchResults();
        return () => { mounted = false; };
    }, [debouncedQuery]);

    const handleSearch = useCallback(() => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;

        setShowDropdown(false);

        // Prevent duplicate navigation
        const currentParam = searchParams.get(SEARCH_PARAM);
        if (currentParam === trimmedQuery) return;

        navigate(`/browse?${SEARCH_PARAM}=${encodeURIComponent(trimmedQuery)}`);
    }, [query, navigate, searchParams]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
            // Close dropdown explicitly
            setShowDropdown(false);
        } else if (e.key === "Escape") {
            e.preventDefault();
            if (showDropdown) {
                setShowDropdown(false);
            } else {
                setQuery(""); // Clear input if dropdown is already closed
            }
        }
    };

    const handleResultClick = (id: string) => {
        setShowDropdown(false);
        setQuery(""); // Optional: clear query on selection
        navigate(`/resource/${id}`);
    };

    const clearSearch = () => {
        setQuery("");
        setResults([]);
        setShowDropdown(false);
    };

    return {
        query,
        results,
        isSearching: showLoading, // Expose combined state to prevent false empty UI
        showDropdown,
        setQuery,
        setShowDropdown,
        handleSearch,
        handleKeyDown,
        handleResultClick,
        clearSearch
    };
}
