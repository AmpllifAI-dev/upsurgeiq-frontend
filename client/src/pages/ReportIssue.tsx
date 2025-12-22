import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Bug, Lightbulb, HelpCircle, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";

export default function ReportIssue() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [issueType, setIssueType] = useState<"bug" | "feature_request" | "improvement" | "question">("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [expectedBehavior, setExpectedBehavior] = useState("");
  const [actualBehavior, setActualBehavior] = useState("");

  const submitIssue = trpc.issues.submit.useMutation({
    onSuccess: () => {
      toast({
        title: "Issue reported successfully",
        description: "We'll review your report and get back to you soon.",
      });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to submit issue",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide a title and description.",
      });
      return;
    }

    submitIssue.mutate({
      issueType,
      title,
      description,
      stepsToReproduce: stepsToReproduce || undefined,
      expectedBehavior: expectedBehavior || undefined,
      actualBehavior: actualBehavior || undefined,
      browserInfo: navigator.userAgent,
      deviceInfo: `${navigator.platform} - ${window.screen.width}x${window.screen.height}`,
      pageUrl: window.location.href,
    });
  };

  const issueTypeOptions = [
    { value: "bug", label: "Bug Report", icon: Bug, description: "Something isn't working as expected" },
    { value: "feature_request", label: "Feature Request", icon: Lightbulb, description: "Suggest a new feature" },
    { value: "improvement", label: "Improvement", icon: AlertCircle, description: "Suggest an enhancement" },
    { value: "question", label: "Question", icon: HelpCircle, description: "Ask a question" },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Report an Issue</CardTitle>
            <CardDescription>
              Help us improve UpsurgeIQ by reporting bugs, requesting features, or asking questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Issue Type */}
              <div className="space-y-2">
                <Label>Issue Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {issueTypeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setIssueType(option.value as typeof issueType)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          issueType === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`h-5 w-5 mt-0.5 ${issueType === option.value ? "text-primary" : "text-muted-foreground"}`} />
                          <div>
                            <p className="font-medium">{option.label}</p>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief summary of the issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the issue"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              {/* Bug-specific fields */}
              {issueType === "bug" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="stepsToReproduce">Steps to Reproduce</Label>
                    <Textarea
                      id="stepsToReproduce"
                      placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                      value={stepsToReproduce}
                      onChange={(e) => setStepsToReproduce(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expectedBehavior">Expected Behavior</Label>
                      <Textarea
                        id="expectedBehavior"
                        placeholder="What should happen?"
                        value={expectedBehavior}
                        onChange={(e) => setExpectedBehavior(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="actualBehavior">Actual Behavior</Label>
                      <Textarea
                        id="actualBehavior"
                        placeholder="What actually happens?"
                        value={actualBehavior}
                        onChange={(e) => setActualBehavior(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* System Info (auto-collected) */}
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">System Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Browser:</strong> {navigator.userAgent.split(" ").slice(-2).join(" ")}</p>
                  <p><strong>Platform:</strong> {navigator.platform}</p>
                  <p><strong>Screen:</strong> {window.screen.width}x{window.screen.height}</p>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/dashboard")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitIssue.isPending}
                  className="flex-1"
                >
                  {submitIssue.isPending ? "Submitting..." : "Submit Issue"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
