import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardHeader } from "@/components/DashboardHeader";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, FileText, Share2, Users, BarChart3, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { useState } from "react";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { toast } from "sonner";

export default function Analytics() {
  const exportMutation = trpc.csvExport.exportAnalyticsSummary.useMutation();
  const { user, loading: authLoading } = useAuth();
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "custom">("30d");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: pressReleases, isLoading: prLoading } = trpc.pressRelease.list.useQuery();
  const { data: socialPosts, isLoading: socialLoading } = trpc.socialMedia.list.useQuery();
  const { data: campaigns, isLoading: campaignsLoading } = trpc.campaign.list.useQuery();

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  const isLoading = statsLoading || prLoading || socialLoading || campaignsLoading;

  // Calculate analytics data
  const totalPressReleases = pressReleases?.length || 0;
  const publishedPressReleases = pressReleases?.filter(pr => pr.status === "published").length || 0;
  const draftPressReleases = pressReleases?.filter(pr => pr.status === "draft").length || 0;
  
  const totalSocialPosts = socialPosts?.length || 0;
  const scheduledPosts = socialPosts?.filter(post => post.status === "scheduled").length || 0;
  const publishedPosts = socialPosts?.filter(post => post.status === "published").length || 0;
  
  const totalCampaigns = campaigns?.length || 0;
  const activeCampaigns = campaigns?.filter(c => c.status === "active").length || 0;
  const completedCampaigns = campaigns?.filter(c => c.status === "completed").length || 0;

  // Calculate growth percentages (mock data for now)
  const prGrowth = totalPressReleases > 0 ? "+12%" : "0%";
  const socialGrowth = totalSocialPosts > 0 ? "+23%" : "0%";
  const campaignGrowth = totalCampaigns > 0 ? "+8%" : "0%";

  return (
    <>
      <DashboardHeader currentPage="Analytics" />
      <div className="min-h-screen bg-gray-50">
        <div className="container py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your PR and marketing performance</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={dateRange === "7d" ? "default" : "outline"}
                onClick={() => setDateRange("7d")}
                size="sm"
              >
                7 Days
              </Button>
              <Button
                variant={dateRange === "30d" ? "default" : "outline"}
                onClick={() => setDateRange("30d")}
                size="sm"
              >
                30 Days
              </Button>
              <Button
                variant={dateRange === "90d" ? "default" : "outline"}
                onClick={() => setDateRange("90d")}
                size="sm"
              >
                90 Days
              </Button>
              <Button
                variant={dateRange === "custom" ? "default" : "outline"}
                onClick={() => setDateRange("custom")}
                size="sm"
              >
                Custom Range
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const startDateStr = dateRange === "custom" && startDate ? startDate : undefined;
                    const endDateStr = dateRange === "custom" && endDate ? endDate : undefined;
                    
                    const result = await exportMutation.mutateAsync({
                      startDate: startDateStr,
                      endDate: endDateStr,
                    });
                    
                    // Create and download CSV file
                    const blob = new Blob([result.csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `analytics-summary-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    toast.success("Analytics exported successfully");
                  } catch (error: any) {
                    toast.error(`Export failed: ${error.message}`);
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Summary
              </Button>
            </div>
          </div>
          
          {/* Custom Date Range Inputs */}
          {dateRange === "custom" && (
            <div className="mt-4 flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button
                onClick={() => {
                  if (!startDate || !endDate) {
                    alert("Please select both start and end dates");
                    return;
                  }
                  // Filter data based on custom date range
                  console.log("Filtering from", startDate, "to", endDate);
                }}
                size="sm"
              >
                Apply Filter
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                size="sm"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="container py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Press Releases
                  </CardTitle>
                  <FileText className="h-4 w-4 text-teal-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{totalPressReleases}</div>
                  <p className="text-xs text-gray-600 mt-1">
                    {publishedPressReleases} published, {draftPressReleases} drafts
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600 font-medium">{prGrowth}</span>
                    <span className="text-xs text-gray-500 ml-1">vs last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Social Media Posts
                  </CardTitle>
                  <Share2 className="h-4 w-4 text-teal-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{totalSocialPosts}</div>
                  <p className="text-xs text-gray-600 mt-1">
                    {publishedPosts} published, {scheduledPosts} scheduled
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600 font-medium">{socialGrowth}</span>
                    <span className="text-xs text-gray-500 ml-1">vs last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Campaigns
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-teal-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{totalCampaigns}</div>
                  <p className="text-xs text-gray-600 mt-1">
                    {activeCampaigns} active, {completedCampaigns} completed
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600 font-medium">{campaignGrowth}</span>
                    <span className="text-xs text-gray-500 ml-1">vs last period</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Charts */}
            <div className="mb-8">
              <AnalyticsCharts
                pressReleases={pressReleases}
                socialPosts={socialPosts}
                campaigns={campaigns}
              />
            </div>

            {/* Content Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Press Releases</CardTitle>
                  <CardDescription>Your latest published content</CardDescription>
                </CardHeader>
                <CardContent>
                  {pressReleases && pressReleases.length > 0 ? (
                    <div className="space-y-4">
                      {pressReleases.slice(0, 5).map((pr) => (
                        <div key={pr.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{pr.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(pr.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            pr.status === "published" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {pr.status}
                          </span>
                        </div>
                      ))}
                      <Link href="/press-releases">
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          View All Press Releases
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No press releases yet</p>
                      <Link href="/press-release/new">
                        <Button size="sm" className="mt-3">Create Your First Press Release</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social Media Activity</CardTitle>
                  <CardDescription>Recent posts and scheduled content</CardDescription>
                </CardHeader>
                <CardContent>
                  {socialPosts && socialPosts.length > 0 ? (
                    <div className="space-y-4">
                      {socialPosts.slice(0, 5).map((post) => (
                        <div key={post.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                              {post.content.substring(0, 50)}...
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {post.platform}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            post.status === "published" 
                              ? "bg-green-100 text-green-700" 
                              : post.status === "scheduled"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {post.status}
                          </span>
                        </div>
                      ))}
                      <Link href="/social-media/new">
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          Create New Post
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Share2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No social media posts yet</p>
                      <Link href="/social-media/new">
                        <Button size="sm" className="mt-3">Create Your First Post</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Campaign Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Track your marketing campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                {campaigns && campaigns.length > 0 ? (
                  <div className="space-y-4">
                    {campaigns.slice(0, 5).map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Budget: £{campaign.budget ? parseFloat(campaign.budget).toFixed(2) : '0.00'} • {campaign.platforms || 'No platforms'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            campaign.status === "active" 
                              ? "bg-green-100 text-green-700" 
                              : campaign.status === "completed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    <Link href="/campaign-lab">
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        View All Campaigns
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No campaigns yet</p>
                    <Link href="/campaign-lab">
                      <Button size="sm" className="mt-3">Create Your First Campaign</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest actions across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pressReleases && pressReleases.slice(0, 3).map((pr) => (
                    <div key={`pr-${pr.id}`} className="flex items-start gap-3">
                      <div className="bg-teal-100 p-2 rounded-full">
                        <FileText className="h-4 w-4 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          Created press release: <span className="font-medium">{pr.title}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(pr.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {socialPosts && socialPosts.slice(0, 2).map((post) => (
                    <div key={`post-${post.id}`} className="flex items-start gap-3">
                      <div className="bg-lime-100 p-2 rounded-full">
                        <Share2 className="h-4 w-4 text-lime-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          Created social media post for {post.platform}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(post.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
