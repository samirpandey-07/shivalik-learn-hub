import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Scale } from "lucide-react";

export default function TermsOfService() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>

                <Card className="p-8 md:p-12 bg-white/50 dark:bg-slate-950/50 backdrop-blur border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                            <Scale className="h-8 w-8 text-purple-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
                            <p className="text-muted-foreground">Last updated: December 16, 2025</p>
                        </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                By accessing or using Campus Flow, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">2. User Conduct</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                You agree to use the platform responsibly. You must not:
                            </p>
                            <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                                <li>Upload content that violates intellectual property rights</li>
                                <li>Post malicious, offensive, or harmful content</li>
                                <li>Attempt to breach the security of the platform</li>
                                <li>Use the service for any illegal purpose</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">3. User Content & Licensing</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                When you upload notes, papers, or other resources to Campus Flow:
                            </p>
                            <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                                <li>You maintain ownership of your content.</li>
                                <li>You grant Campus Flow a non-exclusive, royalty-free license to host, display, and distribute your content to other users on the platform.</li>
                                <li>You represent that you have the right to share the content and it does not violate any third-party rights.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">4. Academic Integrity</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Campus Flow is a tool for learning and collaboration. It should not be used for academic dishonesty or cheating. We encourage responsible sharing of knowledge.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">5. Disclaimer</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                The content on Campus Flow is user-generated. We do not guarantee the accuracy, completeness, or usefulness of any resource. Use the materials at your own discretion.
                            </p>
                        </section>
                    </div>
                </Card>
            </div>
        </div>
    );
}
