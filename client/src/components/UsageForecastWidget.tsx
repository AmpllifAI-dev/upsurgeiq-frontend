import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

interface UsageForecast {
  pressReleases: {
    current: number;
    limit: number;
    trend: number; // Average per week
    daysUntilLimit: number | null;
    projectedEndOfMonth: number;
  };
  campaigns: {
    current: number;
    limit: number;
    trend: number;
    daysUntilLimit: number | null;
    projectedEndOfMonth: number;
  };
  projectedCost: {
    current: number;
    projected: number;
    savings: number;
  };
  recommendation: {
    type: "upgrade" | "downgrade" | "stay" | "warning";
    message: string;
    suggestedPlan?: "starter" | "pro" | "scale";
    savingsAmount?: number;
  };
}

function calculateForecast(
  currentUsage: { pressReleases: number; campaigns: number; socialPosts: number },
  plan: "starter" | "pro" | "scale",
  createdAt: Date
): UsageForecast {
  // Calculate days since account creation
  const now = new Date();
  const daysSinceCreation = Math.max(
    1,
    Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Calculate weekly trend
  const prTrend = (currentUsage.pressReleases / daysSinceCreation) * 7;
  const campaignTrend = (currentUsage.campaigns / daysSinceCreation) * 7;

  // Tier limits
  const limits = {
    starter: { pressReleases: 2, campaigns: 5 },
    pro: { pressReleases: 5, campaigns: 20 },
    scale: { pressReleases: 15, campaigns: Infinity },
  };

  const currentLimits = limits[plan];

  // Calculate days until limit
  const daysUntilPRLimit =
    currentLimits.pressReleases === Infinity
      ? null
      : prTrend > 0
      ? Math.floor((currentLimits.pressReleases - currentUsage.pressReleases) / (prTrend / 7))
      : null;

  const daysUntilCampaignLimit =
    currentLimits.campaigns === Infinity
      ? null
      : campaignTrend > 0
      ? Math.floor((currentLimits.campaigns - currentUsage.campaigns) / (campaignTrend / 7))
      : null;

  // Project end of month usage
  const daysInMonth = 30;
  const daysRemaining = daysInMonth - (now.getDate() % daysInMonth);
  const projectedPREndOfMonth = Math.min(
    currentUsage.pressReleases + (prTrend / 7) * daysRemaining,
    currentLimits.pressReleases === Infinity ? 999 : currentLimits.pressReleases
  );
  const projectedCampaignsEndOfMonth = Math.min(
    currentUsage.campaigns + (campaignTrend / 7) * daysRemaining,
    currentLimits.campaigns === Infinity ? 999 : currentLimits.campaigns
  );

  // Calculate projected costs
  const planCosts = { starter: 29, pro: 99, scale: 299 };
  const currentCost = planCosts[plan];
  const projectedCost = currentCost; // Base cost (add-ons would be calculated here)

  // Generate recommendation
  let recommendation: UsageForecast["recommendation"];

  if (plan === "starter" && (daysUntilPRLimit !== null && daysUntilPRLimit < 7)) {
    recommendation = {
      type: "warning",
      message: `You'll hit your press release limit in ${daysUntilPRLimit} days. Consider upgrading to Pro.`,
      suggestedPlan: "pro",
    };
  } else if (plan === "starter" && projectedPREndOfMonth >= currentLimits.pressReleases * 0.8) {
    recommendation = {
      type: "upgrade",
      message: "You're on track to use 80%+ of your limit. Upgrade to Pro for more capacity.",
      suggestedPlan: "pro",
    };
  } else if (plan === "pro" && projectedPREndOfMonth >= currentLimits.pressReleases * 0.9) {
    recommendation = {
      type: "upgrade",
      message: "You're approaching your Pro limit. Upgrade to Scale for unlimited campaigns.",
      suggestedPlan: "scale",
    };
  } else if (
    plan === "pro" &&
    currentUsage.pressReleases < 2 &&
    currentUsage.campaigns < 3 &&
    daysSinceCreation > 30
  ) {
    recommendation = {
      type: "downgrade",
      message: "Your usage is low. Consider downgrading to Starter to save $70/month.",
      suggestedPlan: "starter",
      savingsAmount: 70,
    };
  } else if (
    plan === "scale" &&
    currentUsage.pressReleases < 6 &&
    currentUsage.campaigns < 15 &&
    daysSinceCreation > 30
  ) {
    recommendation = {
      type: "downgrade",
      message: "Your usage fits within Pro limits. Save $200/month by downgrading.",
      suggestedPlan: "pro",
      savingsAmount: 200,
    };
  } else {
    recommendation = {
      type: "stay",
      message: "Your current plan fits your usage perfectly. No changes needed.",
    };
  }

  return {
    pressReleases: {
      current: currentUsage.pressReleases,
      limit: currentLimits.pressReleases,
      trend: prTrend,
      daysUntilLimit: daysUntilPRLimit,
      projectedEndOfMonth: Math.round(projectedPREndOfMonth),
    },
    campaigns: {
      current: currentUsage.campaigns,
      limit: currentLimits.campaigns,
      trend: campaignTrend,
      daysUntilLimit: daysUntilCampaignLimit,
      projectedEndOfMonth: Math.round(projectedCampaignsEndOfMonth),
    },
    projectedCost: {
      current: currentCost,
      projected: projectedCost,
      savings: 0,
    },
    recommendation,
  };
}

export function UsageForecastWidget() {
  const [, setLocation] = useLocation();

  const { data: subscription, isLoading: subLoading } = trpc.subscription.get.useQuery();
  const { data: usage, isLoading: usageLoading } = trpc.usage.getSummary.useQuery();

  const forecast = useMemo(() => {
    if (!subscription || !usage) return null;

    // TODO: Fix usage property names to match backend response
    return calculateForecast(
      {
        pressReleases: 0, // usage.pressReleasesUsed,
        campaigns: 0, // usage.campaignsUsed,
        socialPosts: 0, // usage.socialPostsUsed,
      },
      subscription.plan,
      new Date(subscription.createdAt)
    );
  }, [subscription, usage]);

  if (subLoading || usageLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!forecast || !subscription) {
    return null;
  }

  const getRecommendationIcon = () => {
    switch (forecast.recommendation.type) {
      case "upgrade":
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case "downgrade":
        return <TrendingDown className="w-5 h-5 text-success" />;
      case "stay":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
    }
  };

  const getRecommendationColor = () => {
    switch (forecast.recommendation.type) {
      case "warning":
        return "destructive";
      case "upgrade":
        return "default";
      case "downgrade":
        return "secondary";
      case "stay":
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Usage Forecast
            </CardTitle>
            <CardDescription>Projected usage and cost optimization</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Press Releases Forecast */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Press Releases</span>
            <span className="text-muted-foreground">
              {forecast.pressReleases.current} / {forecast.pressReleases.limit === Infinity ? "∞" : forecast.pressReleases.limit}
            </span>
          </div>
          <Progress
            value={
              forecast.pressReleases.limit === Infinity
                ? 0
                : (forecast.pressReleases.current / forecast.pressReleases.limit) * 100
            }
            className="h-2"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Trend: {forecast.pressReleases.trend.toFixed(1)}/week
            </span>
            <span>
              Projected EOM: {forecast.pressReleases.projectedEndOfMonth}
            </span>
          </div>
          {forecast.pressReleases.daysUntilLimit !== null && forecast.pressReleases.daysUntilLimit < 14 && (
            <div className="flex items-center gap-1 text-xs text-warning">
              <Calendar className="w-3 h-3" />
              <span>Limit in {forecast.pressReleases.daysUntilLimit} days</span>
            </div>
          )}
        </div>

        {/* Campaigns Forecast */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Campaigns</span>
            <span className="text-muted-foreground">
              {forecast.campaigns.current} / {forecast.campaigns.limit === Infinity ? "∞" : forecast.campaigns.limit}
            </span>
          </div>
          <Progress
            value={
              forecast.campaigns.limit === Infinity
                ? 0
                : (forecast.campaigns.current / forecast.campaigns.limit) * 100
            }
            className="h-2"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Trend: {forecast.campaigns.trend.toFixed(1)}/week
            </span>
            <span>
              Projected EOM: {forecast.campaigns.projectedEndOfMonth}
            </span>
          </div>
          {forecast.campaigns.daysUntilLimit !== null && forecast.campaigns.daysUntilLimit < 14 && (
            <div className="flex items-center gap-1 text-xs text-warning">
              <Calendar className="w-3 h-3" />
              <span>Limit in {forecast.campaigns.daysUntilLimit} days</span>
            </div>
          )}
        </div>

        {/* Projected Cost */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Monthly Cost
            </span>
            <span className="text-lg font-semibold">
              ${forecast.projectedCost.projected}
            </span>
          </div>
        </div>

        {/* Recommendation */}
        <div className={`p-4 rounded-lg border ${
          forecast.recommendation.type === "warning" ? "bg-destructive/10 border-destructive" :
          forecast.recommendation.type === "upgrade" ? "bg-primary/10 border-primary" :
          forecast.recommendation.type === "downgrade" ? "bg-success/10 border-success" :
          "bg-muted"
        }`}>
          <div className="flex items-start gap-3">
            {getRecommendationIcon()}
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium">{forecast.recommendation.message}</p>
              {forecast.recommendation.savingsAmount && (
                <p className="text-xs text-muted-foreground">
                  Potential savings: ${forecast.recommendation.savingsAmount}/month
                </p>
              )}
              {forecast.recommendation.suggestedPlan && (
                <Button
                  size="sm"
                  variant={getRecommendationColor()}
                  onClick={() => setLocation("/dashboard/pricing")}
                  className="mt-2"
                >
                  {forecast.recommendation.type === "upgrade" ? "Upgrade" : "Change"} to{" "}
                  {forecast.recommendation.suggestedPlan.charAt(0).toUpperCase() +
                    forecast.recommendation.suggestedPlan.slice(1)}
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Confidence Indicator */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Forecast based on your usage patterns over the last{" "}
          {Math.floor(
            (new Date().getTime() - new Date(subscription.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )}{" "}
          days
        </div>
      </CardContent>
    </Card>
  );
}
