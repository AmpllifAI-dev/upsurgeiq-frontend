import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, Share2, ArrowLeft, Sparkles, Calendar, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function SocialMediaNew() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [content, setContent] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [scheduledFor, setScheduledFor] = useState("");
  const [customTones, setCustomTones] = useState<Record<string, string>>({});

  const { data: business } = trpc.business.get.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: subscription } = trpc.subscription.get.useQuery(undefined, {
    enabled: !!user,
  });

  const createMutation = trpc.socialMedia.create.useMutation({
    onSuccess: () => {
      toast.success("Social media post created successfully!");
      setLocation("/social-media");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create social media post");
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

  if (!user || !business || !subscription) {
    setLocation("/");
    return null;
  }

  const availablePlatforms = [
    { id: "facebook", name: "Facebook", icon: Facebook, limit: ["starter", "pro", "scale"] },
    { id: "instagram", name: "Instagram", icon: Instagram, limit: ["pro", "scale"] },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, limit: ["pro", "scale"] },
    { id: "x", name: "X (Twitter)", icon: Twitter, limit: ["scale"] },
  ];

  const canUsePlatform = (platformLimits: string[]) => {
    return platformLimits.includes(subscription.plan);
  };

  const togglePlatform = (platformId: string) => {
    setPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSave = () => {
    if (!content) {
      toast.error("Please enter content for your post");
      return;
    }

    if (platforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }

    createMutation.mutate({
      content,
      platforms,
      scheduledFor: scheduledFor || undefined,
      customTones,
    });
  };

  const getCharacterLimit = (platform: string) => {
    const limits: Record<string, number> = {
      x: 280,
      facebook: 63206,
      instagram: 2200,
      linkedin: 3000,
    };
    return limits[platform] || 5000;
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
            <Share2 className="w-3 h-3 mr-1" />
            New Social Media Post
          </Badge>
          <h1 className="text-4xl font-bold text-foreground">Create Social Media Post</h1>
          <p className="text-muted-foreground mt-2">
            Compose and schedule posts across your social media channels
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Content</CardTitle>
                <CardDescription>Write your social media post</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Message *</Label>
                  <Textarea
                    id="content"
                    placeholder="What would you like to share?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    {content.length} characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledFor">Schedule (Optional)</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to post immediately
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform-Specific Customization</CardTitle>
                <CardDescription>
                  Customize tone for each platform (optional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="facebook" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="facebook">Facebook</TabsTrigger>
                    <TabsTrigger value="instagram">Instagram</TabsTrigger>
                    <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                    <TabsTrigger value="x">X</TabsTrigger>
                  </TabsList>
                  {["facebook", "instagram", "linkedin", "x"].map((platform) => (
                    <TabsContent key={platform} value={platform} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Tone for {platform.charAt(0).toUpperCase() + platform.slice(1)}</Label>
                        <Select
                          value={customTones[platform] || ""}
                          onValueChange={(value) =>
                            setCustomTones((prev) => ({ ...prev, [platform]: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Use default brand tone" />
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
                          Character limit: {getCharacterLimit(platform)}
                        </p>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Platforms</CardTitle>
                <CardDescription>Choose where to publish</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availablePlatforms.map((platform) => {
                  const canUse = canUsePlatform(platform.limit);
                  const Icon = platform.icon;
                  return (
                    <div
                      key={platform.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border ${
                        canUse
                          ? "cursor-pointer hover:bg-muted/50"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                      onClick={() => canUse && togglePlatform(platform.id)}
                    >
                      <Checkbox
                        checked={platforms.includes(platform.id)}
                        disabled={!canUse}
                      />
                      <Icon className="w-5 h-5" />
                      <div className="flex-1">
                        <div className="font-medium">{platform.name}</div>
                        {!canUse && (
                          <div className="text-xs text-muted-foreground">
                            Upgrade to {platform.limit[platform.limit.length - 1]} plan
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Enhancement</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Optimize with AI
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  AI will suggest hashtags, emojis, and optimal posting times
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={createMutation.isPending}
              >
                {scheduledFor ? (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Post
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Publish Now
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setLocation("/social-media")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
