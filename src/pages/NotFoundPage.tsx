import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Search, HelpCircle, ArrowLeft } from "lucide-react";
import { SEO } from "@/components/common/SEO";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground relative overflow-hidden">
      <SEO
        title="404 - Page Not Found | Campus Flow"
        description="The requested page could not be found on Campus Flow. Return to homepage or search our academic resources."
        noindex={true}
        canonicalPath="/404"
      />

      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-lg w-full text-center space-y-6 relative z-10 p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-500 text-xs font-semibold tracking-wide uppercase">
          Error 404
        </div>

        <h1 className="text-7xl md:text-8xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-primary dark:via-cyan-400 dark:to-purple-400 leading-none">
          404
        </h1>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Page Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            The page you are looking for doesn't exist, has been removed, or the link may have expired.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="rounded-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
          <Button asChild className="rounded-full bg-primary text-white">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" /> Return Home
            </Link>
          </Button>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <Link to="/browse" className="hover:text-primary flex items-center gap-1 transition-colors">
            <Search className="h-3.5 w-3.5" /> Browse Notes
          </Link>
          <span>•</span>
          <Link to="/faq" className="hover:text-primary flex items-center gap-1 transition-colors">
            <HelpCircle className="h-3.5 w-3.5" /> Visit FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}