import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, CheckCircle2, Settings } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function SubscriberPreferences() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  
  // Preference states
  const [preferPrTips, setPreferPrTips] = useState(true);
  const [preferMarketingInsights, setPreferMarketingInsights] = useState(true);
  const [preferAiUpdates, setPreferAiUpdates] = useState(true);
  const [preferCaseStudies, setPreferCaseStudies] = useState(true);
  const [preferProductNews, setPreferProductNews] = useState(true);

  // Get email from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  // Load existing preferences
  const { data: subscriber, isLoading } = trpc.newsletter.getSubscriberPreferences.useQuery(
    { email },
    { enabled: !!email }
  );

  useEffect(() => {
    if (subscriber) {
      setPreferPrTips(subscriber.preferPrTips === 1);
      setPreferMarketingInsights(subscriber.preferMarketingInsights === 1);
      setPreferAiUpdates(subscriber.preferAiUpdates === 1);
      setPreferCaseStudies(subscriber.preferCaseStudies === 1);
      setPreferProductNews(subscriber.preferProductNews === 1);
    }
  }, [subscriber]);

  const updatePreferences = trpc.newsletter.updatePreferences.useMutation({
    onSuccess: () => {
      toast({
        title: "Preferences updated",
        description: "Your email preferences have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update preferences",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!email) {
      toast({
        title: "Missing email",
        description: "Please provide your email address.",
        variant: "destructive",
      });
      return;
    }

    updatePreferences.mutate({
      email,
      preferPrTips: preferPrTips ? 1 : 0,
      preferMarketingInsights: preferMarketingInsights ? 1 : 0,
      preferAiUpdates: preferAiUpdates ? 1 : 0,
      preferCaseStudies: preferCaseStudies ? 1 : 0,
      preferProductNews: preferProductNews ? 1 : 0,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your preferences...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Settings className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Email Preferences</h1>
          <p className="text-muted-foreground">
            Choose the types of content you'd like to receive from UpsurgeIQ
          </p>
        </div>

        {/* Preferences Card */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Content Categories</h2>
              <p className="text-sm text-muted-foreground">
                Select the topics you're interested in. You can change these preferences at any time.
              </p>
            </div>

            <div className="space-y-4">
              {/* PR Tips */}
              <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                <Checkbox
                  id="pr-tips"
                  checked={preferPrTips}
                  onCheckedChange={(checked) => setPreferPrTips(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="pr-tips" className="text-base font-medium cursor-pointer">
                    PR Tips & Best Practices
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Practical advice for creating effective press releases and media outreach strategies
                  </p>
                </div>
              </div>

              {/* Marketing Insights */}
              <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                <Checkbox
                  id="marketing-insights"
                  checked={preferMarketingInsights}
                  onCheckedChange={(checked) => setPreferMarketingInsights(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="marketing-insights" className="text-base font-medium cursor-pointer">
                    Marketing Insights
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Industry trends, marketing strategies, and growth tactics for your business
                  </p>
                </div>
              </div>

              {/* AI Updates */}
              <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                <Checkbox
                  id="ai-updates"
                  checked={preferAiUpdates}
                  onCheckedChange={(checked) => setPreferAiUpdates(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="ai-updates" className="text-base font-medium cursor-pointer">
                    AI & Technology Updates
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Latest AI features, automation tips, and technology innovations in PR and marketing
                  </p>
                </div>
              </div>

              {/* Case Studies */}
              <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                <Checkbox
                  id="case-studies"
                  checked={preferCaseStudies}
                  onCheckedChange={(checked) => setPreferCaseStudies(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="case-studies" className="text-base font-medium cursor-pointer">
                    Case Studies & Success Stories
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Real-world examples of successful PR campaigns and client achievements
                  </p>
                </div>
              </div>

              {/* Product News */}
              <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                <Checkbox
                  id="product-news"
                  checked={preferProductNews}
                  onCheckedChange={(checked) => setPreferProductNews(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="product-news" className="text-base font-medium cursor-pointer">
                    Product News & Updates
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    New features, platform updates, and announcements from the UpsurgeIQ team
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {email && `Preferences for: ${email}`}
              </p>
              <Button onClick={handleSave} disabled={updatePreferences.isPending}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {updatePreferences.isPending ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-muted/50">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">You're in control</p>
              <p className="text-muted-foreground">
                You can update your preferences at any time by clicking the "Manage Preferences" 
                link in any email we send you. To unsubscribe completely, click the unsubscribe 
                link at the bottom of our emails.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
