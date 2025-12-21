import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, PenTool, ArrowRight, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

interface PressReleaseCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PressReleaseCreationDialog({
  open,
  onOpenChange,
}: PressReleaseCreationDialogProps) {
  const [, setLocation] = useLocation();
  
  // Fetch usage data
  const { data: usageData } = trpc.usageTracking.getCurrentUsage.useQuery();
  
  const pressReleaseUsage = usageData?.pressReleases || { used: 0, limit: 0 };
  const usagePercentage = pressReleaseUsage.limit > 0 
    ? (pressReleaseUsage.used / pressReleaseUsage.limit) * 100 
    : 0;
  
  const isAtLimit = pressReleaseUsage.used >= pressReleaseUsage.limit;
  const isNearLimit = usagePercentage >= 80;

  const handleAIGenerated = () => {
    onOpenChange(false);
    setLocation("/press-releases/new?mode=ai");
  };

  const handleManual = () => {
    onOpenChange(false);
    setLocation("/press-releases/new?mode=manual");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Press Release</DialogTitle>
          <DialogDescription>
            Choose how you'd like to create your press release
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Usage Tracker */}
          <Card className={isNearLimit ? "border-yellow-500" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  AI-Generated Press Releases
                </CardTitle>
                <Badge variant={isAtLimit ? "destructive" : isNearLimit ? "secondary" : "default"}>
                  {pressReleaseUsage.used} / {pressReleaseUsage.limit} used
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isAtLimit
                        ? "bg-destructive"
                        : isNearLimit
                        ? "bg-yellow-500"
                        : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
                {isAtLimit && (
                  <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                      You've reached your monthly limit. Upgrade your plan or create press releases manually.
                    </p>
                  </div>
                )}
                {isNearLimit && !isAtLimit && (
                  <p className="text-sm text-muted-foreground">
                    You're approaching your monthly limit. Consider upgrading for more AI-generated content.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Creation Options */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* AI-Generated Option */}
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={!isAtLimit ? handleAIGenerated : undefined}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">AI-Generated</CardTitle>
                </div>
                <CardDescription>
                  Let AI craft a professional press release based on your inputs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>AI-powered content generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Uses your business dossier</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Customizable tone and style</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Edit after generation</span>
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  disabled={isAtLimit}
                  onClick={handleAIGenerated}
                >
                  {isAtLimit ? "Limit Reached" : "Generate with AI"}
                  {!isAtLimit && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
                {isAtLimit && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation("/subscription/upgrade");
                    }}
                  >
                    Upgrade Plan
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Manual Option */}
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={handleManual}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <PenTool className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-lg">Write Manually</CardTitle>
                </div>
                <CardDescription>
                  Write your press release from scratch with our rich text editor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent-foreground mt-0.5">•</span>
                    <span>Full creative control</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-foreground mt-0.5">•</span>
                    <span>Rich text formatting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-foreground mt-0.5">•</span>
                    <span>No usage limits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-foreground mt-0.5">•</span>
                    <span>Perfect for custom content</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" onClick={handleManual}>
                  Start Writing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
