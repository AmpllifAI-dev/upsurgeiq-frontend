import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/Breadcrumb";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingUp, AlertCircle, Download, Calendar, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

export default function AdminCreditMonitoring() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  // Redirect non-admin users
  if (!loading && user?.role !== "admin") {
    setLocation("/dashboard");
    return null;
  }

  const { data: creditStats, isLoading } = trpc.admin.getCreditStats.useQuery(
    { timeRange },
    { enabled: !!user && user.role === "admin" }
  );

  if (loading || isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658"];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Admin", href: "#" },
            { label: "Credit Monitoring" },
          ]}
        />

        <div className="flex justify-between items-center mb-8 mt-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Manus Credit Monitoring</h1>
            <p className="text-muted-foreground mt-2">
              Track platform-wide credit consumption and costs
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setLocation("/admin/alerts")}
            >
              <Bell className="h-4 w-4 mr-2" />
              Manage Alerts
            </Button>
            <Button
              variant={timeRange === "7d" ? "default" : "outline"}
              onClick={() => setTimeRange("7d")}
            >
              7 Days
            </Button>
            <Button
              variant={timeRange === "30d" ? "default" : "outline"}
              onClick={() => setTimeRange("30d")}
            >
              30 Days
            </Button>
            <Button
              variant={timeRange === "90d" ? "default" : "outline"}
              onClick={() => setTimeRange("90d")}
            >
              90 Days
            </Button>
            <Button
              variant={timeRange === "all" ? "default" : "outline"}
              onClick={() => setTimeRange("all")}
            >
              All Time
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Credits Used
              </CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {creditStats?.totalCredits?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {timeRange === "all" ? "All time" : `Last ${timeRange}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tokens
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {creditStats?.totalTokens?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">LLM tokens processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {creditStats?.totalUsers || "0"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Credits/User
              </CardTitle>
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {creditStats?.avgCreditsPerUser?.toFixed(2) || "0"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Per user average</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Usage Trend</CardTitle>
              <CardDescription>Daily credit consumption over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={creditStats?.dailyTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="credits"
                    stroke="#0088FE"
                    strokeWidth={2}
                    name="Credits Used"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Feature Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Credits by Feature</CardTitle>
              <CardDescription>Distribution across feature types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={creditStats?.byFeature || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(creditStats?.byFeature || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle>Top Credit Consumers</CardTitle>
            <CardDescription>Users with highest credit usage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={creditStats?.topUsers || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="credits" fill="#0088FE" name="Credits Used" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alert Section */}
        <Card className="mt-6 border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Cost Monitoring Note
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This dashboard shows Manus credit consumption. To calculate actual costs, you need to
              obtain the credit-to-dollar conversion rate from Manus support at{" "}
              <a
                href="https://help.manus.im"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                help.manus.im
              </a>
              . Use the data above to estimate monthly costs and adjust your subscription tier
              limits accordingly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
