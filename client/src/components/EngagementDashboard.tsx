import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Mail, MousePointerClick, Eye, TrendingUp } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface EngagementDashboardProps {
  pressReleaseId: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function EngagementDashboard({ pressReleaseId }: EngagementDashboardProps) {
  const { data: engagement, isLoading } = trpc.tracking.engagement.useQuery({
    pressReleaseId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!engagement) {
    return (
      <div className="text-center p-12 text-muted-foreground">
        No engagement data available yet.
      </div>
    );
  }

  const stats = [
    {
      title: "Total Sent",
      value: engagement.totalSent,
      icon: Mail,
      description: "Emails delivered",
      color: "text-blue-600",
    },
    {
      title: "Total Opens",
      value: engagement.totalOpened,
      icon: Eye,
      description: `${engagement.openRate.toFixed(1)}% open rate`,
      color: "text-green-600",
    },
    {
      title: "Total Clicks",
      value: engagement.totalClicked,
      icon: MousePointerClick,
      description: `${engagement.clickRate.toFixed(1)}% click rate`,
      color: "text-purple-600",
    },
    {
      title: "Engagement Score",
      value: Math.round((engagement.openRate + engagement.clickRate) / 2),
      icon: TrendingUp,
      description: "Overall performance",
      color: "text-orange-600",
    },
  ];

  const pieData = [
    { name: "Opened", value: engagement.totalOpened },
    { name: "Clicked", value: engagement.totalClicked },
    { name: "Not Opened", value: engagement.totalSent - engagement.totalOpened },
  ];

  // Group distributions by media list for bar chart
  const mediaListData: Record<string, { sent: number; opened: number; clicked: number }> = {};
  
  engagement.distributions.forEach((dist: any) => {
    const listId = dist.mediaListId.toString();
    if (!mediaListData[listId]) {
      mediaListData[listId] = { sent: 0, opened: 0, clicked: 0 };
    }
    mediaListData[listId].sent++;
    if (dist.openedAt) mediaListData[listId].opened++;
    if (dist.clickedAt) mediaListData[listId].clicked++;
  });

  const barChartData = Object.entries(mediaListData).map(([listId, data]) => ({
    name: `List ${listId}`,
    sent: data.sent,
    opened: data.opened,
    clicked: data.clicked,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Overview Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Overview</CardTitle>
            <CardDescription>Distribution of email interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Media List Performance Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Media List</CardTitle>
            <CardDescription>Engagement metrics across different lists</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sent" fill="#8884d8" name="Sent" />
                <Bar dataKey="opened" fill="#82ca9d" name="Opened" />
                <Bar dataKey="clicked" fill="#ffc658" name="Clicked" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Distribution Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Engagement</CardTitle>
          <CardDescription>Individual recipient interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Recipient</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-center p-2">Opens</th>
                  <th className="text-center p-2">Clicks</th>
                  <th className="text-left p-2">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {engagement.distributions.slice(0, 10).map((dist: any) => (
                  <tr key={dist.id} className="border-b">
                    <td className="p-2">{dist.recipientEmail}</td>
                    <td className="p-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        dist.status === 'sent' ? 'bg-green-100 text-green-800' :
                        dist.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {dist.status}
                      </span>
                    </td>
                    <td className="text-center p-2">{dist.openCount}</td>
                    <td className="text-center p-2">{dist.clickCount}</td>
                    <td className="p-2">
                      {dist.clickedAt ? new Date(dist.clickedAt).toLocaleDateString() :
                       dist.openedAt ? new Date(dist.openedAt).toLocaleDateString() :
                       dist.sentAt ? new Date(dist.sentAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {engagement.distributions.length > 10 && (
              <p className="text-sm text-muted-foreground text-center mt-4">
                Showing 10 of {engagement.distributions.length} distributions
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
