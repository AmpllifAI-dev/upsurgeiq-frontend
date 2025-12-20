import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Image, Sparkles, Check, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function ImagePacks() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [purchasingPack, setPurchasingPack] = useState<string | null>(null);

  const { data: usage, isLoading: usageLoading } = trpc.usageTracking.current.useQuery(undefined, {
    enabled: !!user,
  });

  // TODO: Implement image pack purchase mutation
  // const createCheckoutMutation = trpc.imagePacks.createCheckout.useMutation(...)

  if (loading || usageLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const aiImagesUsed = usage?.aiImages || 0;
  const aiImagesLimit = usage?.limits.aiImages || 0;
  const aiImagesRemaining = aiImagesLimit === -1 ? Infinity : Math.max(0, aiImagesLimit - aiImagesUsed);
  const usagePercentage = aiImagesLimit === -1 ? 0 : (aiImagesUsed / aiImagesLimit) * 100;

  const imagePacks = [
    {
      id: "single",
      name: "Single Image",
      price: "£3.99",
      credits: 1,
      description: "Perfect for one-off needs",
      features: [
        "1 AI-generated image",
        "High resolution output",
        "Multiple style options",
        "Instant generation",
      ],
      popular: false,
    },
    {
      id: "pack_5",
      name: "5-Image Pack",
      price: "£14.99",
      credits: 5,
      description: "Best value for regular use",
      features: [
        "5 AI-generated images",
        "High resolution output",
        "Multiple style options",
        "Instant generation",
        "Save £5 vs single images",
      ],
      popular: true,
    },
    {
      id: "pack_10",
      name: "10-Image Pack",
      price: "£24.99",
      credits: 10,
      description: "Maximum savings for power users",
      features: [
        "10 AI-generated images",
        "High resolution output",
        "Multiple style options",
        "Instant generation",
        "Save £15 vs single images",
      ],
      popular: false,
    },
  ];

  const handlePurchase = (packId: string) => {
    setPurchasingPack(packId);
    // TODO: Implement actual Stripe checkout for image packs
    toast.info("Image pack purchase coming soon!");
    setTimeout(() => setPurchasingPack(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Image className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">AI Generated Image Packs</h1>
          </div>
          <p className="text-muted-foreground">
            Purchase AI-generated images for your campaigns and social posts
          </p>
        </div>
      </div>

      <div className="container mx-auto py-8 space-y-8">
        {/* Current Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Your AI Image Credits
            </CardTitle>
            <CardDescription>
              Track your AI-generated image usage and remaining credits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {aiImagesLimit === -1 ? "Unlimited" : aiImagesRemaining}
                </p>
                <p className="text-sm text-muted-foreground">
                  {aiImagesLimit === -1 ? "images remaining" : `of ${aiImagesLimit} credits remaining`}
                </p>
              </div>
              {aiImagesLimit !== -1 && (
                <Badge variant={usagePercentage > 80 ? "destructive" : "secondary"}>
                  {aiImagesUsed} used
                </Badge>
              )}
            </div>
            {aiImagesLimit !== -1 && (
              <div className="space-y-2">
                <Progress value={usagePercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {usagePercentage > 80
                    ? "Running low on credits - consider purchasing more"
                    : "You have plenty of credits remaining"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image Packs */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Purchase Image Credits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {imagePacks.map((pack) => (
              <Card
                key={pack.id}
                className={`relative ${
                  pack.popular ? "border-primary shadow-lg" : ""
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Zap className="w-3 h-3 mr-1" />
                      Best Value
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{pack.name}</CardTitle>
                  <CardDescription>{pack.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">{pack.price}</span>
                    <span className="text-muted-foreground ml-2">
                      ({pack.credits} {pack.credits === 1 ? "image" : "images"})
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {pack.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={pack.popular ? "default" : "outline"}
                    onClick={() => handlePurchase(pack.id)}
                    disabled={purchasingPack === pack.id}
                  >
                    {purchasingPack === pack.id ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Image className="w-4 h-4 mr-2" />
                        Purchase Pack
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Purchase Credits</h3>
                <p className="text-sm text-muted-foreground">
                  Buy image packs that suit your needs. Credits never expire.
                </p>
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <Image className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Generate Images</h3>
                <p className="text-sm text-muted-foreground">
                  Use credits when creating press releases or social posts to generate custom AI images.
                </p>
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">No Licensing Worries</h3>
                <p className="text-sm text-muted-foreground">
                  All generated images are yours to use commercially with no attribution required.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
