import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  TrendingUp, 
  Mail, 
  MousePointerClick, 
  Eye, 
  XCircle, 
  UserMinus,
  BarChart3,
  Calendar
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export function EmailAnalytics() {
  const [timeRange, setTimeRange] = useState("30");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");

  // Fetch analytics data
  // TODO: Add getOverview procedure to leadBehaviour router
  // const { data: overviewStats, isLoading: statsLoading } = trpc.leadBehaviour.getOverview.useQuery({
  //   days: parseInt(timeRange),
  // });
  const overviewStats = null;
  const statsLoading = false;

  const { data: campaigns } = trpc.campaigns.list.useQuery();
  
  // TODO: Add getCampaignPerformance procedure to leadBehaviour router
  // const { data: campaignPerformance, isLoading: performanceLoading } = trpc.leadBehaviour.getCampaignPerformance.useQuery({
  //   campaignId: selectedCampaign === "all" ? undefined : parseInt(selectedCampaign),
  //   days: parseInt(timeRange),
  // });
  const campaignPerformance: any[] = [];
  const performanceLoading = false;

  const stats = overviewStats || {
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalBounced: 0,
    totalUnsubscribed: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
  };

  const getStatCard = (
    title: string,
    value: number,
    percentage: number,
    icon: React.ReactNode,
    color: string
  ) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold">{value.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className={`w-4 h-4 ${color}`} />
            <span className={`text-sm font-medium ${color}`}>
              {percentage.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className={`p-4 rounded-full ${color.replace('text-', 'bg-')}/10`}>
          {icon}
        </div>
      </div>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Email Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Track campaign performance and engagement metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-24 bg-muted rounded"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getStatCard(
              "Total Sent",
              stats.totalSent,
              100,
              <Mail className="w-6 h-6 text-blue-600" />,
              "text-blue-600"
            )}
            {getStatCard(
              "Open Rate",
              stats.totalOpened,
              stats.openRate,
              <Eye className="w-6 h-6 text-green-600" />,
              "text-green-600"
            )}
            {getStatCard(
              "Click Rate",
              stats.totalClicked,
              stats.clickRate,
              <MousePointerClick className="w-6 h-6 text-purple-600" />,
              "text-purple-600"
            )}
            {getStatCard(
              "Bounce Rate",
              stats.totalBounced,
              stats.bounceRate,
              <XCircle className="w-6 h-6 text-red-600" />,
              "text-red-600"
            )}
          </div>
        )}

        {/* Campaign Performance */}
        <Card>
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Campaign Performance</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Detailed metrics for each campaign
                </p>
              </div>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="All Campaigns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {campaigns?.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id.toString()}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {performanceLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading campaign data...</p>
              </div>
            ) : !campaignPerformance || campaignPerformance.length === 0 ? (
              <div className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No campaign data available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Send some campaigns to see analytics here
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead className="text-right">Sent</TableHead>
                    <TableHead className="text-right">Delivered</TableHead>
                    <TableHead className="text-right">Opened</TableHead>
                    <TableHead className="text-right">Clicked</TableHead>
                    <TableHead className="text-right">Open Rate</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Bounce Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignPerformance.map((campaign: any) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell className="text-right">{campaign.sent || 0}</TableCell>
                      <TableCell className="text-right">{campaign.delivered || 0}</TableCell>
                      <TableCell className="text-right">{campaign.opened || 0}</TableCell>
                      <TableCell className="text-right">{campaign.clicked || 0}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-green-600 font-medium">
                          {campaign.openRate ? `${campaign.openRate.toFixed(1)}%` : "0%"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-purple-600 font-medium">
                          {campaign.clickRate ? `${campaign.clickRate.toFixed(1)}%` : "0%"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-red-600 font-medium">
                          {campaign.bounceRate ? `${campaign.bounceRate.toFixed(1)}%` : "0%"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Engagement Trends</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Average Open Rate</span>
                </div>
                <span className="font-semibold text-green-600">
                  {stats.openRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Average Click Rate</span>
                </div>
                <span className="font-semibold text-purple-600">
                  {stats.clickRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Average Bounce Rate</span>
                </div>
                <span className="font-semibold text-red-600">
                  {stats.bounceRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserMinus className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Total Unsubscribes</span>
                </div>
                <span className="font-semibold text-orange-600">
                  {stats.totalUnsubscribed}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Delivery Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Delivery Rate</span>
                  <span className="font-semibold">
                    {stats.totalSent > 0
                      ? ((stats.totalDelivered / stats.totalSent) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${stats.totalSent > 0 ? (stats.totalDelivered / stats.totalSent) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Engagement Rate</span>
                  <span className="font-semibold">
                    {stats.totalDelivered > 0
                      ? (((stats.totalOpened + stats.totalClicked) / stats.totalDelivered) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${stats.totalDelivered > 0 ? ((stats.totalOpened + stats.totalClicked) / stats.totalDelivered) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
