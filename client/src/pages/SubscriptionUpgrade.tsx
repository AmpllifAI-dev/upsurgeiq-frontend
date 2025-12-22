import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, ArrowRight, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SubscriptionUpgrade() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: subscription, isLoading: subscriptionLoading } = trpc.subscription.get.useQuery(undefined, {
    enabled: !!user,
  });

  const upgradeMutation = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success("Redirecting to checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create upgrade checkout");
    },
  });

  if (loading || subscriptionLoading) {
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

  const currentTier = subscription?.plan || "starter";

  const upgradePaths = [
    {
      from: "starter",
      to: "pro",
      name: "Upgrade to Pro",
      price: "£99",
      savings: "Save time with 5 campaigns per month",
      features: [
        "5 campaigns per month (vs 2 on Starter)",
        "5 media lists (vs 3 on Starter)",
        "Priority support",
        "All Starter features included"
      ],
      highlighted: true
    },
    {
      from: "starter",
      to: "scale",
      name: "Upgrade to Scale",
      price: "£349",
      savings: "Maximum capacity for agencies",
      features: [
        "15 campaigns per month",
        "10 media lists",
        "Intelligent Campaign Lab included",
        "Priority support",
        "All Pro features included"
      ],
      highlighted: false
    },
    {
      from: "pro",
      to: "scale",
      name: "Upgrade to Scale",
      price: "£349",
      savings: "Unlock Campaign Lab and 3x capacity",
      features: [
        "15 campaigns per month (vs 5 on Pro)",
        "10 media lists (vs 5 on Pro)",
        "Intelligent Campaign Lab included",
        "Priority support",
        "All Pro features included"
      ],
      highlighted: true
    }
  ];

  const availableUpgrades = upgradePaths.filter(path => path.from === currentTier);

  if (currentTier === "scale") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-20">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="w-fit mx-auto">
              Scale Plan
            </Badge>
            <h1 className="text-4xl font-bold text-foreground">
              You're on the Best Plan!
            </h1>
            <p className="text-xl text-muted-foreground">
              You have access to all UpsurgeIQ features, including Intelligent Campaign Lab, unlimited capacity, and priority support.
            </p>
            <Button onClick={() => setLocation("/dashboard")} variant="default" className="gap-2">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleUpgrade = (targetTier: "pro" | "scale") => {
    if (!user) {
      toast.error("Please sign in to upgrade");
      return;
    }
    upgradeMutation.mutate({ tier: targetTier });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between py-4">
          <a href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">UpsurgeIQ</span>
          </a>
          <Button onClick={() => setLocation("/dashboard")} variant="ghost">
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto py-16 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="w-fit mx-auto">
            Current Plan: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
          </Badge>
          <h1 className="text-5xl font-bold text-foreground">
            Upgrade Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Scale your marketing with more campaigns, media lists, and advanced features
          </p>
        </div>

        {/* Prorated Billing Notice */}
        <Alert className="max-w-3xl mx-auto">
          <TrendingUp className="w-4 h-4" />
          <AlertDescription>
            <strong>Prorated billing:</strong> You'll only pay for the remaining time in your current billing cycle. Your upgrade takes effect immediately.
          </AlertDescription>
        </Alert>

        {/* Upgrade Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {availableUpgrades.map((upgrade) => (
            <Card
              key={upgrade.to}
              className={`relative ${
                upgrade.highlighted
                  ? "border-primary shadow-2xl scale-105"
                  : "border-border"
              }`}
            >
              {upgrade.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-secondary text-secondary-foreground">Recommended</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{upgrade.name}</CardTitle>
                <CardDescription className="text-sm">{upgrade.savings}</CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-foreground">{upgrade.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {upgrade.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={upgrade.highlighted ? "default" : "outline"}
                  onClick={() => handleUpgrade(upgrade.to as "pro" | "scale")}
                  disabled={upgradeMutation.isPending}
                >
                  {upgradeMutation.isPending ? "Processing..." : `Upgrade to ${upgrade.to.charAt(0).toUpperCase() + upgrade.to.slice(1)}`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto space-y-6 pt-12">
          <h2 className="text-2xl font-bold text-foreground text-center">
            Upgrade FAQs
          </h2>
          <div className="space-y-4">
            <div className="border-b border-border pb-4">
              <h3 className="font-semibold mb-2">How does prorated billing work?</h3>
              <p className="text-sm text-muted-foreground">
                When you upgrade, we calculate the unused portion of your current plan and credit it toward your new plan. You only pay the difference for the remaining days in your billing cycle.
              </p>
            </div>
            <div className="border-b border-border pb-4">
              <h3 className="font-semibold mb-2">When does my upgrade take effect?</h3>
              <p className="text-sm text-muted-foreground">
                Your upgrade is instant! As soon as you complete the checkout, you'll have access to all features of your new plan.
              </p>
            </div>
            <div className="border-b border-border pb-4">
              <h3 className="font-semibold mb-2">Can I downgrade later?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can change your plan at any time from your account settings. Downgrades take effect at the end of your current billing cycle to ensure you get full value.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
