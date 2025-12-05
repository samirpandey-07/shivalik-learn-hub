import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/useAuth';
import { toast } from 'sonner';

interface SavedResourcesContextType {
    savedIds: Set<string>;
    savedResources: any[];
    loading: boolean;
    toggleSave: (resourceId: string) => Promise<void>;
    isSaved: (id: string) => boolean;
}

const SavedResourcesContext = createContext<SavedResourcesContextType | undefined>(undefined);

export function SavedResourcesProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    const [savedResources, setSavedResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setSavedIds(new Set());
            setSavedResources([]);
            setLoading(false);
            return;
        }
        fetchSavedResources();
    }, [user]);

    const fetchSavedResources = async () => {
        try {
            const { data, error } = await supabase
                .from('saved_resources')
                .select(`
          resource_id,
          resource:resources(*)
        `)
                .eq('user_id', user?.id);

            if (error) throw error;

            const ids = new Set(data?.map(item => item.resource_id) || []);
            const resources = data?.map(item => item.resource).filter(Boolean) || [];

            setSavedIds(ids);
            setSavedResources(resources);
        } catch (error) {
            console.error('Error fetching saved resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSave = async (resourceId: string) => {
        if (!user) {
            toast.error("Please login to save resources");
            return;
        }

        const isSaved = savedIds.has(resourceId);

        try {
            // Optimistic update
            const newIds = new Set(savedIds);
            if (isSaved) {
                newIds.delete(resourceId);
                setSavedIds(newIds);
                toast.success("Removed from saved resources");

                const { error } = await supabase
                    .from('saved_resources')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('resource_id', resourceId);

                if (error) {
                    // Revert on error
                    newIds.add(resourceId);
                    setSavedIds(newIds);
                    throw error;
                }
            } else {
                newIds.add(resourceId);
                setSavedIds(newIds);
                toast.success("Resource saved!");

                const { error } = await supabase
                    .from('saved_resources')
                    .insert({
                        user_id: user.id,
                        resource_id: resourceId
                    });

                if (error) {
                    // Revert on error
                    newIds.delete(resourceId);
                    setSavedIds(newIds);
                    throw error;
                }
            }

            // Refresh full list in background to keep resources in sync
            fetchSavedResources();
        } catch (error) {
            console.error('Error toggling save:', error);
            toast.error("Failed to update saved resources");
        }
    };

    return (
        <SavedResourcesContext.Provider value={{ savedIds, savedResources, loading, toggleSave, isSaved: (id) => savedIds.has(id) }}>
            {children}
        </SavedResourcesContext.Provider>
    );
}

export function useSavedResources() {
    const context = useContext(SavedResourcesContext);
    if (context === undefined) {
        throw new Error('useSavedResources must be used within a SavedResourcesProvider');
    }
    return context;
}
