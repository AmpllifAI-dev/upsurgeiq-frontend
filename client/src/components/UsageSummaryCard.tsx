import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Megaphone, MessageSquare, Image as ImageIcon, ShoppingCart } from "lucide-react";
import { Link } from "wouter";

/**
 * Usage Summary Card
 * 
 * Shows current usage across all features with progress bars
 */

export default function UsageSummaryCard() {
  const { data: summary, isLoading } = trpc.usage.getSummary.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Summary</CardTitle>
          <CardDescription>Loading your usage data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const features = [
    {
      icon: FileText,
      label: "Press Releases",
      ...summary.usage.pressReleases,
      color: "bg-blue-600",
    },
    {
      icon: Megaphone,
      label: "Campaigns",
      ...summary.usage.campaigns,
      color: "bg-purple-600",
    },
    {
      icon: MessageSquare,
      label: "AI Chat Messages",
      ...summary.usage.aiChatMessages,
      color: "bg-green-600",
    },
    {
      icon: ImageIcon,
      label: "AI Images",
      ...summary.usage.images,
      color: "bg-orange-600",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Usage Summary</CardTitle>
            <CardDescription>
              Your {summary.tier} plan usage this month
            </CardDescription>
          </div>
          <Link href="/dashboard/purchases">
            <Button size="sm" variant="outline">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Buy Add-Ons
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isNearLimit = feature.percentage >= 80;
          const isAtLimit = feature.percentage >= 100;

          return (
            <div key={feature.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{feature.label}</span>
                </div>
                <span className={`font-medium ${isAtLimit ? "text-destructive" : isNearLimit ? "text-amber-600" : "text-muted-foreground"}`}>
                  {feature.current} / {feature.limit}
                </span>
              </div>
              <Progress 
                value={Math.min(feature.percentage, 100)} 
                className={`h-2 ${isAtLimit ? "[&>*]:bg-destructive" : isNearLimit ? "[&>*]:bg-amber-600" : `[&>*]:${feature.color}`}`}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{feature.percentage}% used</span>
                {isNearLimit && (
                  <span className={isAtLimit ? "text-destructive font-medium" : "text-amber-600 font-medium"}>
                    {isAtLimit ? "Limit reached" : "Approaching limit"}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Purchased Credits */}
        {(summary.purchasedCredits.words > 0 || summary.purchasedCredits.images > 0) && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Purchased Credits</h4>
            <div className="space-y-2 text-sm">
              {summary.purchasedCredits.words > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Extra Words:</span>
                  <span className="font-medium">{summary.purchasedCredits.words} words</span>
                </div>
              )}
              {summary.purchasedCredits.images > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Extra Images:</span>
                  <span className="font-medium">{summary.purchasedCredits.images} images</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
