import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { AlertCircle, TrendingUp, Zap } from "lucide-react";
import { useLocation } from "wouter";

interface UsageItem {
  feature: string;
  label: string;
  current: number;
  limit: number;
  unlimited: boolean;
}

export function UsageDashboard() {
  const [, setLocation] = useLocation();
  const { data: subscription, isLoading: subLoading } = trpc.subscription.get.useQuery();
  const { data: usage, isLoading: usageLoading } = trpc.usageTracking.current.useQuery();

  if (subLoading || usageLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage & Limits</CardTitle>
          <CardDescription>Track your subscription usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!subscription || !usage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage & Limits</CardTitle>
          <CardDescription>Track your subscription usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Unable to load usage data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const plan = subscription.plan;
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  const usageItems: UsageItem[] = [
    {
      feature: "campaigns",
      label: "Campaigns (AI-drafted copy + own imagery)",
      current: usage.campaigns || 0,
      limit: usage.limits.campaigns,
      unlimited: usage.limits.campaigns === -1,
    },
    {
      feature: "socialMediaPosts",
      label: "User-Composed Social Posts",
      current: usage.socialMediaPosts || 0,
      limit: usage.limits.socialMediaPosts,
      unlimited: usage.limits.socialMediaPosts === -1,
    },
    {
      feature: "aiImages",
      label: "AI Images",
      current: usage.aiImages || 0,
      limit: usage.limits.aiImages,
      unlimited: usage.limits.aiImages === -1,
    },
    {
      feature: "aiChatMessages",
      label: "AI Chat Messages",
      current: usage.aiChatMessages || 0,
      limit: usage.limits.aiChatMessages,
      unlimited: usage.limits.aiChatMessages === -1,
    },
  ];

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-orange-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getUsagePercentage = (current: number, limit: number, unlimited: boolean) => {
    if (unlimited) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Usage & Limits
            </CardTitle>
            <CardDescription>Track your subscription usage this month</CardDescription>
          </div>
          <Badge variant="default" className="text-sm">
            {planLabel} Plan
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {usageItems.map((item) => {
          const percentage = getUsagePercentage(item.current, item.limit, item.unlimited);
          const isNearLimit = percentage >= 75 && !item.unlimited;

          return (
            <div key={item.feature} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  {item.label}
                  {isNearLimit && (
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                  )}
                </span>
                <span className="text-sm text-muted-foreground">
                  {item.unlimited ? (
                    <Badge variant="secondary" className="text-xs">
                      Unlimited
                    </Badge>
                  ) : (
                    `${item.current} / ${item.limit}`
                  )}
                </span>
              </div>
              {!item.unlimited && (
                <div className="space-y-1">
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                  {isNearLimit && (
                    <p className="text-xs text-orange-600">
                      {percentage >= 90 
                        ? "Almost at limit! Consider upgrading."
                        : "Approaching limit"}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {plan !== "scale" && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <Zap className="w-8 h-8 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Need more capacity?</p>
                <p className="text-xs text-muted-foreground">
                  Upgrade to {plan === "starter" ? "Pro or Scale" : "Scale"} for higher limits
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => setLocation("/subscription")}
                className="flex-shrink-0"
              >
                Upgrade
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
