import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, MessageSquare, Trophy, Sparkles } from "lucide-react";
import { ParticlesBackground } from "@/components/landing/ParticlesBackground";
import { InterviewExperienceList } from "@/components/careers/InterviewExperienceList";

export default function CareersPage() {
    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <ParticlesBackground className="fixed inset-0 pointer-events-none opacity-20 z-0" />

            {/* Header */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
                        <Sparkles className="h-3 w-3 mr-1" /> Career Hub
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:via-white dark:to-white/70">
                        Placement & Opportunities
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Find internships, read interview experiences, and team up for hackathons.
                    </p>
                </div>
            </div>

            <div className="relative z-10">
                <Tabs defaultValue="experiences" className="w-full">
                    <TabsList className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 rounded-xl mb-6 flex flex-wrap h-auto">
                        <TabsTrigger value="experiences" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg px-6">
                            <MessageSquare className="mr-2 h-4 w-4" /> Interview Experiences
                        </TabsTrigger>
                        <TabsTrigger value="jobs" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg px-6">
                            <Briefcase className="mr-2 h-4 w-4" /> Internships & Jobs
                        </TabsTrigger>
                        <TabsTrigger value="hackathons" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg px-6">
                            <Trophy className="mr-2 h-4 w-4" /> Hackathons
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="experiences" className="animate-in slide-in-from-bottom-2 fade-in duration-500">
                        <InterviewExperienceList />
                    </TabsContent>

                    <TabsContent value="jobs" className="animate-in slide-in-from-bottom-2 fade-in duration-500">
                        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 p-12 shadow-2xl flex flex-col items-center justify-center text-center">
                            <Briefcase className="h-16 w-16 text-blue-500/50 mb-4" />
                            <h2 className="text-xl font-semibold text-foreground dark:text-white mb-2">
                                Internships & Job Board
                            </h2>
                            <p className="text-muted-foreground max-w-md">
                                This section is currently under construction. Soon, you'll be able to find and apply for the best off-campus opportunities right here!
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="hackathons" className="animate-in slide-in-from-bottom-2 fade-in duration-500">
                        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 p-12 shadow-2xl flex flex-col items-center justify-center text-center">
                            <Trophy className="h-16 w-16 text-orange-500/50 mb-4" />
                            <h2 className="text-xl font-semibold text-foreground dark:text-white mb-2">
                                Hackathons & Competitions
                            </h2>
                            <p className="text-muted-foreground max-w-md">
                                Keep an eye out for upcoming hackathons. Soon, you'll be able to form teams and find teammates right from this page!
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
