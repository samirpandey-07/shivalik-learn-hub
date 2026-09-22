import { PublicLayout } from "@/components/landing/PublicLayout";
import { SEO } from "@/components/common/SEO";
import { createWebPageSchema } from "@/lib/seo/schemaData";
import { BookOpen, FileText, Clock, Users, Sparkles, Trophy, Briefcase, Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function FeaturesPage() {
  const schema = createWebPageSchema({
    title: "Campus Flow Features | Notes, PYQs, Study Rooms & Doubt Solver",
    description:
      "Explore features of Campus Flow: college lecture notes, previous year question papers (PYQs), Pomodoro study rooms, AI doubt solver, flashcards, and student community.",
    url: "/features",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Features", url: "/features" },
    ],
  });

  const featureList = [
    {
      icon: FileText,
      title: "Curated Lecture Notes & PYQs",
      category: "Academic Resources",
      description:
        "Access structured, branch-wise lecture notes, previous year exam papers (PYQs), and presentation slides. Filter seamlessly by college, course, semester, and subject.",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      icon: Clock,
      title: "Virtual Focus Study Rooms",
      category: "Productivity",
      description:
        "Join collaborative virtual study rooms equipped with synchronized Pomodoro timers, background focus ambiance, and peer study chats to stay accountable.",
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Doubt Solver",
      category: "Intelligent Learning",
      description:
        "Get step-by-step solutions to complex textbook problems, code debugging guidance, and instant concept clarifications powered by cutting-edge AI.",
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      icon: Users,
      title: "Campus Community Forum",
      category: "Peer Discussion",
      description:
        "Engage with college peers, ask questions about challenging coursework, discuss campus projects, and exchange practical exam preparation strategies.",
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      icon: Brain,
      title: "Flashcard Decks & Spaced Repetition",
      category: "Smart Revision",
      description:
        "Retain key formulas, technical definitions, and exam concepts faster with interactive flashcard decks designed for active recall before test day.",
      color: "text-cyan-500 bg-cyan-500/10",
    },
    {
      icon: Trophy,
      title: "Gamification & Leaderboards",
      category: "Engagement",
      description:
        "Earn Coins and XP by uploading high-quality notes, helping fellow students solve doubts, and maintaining study streaks. Unlock achievements and rise on campus leaderboards.",
      color: "text-yellow-500 bg-yellow-500/10",
    },
    {
      icon: Briefcase,
      title: "Careers & Hackathon Tracker",
      category: "Opportunity Hub",
      description:
        "Discover upcoming hackathons, tech internship openings, and interview experiences shared by seniors who recently cracked competitive placement rounds.",
      color: "text-pink-500 bg-pink-500/10",
    },
    {
      icon: BookOpen,
      title: "Offline-Ready Reader & Bookmarks",
      category: "Convenience",
      description:
        "Save your favorite notes and syllabus guides to your personalized study dashboard. Quick access anytime, even during last-minute revision before exams.",
      color: "text-indigo-500 bg-indigo-500/10",
    },
  ];

  return (
    <PublicLayout>
      <SEO
        title="Features | Campus Flow - Next-Gen Student Academic Platform"
        description="Discover Campus Flow features: verified college notes, past exam questions (PYQs), virtual focus rooms, AI doubt solver, flashcards, and student forum."
        canonicalPath="/features"
        structuredData={schema}
      />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">Features</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase">
            Designed for Student Success
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Everything You Need to <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-primary dark:via-cyan-400 dark:to-purple-400">
              Excel in College
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Campus Flow brings together all essential tools—from verified study materials and past year question papers to collaborative study rooms and AI assistance.
          </p>
        </header>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {featureList.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <article
                key={index}
                className="group p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${feat.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {feat.category}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {feat.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </article>
            );
          })}
        </section>

        {/* How It Integrates Section */}
        <section className="p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-primary/5 via-purple-500/5 to-transparent backdrop-blur-md mb-16">
          <div className="max-w-3xl space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Built for Real College Workflows
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Unlike generic cloud drives or unstructured group chats, Campus Flow categorizes academic resources strictly by college university curriculum, semester, and course codes. Whether you need Midterm PYQs or deep conceptual summaries before finals, Campus Flow gets you the exact resource in seconds.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button asChild className="rounded-full bg-primary text-white">
                <Link to="/auth">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/how-it-works">See How It Works</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
