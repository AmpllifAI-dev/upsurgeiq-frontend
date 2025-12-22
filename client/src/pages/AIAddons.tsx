import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Phone, Check, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast as showToast } from "sonner";

export default function AIAddons() {
  const { user } = useAuth();
  
  const { data: subscription, isLoading: subscriptionLoading } = trpc.subscription.get.useQuery();
  const { data: usage } = trpc.usage.getSummary.useQuery();
  
  const createCheckoutMutation = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data: { url: string | null }) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      showToast.error("Error", {
        description: error.message || "Failed to start checkout",
      });
    },
  });

  const handlePurchase = (productId: string) => {
    // TODO: Implement add-on checkout - currently createCheckout only supports tier subscriptions
    showToast("Coming Soon", {
      description: "AI add-on checkout is being implemented. Please check back soon!",
    });
  };

  const addons = [
    {
      id: "ai_chat",
      name: "AI Chat Educational Tool",
      icon: MessageSquare,
      price: "£39",
      period: "/month",
      description: "Learn PR and marketing through conversation",
      features: [
        "32 messages per month (16 exchanges)",
        "Educational conversations about PR strategy",
        "Content refinement guidance",
        "Best practice recommendations",
        "Fair Usage Policy applies",
        "Resets monthly",
      ],
      benefits: [
        "Perfect for learning on the go",
        "Get instant feedback on ideas",
        "Understand PR fundamentals",
        "Improve content quality",
      ],
      highlighted: true,
    },
    {
      id: "ai_call_in",
      name: "AI Call-in Virtual Assistant",
      icon: Phone,
      price: "£59",
      period: "/month",
      description: "Voice-powered PR assistant with transcription",
      features: [
        "32 messages per month (16 voice instructions)",
        "Whisper AI transcription",
        "Voice-to-text processing",
        "Email delivery of drafted content",
        "Requires dossier recording first",
        "Resets monthly",
      ],
      benefits: [
        "Hands-free content creation",
        "Perfect for busy professionals",
        "Natural voice interaction",
        "Time-saving workflow",
      ],
      highlighted: false,
    },
  ];

  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Add-ons</Badge>
          <Badge variant="outline">{subscription?.plan || "No subscription"}</Badge>
        </div>
        <h1 className="text-4xl font-bold">AI Assistant Add-ons</h1>
        <p className="text-xl text-muted-foreground">
          Enhance your PR workflow with conversational AI tools. These add-ons work with any subscription tier.
        </p>
      </div>

      {/* Current Usage Alert */}
      {usage && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Current Usage:</strong> AI Chat: {usage.usage.aiChatMessages?.current || 0}/32 messages • AI Call-in: 0/32 messages
          </AlertDescription>
        </Alert>
      )}

      {/* Add-on Cards */}
      <div className="grid md:grid-cols-2 gap-8">
        {addons.map((addon) => {
          const Icon = addon.icon;
          const isActive = false; // TODO: Check if user has this add-on
          
          return (
            <Card
              key={addon.id}
              className={`relative ${
                addon.highlighted
                  ? "border-primary shadow-lg"
                  : "border-border"
              }`}
            >
              {addon.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-secondary text-secondary-foreground">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{addon.name}</CardTitle>
                <CardDescription className="text-sm">{addon.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{addon.price}</span>
                  <span className="text-muted-foreground">{addon.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">What's Included:</h4>
                  {addon.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Benefits */}
                <div className="pt-4 border-t border-border space-y-3">
                  <h4 className="font-semibold text-sm">Benefits:</h4>
                  {addon.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                {isActive ? (
                  <Button className="w-full" variant="outline" disabled>
                    Active Subscription
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={addon.highlighted ? "default" : "outline"}
                    onClick={() => handlePurchase(addon.id)}
                    disabled={createCheckoutMutation.isPending}
                  >
                    {createCheckoutMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Subscribe Now"
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How do message limits work?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Each add-on includes 32 messages per month. For AI Chat, this means 16 back-and-forth exchanges. 
                For AI Call-in, this means 16 voice instructions. Your limit resets on your billing date each month.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I use both add-ons together?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes! AI Chat and AI Call-in are separate subscriptions that work independently. You can subscribe 
                to one or both depending on your needs.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's the Fair Usage Policy?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The Fair Usage Policy ensures the AI assistant is used for its intended educational purpose. 
                Excessive or automated usage may be flagged. Normal business use is always welcome.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel your add-on subscription at any time from your account settings. 
                You'll retain access until the end of your current billing period.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
