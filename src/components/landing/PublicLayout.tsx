import { ReactNode } from "react";
import { LandingNavbar } from "./LandingNavbar";
import { Footer } from "./Footer";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <LandingNavbar />
      <main className="flex-1 pt-24 pb-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
