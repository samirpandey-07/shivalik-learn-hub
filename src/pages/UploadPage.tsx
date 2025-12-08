import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Rocket, Upload, FileText, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useNavigate } from "react-router-dom";
import { useColleges, useCourses, useYears } from "@/hooks/useResources";
import { ParticlesBackground } from "@/components/landing/ParticlesBackground";
import { Database } from "@/lib/supabase/types";

type ResourceType = Database["public"]["Enums"]["resource_type"];

export default function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form State
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ResourceType>("notes");
  const [collegeId, setCollegeId] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const [yearId, setYearId] = useState<string>("");

  const { colleges } = useColleges();
  const { courses } = useCourses(collegeId || null);
  const { years } = useYears(courseId || null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!file || !title || !subject || !type || !collegeId || !courseId || !yearId) {
      toast.error("Missing Information", {
        description: "Please fill in all required fields (including Subject) and upload a file.",
      });
      return;
    }

    setLoading(true);
    setUploadProgress(10); // Start progress

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      setUploadProgress(30);

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from("resources")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setUploadProgress(60);

      const { data: { publicUrl } } = supabase.storage
        .from("resources")
        .getPublicUrl(filePath);

      // Insert record
      const { error: insertError } = await supabase.from("resources").insert({
        title,
        description,
        type,
        subject,
        file_url: publicUrl,
        uploader_id: user.id,
        college_id: collegeId,
        course_id: courseId,
        year_id: yearId,
        status: "pending",
      });

      if (insertError) throw insertError;

      setUploadProgress(100);

      toast.success("Launch Successful! 🚀", {
        description: "Your resource has been submitted for review.",
      });

      setTimeout(() => navigate("/dashboard"), 1500);

    } catch (error: any) {
      toast.error("Launch Aborted", {
        description: error.message || "Something went wrong during upload.",
      });
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
      {/* Antigravity Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-slate-950 to-slate-950 z-0" />
      <ParticlesBackground />

      <Card className="relative z-10 w-full max-w-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl animate-fade-in my-10">
        <div className="p-8 md:p-12 space-y-8">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20 mb-4 border border-white/10">
              <Rocket className="h-8 w-8 text-cyan-400 animate-pulse" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
              Launch a Resource
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Share your knowledge with the universe. Upload notes, papers, or guides to help others lift off.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Magnetic Dropzone */}
            <div
              className={`relative group border-2 border-dashed rounded-3xl transition-all duration-300 ease-in-out min-h-[200px] flex flex-col items-center justify-center text-center p-8 cursor-pointer overflow-hidden
                          ${dragActive ? 'border-cyan-400 bg-cyan-400/10 scale-[1.02]' : 'border-white/10 hover:border-cyan-400/50 hover:bg-white/5'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-purple-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              />

              {file ? (
                <div className="flex flex-col items-center animate-in zoom-in spin-in-3">
                  <FileText className="h-16 w-16 text-cyan-400 mb-4" />
                  <p className="text-lg font-medium text-white">{file.name}</p>
                  <p className="text-sm text-cyan-400/80">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <Button
                    type="button"
                    variant="ghost"
                    className="mt-4 text-muted-foreground hover:text-white z-10"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="h-8 w-8 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-white group-hover:text-cyan-400 transition-colors">
                      Drag & drop your file here
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click to browse
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Metadata Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">Title</label>
                <Input
                  placeholder="e.g. Engineering Mathematics Unit 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-cyan-400/50 text-white placeholder:text-white/20 h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">Subject</label>
                <Input
                  placeholder="e.g. Mathematics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-cyan-400/50 text-white placeholder:text-white/20 h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground ml-1">Resource Type</label>
              <Select value={type} onValueChange={(val) => setType(val as ResourceType)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 text-white">
                  <SelectItem value="notes">Notes</SelectItem>
                  <SelectItem value="pyq">PYQ</SelectItem>
                  <SelectItem value="important_questions">Imp. Questions</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground ml-1">Description</label>
              <Textarea
                placeholder="Tell us a bit about this resource..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-cyan-400/50 text-white placeholder:text-white/20 min-h-[100px] rounded-xl resize-none"
              />
            </div>

            {/* Taxonomy Selectors */}
            <div className="grid md:grid-cols-3 gap-6">
              <Select value={collegeId} onValueChange={(val) => { setCollegeId(val); setCourseId(""); setYearId(""); }}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                  <SelectValue placeholder="Select College" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900/95 border-white/10 text-white">
                  {colleges?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={courseId} onValueChange={(val) => { setCourseId(val); setYearId(""); }} disabled={!collegeId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900/95 border-white/10 text-white">
                  {courses?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={yearId} onValueChange={setYearId} disabled={!courseId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900/95 border-white/10 text-white">
                  {years?.map(y => <SelectItem key={y.id} value={y.id}>Year {y.year_number}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-lg font-semibold rounded-full bg-gradient-to-r from-primary via-cyan-500 to-blue-600 hover:scale-[1.02] shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Launching... {uploadProgress}%
                  </>
                ) : (
                  <>
                    Launch Resource 🚀
                  </>
                )}
              </Button>
            </div>

          </form>
        </div>
      </Card>
    </div>
  );
}