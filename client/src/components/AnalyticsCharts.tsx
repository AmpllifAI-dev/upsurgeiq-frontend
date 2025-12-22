import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsChartsProps {
  pressReleases?: any[];
  socialPosts?: any[];
  campaigns?: any[];
}

export function AnalyticsCharts({ pressReleases = [], socialPosts = [], campaigns = [] }: AnalyticsChartsProps) {
  // Generate time series data for the last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split("T")[0];
  });

  const timeSeriesData = last30Days.map((date) => {
    const prCount = pressReleases.filter(
      (pr) => pr.createdAt && new Date(pr.createdAt).toISOString().split("T")[0] === date
    ).length;
    const socialCount = socialPosts.filter(
      (post) => post.createdAt && new Date(post.createdAt).toISOString().split("T")[0] === date
    ).length;
    const campaignCount = campaigns.filter(
      (c) => c.createdAt && new Date(c.createdAt).toISOString().split("T")[0] === date
    ).length;

    return {
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      pressReleases: prCount,
      socialPosts: socialCount,
      campaigns: campaignCount,
    };
  });

  // Status distribution for press releases
  const prStatusData = [
    { name: "Published", value: pressReleases.filter((pr) => pr.status === "published").length, color: "#10b981" },
    { name: "Draft", value: pressReleases.filter((pr) => pr.status === "draft").length, color: "#f59e0b" },
    { name: "Scheduled", value: pressReleases.filter((pr) => pr.status === "scheduled").length, color: "#3b82f6" },
    { name: "Archived", value: pressReleases.filter((pr) => pr.status === "archived").length, color: "#6b7280" },
  ].filter((item) => item.value > 0);

  // Campaign status distribution
  const campaignStatusData = [
    { name: "Active", value: campaigns.filter((c) => c.status === "active").length, color: "#10b981" },
    { name: "Paused", value: campaigns.filter((c) => c.status === "paused").length, color: "#f59e0b" },
    { name: "Completed", value: campaigns.filter((c) => c.status === "completed").length, color: "#3b82f6" },
    { name: "Draft", value: campaigns.filter((c) => c.status === "draft").length, color: "#6b7280" },
  ].filter((item) => item.value > 0);

  // Content type comparison
  const contentTypeData = [
    { name: "Press Releases", count: pressReleases.length },
    { name: "Social Posts", count: socialPosts.length },
    { name: "Campaigns", count: campaigns.length },
  ];

  return (
    <div className="space-y-6">
      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline (Last 30 Days)</CardTitle>
          <CardDescription>Content creation trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pressReleases" stroke="#10b981" name="Press Releases" />
              <Line type="monotone" dataKey="socialPosts" stroke="#3b82f6" name="Social Posts" />
              <Line type="monotone" dataKey="campaigns" stroke="#f59e0b" name="Campaigns" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Content Type Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Content Distribution</CardTitle>
            <CardDescription>Total content by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={contentTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Press Release Status */}
        <Card>
          <CardHeader>
            <CardTitle>Press Release Status</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {prStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={prStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {prStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                No press releases yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaign Status */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Status</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {campaignStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={campaignStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {campaignStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                No campaigns yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engagement Metrics Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Overview</CardTitle>
            <CardDescription>Average engagement rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Press Release Opens</span>
                <span className="text-2xl font-bold text-green-600">--</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Social Media Reach</span>
                <span className="text-2xl font-bold text-blue-600">--</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Campaign CTR</span>
                <span className="text-2xl font-bold text-purple-600">--</span>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Engagement tracking will be available once distributions are sent
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
