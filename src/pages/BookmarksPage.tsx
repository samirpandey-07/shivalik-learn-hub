import { useSavedResources } from "@/contexts/SavedResourcesContext";
import { SavedResourceGrid } from "@/components/resources/SavedResourceGrid";
// import { ParticlesBackground } from "@/components/landing/ParticlesBackground";

export default function BookmarksPage() {
    const { savedResources, loading } = useSavedResources();

    return (
        <div className="space-y-8 animate-fade-in pb-10 relative">
            {/* <ParticlesBackground className="fixed inset-0 pointer-events-none opacity-20 z-0" /> */}

            <div className="relative z-10">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:via-white dark:to-white/70 mb-2">
                    Saved Resources
                </h1>
                <p className="text-muted-foreground">Your personal collection of bookmarked materials.</p>
            </div>

            <div className="relative z-10">
                <SavedResourceGrid resources={savedResources} loading={loading} />
            </div>
        </div>
    );
}
