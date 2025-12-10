import { useSavedResources } from "@/contexts/SavedResourcesContext";
import { SavedResourceGrid } from "@/components/resources/SavedResourceGrid";
// import { ParticlesBackground } from "@/components/landing/ParticlesBackground";

export default function BookmarksPage() {
    const { savedResources, loading } = useSavedResources();

    return (
        <div className="space-y-8 animate-fade-in pb-10 relative">
            {/* <ParticlesBackground className="fixed inset-0 pointer-events-none opacity-20 z-0" /> */}

            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 md:p-12 text-center">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:to-purple-500/20 pointer-events-none" />
                <div className="relative z-10 space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground dark:text-white uppercase font-sans">
                        Saved Resources
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Your personal collection of bookmarked materials. Access them anytime, anywhere.
                    </p>
                </div>
            </div>

            <div className="relative z-10">
                <SavedResourceGrid resources={savedResources} loading={loading} />
            </div>
        </div>
    );
}
