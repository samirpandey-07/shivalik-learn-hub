import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/useAuth";
import { useYears, uploadResource } from "@/hooks/useResources";
import { useGamification } from "@/hooks/useGamification";
import { supabase } from '@/lib/supabase/client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Upload,
  FileText,
  Video,
  Link,
  Presentation,
  X,
  CheckCircle,
  Info,
  AlertCircle
} from "lucide-react";

// ----------------------------
// Resource Types Configuration
// ----------------------------
const RESOURCE_TYPES = [
  { value: "notes", label: "Notes", icon: FileText, description: "Study materials, handwritten notes" },
  { value: "pyq", label: "Previous Year Questions", icon: FileText, description: "Past exams & solved papers" },
  { value: "presentation", label: "Presentation", icon: Presentation, description: "PPT or slide deck" },
  { value: "video", label: "Video", icon: Video, description: "Lecture videos, tutorials" },
  { value: "link", label: "External Link", icon: Link, description: "Reference websites or resources" }
];

const SUBJECTS = [
  "DSA", "DBMS", "OOP", "OS", "CN", "ML", "AI", "Web Development", "Mobile Development"
];

const SEMESTERS: Record<string, string[]> = {
  "1": ["1", "2"],
  "2": ["3", "4"],
  "3": ["5", "6"],
  "4": ["7", "8"]
};

// ----------------------------
// Component
// ----------------------------
export function UploadForm() {
  const { user, profile } = useAuth();
  const { awardCoins, UPLOAD_REWARD } = useGamification();

  // Fetch years based on user's course automatically
  const { years } = useYears(profile?.course_id);

  // Upload form states
  const [resourceType, setResourceType] = useState("");
  const [uploadType, setUploadType] = useState<"file" | "link">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    url: "",
    year: "", // This is "1", "2", "3", "4"
    semester: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // ----------------------------
  // Derived Semester List
  // ----------------------------
  const availableSemesters = useMemo(() => {
    if (!formData.year) return [];
    return SEMESTERS[formData.year] ?? [];
  }, [formData.year]);

  // ----------------------------
  // File Select
  // ----------------------------
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  // ----------------------------
  // Submit Handler
  // ----------------------------
  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    if (!user || !profile) {
      setStatus("error");
      setErrorMessage("You must be signed in to upload resources.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (!resourceType) throw new Error("Please select a resource type");
      if (!formData.title) throw new Error("Title is required");
      if (!formData.subject) throw new Error("Subject is required");
      if (!formData.year || !formData.semester) throw new Error("Year & Semester required");

      // Resolve Year ID from the "Year Number"
      const targetYearObj = years.find(y => y.year_number === parseInt(formData.year));
      if (!targetYearObj) {
        throw new Error(`Invalid Year selected. Could not find year ID for Year ${formData.year}`);
      }

      // Upload handling
      let finalUrl = formData.url;
      let fileSize: string | undefined = undefined;

      if (uploadType === "file") {
        if (!selectedFile) throw new Error("Please upload a file");

        const path = `resources/${user.id}/${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        const { error: uploadErr } = await supabase.storage
          .from("resources")
          .upload(path, selectedFile);

        if (uploadErr) throw uploadErr;

        const { data: publicUrl } = supabase.storage.from("resources").getPublicUrl(path);

        finalUrl = publicUrl?.publicUrl ?? "";
        fileSize = `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`;
      }

      // DB upload
      const { error } = await uploadResource({
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        type: resourceType as any,
        college_id: profile.college_id, // Use profile data
        course_id: profile.course_id,   // Use profile data
        year_id: targetYearObj.id,      // Use resolved UUID
        drive_link: finalUrl,
        file_size: fileSize,
        uploader_id: user.id,
        uploader_name: profile.full_name || user.email || "Unknown",
        uploader_year: formData.year,
      });

      if (error) throw error;

      setStatus("success");

      // Auto-reset form
      setTimeout(() => {
        setStatus("idle");
        setResourceType("");
        setSelectedFile(null);
        setFormData({
          title: "",
          subject: "",
          description: "",
          url: "",
          year: "",
          semester: ""
        });
      }, 2500);

    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Upload failed. Please try again.");
      console.error("Upload Error:", err);
    }

    setIsSubmitting(false);
  };

  // ----------------------------
  // Success Screen
  // ----------------------------
  if (status === "success") {
    return (
      <Card className="max-w-2xl mx-auto shadow-card text-center p-8 space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Upload Successful!</h2>
        <p className="text-muted-foreground">
          Your resource is submitted for admin review. You will receive coins once approved.
        </p>
        <div className="pt-4">
          <Button className="bg-gradient-primary" onClick={() => setStatus("idle")}>
            Upload Another
          </Button>
        </div>
      </Card>
    );
  }

  // ----------------------------
  // Form Section
  // ----------------------------
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold">Upload Resource</h1>
        <p className="text-muted-foreground">Share study materials with your juniors & friends.</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          All uploads require admin approval before becoming public.
        </AlertDescription>
      </Alert>

      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Select Resource Type</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Resource Type Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {RESOURCE_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.value}
                  className={`cursor-pointer transition-all ${resourceType === type.value ? "ring-2 ring-primary bg-primary/5" : ""
                    }`}
                  onClick={() => {
                    setResourceType(type.value);
                    setUploadType(["link", "video"].includes(type.value) ? "link" : "file");
                  }}
                >
                  <CardContent className="p-4 flex space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{type.label}</h3>
                      <p className="text-muted-foreground text-xs">{type.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {resourceType && (
            <>
              {/* Title + Subject */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    placeholder="Enter title"
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Subject *</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(v) => setFormData({ ...formData, subject: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Year + Semester */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Year *</Label>
                  <Select
                    value={formData.year}
                    onValueChange={(v) => {
                      setFormData({ ...formData, year: v, semester: "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {["1", "2", "3", "4"].map((year) => (
                        <SelectItem key={year} value={year}>
                          {year} Year
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Semester *</Label>
                  <Select
                    value={formData.semester}
                    onValueChange={(v) => setFormData({ ...formData, semester: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSemesters.map((sem) => (
                        <SelectItem key={sem} value={sem}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label>Description (optional)</Label>
                <Textarea
                  rows={3}
                  placeholder="Describe what this resource contains"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* File Upload OR Link Input */}
              {uploadType === "file" ? (
                <div>
                  <Label>Upload File *</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer">
                    <input
                      type="file"
                      id="file-input"
                      className="hidden"
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                    />
                    <label htmlFor="file-input" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      {!selectedFile ? (
                        <p className="text-muted-foreground">
                          Click to upload file (PDF/PPT/DOC)
                        </p>
                      ) : (
                        <>
                          <p className="font-medium">{selectedFile.name}</p>
                          <Badge variant="secondary">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </Badge>
                          <Button
                            variant="ghost"
                            className="mt-2"
                            onClick={() => setSelectedFile(null)}
                          >
                            <X className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <Label>{resourceType === "video" ? "Video URL *" : "External Link *"}</Label>
                  <Input
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                onClick={handleSubmit} // Attached handler
                disabled={isSubmitting}
                className="w-full bg-gradient-primary text-white mt-4"
              >
                {isSubmitting ? "Uploading..." : "Submit for Review"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
