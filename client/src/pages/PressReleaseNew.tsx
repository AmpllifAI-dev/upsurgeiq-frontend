import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Sparkles, FileText, ArrowLeft, Wand2, PenTool } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RichTextEditor } from "@/components/RichTextEditor";
import { CopyButton } from "@/components/CopyButton";
import { CharacterCounter } from "@/components/CharacterCounter";
import { PressReleaseImageGenerator } from "@/components/PressReleaseImageGenerator";
import { WordCountPurchaseCTA } from "@/components/WordCountPurchaseCTA";
import { ImageUpload } from "@/components/ImageUpload";
import { AIGenerationWarning, shouldShowAIWarning } from "@/components/AIGenerationWarning";

export default function PressReleaseNew() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Detect mode from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode') || 'ai'; // 'ai' or 'manual'
  const isManualMode = mode === 'manual';
  
  const [topic, setTopic] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [showPurchaseCTA, setShowPurchaseCTA] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [timezone, setTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [wordCountError, setWordCountError] = useState<{
    requiredWords: number;
    tierLimit: number;
    purchasedWords: number;
  } | null>(null);
  const [showAIWarning, setShowAIWarning] = useState(false);
  const [distributionType, setDistributionType] = useState<"ai_assisted" | "manual">("ai_assisted");

  const { data: business, isLoading: businessLoading } = trpc.business.get.useQuery(undefined, {
    enabled: !!user,
  });

  const generateMutation = trpc.pressRelease.generate.useMutation({
    onSuccess: (data) => {
      const content = typeof data.content === 'string' ? data.content : '';
      setGeneratedContent(content);
      setIsGenerating(false);
      toast.success("Press release generated successfully!");
    },
    onError: (error) => {
      setIsGenerating(false);
      
      // Check if error is about word count limits
      if (error.message && error.message.includes("need") && error.message.includes("more words")) {
        // Parse error message to extract numbers
        const match = error.message.match(/need (\d+) more words.*allows (\d+) words.*have (\d+) purchased/);
        if (match) {
          const [, requiredWords, tierLimit, purchasedWords] = match;
          setWordCountError({
            requiredWords: parseInt(requiredWords),
            tierLimit: parseInt(tierLimit),
            purchasedWords: parseInt(purchasedWords),
          });
          setShowPurchaseCTA(true);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error(error.message || "Failed to generate press release");
      }
    },
  });

  const saveMutation = trpc.pressRelease.create.useMutation({
    onSuccess: () => {
      toast.success("Press release created!", {
        description: "Your press release has been saved as a draft. You can publish it when ready."
      });
      setLocation("/press-releases");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save press release");
    },
  });

  if (loading || businessLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  // Only redirect to onboarding if business data is explicitly null after loading
  if (!business && !businessLoading) {
    setLocation("/onboarding");
    return null;
  }

  const handleGenerate = () => {
    if (!topic) {
      toast.error("Topic required", {
        description: "Please enter a topic or headline for your press release to get started."
      });
      return;
    }

    if (topic.length < 10) {
      toast.error("Topic too short", {
        description: "Please provide a more descriptive topic (at least 10 characters) for better AI results."
      });
      return;
    }

    // Check if we should show the AI warning
    if (shouldShowAIWarning()) {
      setShowAIWarning(true);
    } else {
      proceedWithGeneration();
    }
  };

  const proceedWithGeneration = () => {
    setIsGenerating(true);
    generateMutation.mutate({
      topic,
      keyPoints,
      targetAudience: targetAudience || business.targetAudience || "",
      tone: tone || business.brandVoiceTone || "formal",
    });
  };

  const handleSave = () => {
    if (!generatedContent) {
      toast.error("No content to save", {
        description: isManualMode ? "Please write some content before saving." : "Please generate press release content using the AI before saving."
      });
      return;
    }
    
    if (isManualMode && !manualTitle) {
      toast.error("Title required", {
        description: "Please enter a title for your press release."
      });
      return;
    }

    if (generatedContent.length < 100) {
      toast.error("Content too short", {
        description: "The press release content seems too brief. Consider adding more details or regenerating."
      });
      return;
    }

    // Combine date and time for scheduling
    let scheduledFor: string | undefined;
    if (scheduledDate && scheduledTime) {
      scheduledFor = `${scheduledDate}T${scheduledTime}:00`;
    }

    saveMutation.mutate({
      title: isManualMode ? manualTitle : topic,
      content: generatedContent,
      imageUrl: generatedImageUrl || uploadedImageUrl || undefined,
      status: scheduledFor ? "scheduled" : "draft",
      distributionType,
      scheduledFor,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">UpsurgeIQ</span>
          </div>
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-8 max-w-6xl">
        <Breadcrumb items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Press Releases", href: "/press-releases" },
          { label: "New Press Release" }
        ]} />
        <div className="mb-8 mt-4">
          <Badge variant="secondary" className="mb-2">
            <FileText className="w-3 h-3 mr-1" />
            New Press Release
          </Badge>
          <h1 className="text-4xl font-bold text-foreground">
            {isManualMode ? "Write Press Release" : "Create Press Release"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isManualMode 
              ? "Write your press release from scratch with our rich text editor" 
              : "Use AI to generate professional press releases tailored to your brand voice"
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Input Form - AI Mode */}
          {!isManualMode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Content Details
              </CardTitle>
              <CardDescription>
                Provide information about your press release
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic / Headline *</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Company Launches Revolutionary New Product"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isGenerating}
                />
                <CharacterCounter current={topic.length} max={150} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keyPoints">Key Points</Label>
                <Textarea
                  id="keyPoints"
                  placeholder="List the main points you want to cover..."
                  value={keyPoints}
                  onChange={(e) => setKeyPoints(e.target.value)}
                  rows={4}
                  disabled={isGenerating}
                />
                <CharacterCounter current={keyPoints.length} max={500} />
                <p className="text-xs text-muted-foreground">
                  Optional: Bullet points or key information to include
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  placeholder={business.targetAudience || "e.g., Tech industry professionals"}
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground">
                  Default: {business.targetAudience || "General audience"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="distributionType">Distribution Type</Label>
                <Select value={distributionType} onValueChange={(val: "ai_assisted" | "manual") => setDistributionType(val)} disabled={isGenerating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai_assisted">AI-Assisted (uses tier credits)</SelectItem>
                    <SelectItem value="manual">Manual Distribution (unlimited, no credits)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {distributionType === "manual" ? (
                    <span className="text-green-600 dark:text-green-400 font-medium">✓ Unlimited - No credits consumed</span>
                  ) : (
                    "Uses 1 press release credit from your tier allowance"
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={setTone} disabled={isGenerating}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Default: ${business.brandVoiceTone || "Formal"}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal & Professional</SelectItem>
                    <SelectItem value="friendly">Friendly & Approachable</SelectItem>
                    <SelectItem value="inspirational">Inspirational & Visionary</SelectItem>
                    <SelectItem value="witty">Witty & Playful</SelectItem>
                    <SelectItem value="educational">Educational & Informative</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Default: {business.brandVoiceTone || "Formal"}
                </p>
              </div>

              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Press Release
                  </>
                )}
              </Button>

              {/* Word Count Purchase CTA */}
              {showPurchaseCTA && wordCountError && (
                <div className="mt-6">
                  <WordCountPurchaseCTA
                    requiredWords={wordCountError.requiredWords}
                    tierLimit={wordCountError.tierLimit}
                    purchasedWords={wordCountError.purchasedWords}
                    onPurchaseSuccess={() => {
                      setShowPurchaseCTA(false);
                      setWordCountError(null);
                      toast.success("Purchase successful! You can now generate your press release.");
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          )}
          
          {/* Manual Mode Form */}
          {isManualMode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="w-5 h-5" />
                Press Release Details
              </CardTitle>
              <CardDescription>
                Enter your press release information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="manualTitle">Title *</Label>
                <Input
                  id="manualTitle"
                  placeholder="Enter press release title"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                />
                <CharacterCounter current={manualTitle.length} max={150} />
              </div>
              
              <div className="space-y-2">
                <Label>Content *</Label>
                <RichTextEditor
                  content={generatedContent}
                  onChange={setGeneratedContent}
                  placeholder="Start writing your press release..."
                  minHeight="400px"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="distributionType">Distribution Type</Label>
                <Select value={distributionType} onValueChange={(val: "ai_assisted" | "manual") => setDistributionType(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai_assisted">AI-Assisted (uses tier credits)</SelectItem>
                    <SelectItem value="manual">Manual Distribution (unlimited, no credits)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {distributionType === "manual" ? (
                    <span className="text-green-600 dark:text-green-400 font-medium">✓ Unlimited - No credits consumed</span>
                  ) : (
                    "Uses 1 press release credit from your tier allowance"
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Preview/Output */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Generated Content
                  </CardTitle>
                  <CardDescription>
                    AI-generated press release based on your inputs
                  </CardDescription>
                </div>
                {generatedContent && (
                  <CopyButton text={generatedContent} label="Copy content" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!generatedContent && !isGenerating && (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Your generated press release will appear here
                  </p>
                </div>
              )}

              {isGenerating && (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                  <p className="text-muted-foreground">
                    AI is crafting your press release...
                  </p>
                </div>
              )}

              {generatedContent && !isEditing && (
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none bg-muted/30 p-6 rounded-lg">
                    <Streamdown>{generatedContent}</Streamdown>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Content
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleSave}
                      disabled={saveMutation.isPending}
                    >
                      Save as Draft
                    </Button>
                  </div>
                </div>
              )}

              {generatedContent && isEditing && (
                <div className="space-y-4">
                  {generatedImageUrl && (
                    <div className="relative">
                      <img
                        src={generatedImageUrl}
                        alt="Generated press release image"
                        className="w-full h-auto rounded-lg border mb-4"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGeneratedImageUrl(null)}
                        className="absolute top-2 right-2"
                      >
                        Remove Image
                      </Button>
                    </div>
                  )}
                  <RichTextEditor
                    content={generatedContent}
                    onChange={setGeneratedContent}
                    placeholder="Edit your press release content..."
                    minHeight="500px"
                  />
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold">Upload Your Own Image</h3>
                      <p className="text-xs text-muted-foreground">
                        Add your own image to accompany this press release (included in campaign)
                      </p>
                      <ImageUpload
                        onImageSelect={(file, url) => {
                          setUploadedImage(file);
                          setUploadedImageUrl(url);
                        }}
                        currentImage={uploadedImageUrl}
                        onRemove={() => {
                          setUploadedImage(null);
                          setUploadedImageUrl(null);
                        }}
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or generate with AI (costs extra)</span>
                      </div>
                    </div>
                    <PressReleaseImageGenerator
                      title={topic}
                      content={generatedContent}
                      onImageGenerated={(url) => setGeneratedImageUrl(url)}
                    />
                    {/* Scheduling Section */}
                    <Card className="border-dashed">
                      <CardHeader>
                        <CardTitle className="text-sm">Schedule Publication (Optional)</CardTitle>
                        <CardDescription className="text-xs">
                          Leave blank to save as draft, or set a future date to schedule automatic publication
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="scheduledDate" className="text-xs">Date</Label>
                            <Input
                              id="scheduledDate"
                              type="date"
                              value={scheduledDate}
                              onChange={(e) => setScheduledDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="scheduledTime" className="text-xs">Time</Label>
                            <Input
                              id="scheduledTime"
                              type="time"
                              value={scheduledTime}
                              onChange={(e) => setScheduledTime(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timezone" className="text-xs">Timezone</Label>
                          <Select value={timezone} onValueChange={setTimezone}>
                            <SelectTrigger id="timezone">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="America/New_York">Eastern Time (US)</SelectItem>
                              <SelectItem value="America/Chicago">Central Time (US)</SelectItem>
                              <SelectItem value="America/Denver">Mountain Time (US)</SelectItem>
                              <SelectItem value="America/Los_Angeles">Pacific Time (US)</SelectItem>
                              <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                              <SelectItem value="Europe/Paris">Paris (CET/CEST)</SelectItem>
                              <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                              <SelectItem value="Australia/Sydney">Sydney (AEDT/AEST)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsEditing(false)}
                      >
                        Preview
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                      >
                        {scheduledDate && scheduledTime ? "Schedule Release" : "Save as Draft"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Generation Warning Dialog */}
      <AIGenerationWarning
        open={showAIWarning}
        onOpenChange={setShowAIWarning}
        onConfirm={proceedWithGeneration}
        creditsToUse={1}
        actionDescription="You are about to generate a press release using AI. This will use 1 credit from your account."
      />
    </div>
  );
}
