import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Megaphone, TrendingUp, AlertCircle, Crown } from "lucide-react";
import { Link } from "wouter";

interface UsageStat {
  name: string;
  used: number;
  limit: number | "unlimited";
  icon: React.ReactNode;
  description: string;
}

export function UsageTrackingDashboard() {
  const { data: subscription } = trpc.subscription.getSubscription.useQuery();
  const { data: pressReleases } = trpc.pressReleases.list.useQuery();
  const { data: campaigns } = trpc.campaigns.list.useQuery();
  const { data: socialPosts } = trpc.socialMedia.list.useQuery();

  if (!subscription) {
    return null;
  }

  // Get tier limits
  const tierLimits = {
    starter: { pressReleases: 2, campaigns: 5 },
    pro: { pressReleases: 5, campaigns: 20 },
    scale: { pressReleases: 15, campaigns: Infinity },
  };

  const currentTier = subscription.tier as "starter" | "pro" | "scale";
  const limits = tierLimits[currentTier];

  // Count current month usage
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const pressReleasesThisMonth = pressReleases?.filter((pr) => {
    const createdAt = new Date(pr.createdAt);
    return createdAt >= startOfMonth;
  }).length || 0;

  const campaignsThisMonth = campaigns?.filter((c) => {
    const createdAt = new Date(c.createdAt);
    return createdAt >= startOfMonth;
  }).length || 0;

  const socialPostsThisMonth = socialPosts?.filter((sp) => {
    const createdAt = new Date(sp.createdAt);
    return createdAt >= startOfMonth;
  }).length || 0;

  const usageStats: UsageStat[] = [
    {
      name: "Campaigns",
      used: pressReleasesThisMonth,
      limit: limits.pressReleases,
      icon: <FileText className="h-5 w-5 text-primary" />,
      description: "AI-drafted press releases with imagery",
    },
    {
      name: "Campaign Lab",
      used: campaignsThisMonth,
      limit: limits.campaigns === Infinity ? "unlimited" : limits.campaigns,
      icon: <TrendingUp className="h-5 w-5 text-primary" />,
      description: "A/B testing campaigns with AI optimization",
    },
    {
      name: "Social Posts",
      used: socialPostsThisMonth,
      limit: "unlimited",
      icon: <Megaphone className="h-5 w-5 text-primary" />,
      description: "User-composed social media posts",
    },
  ];

  const getUsagePercentage = (used: number, limit: number | "unlimited") => {
    if (limit === "unlimited") return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-primary";
  };

  const isApproachingLimit = (used: number, limit: number | "unlimited") => {
    if (limit === "unlimited") return false;
    return (used / limit) >= 0.8;
  };

  const isAtLimit = (used: number, limit: number | "unlimited") => {
    if (limit === "unlimited") return false;
    return used >= limit;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Usage Tracking</h2>
        <p className="text-muted-foreground">
          Monitor your monthly usage across all features
        </p>
      </div>

      {/* Current Tier Badge */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="text-2xl font-bold capitalize">{currentTier}</p>
              </div>
            </div>
            <Link href="/subscription/upgrade">
              <Button variant="outline">
                Upgrade Plan
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {usageStats.map((stat) => {
          const percentage = getUsagePercentage(stat.used, stat.limit);
          const approaching = isApproachingLimit(stat.used, stat.limit);
          const atLimit = isAtLimit(stat.used, stat.limit);

          return (
            <Card key={stat.name} className={atLimit ? "border-red-500/50" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {stat.icon}
                    <CardTitle className="text-lg">{stat.name}</CardTitle>
                  </div>
                  {atLimit && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Limit Reached
                    </Badge>
                  )}
                  {approaching && !atLimit && (
                    <Badge variant="outline" className="gap-1 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                      <AlertCircle className="h-3 w-3" />
                      80%+
                    </Badge>
                  )}
                </div>
                <CardDescription>{stat.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold">{stat.used}</span>
                    <span className="text-sm text-muted-foreground">
                      / {stat.limit === "unlimited" ? "∞" : stat.limit} per month
                    </span>
                  </div>
                  {stat.limit !== "unlimited" && (
                    <div className="space-y-1">
                      <Progress 
                        value={percentage} 
                        className="h-2"
                        indicatorClassName={getUsageColor(percentage)}
                      />
                      <p className="text-xs text-muted-foreground">
                        {stat.limit - stat.used} remaining this month
                      </p>
                    </div>
                  )}
                  {stat.limit === "unlimited" && (
                    <p className="text-xs text-muted-foreground">
                      Unlimited usage included in your plan
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upgrade Prompt */}
      {usageStats.some(stat => isApproachingLimit(stat.used, stat.limit)) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Approaching Usage Limits</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You're using 80% or more of your monthly allocation for some features. 
                  Consider upgrading to a higher tier for increased limits.
                </p>
                <Link href="/subscription/upgrade">
                  <Button size="sm">
                    View Upgrade Options
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About Usage Tracking</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Campaigns:</strong> Each campaign includes an AI-drafted press release with your own uploaded imagery. 
            Limits reset on the 1st of each month.
          </p>
          <p>
            <strong>Campaign Lab:</strong> A/B testing campaigns with AI-generated variations and automatic optimization. 
            Available on Pro (20/month) and Scale (unlimited) tiers.
          </p>
          <p>
            <strong>Social Posts:</strong> User-composed social media posts are unlimited on all plans. 
            You write the copy and provide your own images.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
