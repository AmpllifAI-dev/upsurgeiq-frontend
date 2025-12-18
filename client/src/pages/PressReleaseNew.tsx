import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Sparkles, FileText, ArrowLeft, Wand2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function PressReleaseNew() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [topic, setTopic] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data: business } = trpc.business.get.useQuery(undefined, {
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
      toast.error(error.message || "Failed to generate press release");
    },
  });

  const saveMutation = trpc.pressRelease.create.useMutation({
    onSuccess: () => {
      toast.success("Press release saved successfully!");
      setLocation("/press-releases");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save press release");
    },
  });

  if (loading) {
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

  if (!business) {
    setLocation("/onboarding");
    return null;
  }

  const handleGenerate = () => {
    if (!topic) {
      toast.error("Please enter a topic for your press release");
      return;
    }

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
      toast.error("Please generate content first");
      return;
    }

    saveMutation.mutate({
      title: topic,
      content: generatedContent,
      status: "draft",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">upsurgeIQ</span>
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
        <div className="mb-8">
          <Badge variant="secondary" className="mb-2">
            <FileText className="w-3 h-3 mr-1" />
            New Press Release
          </Badge>
          <h1 className="text-4xl font-bold text-foreground">Create Press Release</h1>
          <p className="text-muted-foreground mt-2">
            Use AI to generate professional press releases tailored to your brand voice
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
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
            </CardContent>
          </Card>

          {/* Preview/Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generated Content
              </CardTitle>
              <CardDescription>
                AI-generated press release based on your inputs
              </CardDescription>
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
                  <Textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    rows={20}
                    className="font-mono text-sm"
                  />
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
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
