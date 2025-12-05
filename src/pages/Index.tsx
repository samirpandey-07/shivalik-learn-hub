import { useState } from "react";
import { Navigation } from "@/components/common/Navigation";
import { SelectionFlow } from "@/components/selection/SelectionFlow";
import { ResourceGrid } from "@/components/resources/ResourceGrid";
import { UploadForm } from "@/components/upload/UploadForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  Download, 
  Star,
  ArrowRight,
  Zap,
  Shield,
  ArrowLeft
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

interface Selection {
  collegeId: string;
  collegeName: string;
  courseId: string;
  courseName: string;
  yearId: string;
  yearNumber: number;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [selection, setSelection] = useState<Selection | null>(null);

  const handleSelectionComplete = (newSelection: Selection) => {
    setSelection(newSelection);
    setActiveTab("browse");
  };

  const handleBackToSelection = () => {
    setSelection(null);
    setActiveTab("home");
  };

  const features = [
    {
      icon: BookOpen,
      title: "Curated Resources",
      description: "Access high-quality study materials reviewed by faculty and senior students"
    },
    {
      icon: Users,
      title: "Student Community",
      description: "Connect with peers and share knowledge across different courses and years"
    },
    {
      icon: Download,
      title: "Easy Access",
      description: "Download notes, presentations, and past papers with just one click"
    },
    {
      icon: Shield,
      title: "Quality Assured",
      description: "All uploads are moderated to ensure accuracy and relevance"
    }
  ];

  const stats = [
    { label: "Active Students", value: "2,500+", icon: Users },
    { label: "Study Resources", value: "1,200+", icon: BookOpen },
    { label: "Downloads", value: "15K+", icon: Download },
    { label: "Average Rating", value: "4.8", icon: Star }
  ];

  const getYearLabel = (num: number) => {
    if (num === 1) return '1st';
    if (num === 2) return '2nd';
    if (num === 3) return '3rd';
    return `${num}th`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container py-8">
        {/* Home - Selection Flow or Landing */}
        {activeTab === "home" && !selection && (
          <>
            {/* Hero Section */}
            <section className="relative py-12 overflow-hidden mb-12">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              <div className="relative">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        Shivalik College Resource Hub
                      </Badge>
                      <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                        Your Ultimate
                        <span className="bg-gradient-primary bg-clip-text text-transparent block">
                          Study Companion
                        </span>
                      </h1>
                      <p className="text-xl text-muted-foreground leading-relaxed">
                        Access thousands of study materials, previous year questions, and resources 
                        shared by students and faculty. Study smarter, not harder.
                      </p>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-6 pt-4">
                      {stats.slice(0, 2).map((stat, index) => {
                        const IconComponent = stat.icon;
                        return (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold">{stat.value}</div>
                              <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="relative hidden lg:block">
                    <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-3xl blur-3xl transform rotate-6" />
                    <img 
                      src={heroImage} 
                      alt="Students studying with digital resources"
                      className="relative rounded-3xl shadow-2xl w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Selection Flow */}
            <SelectionFlow onSelectionComplete={handleSelectionComplete} />

            {/* Features Section */}
            <section className="py-16 mt-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Why Choose ResourceHub?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Built by students, for students. Everything you need to excel in your studies.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <Card key={index} className="text-center shadow-card hover:shadow-lg transition-all bg-gradient-card">
                      <CardContent className="p-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <IconComponent className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          </>
        )}
        
        {/* Browse Resources */}
        {activeTab === "browse" && selection && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={handleBackToSelection}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{selection.collegeName}</h1>
                  <p className="text-muted-foreground">
                    {selection.courseName} • {getYearLabel(selection.yearNumber)} Year
                  </p>
                </div>
              </div>
            </div>
            <ResourceGrid 
              collegeId={selection.collegeId}
              courseId={selection.courseId}
              yearId={selection.yearId}
            />
          </div>
        )}

        {/* Browse without selection - show selection flow */}
        {activeTab === "browse" && !selection && (
          <SelectionFlow onSelectionComplete={handleSelectionComplete} />
        )}
        
        {/* Upload Form */}
        {activeTab === "upload" && (
          <UploadForm />
        )}
      </main>
    </div>
  );
};

export default Index;
