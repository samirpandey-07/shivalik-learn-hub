import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
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
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
                            <p className="text-muted-foreground">Last updated: December 16, 2025</p>
                        </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                When you use Campus Flow, we collect information that ensures a seamless academic experience. This includes:
                            </p>
                            <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                                <li>Account information (Name, College Email, Profile preferences)</li>
                                <li>Academic details (College, Course, Year) for personalization</li>
                                <li>Usage data (Resources viewed, downloaded, or uploaded)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We use your data solely to improve the platform and your study experience. Specifically to:
                            </p>
                            <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                                <li>Personalize your feed with relevant study materials</li>
                                <li>Facilitate peer-to-peer learning and doubt solving</li>
                                <li>Maintain the security and integrity of the platform</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">3. Data Security</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We implement robust security measures to protect your personal information. Your data is encrypted in transit and at rest. We do not sell your personal data to third parties.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">4. Beta Service Disclaimer</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Campus Flow is currently in a public beta phase. While we strive for industry-standard security and reliability, some features may evolve. We value your feedback to improve the platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">5. Contact Us</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                If you have any questions about this Privacy Policy, please contact us through the feedback section in your dashboard.
                            </p>
                        </section>
                    </div>
                </Card>
            </div>
        </div>
    );
}
