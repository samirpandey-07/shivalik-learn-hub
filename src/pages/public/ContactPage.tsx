import { useState } from "react";
import { PublicLayout } from "@/components/landing/PublicLayout";
import { SEO } from "@/components/common/SEO";
import { createWebPageSchema } from "@/lib/seo/schemaData";
import { Mail, MessageSquare, Send, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Support");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // In client-side SPA, open default email client with mailto or simulate immediate confirmation
    const mailtoUrl = `mailto:sigmaprimeplus@gmail.com?subject=${encodeURIComponent(
      `[Campus Flow Support] ${subject}: ${name}`
    )}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;

    window.location.href = mailtoUrl;
    setSubmitted(true);
    toast.success("Opening your email client to send your message...");
  };

  const schema = createWebPageSchema({
    title: "Contact Campus Flow | Student Support & Feedback",
    description:
      "Get in touch with the Campus Flow team for student assistance, bug reports, content moderation, or institutional partnerships.",
    url: "/contact",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Contact", url: "/contact" },
    ],
  });

  return (
    <PublicLayout>
      <SEO
        title="Contact Us | Campus Flow - Student Support & Inquiries"
        description="Contact the Campus Flow support team at sigmaprimeplus@gmail.com. We assist with academic resources, copyright inquiries, and student feedback."
        canonicalPath="/contact"
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
            <li className="text-foreground font-medium">Contact</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase">
            <MessageSquare className="h-4 w-4" />
            We're Here to Help
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Get in Touch with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-primary dark:via-cyan-400 dark:to-purple-400">
              Campus Flow
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Have a question, feedback, or need help with course materials? Reach out to our student operations team.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Contact Channels
              </h2>
              
              <div className="space-y-4">
                <a
                  href="mailto:sigmaprimeplus@gmail.com"
                  className="flex items-start gap-3 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors group"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-muted-foreground">Direct Support Email</p>
                    <p className="text-sm font-medium text-foreground">sigmaprimeplus@gmail.com</p>
                  </div>
                </a>

                <a
                  href="https://instagram.com/droneclubshivalik"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors group"
                >
                  <div className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-105 transition-transform shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-muted-foreground">Community Instagram</p>
                    <p className="text-sm font-medium text-foreground">@droneclubshivalik</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Content Notice / Moderation */}
            <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 backdrop-blur-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-semibold text-sm">
                <ShieldAlert className="h-4 w-4" />
                Academic &amp; Copyright Inquiries
              </div>
              <p className="text-xs text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
                If you are a faculty member or rights holder and wish to request removal of a specific document or note uploaded by a student, please email us with the exact URL for swift takedown.
              </p>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-xl">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Message Prepared!</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm max-w-sm mx-auto">
                    Your email client should have opened. If not, feel free to email us directly at <strong>sigmaprimeplus@gmail.com</strong>.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                    className="rounded-full"
                  >
                    Send another inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Send an Inquiry
                  </h2>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-name" className="text-xs font-semibold uppercase text-muted-foreground">
                      Your Name
                    </label>
                    <Input
                      id="contact-name"
                      placeholder="e.g., Alex Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-email" className="text-xs font-semibold uppercase text-muted-foreground">
                      College Email Address
                    </label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="e.g., alex@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-subject" className="text-xs font-semibold uppercase text-muted-foreground">
                      Subject
                    </label>
                    <select
                      id="contact-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="General Support">General Support &amp; Questions</option>
                      <option value="Resource Request">Request New Course / Branch</option>
                      <option value="Content Report">Report Inappropriate or Copyrighted Material</option>
                      <option value="Feedback / Bug">Platform Bug or Feature Feedback</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-message" className="text-xs font-semibold uppercase text-muted-foreground">
                      Message
                    </label>
                    <Textarea
                      id="contact-message"
                      rows={4}
                      placeholder="Describe your inquiry or question in detail..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full rounded-full bg-primary text-white">
                    <Send className="mr-2 h-4 w-4" /> Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
