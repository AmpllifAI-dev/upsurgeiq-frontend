import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HelpCircle,
  Keyboard,
  BookOpen,
  MessageCircle,
  FileText,
  Zap,
  Users,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function HelpCenter() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="w-4 h-4 mr-2" />
          Help Center
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Help Center</DialogTitle>
          <DialogDescription>
            Get help with UpsurgeIQ features, keyboard shortcuts, and best practices
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="shortcuts" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="shortcuts">
              <Keyboard className="w-4 h-4 mr-2" />
              Shortcuts
            </TabsTrigger>
            <TabsTrigger value="features">
              <BookOpen className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="faq">
              <MessageCircle className="w-4 h-4 mr-2" />
              FAQ
            </TabsTrigger>
          </TabsList>

          {/* Keyboard Shortcuts */}
          <TabsContent value="shortcuts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
                <CardDescription>Speed up your workflow with these shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Global Shortcuts
                  </h4>
                  <div className="space-y-2">
                    <ShortcutRow keys={["Ctrl", "K"]} description="Open command palette" />
                    <ShortcutRow keys={["Ctrl", "/"]} description="Show keyboard shortcuts" />
                    <ShortcutRow keys={["Esc"]} description="Close dialogs and modals" />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Content Creation
                  </h4>
                  <div className="space-y-2">
                    <ShortcutRow keys={["Ctrl", "N"]} description="New press release" />
                    <ShortcutRow keys={["Ctrl", "S"]} description="Save draft" />
                    <ShortcutRow keys={["Ctrl", "Enter"]} description="Generate with AI" />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Navigation
                  </h4>
                  <div className="space-y-2">
                    <ShortcutRow keys={["G", "D"]} description="Go to Dashboard" />
                    <ShortcutRow keys={["G", "P"]} description="Go to Press Releases" />
                    <ShortcutRow keys={["G", "C"]} description="Go to Campaign Lab" />
                    <ShortcutRow keys={["G", "J"]} description="Go to Journalists" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Guide */}
          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Feature Guides</CardTitle>
                <CardDescription>Learn how to use UpsurgeIQ's powerful features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FeatureGuide
                  icon={<Zap className="w-5 h-5" />}
                  title="AI-Powered Press Releases"
                  description="Generate professional press releases in seconds using AI. Simply describe your news, and our AI will create a compelling press release following industry best practices."
                  steps={[
                    "Click 'New Press Release' from the dashboard",
                    "Enter your headline and key details",
                    "Click 'Generate with AI' to create content",
                    "Review and edit the generated content",
                    "Distribute to your media lists",
                  ]}
                />

                <FeatureGuide
                  icon={<BarChart3 className="w-5 h-5" />}
                  title="Campaign Lab"
                  description="Plan, execute, and track marketing campaigns with AI-powered strategy generation and real-time analytics."
                  steps={[
                    "Click 'New Campaign' in Campaign Lab",
                    "Complete the 5-step planning wizard",
                    "Review AI-generated campaign strategy",
                    "Add milestones and deliverables",
                    "Track performance in the analytics dashboard",
                  ]}
                />

                <FeatureGuide
                  icon={<Users className="w-5 h-5" />}
                  title="Journalist Database"
                  description="Build and manage relationships with journalists and media contacts. Track interactions and segment by beat or industry."
                  steps={[
                    "Navigate to Journalists section",
                    "Add journalists manually or import via CSV",
                    "Organize by beats and tags",
                    "Track outreach history",
                    "Build targeted media lists for distribution",
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
                <CardDescription>Common questions and answers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FAQItem
                  question="How many press releases can I create?"
                  answer="It depends on your subscription tier. Starter plans include 10 press releases per month, Pro includes 50, and Scale includes unlimited press releases."
                />

                <FAQItem
                  question="Can I customize the AI-generated content?"
                  answer="Yes! All AI-generated content is fully editable. The AI provides a strong starting point, but you have complete control to refine and customize the content to match your brand voice and specific needs."
                />

                <FAQItem
                  question="How does the journalist database work?"
                  answer="You can add journalists manually or import them via CSV. Each journalist profile includes contact information, beats, publication details, and interaction history. You can segment journalists by industry, beat, or custom tags to create targeted media lists."
                />

                <FAQItem
                  question="What analytics are tracked in Campaign Lab?"
                  answer="Campaign Lab tracks impressions, clicks, conversions, spend, reach, and engagement metrics. You'll see performance trends over time, conversion funnels, and ROI calculations to measure campaign effectiveness."
                />

                <FAQItem
                  question="Can I export my data?"
                  answer="Yes! You can export press releases as PDFs, export campaign reports, and download journalist lists as CSV files. All your data remains accessible and portable."
                />

                <FAQItem
                  question="How do I upgrade my subscription?"
                  answer="Navigate to Settings → Subscription to view available plans and upgrade options. Upgrades take effect immediately, and you'll be charged a prorated amount for the remainder of your billing cycle."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Need more help?{" "}
            <a href="mailto:support@upsurgeiq.com" className="text-primary hover:underline">
              Contact our support team
            </a>{" "}
            or visit our{" "}
            <a href="/help" className="text-primary hover:underline">
              full documentation
            </a>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutRow({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <span key={index}>
            <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
              {key}
            </kbd>
            {index < keys.length - 1 && <span className="mx-1 text-muted-foreground">+</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function FeatureGuide({
  icon,
  title,
  description,
  steps,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  steps: string[];
}) {
  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
      <div className="ml-11 space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-2 text-sm">
            <Badge variant="outline" className="mt-0.5">
              {index + 1}
            </Badge>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-border pb-4 last:border-0 last:pb-0">
      <h4 className="font-semibold mb-2">{question}</h4>
      <p className="text-sm text-muted-foreground">{answer}</p>
    </div>
  );
}
