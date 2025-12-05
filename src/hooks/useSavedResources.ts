import { useSavedResources as useSavedResourcesContext } from '@/contexts/SavedResourcesContext';

export function useSavedResources() {
    return useSavedResourcesContext();
}
