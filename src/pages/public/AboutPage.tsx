import { PublicLayout } from "@/components/landing/PublicLayout";
import { SEO } from "@/components/common/SEO";
import { createWebPageSchema } from "@/lib/seo/schemaData";
import { GraduationCap, Target, ShieldCheck, Heart, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function AboutPage() {
  const schema = createWebPageSchema({
    title: "About Campus Flow | Next-Gen Student Academic & Campus Platform",
    description:
      "Learn about Campus Flow, the student-centric academic platform designed to make college study materials, past exam questions, and virtual study rooms accessible to everyone.",
    url: "/about",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "About", url: "/about" },
    ],
  });

  return (
    <PublicLayout>
      <SEO
        title="About Campus Flow | Our Mission & Student Platform"
        description="Learn about Campus Flow, the academic collaboration platform empowering college students with verified notes, PYQs, focus study rooms, and peer support."
        canonicalPath="/about"
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
            <li className="text-foreground font-medium">About</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <header className="space-y-4 mb-16 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase">
            <GraduationCap className="h-4 w-4" />
            Our Mission &amp; Purpose
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Empowering College Students <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-primary dark:via-cyan-400 dark:to-purple-400">
              Through Open Knowledge
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            Campus Flow is an academic and campus collaboration ecosystem created to solve a universal college problem: fragmented notes, inaccessible past year question papers (PYQs), and isolated study environments.
          </p>
        </header>

        {/* Section: The Problem & The Solution */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm space-y-4">
            <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 font-bold">
              01
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              The College Dilemma
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Every semester, students scramble across multiple messaging groups, chaotic cloud drives, and fragmented chats searching for syllabus-aligned lecture notes, reliable lab records, and previous year exam questions. Crucial study materials get lost, and students often prepare in silos.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 backdrop-blur-sm space-y-4">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
              02
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              The Campus Flow Solution
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Campus Flow centralizes all academic resources under one intuitive roof. We combine curated course material with interactive tools—such as virtual focus study rooms with Pomodoro timers, peer discussion forums, AI doubt resolution, and gamified study milestones.
            </p>
          </div>
        </section>

        {/* Section: Core Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center md:text-left">
            What Drives Campus Flow
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <article className="p-6 rounded-xl border border-slate-200 dark:border-white/10 bg-card/60 backdrop-blur-sm space-y-3">
              <Target className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Student-First Accessibility
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Academic knowledge should be accessible, organized, and available to every student without paywalls or friction.
              </p>
            </article>

            <article className="p-6 rounded-xl border border-slate-200 dark:border-white/10 bg-card/60 backdrop-blur-sm space-y-3">
              <ShieldCheck className="h-6 w-6 text-emerald-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Academic Integrity &amp; Quality
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Content is vetted and moderated by active community members and peer contributors to maintain high study standards.
              </p>
            </article>

            <article className="p-6 rounded-xl border border-slate-200 dark:border-white/10 bg-card/60 backdrop-blur-sm space-y-3">
              <Heart className="h-6 w-6 text-pink-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Collaborative Community
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Studying is more effective together. From shared doubt solving to group focus rooms, we champion peer collaboration.
              </p>
            </article>
          </div>
        </section>

        {/* Section: Affiliation & Origin */}
        <section className="p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-950/50 mb-16 space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Built by Students, for Students
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Campus Flow is an initiative supported by student builders and the <strong>DroneX Club</strong>. Originally incubated as an academic portal for engineering and computer science scholars, Campus Flow has evolved into a comprehensive resource network that supports students throughout their entire academic journey.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/features"
              className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              Explore all features <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/how-it-works"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              See how it works <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Call to action */}
        <div className="text-center py-10 border-t border-slate-200 dark:border-white/10 space-y-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Ready to Supercharge Your Academic Journey?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Join thousands of students accessing verified course notes, PYQs, and interactive study rooms on Campus Flow.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-8 bg-primary text-white">
              <Link to="/auth">Join Campus Flow</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8">
              <Link to="/browse">Browse Resources</Link>
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
