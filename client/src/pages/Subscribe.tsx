import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Subscribe() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: subscription } = trpc.subscription.get.useQuery(undefined, {
    enabled: !!user,
  });

  // If already has subscription, redirect to dashboard
  if (subscription) {
    setLocation("/dashboard");
    return null;
  }

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

  const checkoutMutation = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success("Redirecting to checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create checkout session");
    },
  });

  const handleSelectPlan = (tier: "starter" | "pro" | "scale") => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      return;
    }
    checkoutMutation.mutate({ tier });
  };

  const pricingTiers = [
    {
      id: "starter",
      name: "Starter",
      price: "£49",
      period: "/month",
      description: "Perfect for solopreneurs and small businesses",
      features: [
        "2 press releases per month",
        "1 social media channel",
        "3 default media lists",
        "AI-powered content generation",
        "Basic analytics",
        "Email support",
      ],
      cta: "Start Free Trial",
      highlighted: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: "£99",
      period: "/month",
      description: "Most popular for growing businesses",
      features: [
        "5 press releases per month",
        "3 social media channels",
        "5 media lists included",
        "AI-powered content generation",
        "Conversational AI assistant",
        "AI call-in feature",
        "Advanced analytics",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      id: "scale",
      name: "Scale",
      price: "£349",
      period: "/month",
      description: "For agencies and high-growth companies",
      features: [
        "15 press releases per month",
        "All 4 social media channels",
        "10 media lists included",
        "AI-powered content generation",
        "Conversational AI assistant",
        "AI call-in feature",
        "Intelligent Campaign Lab",
        "Advanced analytics & reporting",
        "Priority support",
        "Dedicated account manager",
      ],
      cta: "Start Free Trial",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">upsurgeIQ</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-16 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="w-fit mx-auto">
            Choose Your Plan
          </Badge>
          <h1 className="text-5xl font-bold text-foreground">
            Select the Perfect Plan for Your Business
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with a 14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.id}
              className={`relative ${
                tier.highlighted
                  ? "border-primary shadow-2xl scale-105"
                  : "border-border"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-secondary text-secondary-foreground">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                <CardDescription className="text-sm">{tier.description}</CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-foreground">{tier.price}</span>
                  <span className="text-muted-foreground">{tier.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {tier.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={tier.highlighted ? "default" : "outline"}
                  onClick={() => handleSelectPlan(tier.id as "starter" | "pro" | "scale")}
                >
                  {tier.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="text-center space-y-4 pt-12">
          <p className="text-sm text-muted-foreground">
            All plans include AI-powered content generation, social media distribution, and journalist media lists.
          </p>
          <p className="text-sm text-muted-foreground">
            Need a custom plan? <a href="mailto:sales@upsurgeiq.com" className="text-primary hover:underline">Contact our sales team</a>
          </p>
        </div>
      </div>
    </div>
  );
}
