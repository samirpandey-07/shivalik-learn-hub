import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/common/SEO";
import { createWebPageSchema, createFAQSchema } from "@/lib/seo/schemaData";
import { FAQ_DATA } from "@/lib/seo/faqData";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  GraduationCap
} from "lucide-react";
import { useState } from "react";

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const homeSchema = createWebPageSchema({
    title: "Campus Flow | Next-Gen Student Academic & Campus Platform",
    description:
      "Campus Flow is the next-gen academic platform for college students. Access verified lecture notes, previous year question papers (PYQs), study rooms, and community forums.",
    url: "/",
  });

  const homeFaqSchema = createFAQSchema(FAQ_DATA.slice(0, 5));

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-clip selection:bg-primary/20 selection:text-primary">
      <SEO
        title="Campus Flow | Student Campus Platform &amp; Academic Community"
        description="Campus Flow is the premier student platform for college academics. Access verified notes, past papers (PYQs), virtual focus rooms, AI doubt solving, and peer communities."
        canonicalPath="/"
        structuredData={[homeSchema, homeFaqSchema]}
      />

      <LandingNavbar />

      <main>
        {/* Hero Section with interactive particles */}
        <HeroSection />

        {/* Section: What is Campus Flow (Entity Clarity & Problem Solving) */}
        <section className="py-20 bg-slate-50/50 dark:bg-slate-950/30 border-y border-slate-200 dark:border-white/5 relative">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase">
                <GraduationCap className="h-4 w-4" />
                Next-Gen Academic Network
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Your Entire Campus, <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-primary dark:via-cyan-400 dark:to-purple-400">
                  Seamlessly Connected
                </span>
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                Campus Flow is a student-centric platform engineered to streamline your academic journey. From verified lecture notes and semester-specific PYQs to virtual study rooms and active peer discussion, everything you need to succeed is right here.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm space-y-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Verified Notes &amp; PYQs
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  No more chasing classmates or searching cluttered drives. Access peer-reviewed notes and past exam papers categorized by university syllabus and course code.
                </p>
                <Link to="/browse" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
                  Explore notes catalog <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm space-y-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Virtual Focus Rooms
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Study effectively alongside peers. Synchronized Pomodoro focus sessions and quiet accountability rooms help you conquer procrastination before exams.
                </p>
                <Link to="/features" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
                  Learn about study rooms <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm space-y-4">
                <div className="h-12 w-12 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  AI Doubt Resolution
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Stuck on a tricky concept or homework problem at 2 AM? Get instant step-by-step guidance and practice quizzes with our integrated AI study assistant.
                </p>
                <Link to="/how-it-works" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
                  See how it works <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Core Interactive Features Section */}
        <FeaturesSection />

        {/* Section: How Students Use Campus Flow */}
        <section className="py-20 bg-white dark:bg-background relative">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wide uppercase">
                  <ShieldCheck className="h-4 w-4" />
                  Academic Excellence &amp; Community
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  Designed for Students, Supported by the Campus Community
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Campus Flow isn’t just another static file repository. It’s an active student ecosystem that rewards helpful contributors with Coins and XP, encourages collaborative focus, and connects students across semesters.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <strong>Curriculum-aligned filters:</strong> Instant access to semester, branch, and subject materials.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <strong>Peer doubt solving:</strong> Ask in public forums or collaborate inside private study groups.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <strong>Gamified contributions:</strong> Earn badges and level up on your college leaderboard by uploading notes.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-4">
                  <Button asChild className="rounded-full bg-primary text-white">
                    <Link to="/auth">Get Started Free</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link to="/about">About Campus Flow</Link>
                  </Button>
                </div>
              </div>

              <div className="p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/60 dark:to-slate-950/60 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Active College Community</h3>
                    <p className="text-xs text-muted-foreground">Collaborative learning that actually works</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <p className="text-xs font-semibold text-primary uppercase">Study Streak Milestone</p>
                    <p className="text-sm text-foreground font-medium mt-1">
                      Students studying in focus rooms maintain 3x longer study sessions during exam weeks.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <p className="text-xs font-semibold text-emerald-500 uppercase">Verified Exam Prep</p>
                    <p className="text-sm text-foreground font-medium mt-1">
                      Full access to semester PYQ collections with model answers and formula sheets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Frequently Asked Questions (Homepage Preview) */}
        <section className="py-20 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-200 dark:border-white/5">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
                Common questions from students getting started with Campus Flow.
              </p>
            </div>

            <div className="space-y-3 mb-10">
              {FAQ_DATA.slice(0, 5).map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="border border-slate-200 dark:border-white/10 rounded-xl bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-semibold text-base text-slate-900 dark:text-white hover:text-primary transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span>{item.question}</span>
                      <span className="text-primary font-bold text-lg">{isOpen ? "−" : "+"}</span>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-white/5 pt-3 leading-relaxed">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/faq">
                  View All Questions &amp; Answers <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;