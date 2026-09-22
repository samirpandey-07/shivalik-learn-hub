import { useState } from "react";
import { PublicLayout } from "@/components/landing/PublicLayout";
import { SEO } from "@/components/common/SEO";
import { createFAQSchema, createWebPageSchema } from "@/lib/seo/schemaData";
import { FAQ_DATA } from "@/lib/seo/faqData";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const FAQ_DATA: FAQItem[] = [
  {
    question: "What is Campus Flow?",
    answer:
      "Campus Flow is an academic collaboration platform designed specifically for college students. It provides access to verified lecture notes, previous year question papers (PYQs), virtual focus study rooms with Pomodoro timers, AI doubt solving, and active peer discussion communities.",
  },
  {
    question: "Is Campus Flow completely free for students?",
    answer:
      "Yes! Core academic resources on Campus Flow—including searching, viewing notes, downloading PYQs, joining study rooms, and participating in forum discussions—are completely free for college students.",
  },
  {
    question: "What kinds of study materials are available on Campus Flow?",
    answer:
      "Students can access semester lecture notes, previous year university question papers (PYQs), lab manuals, presentation slides, formula reference cheat-sheets, and recommended video tutorials organized by department, semester, and course code.",
  },
  {
    question: "How do the Virtual Study Rooms work?",
    answer:
      "Virtual Study Rooms provide distraction-free digital spaces where students can study together. Each room features synchronized Pomodoro focus intervals, ambient soundscapes, and text chat to share study goals and maintain mutual accountability.",
  },
  {
    question: "How does the Gamification system (Coins and XP) work?",
    answer:
      "Students earn Experience Points (XP) and Campus Flow Coins by actively contributing to the community—such as uploading high-quality notes, maintaining daily study streaks, solving doubts for peers, and engaging in forum discussions. High scores unlock achievement badges and top spots on campus leaderboards.",
  },
  {
    question: "Can any college or university student use Campus Flow?",
    answer:
      "Yes! While Campus Flow initially launched with dedicated curricula for engineering and computer science institutions like Shivalik College, any student from any college can join, explore public resources, create study rooms, and contribute materials for their specific curriculum.",
  },
  {
    question: "How does the AI Doubt Solver assist with studying?",
    answer:
      "The AI Doubt Solver uses advanced generative language models to help clarify difficult academic concepts, explain complex textbook questions step-by-step, generate quizzes, and debug code snippets to accelerate your exam revision.",
  },
  {
    question: "How are copyright and academic integrity maintained?",
    answer:
      "Campus Flow enforces strict community guidelines. Content that violates academic integrity, leaks confidential exam papers, or infringes copyright is prohibited. Users can report any flagged content, which is promptly reviewed by moderators.",
  },
  {
    question: "Is Campus Flow mobile-friendly?",
    answer:
      "Yes! Campus Flow is built with a responsive mobile-first architecture and Progressive Web App (PWA) support, allowing smooth browsing and reading across smartphones, tablets, and desktop computers.",
  },
  {
    question: "Who developed Campus Flow and how can I get support?",
    answer:
      "Campus Flow was built by student builders in collaboration with the DroneX Club. You can reach out directly for technical assistance, partnership inquiries, or feedback at sigmaprimeplus@gmail.com.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const webPageSchema = createWebPageSchema({
    title: "Frequently Asked Questions | Campus Flow",
    description:
      "Find answers to frequently asked questions about Campus Flow, including notes access, PYQs, virtual study rooms, doubt solvers, and student accounts.",
    url: "/faq",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "FAQ", url: "/faq" },
    ],
  });

  const faqSchema = createFAQSchema(FAQ_DATA);

  return (
    <PublicLayout>
      <SEO
        title="Frequently Asked Questions (FAQ) | Campus Flow"
        description="Get answers to common questions about Campus Flow: accessing free lecture notes, PYQs, virtual study rooms, gamification, and college resources."
        canonicalPath="/faq"
        structuredData={[webPageSchema, faqSchema]}
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">FAQ</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase">
            <HelpCircle className="h-4 w-4" />
            Help Center &amp; Answers
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Frequently Asked <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-primary dark:via-cyan-400 dark:to-purple-400">
              Questions
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Everything you need to know about Campus Flow, resources, study rooms, and community policies.
          </p>
        </header>

        {/* Accordion FAQ List */}
        <div className="space-y-4 mb-16">
          {FAQ_DATA.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-slate-200 dark:border-white/10 rounded-2xl bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-lg text-slate-900 dark:text-white hover:text-primary transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base border-t border-slate-100 dark:border-white/5 pt-4">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions CTA */}
        <section className="p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-card/60 backdrop-blur-md text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Still have questions?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto text-sm">
            Can’t find what you’re looking for? Reach out to our student support team and we’ll get back to you promptly.
          </p>
          <div className="pt-2">
            <Button asChild className="rounded-full bg-primary text-white">
              <Link to="/contact">
                Contact Support <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
