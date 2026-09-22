import { PublicLayout } from "@/components/landing/PublicLayout";
import { SEO } from "@/components/common/SEO";
import { createWebPageSchema } from "@/lib/seo/schemaData";
import { UserCheck, Search, Users2, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HowItWorksPage() {
  const schema = createWebPageSchema({
    title: "How Campus Flow Works | Step-by-Step Student Guide",
    description:
      "Learn how to use Campus Flow to access lecture notes, download past papers (PYQs), study with peers in virtual focus rooms, and earn gamification badges.",
    url: "/how-it-works",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "How It Works", url: "/how-it-works" },
    ],
  });

  const steps = [
    {
      stepNumber: "01",
      icon: UserCheck,
      title: "Set Up Your Academic Profile",
      description:
        "Create your free account using your email. Select your college, branch/degree, and current semester. Campus Flow automatically personalizes your feed with relevant study materials tailored to your curriculum.",
    },
    {
      stepNumber: "02",
      icon: Search,
      title: "Discover Verified Notes & PYQs",
      description:
        "Use smart filters or instant search to locate lecture notes, previous year exam question papers (PYQs), lab manuals, and video tutorials. Preview materials directly in your browser or save them to your bookmarks.",
    },
    {
      stepNumber: "03",
      icon: Users2,
      title: "Study Together & Clear Doubts",
      description:
        "Enter virtual study rooms equipped with synchronized Pomodoro timers for focused group sessions. If you hit a roadblock, ask in the Community Forum or use the AI Doubt Solver for instant step-by-step guidance.",
    },
    {
      stepNumber: "04",
      icon: Award,
      title: "Contribute, Earn XP & Rise Up",
      description:
        "Help classmates by uploading your handwritten notes, lecture slides, or answering forum questions. Earn Coins, unlock achievement badges, and climb your college's study leaderboard.",
    },
  ];

  return (
    <PublicLayout>
      <SEO
        title="How It Works | Campus Flow - Student Academic Platform"
        description="Discover how Campus Flow works: personalizing course feeds, accessing verified lecture notes and PYQs, joining focus study rooms, and earning study badges."
        canonicalPath="/how-it-works"
        structuredData={schema}
      />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">How It Works</li>
          </ol>
        </nav>

        {/* Hero Header */}
        <header className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase">
            Simple 4-Step Process
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            How Campus Flow <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-primary dark:via-cyan-400 dark:to-purple-400">
              Powers Your Studies
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Get up and running in less than two minutes. Here is how students leverage Campus Flow to prepare smarter and ace college semester exams.
          </p>
        </header>

        {/* Steps List */}
        <div className="space-y-12 mb-20">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <article
                key={index}
                className="relative p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
              >
                <div className="md:col-span-3 flex flex-col items-start md:items-center justify-center text-center">
                  <span className="text-5xl font-black text-primary/30 tracking-tight">
                    {item.stepNumber}
                  </span>
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mt-2 shadow-sm">
                    <Icon className="h-7 w-7" />
                  </div>
                </div>

                <div className="md:col-span-9 space-y-3">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* Value Proposition Callout */}
        <section className="p-8 md:p-12 rounded-3xl bg-slate-900 text-white text-center space-y-6">
          <h2 className="text-3xl font-bold">Start Studying Smarter Today</h2>
          <p className="text-slate-300 max-w-xl mx-auto leading-relaxed">
            Campus Flow is completely free for college students. Join today and start accessing syllabus-aligned study materials right away.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Button asChild size="lg" className="rounded-full bg-primary text-white">
              <Link to="/auth">
                Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-white/20 text-white hover:bg-white/10">
              <Link to="/browse">Browse Study Notes</Link>
            </Button>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
