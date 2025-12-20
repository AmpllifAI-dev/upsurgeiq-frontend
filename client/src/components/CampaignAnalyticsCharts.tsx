import { useMemo } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsEntry {
  id: number;
  campaignId: number;
  date: Date;
  impressions: number | null;
  clicks: number | null;
  conversions: number | null;
  spend: number | null;
  reach: number | null;
  engagements: number | null;
  createdAt: Date;
}

interface CampaignAnalyticsChartsProps {
  analytics: AnalyticsEntry[];
}

const COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  accent: "hsl(var(--accent))",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.success];

export function CampaignAnalyticsCharts({ analytics }: CampaignAnalyticsChartsProps) {
  // Prepare time series data
  const timeSeriesData = useMemo(() => {
    return analytics
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((entry) => ({
        date: new Date(entry.date).toLocaleDateString("en-GB", {
          month: "short",
          day: "numeric",
        }),
        impressions: entry.impressions || 0,
        clicks: entry.clicks || 0,
        conversions: entry.conversions || 0,
      }));
  }, [analytics]);

  // Calculate totals
  const totals = useMemo(() => {
    return analytics.reduce(
      (acc, entry) => ({
        impressions: acc.impressions + (entry.impressions || 0),
        clicks: acc.clicks + (entry.clicks || 0),
        conversions: acc.conversions + (entry.conversions || 0),
        spend: acc.spend + (entry.spend || 0),
      }),
      { impressions: 0, clicks: 0, conversions: 0, spend: 0 }
    );
  }, [analytics]);

  // Calculate funnel data
  const funnelData = useMemo(() => {
    if (totals.impressions === 0) return [];
    return [
      { name: "Impressions", value: totals.impressions },
      { name: "Clicks", value: totals.clicks },
      { name: "Conversions", value: totals.conversions },
    ];
  }, [totals]);

  // Calculate conversion rates
  const conversionRates = useMemo(() => {
    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const cvr = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;
    const overallCvr =
      totals.impressions > 0 ? (totals.conversions / totals.impressions) * 100 : 0;

    return [
      { metric: "CTR", rate: ctr.toFixed(2) },
      { metric: "CVR", rate: cvr.toFixed(2) },
      { metric: "Overall", rate: overallCvr.toFixed(2) },
    ];
  }, [totals]);

  if (analytics.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No analytics data available yet. Data will appear once your campaign is active.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Daily impressions, clicks, and conversions over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="impressions"
                stroke={COLORS.primary}
                strokeWidth={2}
                dot={{ fill: COLORS.primary }}
                name="Impressions"
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke={COLORS.secondary}
                strokeWidth={2}
                dot={{ fill: COLORS.secondary }}
                name="Clicks"
              />
              <Line
                type="monotone"
                dataKey="conversions"
                stroke={COLORS.success}
                strokeWidth={2}
                dot={{ fill: COLORS.success }}
                name="Conversions"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>User journey from impression to conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={funnelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
                  outerRadius={80}
                  fill={COLORS.primary}
                  dataKey="value"
                >
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rates</CardTitle>
            <CardDescription>Click-through and conversion performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={conversionRates}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="metric"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  label={{ value: "%", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  formatter={(value: number) => [`${value}%`, "Rate"]}
                />
                <Bar dataKey="rate" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">CTR (Click-Through Rate):</span>
                <span className="font-semibold">{conversionRates[0].rate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CVR (Conversion Rate):</span>
                <span className="font-semibold">{conversionRates[1].rate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Overall Conversion:</span>
                <span className="font-semibold">{conversionRates[2].rate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Impressions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.impressions.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.clicks.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.conversions.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{totals.spend.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
