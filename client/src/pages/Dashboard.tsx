import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  FileText,
  Share2,
  Users,
  BarChart3,
  MessageSquare,
  Zap,
  Plus,
  TrendingUp,
  Calendar,
  Target,
  AlertCircle,
  Search
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { KeyboardShortcut } from "@/components/KeyboardShortcut";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { UsageDashboard } from "@/components/UsageDashboard";
import { AICreditsUsage } from "@/components/AICreditsUsage";
import { UsageForecastWidget } from "@/components/UsageForecastWidget";
import { FloatingIssueButton } from "@/components/FloatingIssueButton";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: subscription, isLoading: subLoading } = trpc.subscription.get.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: business, isLoading: businessLoading } = trpc.business.get.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery(undefined, {
    enabled: !!user,
  });

  if (authLoading || subLoading || businessLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  // If no subscription, redirect to subscription selection
  if (!subscription) {
    setLocation("/subscribe");
    return null;
  }

  // If no business profile, redirect to onboarding
  if (!business) {
    setLocation("/onboarding");
    return null;
  }

  const planName = subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1);
  const planLimits = {
    starter: { pressReleases: 2, channels: 1, mediaLists: 3 },
    pro: { pressReleases: 5, channels: 3, mediaLists: 5 },
    scale: { pressReleases: 15, channels: 4, mediaLists: 10 },
  };

  const limits = planLimits[subscription.plan as keyof typeof planLimits];
  const currentStats = stats || { pressReleases: 0, campaigns: 0, activeCampaigns: 0, journalists: 0, mediaOutlets: 0 };

  const quickActions = [
    {
      icon: FileText,
      title: "Create Press Release",
      description: "Generate AI-powered press releases",
      href: "/press-releases/new",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Share2,
      title: "Schedule Social Post",
      description: "Post to your social channels",
      href: "/social-media/new",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      icon: Users,
      title: "Manage Media Lists",
      description: "Update journalist contacts",
      href: "/media-lists",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: MessageSquare,
      title: "AI Assistant",
      description: "Chat with your AI marketing assistant",
      href: "/ai-assistant",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      disabled: subscription.plan === "starter",
    },
    {
      icon: Calendar,
      title: "Content Calendar",
      description: "View scheduled content",
      href: "/content-calendar",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <DashboardLayout>
      {/* Skip Navigation Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div id="main-content" className="container mx-auto py-8 space-y-8" role="main">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Welcome back, {user.name?.split(' ')[0] || 'there'}!</h1>
              <p className="text-muted-foreground mt-2">Here's what's happening with your campaigns today.</p>
            </div>
            <Button size="lg" onClick={() => setLocation("/press-releases/new")} aria-label="Create new press release">
              <Plus className="w-5 h-5 mr-2" />
              New Press Release
            </Button>
          </div>
          
          {/* AI Credits Usage Meters */}
          <AICreditsUsage />
        </header>

        {/* Stats Overview */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">Statistics Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card 
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
            onClick={() => setLocation("/press-releases")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Press Releases</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {currentStats.pressReleases}
                <span className="text-lg text-muted-foreground">/{limits.pressReleases}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
            onClick={() => setLocation("/media-lists")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Journalists</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{currentStats.journalists}</div>
              <p className="text-xs text-muted-foreground mt-1">In your database</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
            onClick={() => setLocation("/campaigns")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
              <Target className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{currentStats.activeCampaigns}</div>
              <p className="text-xs text-muted-foreground mt-1">Active campaigns</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
            onClick={() => setLocation("/media-lists")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Media Outlets</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {currentStats.mediaOutlets}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Unique publications</p>
            </CardContent>
          </Card>
        </div>

        </section>

        {/* Admin Section (visible only to admins) */}
        {user.role === "admin" && (
          <section className="mb-8">
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Admin Tools
                </CardTitle>
                <CardDescription>
                  Platform administration and monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setLocation("/admin/credit-monitoring")}
                  className="w-full sm:w-auto"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Manus Credit Monitoring
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Quick Actions */}
        <section aria-labelledby="quick-actions-heading">
          <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {quickActions.map((action, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Card
                    className={`cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-lg ${
                      action.disabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => !action.disabled && setLocation(action.href)}
                  >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-4`}>
                    <action.icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                  {action.disabled && (
                    <Badge variant="secondary" className="w-fit mt-2">Pro Plan Required</Badge>
                  )}
                </CardHeader>
              </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{action.description}</p>
                  {action.disabled && <p className="text-xs mt-1">Upgrade to Pro plan to unlock</p>}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section aria-labelledby="recent-activity-heading">
          <h2 id="recent-activity-heading" className="sr-only">Recent Activity</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Scheduled Posts
              </CardTitle>
              <CardDescription>Your next scheduled content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">No scheduled posts yet</p>
                    <p className="text-xs text-muted-foreground">Create your first press release to get started</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <ActivityTimeline limit={5} />
        </div>
        </section>

        {/* Usage Dashboard */}
        <section aria-labelledby="usage-dashboard-heading" className="mt-6">
          <h2 id="usage-dashboard-heading" className="sr-only">Usage Dashboard</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <UsageDashboard />
            <UsageForecastWidget />
          </div>
        </section>
      </div>
      <FloatingIssueButton />
    </DashboardLayout>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
