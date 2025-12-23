import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  Target,
  DollarSign,
  Trophy,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface CampaignVariantsProps {
  campaignId: number;
}

export function CampaignVariants({ campaignId }: CampaignVariantsProps) {
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const utils = trpc.useUtils();

  // Fetch variants
  const { data: variants, isLoading } = trpc.campaign.getVariants.useQuery(
    { campaignId },
    { enabled: !!campaignId }
  );

  // Generate variants mutation
  const generateMutation = trpc.campaign.generateVariants.useMutation({
    onSuccess: (data) => {
      toast.success("Ad Variations Generated", {
        description: `Successfully created ${data.count} variations using different psychological angles.`,
      });
      utils.campaign.getVariants.invalidate({ campaignId });
      setShowGenerateConfirm(false);
    },
    onError: (error) => {
      toast.error("Generation Failed", {
        description: error.message || "Failed to generate ad variations. Please try again.",
      });
    },
  });

  // Simulate performance mutation
  const simulateMutation = trpc.campaign.simulateVariantPerformance.useMutation({
    onSuccess: () => {
      toast.success("Performance Data Simulated", {
        description: "Realistic performance metrics have been generated for all variants.",
      });
      utils.campaign.getVariants.invalidate({ campaignId });
    },
    onError: (error) => {
      toast.error("Simulation Failed", {
        description: error.message || "Failed to simulate performance data.",
      });
    },
  });

  const handleGenerateVariants = () => {
    generateMutation.mutate({ campaignId });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      testing: { label: "Testing", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      winning: { label: "Winner", className: "bg-green-500/10 text-green-500 border-green-500/20" },
      losing: { label: "Losing", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
      archived: { label: "Archived", className: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.testing;
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const calculateCTR = (impressions: number | null, clicks: number | null) => {
    if (!impressions || impressions === 0) return "0.00";
    return ((clicks || 0) / impressions * 100).toFixed(2);
  };

  const calculateConversionRate = (clicks: number | null, conversions: number | null) => {
    if (!clicks || clicks === 0) return "0.00";
    return ((conversions || 0) / clicks * 100).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  // No variants yet - show generate button
  if (!variants || variants.length === 0) {
    return (
      <>
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center py-12">
            <Sparkles className="w-12 h-12 mx-auto text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generate AI-Powered Ad Variations</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Create 5 distinct ad variations using proven psychological angles: Scarcity, Social
              Proof, Authority, Reciprocity, and Curiosity. Each variation is optimized for your
              campaign goals and target audience.
            </p>
            <Button
              onClick={() => setShowGenerateConfirm(true)}
              disabled={generateMutation.isPending}
              size="lg"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Variations...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Ad Variations
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <AlertDialog open={showGenerateConfirm} onOpenChange={setShowGenerateConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Generate AI Ad Variations?</AlertDialogTitle>
              <AlertDialogDescription>
                This will create 5 unique ad variations using different psychological angles. Each
                variation will be optimized based on your campaign details, target audience, and
                brand voice.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleGenerateVariants}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? "Generating..." : "Generate Variations"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Show variants
  return (
    <div className="space-y-6">
      {/* Header with regenerate option */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Ad Variations ({variants.length})</h2>
          <p className="text-sm text-muted-foreground">
            Testing different psychological angles to find the best performer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => simulateMutation.mutate({ campaignId })}
            disabled={simulateMutation.isPending}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {simulateMutation.isPending ? "Simulating..." : "Simulate Data"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowGenerateConfirm(true)}
            disabled={generateMutation.isPending}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </div>

      {/* Variants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {variants.map((variant) => {
          const ctr = calculateCTR(variant.impressions, variant.clicks);
          const conversionRate = calculateConversionRate(variant.clicks, variant.conversions);
          const isWinner = variant.status === "winning";

          return (
            <Card key={variant.id} className={isWinner ? "border-green-500 shadow-lg" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base">{variant.name}</CardTitle>
                      {isWinner && <Trophy className="w-4 h-4 text-green-500" />}
                    </div>
                    <CardDescription className="text-xs">
                      {variant.psychologicalAngle}
                    </CardDescription>
                  </div>
                  {getStatusBadge(variant.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ad Copy */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-line">{variant.adCopy}</p>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      Impressions
                    </div>
                    <div className="text-lg font-semibold">
                      {(variant.impressions || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MousePointerClick className="w-3 h-3" />
                      Clicks
                    </div>
                    <div className="text-lg font-semibold">
                      {(variant.clicks || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Target className="w-3 h-3" />
                      CTR
                    </div>
                    <div className="text-lg font-semibold">{ctr}%</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      Conv. Rate
                    </div>
                    <div className="text-lg font-semibold">{conversionRate}%</div>
                  </div>
                </div>

                {/* Conversions & Cost */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Conversions</div>
                    <div className="text-base font-semibold">
                      {(variant.conversions || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="text-xs text-muted-foreground">Cost</div>
                    <div className="text-base font-semibold">
                      £{((variant.cost || 0) / 100).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Data Status */}
                {(variant.impressions || 0) < 100 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Collecting data... Need {100 - (variant.impressions || 0)} more impressions
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">How Variant Testing Works</p>
              <p className="text-xs text-muted-foreground">
                Each variation uses a different psychological angle to appeal to your audience. The
                system automatically tracks performance and identifies the winning variation once
                sufficient data is collected (minimum 100 impressions and 10 clicks per variant).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showGenerateConfirm} onOpenChange={setShowGenerateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Ad Variations?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new set of 5 ad variations. Your existing variations will remain
              in the database for reference, but new variations will be generated with fresh
              psychological angles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGenerateVariants}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? "Generating..." : "Regenerate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
